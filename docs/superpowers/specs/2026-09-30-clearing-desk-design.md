# Design — Clearing Desk (`/clearing-desk`)

**Data:** 30/09/2026
**Status:** aguardando revisão antes do plano de implementação
**Fonte visual:** `clearing-desk-react` — exportação React/TypeScript/CSS das seis telas da página Layout (`1:10`) do Figma "Clearing Desk" (`H6pTq5dJfpzGt6vPiZNcIf`), com 20 SVGs originais, fontes locais e seis capturas desktop
**Fonte de convenções:** `ANATOMIA-DE-UMA-PAGE.md` (seções 5, 6, 8, 9 e 10)

---

## 1. Em uma frase

Uma page nova em `app/(private)/clearing-desk/`, visível para admin e supervisor, que
reproduz a tela de autorização e liquidação de pagamentos do Figma dentro da casca
`NavbarWrapper` — com o dado passando por `lib/clearing-desk-api.ts` e TanStack Query,
servido por fixtures enquanto o backend não expõe os endpoints, sem que a troca para a
API real exija mudar um componente sequer.

---

## 2. Decisões tomadas antes deste documento

Quatro escolhas feitas em conversa, registradas aqui para que o plano não as reabra:

1. **Página de produção**, não protótipo. O `ANATOMIA-DE-UMA-PAGE` vale à risca no que
   diz respeito a dado, permissão e gates.
2. **Mock-first com rota de migração.** Não existe endpoint de clearing desk no backend —
   confirmado por leitura de `logix-sphere-backend/src/router/routes.ts` (313 linhas,
   nenhuma ocorrência de `clearing`).
3. **Padrão das telas operacionais** (`week-planner`, `route-balance`, `daily-game-plan`):
   `app/(private)/components/NavbarWrapper` direto, componentes na pasta da page, CSS
   escopado. Não `StandardPageLayout` — ver seção 9.
4. **Admin e supervisor.** Driver não vê a tela.

---

## 3. Escopo funcional

A exportação traz seis frames do Figma. Eles **não são seis telas**: são seis estados de
uma única tela, mais um formulário. O mapeamento:

| Frame Figma | Estado | Vira |
| --- | --- | --- |
| `154:795` | fila com seis itens, Diego selecionado | estado inicial |
| `154:1134` | Carlos selecionado, uma aprovação feita | estado normal após 1 aprovação |
| `154:1486` | Lee selecionado, duas aprovações | idem, após 2 |
| `154:1842` | Aliu selecionado, três aprovações, aviso de progresso | idem + aviso dispensável |
| `154:2225` | fila vazia, seis no histórico | painel de conclusão |
| `154:2524` | formulário de edição do Carlos | modo de edição do painel central |

A galeria com rotas por hash (`/#initial`, `/#edit`, …) que o export traz para revisão
**fica de fora**: é ferramenta de inspeção do entregável, não funcionalidade.

### Comportamentos que entram

- Selecionar um item da fila; o painel central reflete a seleção.
- Buscar na fila por nome, rota ou veículo.
- Aprovar um item: sai da fila, entra em "Cleared session", contador e progresso sobem.
- Devolver um item aprovado à fila: o inverso.
- Editar nome, veículo, modalidade de pagamento, sort, valor de sort e serviço adicional.
- Salvar nota de gestão por rota.
- Dispensar o aviso de progresso.
- Fila vazia rende o painel de conclusão (troféu, "ZERO QUEUE & MAXIMUM RECOGNITION").

### Comportamentos que não entram

- Execução de pagamento. A tela autoriza e liquida registro; não move dinheiro.
- Autenticação própria — as três camadas do app já resolvem (seção 7).
- Os módulos dos outros ícones laterais: não estão no design fornecido.

---

## 4. Estrutura de pastas

```
app/(private)/clearing-desk/
  page.tsx                    "use client"; NavbarWrapper; orquestrador
  loading.tsx                 return <PrivateRouteLoading />
  ClearingDeskContent.tsx     composição; consome o hook
  types.ts                    tipos da tela (sem DTO)
  styles.css                  escopado sob .clearing-desk
  components/
    PendingQueue.tsx          coluna esquerda: busca + lista + contador "6 TOTAL"
    PayeeCard.tsx             item da fila (id, nome, veículo, modalidade, PENDING)
    ClearingPanel.tsx         painel central: detalhe + botão APPROVE
    RouteBalanceResume.tsx    postcodes / stops / pre-12
    PayableEstimate.tsx       per stop / total
    ManagementNotes.tsx       textarea + SAVE NOTE
    ClearedSession.tsx        coluna direita: "N / 6 CLEARED" + cartões
    PayeeEditor.tsx           formulário (frame 154:2524)
    CompletionPanel.tsx       estado de fila vazia
  utils/mappers.ts            DTO snake_case → tipo da tela

lib/clearing-desk-api.ts              acesso a dado
lib/mocks/clearing-desk-fixtures.ts   fixtures das seis pessoas
hooks/useClearingDesk.ts              useQuery + as quatro mutations
public/clearing-desk/assets/          os 20 SVGs do export
```

