# Contrato de API para as pages — logix-sphere-backend

**Para:** quem constrói uma tela no `logix-sphere-frontend-nextjs` e precisa saber o que o servidor
entrega, e para quem no backend vai criar o endpoint que essa tela consome.
**Data do mapeamento:** 21/09/2026 — a partir do código real de `main`.
**Documento irmão:** `logix-sphere-frontend-nextjs/docs/ANATOMIA-DE-UMA-PAGE.md` (o lado do cliente).

---

## 1. Em uma frase

O backend é um Express 5 em TypeScript que expõe duas famílias de rotas — `/auth/*` sem token e
`/bff/*` com Bearer obrigatório — e atravessa sempre as mesmas quatro camadas
(`router → core → service → repository`) até o PostgreSQL, com SQL escrito à mão e parametrizado.

---

## 2. As duas famílias de rotas

`src/app.ts` monta exatamente dois routers, além de três health checks públicos (`/`, `/health`,
`/socket/health`):

| Prefixo | Arquivo | Token | Para quê |
|---|---|---|---|
| `/auth` | `src/router/router-auth.ts` | não | login, registro, reset e troca de senha, refresh, update de perfil |
| `/bff` | `src/router/routes.ts` | sim | **todas** as rotas de negócio — 198 na data do mapeamento |

`/auth` expõe 8 operações: `POST /register`, `POST /login`, `POST /send-password-reset-token`,
`POST /reset-password`, `POST /change-password`, `POST /set-initial-password`,
`POST /refresh-token`, `PATCH /update-profile`.

CORS é restrito a `process.env.FRONTEND_URL` (padrão `http://localhost:3000`), com
`credentials: true` e `X-New-Token` / `X-Authorization` expostos ao navegador. O limite de payload é
50 MB, para suportar criação de faturas em lote.

---

## 3. Autenticação e autorização

### O token

`POST /auth/login` devolve o JWT. Toda chamada a `/bff/*` precisa de
`Authorization: Bearer <token>`.

O payload relevante para o frontend é `userTypeId`, `userId`, `companyId` e, quando aplicável,
`servicePartnerId`. O middleware do frontend também aceita a grafia `user_type_id`.

### Renovação automática

`src/middlewares/auth.ts` verifica, a cada request, se o token está a ponto de expirar (janela de
500 ms antes até 1 s depois). Se estiver, renova e devolve o token novo em **dois headers de
resposta**: `X-New-Token` e `X-Authorization`. O frontend lê `X-New-Token` no patch de `window.fetch`
(`lib/installApiFetchCredentials.ts`). Uma tela que faça `fetch` fora desse caminho **perde a
renovação** e o utilizador é deslogado sem motivo aparente.

Existe ainda um fallback: se a verificação com a chave própria falhar, o middleware tenta validar o
token pelo `logix-sphere-framework`.

### Os três níveis de acesso

| Middleware | Regra | Rotas |
|---|---|---|
| `authenticateJWT` | qualquer token válido | 114 |
| `authenticateAdminJWT` | `userTypeId === 1` | 74 |
| `authenticateAdminOrSupervisorJWT` | `userTypeId === 1` ou `3` | 10 |

Existe também `authorizeRole(role)` em `src/middlewares/permissions.ts`, que checa
`user.permissao.includes(role)`, mas **nenhuma rota de `routes.ts` o usa hoje**.

A consequência prática para quem escreve tela: um botão visível para supervisor numa rota
`authenticateAdminJWT` vai retornar 403. A permissão de rota do frontend
(`lib/route-permissions.ts`) e o middleware da rota do backend precisam contar a mesma história.

---

## 4. As quatro camadas

```
router/routes.ts        declara path + método + middleware de auth, delega ao core
   │
core/<recurso>-core.ts  lê req.query / req.params / req.body, valida entrada,
   │                    devolve status e JSON, loga erro
   │
services/<recurso>-service.ts   regra de negócio, orquestração, logging de domínio
   │
repositories/<recurso>-repository.ts   SQL parametrizado ($1, $2...) contra PostgreSQL
```

`DTO/<recurso>-dto.ts` define os contratos de entrada e saída de cada recurso, sempre em
**`snake_case`**, espelhando as colunas do banco. Há 41 arquivos de DTO, 39 cores, 38 services e 37
repositories — a simetria é a convenção: um recurso novo cria os quatro.

`core/fk-core.ts` é o ponto único de acesso à infraestrutura do `logix-sphere-framework`: `getSQL()`,
`getLog()`, `getSecurity()`, `getEnv()`, `getEmail()`. Nenhuma camada abre conexão por conta própria.

