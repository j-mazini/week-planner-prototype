# Anatomia de uma page — logix-sphere-frontend-nextjs

**Para:** qualquer pessoa (ou IA) que vá criar, alterar ou revisar uma tela do LogixSphere.
**Repositórios cobertos:** `logix-sphere-frontend-nextjs` (`ba-express` v1.0.7) e `logix-sphere-backend` (`ba-express-backend`).
**Data do mapeamento:** 21/09/2026 — feito a partir do código real de `main` nos dois repositórios.
**Documento irmão:** `logix-sphere-backend/docs/CONTRATO-DE-API-PARA-PAGES.md` (o lado do servidor).

> Este documento descreve **o sistema como ele é hoje**, não como gostaríamos que fosse. Onde o código
> diverge da documentação anterior ou de si mesmo, isso está registrado na seção
> [Divergências encontradas](#divergências-encontradas) em vez de ser escondido.

---

## 1. Em uma frase

Uma page é uma rota do App Router dentro de `app/(private)/` que monta uma casca compartilhada
(`NavbarWrapper` + layout privado), busca dado através de um módulo de `lib/` — nunca com `fetch`
solto no componente — e depende de três camadas independentes de autorização para decidir quem a vê.

---

## 2. O mapa do sistema

```
navegador
   │
   ├─ middleware.ts .................. guarda de servidor: lê o cookie auth-token, decodifica o JWT,
   │                                   consulta lib/route-permissions.ts e redireciona
   │
   ├─ app/layout.tsx ................. html, fontes, Bootstrap, <Providers>
   │     └─ app/providers.tsx ........ QueryClientProvider + AuthProvider + patch do window.fetch
   │
   ├─ app/(private)/layout.tsx ....... casca privada: sidebar, navbar mobile, chat, Suspense
   │     └─ app/(private)/<rota>/page.tsx
   │            └─ NavbarWrapper
   │                   └─ componentes da própria pasta da page
   │                          └─ hooks/  ou  lib/*-api.ts
   │                                 └─ fetch → http(s)://<NEXT_PUBLIC_API_URL>/bff/...
   │
   └─ backend Express (/auth/* e /bff/*)
```

Números do repositório na data do mapeamento: **42 `page.tsx`** (37 privadas, 5 públicas), **37
`loading.tsx`**, **38 pages marcadas `"use client"`**, **25 pages usando `NavbarWrapper`**, **52
módulos em `lib/` e `lib/api/`**, **198 rotas expostas pelo backend em `/bff`**.

---

## 3. O caminho de um dado, ponta a ponta

Este é o percurso completo de um clique até o pixel. Cada número é um ponto onde a tela pode quebrar.

1. **O navegador pede a rota.** `middleware.ts` intercepta tudo que não seja asset estático
   (`matcher` exclui `_next/static`, `_next/image`, `favicon.ico` e imagens).
2. **Rota pública?** `/`, `/health`, `/register*`, `/reset-password*`, `/send-password-reset-token*`
   passam direto. Qualquer outra exige o cookie `auth-token`.
3. **Sem cookie** → redirect para `/` com `?callbackUrl=<rota pedida>`.
4. **Com cookie** → o middleware decodifica o payload do JWT à mão (`atob` do segundo segmento),
   confere `exp` e valida que `userTypeId` é um dos quatro valores conhecidos. Um `userTypeId`
   desconhecido derruba o cookie e manda para o login — é a proteção contra token forjado.
5. **`canAccessPath(userTypeId, pathname)`** decide. Admin passa em tudo; os demais só nas whitelists
   de `lib/route-permissions.ts`. Quem não passa é redirecionado para a home do seu perfil.
6. **O layout privado monta** e renderiza a page dentro de `Suspense`, com `PrivateRouteLoading` como
   fallback — é por isso que quase toda pasta de page tem um `loading.tsx` de uma linha.
7. **A page (client component) chama o dado**: ou por um hook de `hooks/` com TanStack Query, ou por
   `useEffect` + `useState` chamando um módulo de `lib/`.
8. **O módulo de `lib/` monta a URL** a partir de `NEXT_PUBLIC_API_URL`, anexa
   `Authorization: Bearer <token>` via `getBearerAuthHeader()` e dispara o `fetch`.
9. **`window.fetch` já foi patcheado** por `installApiFetchCredentials()` (chamado no `Providers`):
   toda chamada para a base da API ganha `credentials: "include"`, headers de no-cache, e o header
   de resposta `X-New-Token` é lido para manter o token client-side em sincronia com o refresh
   automático do backend.
10. **O backend autentica** (`authenticateJWT` / `authenticateAdminJWT` /
    `authenticateAdminOrSupervisorJWT`), executa `core → service → repository → PostgreSQL` e
    responde JSON.
11. **A resposta volta.** Se veio por `lib/api-client.ts`, as chaves são convertidas de `snake_case`
    para `camelCase` automaticamente. Se veio por `fetch` direto, **nada é convertido** — a tipagem
    TypeScript é uma promessa, não uma garantia de runtime.
12. **A page renderiza**, normalmente depois de passar o payload por um mapper local
    (`utils/<algo>Mappers.ts`) que traduz o formato do backend para o modelo da tela.

---

## 4. Onde cada coisa mora

| Camada | Caminho | Papel e regra |
|---|---|---|
| Rota | `app/(private)/<rota>/page.tsx` | Ponto de entrada. Monta `NavbarWrapper` e o conteúdo. Não concentra regra de negócio. |
| Loading | `app/(private)/<rota>/loading.tsx` | Uma linha: `return <PrivateRouteLoading />`. Skeleton instantâneo, não spinner. |
| Conteúdo | `app/(private)/<rota>/components/` | Componentes da própria tela. Só sobem para `components/` quando um **segundo** consumidor real aparecer. |
| Hooks locais | `app/(private)/<rota>/hooks/` | Estado e efeitos que só essa tela usa. |
| Tipos | `app/(private)/<rota>/types.ts` | Modelo da tela. Não é o DTO do backend. |
| Mappers | `app/(private)/<rota>/utils/*Mappers.ts` | Tradução DTO do backend → modelo da tela. É aqui que `snake_case` vira o formato da UI. |
| Estilos | `app/(private)/<rota>/styles.ts` / `styles.css` | Estilo da tela. |
| Constantes | `app/(private)/<rota>/constants.ts` | Valores só dessa tela. IDs de banco vão em `src/constants/businessRules.ts`. |
| Acesso a dado | `lib/<recurso>-api.ts` ou `lib/api/<recurso>.ts` | Toda chamada HTTP. Nenhum `fetch` em `.tsx`. |
| Hooks de dado | `hooks/use<Recurso>.ts` | `useQuery`/`useMutation`. Um hook por operação. |
| Casca | `app/(private)/components/` | `StandardPageLayout`, `PageHeader`, `PageContent`, `MobilePageShell`, `DgpPageFrame`. Exportados por `index.ts`. |
| UI genérica | `components/` e `components/ui/` | Design System do projeto (Radix + Tailwind + `class-variance-authority`). |
| Permissão de rota | `lib/route-permissions.ts` | Whitelist por `userTypeId`. Usada pelo middleware, pela sidebar e pelo Quick Access da home. |
| IDs fixos do banco | `src/constants/businessRules.ts` | `Object.freeze` em todos os níveis, cada ID documentado com origem e impacto. |
| Navegação | `components/beam-sidebar.tsx`, `nav-operations.tsx`, `nav-financial.tsx` | Onde a rota nova precisa ser declarada para aparecer no menu. |

O alias de import é `@/*` → raiz do projeto (`tsconfig.json`).

---

## 5. Autenticação e permissão — três camadas independentes

Cada camada protege contra uma coisa diferente, e **as três precisam estar alinhadas**. Mexer em uma
sem mexer nas outras é a causa mais comum de "a tela abre mas vem vazia" ou "o menu mostra um link
que dá redirect".

| Camada | Arquivo | O que faz | O que ela não faz |
|---|---|---|---|
| Servidor | `middleware.ts` + `lib/route-permissions.ts` | Bloqueia a rota antes de renderizar, lendo o cookie `auth-token`. | Não sabe nada além do `userTypeId` do JWT. Não valida assinatura. |
| Cliente | `RequireAuthClient` + `lib/auth.ts` | Confere `auth-token`/`auth-session` no cookie, com fallback para `sessionStorage`, e redireciona depois de 50ms de carência. | Não é segurança — é alinhamento de UI. |
| Backend | `middlewares/auth.ts` | Valida a assinatura do JWT de verdade e aplica `userTypeId === 1` (admin) ou `1 ou 3` (admin/supervisor) por rota. | Não sabe que rota do frontend chamou. |

### Tipos de utilizador

Definidos em `src/constants/businessRules.ts` (`BUSINESS_RULES.USER_TYPE`) e espelhados no backend:

| ID | Nome | Home de fallback no middleware |
|---|---|---|
| 1 | `ADMIN` | — (passa em tudo) |
| 2 | `DRIVER` (vendor/subcontratado) | `/daily-performance-insight` |
| 3 | `SUPERVISOR` | `/daily-game-plan` |
| 5 | `SERVICE_PARTNER` | `/home` |

Não existe `userTypeId` 4. Qualquer valor fora desta lista é tratado como token inválido.

### A regra que mais pega gente nova

**Uma page nova que você não adicionar a nenhuma whitelist é admin-only por padrão.** `canAccessPath`
retorna `true` para admin e, para todos os outros, exige match exato ou subpath em
`USER_TYPE_2_ALLOWED`, `USER_TYPE_3_ALLOWED` ou `USER_TYPE_5_ALLOWED`. Isso é seguro, mas silencioso:
o supervisor não vê erro, ele é redirecionado.

---

## 6. Os dois padrões de dados que coexistem

O repositório está em migração e você vai encontrar os dois. Saber qual é qual evita copiar o padrão
errado.

### Padrão A — TanStack Query (o alvo, use este)

```
page.tsx  →  hooks/useRecurso.ts  →  lib/recurso-api.ts  →  fetch  →  /bff/recurso
```

```ts
// hooks/useDeposits.ts — o padrão inteiro cabe em oito linhas
import { useQuery } from '@tanstack/react-query';
import { fetchDeposits } from '@/lib/api/deposits';

export function useDeposits() {
  return useQuery({
    queryKey: ['deposits'],
    queryFn: fetchDeposits,
  });
}
```

Hoje **18 hooks** seguem esse padrão. As query keys em uso são simples e por recurso: `['deposits']`,
`['vehicles']`, `['routes']`, `['costModels']`, `['vendorTypes']`, `['userTypes']`, e variantes com
parâmetro como `['vehicles', 'available', date]` ou
`["service-partner-invoices", { month, year, servicePartnerId }]`.

**Não existe um arquivo central de query keys.** Elas são declaradas inline em cada hook. Antes de
criar uma chave nova, procure por `queryKey:` no repositório para não colidir e para invalidar a
chave certa depois de uma mutation.

### Padrão B — `useState` + `useEffect` (legado, não replique)

A maioria das pages ainda carrega dado assim: estado local, `useCallback` com `try/catch`,
`setIsLoading`, e `alert()` no erro. `app/(private)/vehicles/page.tsx` é o exemplo mais completo (548
linhas). Funciona, mas não tem cache, não tem dedupe entre telas e não revalida.

Apenas **uma page** (`service-partner-invoices`) usa `useQuery` diretamente no `page.tsx`. Em page
nova, prefira sempre o Padrão A e mantenha o `useQuery` dentro de um hook.

### O cliente HTTP: `lib/api-client.ts` vs `fetch` direto

`lib/api-client.ts` é o cliente completo — monta query params, injeta o Bearer, força `no-store`,
deduplica mutações idênticas em voo (proteção contra duplo clique), trata erro com mensagem do corpo,
lida com `204`, e **converte a resposta de `snake_case` para `camelCase`**.

Apesar disso, **apenas 6 módulos em todo o projeto o importam**; 18 módulos de `lib/` fazem `fetch`
direto. Essa é a diferença que mais gera bug silencioso:

```ts
// fetch direto: isto NÃO converte nada. É só uma asserção de tipo.
const data: VehiclePaginatedResponseDTO = await response.json();
```

O backend devolve `vehicle_id`, `registration_plates`, `fuel_type`. Se o seu mapper lê `vehicleId`,
ele recebe `undefined` e cai no default. **Em page nova, use `lib/api-client.ts`.** Se por algum
motivo precisar de `fetch` direto, escreva o mapper contra o `snake_case` real do backend e confira
no Network do navegador, não na tipagem.

---

## 7. Cache e revalidação

`app/providers.tsx` configura o `QueryClient` assim:

```ts
staleTime: 0,
gcTime: 0,
retry: 1,
refetchOnMount: "always",
refetchOnWindowFocus: true,
refetchOnReconnect: true,
```

Ou seja: **hoje o projeto não tem cache de fato** — todo mount refaz a request. Some-se a isso o
`next.config.ts`, que manda `Cache-Control: no-store` em todas as respostas, e o `api-client`, que
força `cache: "no-store"` e headers de no-cache em cada chamada. A postura atual é "sempre fresco,
nunca cacheado".

`docs/react-query-defaults.md` descreve uma configuração diferente (`staleTime` de 5 minutos,
`refetchOnWindowFocus: false`). **Aquele documento está desatualizado** — vale como registro do
racional original, não como descrição do comportamento atual.

Consequência prática para quem escreve page: você provavelmente não precisa se preocupar em
invalidar cache de leitura, mas **precisa** chamar `invalidateQueries` depois de uma mutation, porque
outra tela montada pode estar exibindo o dado antigo.

---

## 8. Passo a passo para criar uma page nova

1. **Confirme o endpoint no backend antes de escrever qualquer linha.** Abra
   `logix-sphere-backend/src/router/routes.ts` e localize o path exato, o método e qual middleware de
   auth ele usa. Não invente path.
2. **Crie a pasta da rota**: `app/(private)/<minha-rota>/` com `page.tsx` e `loading.tsx`.
   O `loading.tsx` é sempre `return <PrivateRouteLoading />`.
3. **Escreva o `page.tsx` como orquestrador**: `"use client"`, `NavbarWrapper` por fora, e o conteúdo
   num componente separado. Se a tela for pesada, siga o padrão de `daily-game-plan/page.tsx`, que usa
   `dynamic(..., { ssr: false })` com um fallback próprio.
4. **Crie o módulo de acesso a dado** em `lib/<recurso>-api.ts` usando `lib/api-client.ts`:
   ```ts
   import { api } from "@/lib/api-client";
   export const fetchMinhaCoisa = (params: MinhaCoisaFilters) =>
     api.get<MinhaCoisaDTO[]>("/bff/minha-coisa", { params });
   ```
5. **Crie o hook** em `hooks/useMinhaCoisa.ts` com `useQuery`, escolhendo uma `queryKey` que ainda não
   exista no repositório.
6. **Declare o tipo da tela** em `types.ts` e o mapper em `utils/` — mantenha o DTO do backend fora
   dos componentes.
7. **Monte a UI** com os componentes de `app/(private)/components` (`StandardPageLayout`, `PageHeader`,
   `PageContent`, `PageSection`) e com `components/ui`. Não crie um padrão de header novo.
8. **Registre a rota na navegação**: adicione a entrada em `components/beam-sidebar.tsx` (bloco de
   operações ou financeiro, conforme o caso) e, se for o caso, no Quick Access da home.
9. **Libere o acesso**: adicione o path às whitelists de `lib/route-permissions.ts` para cada perfil
   que deve enxergar a tela. Sem isso, só admin entra.
10. **Valide os três estados**: loading, vazio e erro — e nos dois tamanhos, desktop e mobile. O
    layout privado já tem navbar mobile própria (`MobileNavBar`) e safe areas.
11. **Rode os gates**: `npx tsc --noEmit`, `npx eslint .`, `npm test`, `npm run build`.

---

## 9. Regras — o que nunca fazer

- **Nunca** `fetch` dentro de um `.tsx`. Acesso a dado mora em `lib/`. Hoje há quatro arquivos
  violando isso — `schedule/page.tsx`, `daily-performance-insight/page.tsx`,
  `week-planner/components/AvailableVendors.tsx` e `week-planner-operations/page.new.tsx` (este
  último sequer é uma rota: `.new.tsx` é arquivo morto). Não aumente a conta.
- **Nunca** inventar um endpoint que não esteja em `routes.ts` do backend.
- **Nunca** confiar na tipagem de uma resposta obtida por `fetch` direto. Ou use `api-client` (que
  converte), ou escreva o mapper contra o `snake_case` real.
- **Nunca** usar um ID numérico de banco solto no código. Ele vai em `src/constants/businessRules.ts`
  com origem, motivo e impacto documentados — é o padrão que o arquivo já segue.
- **Nunca** adicionar rota privada sem atualizar `lib/route-permissions.ts` **e** a sidebar. As três
  camadas precisam concordar.
- **Nunca** colocar segredo em variável `NEXT_PUBLIC_*`. Elas são inlinadas no bundle pelo
  `next build` e ficam visíveis no navegador — o próprio `ci.yml` documenta isso.
- **Nunca** usar caminho absoluto de máquina local em código ou documentação.
- **Nunca** guardar dado de servidor em estado global de UI. Dado de servidor é do TanStack Query.
- **Nunca** confiar no `npm run build` como validação: `next.config.ts` tem
  `typescript.ignoreBuildErrors: true` e `eslint.ignoreDuringBuilds: true`. O build passa com o
  código quebrado.
- **Nunca** promover um componente de page para `components/` sem um segundo consumidor real.

---

## 10. Checklist de PR

```text
[ ] O endpoint existe em logix-sphere-backend/src/router/routes.ts (path, método e middleware conferidos)
[ ] Acesso a dado está em lib/, não no .tsx
[ ] Usei lib/api-client.ts (ou escrevi o mapper contra o snake_case real do backend)
[ ] queryKey nova não colide com nenhuma existente
[ ] Mutation invalida as queries afetadas
[ ] Rota adicionada às whitelists de lib/route-permissions.ts para cada perfil que deve ver a tela
[ ] Rota declarada na sidebar (beam-sidebar / nav-operations / nav-financial)
[ ] loading.tsx criado
[ ] Estados de loading, vazio e erro validados
[ ] Desktop e mobile validados
[ ] Nenhum ID de banco solto (foi para businessRules.ts)
[ ] Nenhum segredo em NEXT_PUBLIC_*
[ ] npx tsc --noEmit sem erro novo
[ ] npx eslint . limpo
[ ] npm test passando
[ ] npm run build passando
[ ] Título da PR contém a chave Jira (ABC-123)
[ ] Descrição da PR tem a seção "## O que foi feito" preenchida
```

As duas últimas linhas não são estilo: `.github/workflows/pr-validation.yml` reprova a PR
automaticamente sem elas.

---

## 11. Os portões automáticos

| Workflow | Quando roda | O que exige |
|---|---|---|
| `pr-validation.yml` | abertura/edição de PR | chave Jira no título, seção "O que foi feito" preenchida |
| `ci.yml` (job `validate`) | PR e push em `development`/`production` | lint, typecheck com baseline, testes (Vitest), build de fumaça |
| `ci.yml` (job `package`) | push | build por ambiente, empacotamento standalone, smoke test que sobe `node server.js` e exige `/health` respondendo 200 |
| `cd.yml` | após o CI do mesmo SHA | promoção do artefato |

O typecheck usa **baseline**: `scripts/typecheck-baseline.json` congela a dívida de tipos herdada e o
gate só reprova em erro **novo**. Se você pagar dívida, rode `npm run typecheck:update-baseline`.

O frontend gera **um artefato por ambiente**, porque as `NEXT_PUBLIC_*` são inlinadas no bundle — um
pacote de homologação não pode ser promovido para produção. O detalhe completo está em
`docs/ARTEFATO-E-RELEASES.md`.

---

## 12. Divergências encontradas

Registradas aqui porque foram encontradas no código durante o mapeamento. Cada uma precisa de uma
decisão de alguém — nenhuma foi alterada.

1. **`docs/react-query-defaults.md` está desatualizado.** Descreve `staleTime: 5min` e
   `refetchOnWindowFocus: false`; `app/providers.tsx` usa `staleTime: 0`, `gcTime: 0` e
   `refetchOnWindowFocus: true`. Ou o documento é corrigido, ou a configuração é revertida.

2. **Duas rotas nas whitelists não existem.** `USER_TYPE_5_ALLOWED` libera
   `/daily-operations-insight` e `/invoices`; não há `page.tsx` para nenhum dos dois. As rotas reais
   parecidas são `/daily-operations-reports` e `/financial-invoices`. Ou o service partner está sem
   acesso a telas que deveria ver, ou são entradas mortas.

3. **Possível mismatch de case em `/vehicles`.** `fetchVehiclesPaginated` (`lib/vehicles.ts`) faz
   `fetch` direto e afirma o tipo camelCase; o repositório do backend devolve `vehicle_id`,
   `registration_plates`; e `mapBackendToFrontend` lê `vehicleId`, `registrationPlates`. Se não houver
   conversão em algum ponto que não encontramos, a tela renderiza IDs zerados e placas vazias.
   **Verificar no Network antes de concluir.**

4. **Filtros de veículo que provavelmente não filtram.** O frontend envia `registrationPlate` e
   `fuelType`; `vehicles-core.ts` lê `req.query.registration_plate` e `req.query.fuel_type`. O
   `servicePartnerId` é enviado e não é lido por `getAllVehicles`. `search`, `active`, `model`,
   `manufacturer`, `currentPage` e `totalItensPerPage` batem.

5. **O `cacheService` do backend é um no-op.** Em `src/infra/cache.ts`, o corpo de `set()` está
   inteiramente comentado — nada é gravado, então todo `get()` erra. Serviços que fazem
   `cacheService.set(...)` acham que estão cacheando e não estão.

6. **O README do frontend cita um caminho local de máquina** (`C:\Users\jhoph\Desktop\back`), o que a
   própria regra do projeto proíbe.

7. **`.agents/` não está no repositório.** `WORKFLOW_ONBOARDING_IMPLEMENTATION_FLOW.md` instrui a usar
   `.agents/commands/*.md` e `.agents/scripts/sync-agents.js`, mas essa pasta não existe no snapshot
   de `main`. Os comandos `/sync-agents`, `/verify-architecture` etc. não têm como rodar.

8. **Pasta legada `daily-game-plan-antiga`.** Excluída do `tsconfig.json` e descrita no README como
   código morto sem rota. Vale deletar em vez de manter excluída.