Nenhum componente é promovido para `components/` — a regra do doc exige um segundo
consumidor real, e não há.

---

## 5. Camada de dados

### 5.1 O mock já é arquitetura do repo

Não se inventa uma camada paralela. `lib/api-client.ts` já curto-circuita quando
`MOCK_MODE` está ligado (`lib/mock-api.ts:4` — ligado por padrão, desliga com
`NEXT_PUBLIC_MOCK_MODE=false`):

```
api.get("/bff/clearing-desk")
  → MOCK_MODE ? mockPayload(url, "GET") : fetch real
       → pagePayload(parsed)  ← lib/mocks/page-payload.ts, casa path → fixture
```

A migração para a API real é, portanto, **uma variável de ambiente** — não uma troca de
arquivo e muito menos uma reescrita.

### 5.2 Contrato proposto

Paths propostos, a confirmar com o backend antes de irem para `routes.ts`. Enquanto não
existirem, só o ramo de mock responde.

```ts
// lib/clearing-desk-api.ts
export const fetchClearingDeskQueue = (params: { depot?: string; date?: string }) =>
  api.get<ClearingDeskQueueDTO>("/bff/clearing-desk", { params });

export const approveClearing = (id: string) => api.post(`/bff/clearing-desk/${id}/approve`, {});
export const returnToQueue   = (id: string) => api.post(`/bff/clearing-desk/${id}/return`, {});
export const updatePayee     = (id: string, body: PayeeUpdateDTO) =>
  api.patch(`/bff/clearing-desk/${id}`, body);
export const saveRouteNote   = (id: string, note: string) =>
  api.put(`/bff/clearing-desk/${id}/note`, { note });
```

Middleware de auth sugerido quando o backend implementar:
`authenticateAdminOrSupervisorJWT` — já existe em
`logix-sphere-backend/src/middlewares/auth`.

### 5.3 Query e mutations

`queryKey: ["clearing-desk", depot, date]`. Verificado contra o repositório: não colide.

As quatro mutations fazem **update otimista do cache** e, no `onSettled`, invalidam a
key. O update otimista não é luxo: em `MOCK_MODE` todo não-GET devolve
`{ success: true, message: "Demo action completed (not persisted)" }`
(`lib/mock-api.ts:45`), então sem ele a tela não reagiria a nada. Com backend real, o
`invalidateQueries` reconcilia e o otimismo vira só percepção de velocidade.

---

## 6. Modelo de domínio — três correções sobre o export

O `src/data.ts` do export transcreveu os valores como aparecem na tela. Para uma page de
produção isso não se sustenta:

| Campo no export | Problema | Vira |
| --- | --- | --- |
| `payment: '£160'` / `'£145.00 flat'` / `'—'` | moeda, modalidade e ausência no mesmo campo de texto | `payment: { amount: number \| null; flat: boolean }` |
| `sortValue: '0,00'` e `'20.00'` | vírgula e ponto decimais misturados na mesma lista | `sortValue: number` |
| total `£21,420.00` | valor estático da tela de conclusão | calculado a partir dos itens |

`payment.amount: null` é exatamente o caso do Terry Roberts e do Codrin Stephan, cujos
detalhes financeiros não aparecem em nenhum dos seis frames. Renderiza `—`, como no
Figma. Formatação (`£`, sufixo `flat`, separador) é responsabilidade da UI; o dado é
número.

Tipo resultante:

```ts
export type PaymentMode = 'DAF' | 'DR' | 'VSR' | 'SP_VSR';

export interface Payee {
  id: string;            // rota: DY1B, MD7E, DHOC, DY1A, LL2A, LL2X
  name: string;
  vehicle: string | null;    // null = "NOVEHICLE" no design
  mode: PaymentMode;
  payment: { amount: number | null; flat: boolean };
  sort: boolean;
  sortValue: number;
  adhoc: string | null;
  perStop: number;
}
```

O mapper em `utils/mappers.ts` converte o DTO `snake_case` do backend para esse tipo e é
onde a vírgula decimal e o `—` são normalizados. É também a unidade mais testável da
tela — ver seção 8.

---

## 7. Permissões e navegação

As três camadas precisam concordar, conforme a regra do doc:

1. **`lib/route-permissions.ts`** — `"/clearing-desk"` entra em `USER_TYPE_3_ALLOWED`.
   Admin já passa pelo bypass de `canAccessPath`. Driver e service partner ficam fora.
2. **Sidebar** — entrada no grupo `Operations` de `sidebarGroups`, em
   `app/(private)/components/NavbarWrapper.tsx`. O filtro por role já existente
   (`canShowSearchPage`, linhas 180-182, aplicado em `visibleGroups` na 184) lê a mesma
   whitelist, então o item aparece e some sozinho, sem condicional nova.
3. **Middleware** — nada a fazer: `middleware.ts` já consulta `canAccessPath`.