MongoDB é usado para log (`src/config/mongo.ts`), Redis está em `src/infra/redis-client.ts` e o
tempo real em `src/realtime/` (Socket.IO), com um worker dedicado à persistência de chat
(`src/workers/chat-persist-worker.ts`).

---

## 5. O formato das respostas

### Caso de sucesso

Não há envelope padronizado. O core devolve o resultado do service diretamente:

- listagens simples → **array cru** de DTOs;
- item único → **objeto** do DTO;
- listagem paginada → objeto com `data` e `pagination`.

O frontend precisa lidar com essa variação, e por isso vários módulos de `lib/` testam três formatos
(`Array.isArray(data)`, `data.<recurso>`, `data.data`) antes de desistir. Em endpoint novo, **escolha
o formato do recurso mais próximo e documente-o** em vez de inventar um quarto.

### Paginação

Quatro recursos têm paginação (`vehicles`, `operation-management`, `report`, `week-planner`), com
este formato:

```ts
{
  data: T[],
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  }
}
```

**Atenção ao nome dos query params.** Em `/bff/vehicles` a paginação entra como `currentPage` e
`totalItensPerPage` (grafia com "Itens", não "Items") — não como `page` e `limit`, que é o nome
usado no DTO interno. Confira sempre no core, que é quem lê `req.query`.

### Caso de erro

Duas convenções coexistem: `{ error: "..." }` aparece ~604 vezes nos cores e `{ message: "..." }`
~114 vezes (esta última é a dos middlewares de auth). Por isso o frontend lê
`errorData.message || errorData.error` antes de cair na mensagem genérica. Em código novo, use
`{ error }` nos cores para seguir a maioria.

Distribuição dos status nos cores:

| Status | Ocorrências | Significado no projeto |
|---|---|---|
| 400 | 414 | parâmetro ausente, vazio ou fora de formato — validação feita à mão no core |
| 500 | 193 | exceção não tratada; a mensagem do `Error` vai no corpo |
| 200 | 162 | sucesso |
| 404 | 87 | recurso não encontrado |
| 201 | 33 | criação |
| 403 | 19 | permissão insuficiente |
| 401 | 13 | token ausente, malformado ou inválido |
| 504 | 4 | timeout |

Não há Zod nem validador declarativo: a validação de entrada é `if` à mão no core
(`if (!vehicleId) return res.status(400)...`, `isNaN`, `<= 0`). Um endpoint novo deve seguir o mesmo
rigor — o service e o repository confiam no core.

---

## 6. Inventário de rotas `/bff` por recurso

39 recursos, 198 rotas. Métodos: 106 GET, 39 POST, 26 PATCH, 26 DELETE, 1 PUT. A convenção de
atualização é **PATCH**, não PUT.

| Recurso | JWT | Admin | Admin/Sup | Total |
|---|---|---|---|---|
| `/adhoc-services` | 2 | 3 | | 5 |
| `/adhoc-works` | 2 | | | 2 |
| `/chat` | 11 | | | 11 |
| `/cost-model` | 1 | | | 1 |
| `/cost-model-employees` | 2 | 4 | | 6 |
| `/cost-models` | 2 | 3 | | 5 |
| `/customers` | 1 | | | 1 |
| `/daily-game-plan` | 4 | | 3 | 7 |
| `/daily-overview` | 6 | | | 6 |
| `/daily-team-support` | 4 | 5 | | 9 |
| `/day-overview` | 1 | | | 1 |
| `/deductions` | 1 | | | 1 |
| `/deposits` | 5 | 3 | | 8 |
| `/driver-documents` | 1 | | | 1 |
| `/driver-trainings` | 3 | 3 | | 6 |
| `/driver-types` | 2 | 3 | | 5 |
| `/drivers` | 3 | 2 | | 5 |
| `/files` | 1 | | | 1 |
| `/fix-damage-deductions` | 2 | 3 | | 5 |
| `/invoices` | 8 | 2 | | 10 |
| `/liquidation-damage-deductions` | 2 | 3 | | 5 |
| `/month-overview` | 1 | | | 1 |
| `/operations` | 4 | 6 | | 10 |
| `/other-deductions` | 2 | 3 | | 5 |
| `/pre-payment-deductions` | 2 | 3 | | 5 |
| `/reports` | 5 | | | 5 |
| `/routes` | 2 | 3 | | 5 |
| `/service-types` | 3 | 4 | | 7 |
| `/status` | 1 | | | 1 |
| `/traffic-penalty-deductions` | 2 | 3 | | 5 |
| `/trainings` | 2 | 3 | | 5 |
| `/user-types` | 2 | 3 | | 5 |
| `/users` | 2 | | | 2 |
| `/vehicle-types` | 2 | 3 | | 5 |
| `/vehicles` | 3 | 3 | | 6 |
| `/vendor` | 3 | 3 | | 6 |
| `/vendor-performance` | 2 | | | 2 |
| `/vendor-requests` | 4 | 3 | | 7 |
| `/week-planners` | 8 | | 7 | 15 |