Correção adjacente: `NavbarWrapper.tsx:29` declara
`type NavKey = "home" | "week-planner" | "route-balance" | "cleaning-desk"` — com
`cleaning` no lugar de `clearing`, e nunca ligado a nada. Passa a `"clearing-desk"`.

---

## 8. Estados, erro e responsivo

| Estado | Tratamento |
| --- | --- |
| Navegação | `loading.tsx` com `PrivateRouteLoading`, como as demais |
| Carregando dado | skeleton na fila; painel central e direita neutros |
| Fila vazia | **não** é vazio genérico: é o `CompletionPanel` do frame `154:2225` |
| Erro | mensagem e botão de retry que refaz a query |
| Mobile | o design é desktop 1280 px; abaixo de 900 px as três colunas empilham |

O README do export declara ausência de overflow horizontal a 1280 px e 390 px; isso é
critério de aceitação, não cortesia.

---

## 9. Divergências assumidas

Registradas em vez de escondidas, no espírito da seção 12 do `ANATOMIA-DE-UMA-PAGE`.

1. **Não usa `StandardPageLayout`.** O doc (seção 8, passo 7) o prescreve, mas ele monta
   `WelcomeHeader` + `GradientDotsBackground` sobre `@/components/navbar-wrapper` — outra
   casca. O Clearing Desk foi desenhado sobre a casca de `app/(private)/components/NavbarWrapper`,
   a mesma de `week-planner`, `route-balance` e `daily-game-plan`. Seguir o doc aqui
   produziria uma tela que não corresponde ao Figma aprovado. Adoção real medida no
   repositório em 30/09/2026: 5 pages de 39 privadas usam `StandardPageLayout`. (O
   `ANATOMIA-DE-UMA-PAGE` diz 37 privadas e 5 públicas; a contagem de hoje é 39 e 6.)
2. **Endpoint ainda não existe.** O doc manda confirmar o path em `routes.ts` antes de
   escrever a primeira linha. Não há o que confirmar; os paths da seção 5.2 são proposta,
   e a tela funciona por fixtures até o backend responder. A decisão de seguir assim foi
   explícita.
3. **`sidebarGroups` em vez de `beam-sidebar.tsx`.** O doc (passo 8) cita
   `components/beam-sidebar.tsx`; a navegação efetivamente renderizada hoje é a de
   `NavbarWrapper.tsx`. Registro a menção desatualizada do doc e sigo o código.
4. **Estado de carregamento é um único `<p role="status">`, não um skeleton.** A
   seção 8 pede "skeleton na fila; painel central e direita neutros". O port
   renderiza `<p role="status">Loading transactions…</p>` no lugar das três colunas
   até o board chegar. Mais simples que o skeleton descrito e sem equivalente nos
   estados do export original; registrado em vez de construído sem necessidade
   comprovada.
5. **Breakpoints de 760 px e 1190 px, não "abaixo de 900 px".** A seção 8 diz que as
   três colunas empilham "abaixo de 900 px". O CSS portado (herdado do export Figma)
   empilha abaixo de 760 px e vai para duas colunas entre 760 px e 1190 px. Os
   números do CSS do export prevalecem sobre o número solto do doc, já que o
   objetivo é corresponder ao Figma aprovado.

---

## 10. Testes e gates

Vitest + Testing Library, no padrão dos 27 arquivos existentes.

**Mappers** (`utils/mappers.test.ts`) — a unidade de maior risco:
- `'£160'` → `{ amount: 160, flat: false }`
- `'£145.00 flat'` → `{ amount: 145, flat: true }`
- `'—'` → `{ amount: null, flat: false }`
- `'0,00'` e `'20.00'` → `0` e `20`
- `'NOVEHICLE'` → `null`

**Tela** (`ClearingDeskContent.test.tsx`):
- aprovar move o item da fila para a sessão e incrementa o contador
- devolver reverte ambos
- busca filtra por nome, por rota e por veículo
- fila vazia rende o `CompletionPanel`, não um vazio genérico
- total é soma dos itens, não `£21,420.00` fixo

**Permissões** (`lib/route-permissions.test.ts`): admin e supervisor acessam
`/clearing-desk`; driver não.

**Gates**, todos obrigatórios antes de considerar pronto:

```
npx tsc --noEmit
npx eslint .
npm test
npm run build
```

O doc avisa que `npm run build` não valida nada sozinho — `next.config.ts` traz
`typescript.ignoreBuildErrors: true` e `eslint.ignoreDuringBuilds: true`. Por isso os
quatro, não só o último.

---

## 11. Fora de escopo

- Criar os endpoints no backend.
- Cálculo real de folha. As fixtures vêm do design; `perStop` de £2 é demonstrativo e
  precisa ser substituído por regra real antes de uso operacional.
- Os módulos dos demais ícones da sidebar do Figma.
- Um frame mobile próprio: não existe no Figma; a adaptação é decisão de implementação.