O CRUD padrão de um recurso é: `GET /` e `GET /:id` com `authenticateJWT`; `POST`, `PATCH /:id` e
`DELETE /:id` com `authenticateAdminJWT`. Doze recursos seguem exatamente esse desenho de 5 rotas.

**Ordem importa.** Rotas específicas precisam ser declaradas **antes** das paramétricas — o próprio
`routes.ts` marca isso em `/deposits`: `with-routes` e `with-service-types-and-routes` vêm antes de
`/deposits/:depositId`, senão o Express casa o literal como id.

---

## 7. Como adicionar um endpoint para uma page nova

1. **DTO** — `src/DTO/<recurso>-dto.ts`, em `snake_case`, espelhando as colunas reais. Separe
   `<Recurso>DTO` (saída), `<Recurso>CreateDTO`, `<Recurso>UpdateDTO` e, se houver listagem filtrada,
   `<Recurso>FiltersDTO`.
2. **Repository** — `src/repositories/<recurso>-repository.ts`. SQL parametrizado (`$1`, `$2`…),
   nunca interpolando valor na string. Pegue a conexão por `fkCore.getSQL()`.
3. **Service** — `src/services/<recurso>-service.ts`. Regra de negócio, e `log?.saveLog(...)` no
   caminho feliz e no erro, com uma chave de log descritiva (`Log_Get_Vehicles_Error`).
4. **Core** — `src/core/<recurso>-core.ts`. Leia `req.params` / `req.query` / `req.body`, valide à
   mão, devolva `res.status(...).json(...)` e trate a exceção com 500 + log.
5. **Router** — registre em `src/router/routes.ts`, escolhendo conscientemente o middleware de auth e
   respeitando a ordem específico-antes-de-paramétrico.
6. **Combine com o frontend** — o nome exato de cada query param é contrato. Escreva-o no PR para que
   a tela use a mesma grafia.
7. **Teste** — Jest (`npm test`). Há testes em `tests/repositories/`.

Convenção de commit (de `contributing.md`): `<tipo>(escopo): descrição`, com
`feat|fix|docs|test|refactor`. PR com rebase em `development`.

---

## 8. Divergências encontradas

Registradas como achado, não corrigidas.

1. **`src/infra/cache.ts` é um no-op.** O corpo de `set()` está inteiramente comentado: nada é
   gravado, todo `get()` erra. `vehicles-service.ts` monta `cacheKey` e chama `cacheService.set(...)`
   acreditando que cacheia. Ou o cache volta a funcionar, ou as chamadas devem sair do código.

2. **Query params de `/bff/vehicles` não batem com o frontend.** O core lê
   `req.query.registration_plate` e `req.query.fuel_type` (snake_case); o frontend envia
   `registrationPlate` e `fuelType` (camelCase). `servicePartnerId` é enviado e não é lido por
   `getAllVehicles`. Na prática, esses filtros não filtram.

3. **`snake_case` na resposta vs `camelCase` no frontend.** Os repositories devolvem as colunas como
   estão (`vehicle_id`, `registration_plates`). O frontend só converte quando passa por
   `lib/api-client.ts` — o que hoje acontece em 6 módulos apenas. Vale decidir de que lado fica a
   conversão e aplicar em todos.

4. **Duas convenções de erro** (`{ error }` e `{ message }`) convivendo sem regra escrita.

5. **`authorizeRole` existe e não é usado** por nenhuma rota. Ou vira o mecanismo de permissão fina,
   ou sai.

6. **`services/index.ts` está vazio.**

7. **O README descreve uma estrutura que não é a do repositório** (fala em `src/controllers/`,
   `config/` e `logs/` na raiz; o real é `src/core/`, `src/config/` e `src/utils/log-helper.ts`).

8. **`dump.sql` e `test.json` estão versionados na raiz.** Vale confirmar se devem estar.
