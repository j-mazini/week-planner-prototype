# Catálogo de pages — logix-sphere-frontend-nextjs

**Para:** quem precisa saber o que cada tela do LogixSphere faz, quem a enxerga e o que ela tem de
particular — antes de mexer nela ou de criar uma parecida.
**Data do mapeamento:** 21/09/2026, a partir do código real de `main`.
**Documento irmão:** `docs/ANATOMIA-DE-UMA-PAGE.md` (como uma page é construída) e
`logix-sphere-backend/docs/CONTRATO-DE-API-PARA-PAGES.md` (o que o servidor entrega).

> Cada ficha descreve **o que está no código hoje**. Onde uma tela não tem camada de dados, está
> órfã do menu ou duplica outra, isso está dito na ficha, não escondido.

---

## Como ler uma ficha

**Função** é o que a tela faz. **Quem vê** lista os perfis liberados em `lib/route-permissions.ts` —
admin (`userTypeId` 1) enxerga tudo, então só os outros perfis aparecem; "só admin" significa que a
rota não está em nenhuma whitelist. **Menu** diz por onde se chega. **Dado** nomeia os endpoints ou
módulos de `lib/` que a tela consome. **Particularidades** é o que você precisa saber antes de
encostar nela.

Referência de perfis: `2` = driver/vendor, `3` = supervisor, `5` = service partner.

---

## Mapa rápido

| Rota | Perfis além de admin | Menu | Porte |
|---|---|---|---|
| `/home` | 3, 5 | — | ~9.000 linhas |
| `/week-planner` | 3, 5 | sidebar | ~31.300 linhas |
| `/daily-operations-management` | — | sidebar | ~21.800 linhas |
| `/daily-game-plan` | 3 | sidebar | ~5.100 linhas |
| `/daily-operations-reports` | 3 | sidebar | ~3.600 linhas |
| `/vendor` | 5 | sidebar | ~9.700 linhas |
| `/vehicles` | 5 | sidebar | ~3.200 linhas |
| `/contract-management` | — | sidebar | ~10.500 linhas |
| `/assets` | — | sidebar | ~700 linhas |
| `/vendor-performance` | 3, 5 | sidebar | ~4.400 linhas |
| `/daily-financial-insights` | 5 | sidebar | ~5.100 linhas |
| `/deductions-disbursements-recharges` | — | sidebar | ~5.700 linhas |
| `/financial-invoices` | — | sidebar | ~2.000 linhas |
| `/service-partner-invoices` | 5 | sidebar | ~3.000 linhas |
| `/adhoc-works-invoice-management` | — | sidebar | ~1.200 linhas |
| `/invoice-processing-workflow` | — | — | ~2.300 linhas |
| `/daily-financials` | — | — | ~900 linhas |
| `/schedule` | — | — | ~1.100 linhas |
| `/requests-inbox` | — | — | ~2.000 linhas |
| `/requests-admin` | — | — | ~550 linhas |
| `/daily-performance-insight` | 2, 3 | mobile | ~1.100 linhas |
| `/subcontractor` | 2, 3 | mobile | ~1.500 linhas |
| `/current-month` | 2, 3 | mobile | ~1.700 linhas |
| `/current-performance` | 2, 3 | mobile | ~840 linhas |
| `/deductions` | 2, 3, 5 | mobile | ~1.100 linhas |
| `/mobile-invoice` | 2, 3 | mobile | ~750 linhas |
| `/requests` | 2, 3 | mobile | ~1.100 linhas |
| `/op-management` | — | — | órfã |
| `/operations-management` | — | — | órfã |
| `/week-planner-operations` | — | — | só redirect |
| `/daily` | — | — | protótipo |
| `/logistics` | — | — | protótipo |
| `/op-dashboard` | — | — | protótipo |
| `/performance` | — | — | protótipo |
| `/invoice-history` | — | — | protótipo |
| `/financial-management` | — | — | placeholder |
| `/financial-performance` | — | — | placeholder |

São 37 rotas privadas. **Quatorze** estão na sidebar, **sete** na barra mobile, e **dezesseis** não
estão em nenhum menu.

---

## 1. Operação diária

### `/week-planner` — Planejamento semanal
**Função.** A tela de planejamento da semana: monta a escala, atribui vendor e veículo a rota, trata
day-off, compara dias e exporta a escala.
**Quem vê.** Supervisor (3) e service partner (5). **Menu:** sidebar.
**Dado.** `/bff/week-planners`, `/bff/daily-team-support` (com bulk e troca de utilizador),
`/bff/deposits/with-routes`, `/bff/vehicles`, `/bff/vendor`, `/bff/operations/from-week-planners`,
`/bff/user-types`, `/bff/management-team-functions`.
**Particularidades.** É a maior tela do sistema — 84 arquivos, cerca de 31.300 linhas, com
subpastas próprias de `DailyView`, `Dashboard`, `Modals` e `Common`. Tem exportação de escala em
Excel e em PDF (modais `ExportDayScheduleModal` e `ExportWeekScheduleModal`), controle de
visibilidade de rotas flex, feriados bancários via `useBankHolidays`, e usa `useSubmitGuard` contra
duplo envio. Qualquer mudança aqui é mudança de alto risco: comece lendo
`components/Common` antes de tocar em qualquer outra coisa.

### `/daily-operations-management` — Operações do dia
**Função.** Gestão das operações do dia a partir do planejamento: cria operações em lote a partir dos
week planners, registra day-off, edita e finaliza.
**Quem vê.** Só admin. **Menu:** sidebar ("Daily Operations Management").
**Dado.** `/bff/week-planners` (incluindo `/without-operations/paginated`,
`/finished-with-operations/paginated`, `/bulk`, `/export`, `/types`),
`/bff/daily-operations-management` (e `/day-off`), `/bff/operations/bulk`,
`/bff/operations/from-week-planners`.
**Particularidades.** **O código não está nesta pasta.** `app/(private)/daily-operations-management/page.tsx`
tem uma única linha: `export { default } from '@/app/(private)/week-planner-operations/page'`. Toda
a implementação — 77 arquivos, ~21.800 linhas — vive em `week-planner-operations/`, e o
`next.config.ts` redireciona `/week-planner-operations` para cá permanentemente. Ou seja: a URL
canônica é esta, o código mora na outra pasta. É a primeira coisa que confunde quem chega.

### `/daily-game-plan` — Plano do dia
**Função.** Execução do dia em tempo real: abre e fecha a operação, transiciona status por operação,
acompanha o que está em curso por depósito e trata o que não foi alocado.
**Quem vê.** Supervisor (3). **Menu:** sidebar.
**Dado.** `/bff/daily-game-plan` e `/bff/daily-game-plan/by-date/:date`,
`/bff/daily-game-plan-operations` (com `/stop` e `/transition`), `/bff/daily-team-support/last-7/user/:userId`,
`/bff/week-planners/bulk-approve`, `/bff/daily-operations-management/bulk` e `/day-off/bulk`.
**Particularidades.** É a única page que carrega o conteúdo com `dynamic(..., { ssr: false })` e um
fallback próprio — o `page.tsx` tem 28 linhas e só orquestra. É também a única page com um `api.ts`
próprio que importa `lib/api-client.ts` diretamente, junto de hooks dedicados (`useDailyGamePlanData`,
`useDepositsWithRoutes`). Tem frame visual próprio (`DgpPageFrame`, `DgpPageHeaderCard`) em vez do
`StandardPageLayout`. As rotas de escrita no backend exigem `authenticateAdminOrSupervisorJWT`.

### `/daily-operations-reports` — Operations Insights
**Função.** Relatório de operações por intervalo de datas, com exportação.
**Quem vê.** Supervisor (3). **Menu:** sidebar ("Daily Operations Insights").
**Dado.** `/bff/reports/by-date-range` e `/bff/reports/download/by-date-range`.
**Particularidades.** Tem paginação própria e exporta em Excel. Usa
`useServicePartnerNameByVendorName` para resolver o nome do parceiro a partir do nome do vendor — um
sintoma de que o backend não devolve esse vínculo pronto.

---

## 2. Cadastro e configuração

### `/vendor` — Vendors
**Função.** CRUD de vendors (subcontratados) com filtros, tabela em desktop, cartões em mobile,
modal de informação e exportação.
**Quem vê.** Service partner (5). **Menu:** sidebar.
**Dado.** `lib/vendors-api`, `lib/service-partners-api`, `lib/allowedDeposits`, e sete hooks de
apoio: `useCostModels`, `useDeposits`, `useRoutes`, `useServicePartners`, `useUserTypes`,
`useVehicles`, `useVendorTypes`.
**Particularidades.** ~9.700 linhas. É a tela que mais consome hooks de TanStack Query — bom exemplo
do padrão alvo. Tem view mobile separada (`VendorMobileView`), paginação própria e exportação em
Excel e PDF por `lazy-imports`.

### `/vehicles` — Frota
**Função.** CRUD de veículos com filtros (placa, modelo, fabricante, combustível, status, parceiro),
paginação e métricas de cabeçalho (total, ativos, inativos, disponíveis).
**Quem vê.** Service partner (5). **Menu:** sidebar.
**Dado.** `lib/vehicles` (→ `/bff/vehicles`), `lib/vendors-api` para depósitos,
`lib/service-partners-api`.
**Particularidades.** É o exemplo mais completo do **padrão legado** de dados: 548 linhas de
`page.tsx` com `useState` + `useEffect`, sem TanStack Query, e `alert()` no erro. Tem duas
divergências conhecidas registradas no doc de anatomia — filtros com nome de query param trocado, e
possível mismatch de `snake_case`/`camelCase` no mapper. Não use esta tela como modelo para page
nova; use-a como referência do que estamos migrando.

### `/contract-management` — Configuração contratual
**Função.** Tela de abas para a configuração que sustenta o resto do sistema: depósitos, rotas,
service types, tipos de vendor, cost models, categorias e serviços ad hoc, centros de custo da BA.
**Quem vê.** Só admin. **Menu:** sidebar.
**Dado.** `/bff/routes`, `/bff/service-types`, mais `lib/api/deposits`, `lib/api/routes`,
`lib/customers-api`, `lib/types-config-api`, `lib/service-partners-api`, `lib/vendors-api`.
**Particularidades.** 74 arquivos, ~10.500 linhas, organizada em abas com uma pasta `Modals/` que é
**reutilizada por `/assets`** — mexer num modal daqui afeta as duas telas. Mudança aqui muda o que
todas as outras telas oferecem como opção.

### `/assets` — Assets Management
**Função.** Cadastro dos tipos que alimentam os formulários do sistema: vendor types, user types,
cost models, vehicle types, Management & Support Team e categorias ad hoc.
**Quem vê.** Só admin. **Menu:** sidebar.
**Dado.** via `useAssetsPage` e os modais de `contract-management`.
**Particularidades.** Os seis modais são importados de `../contract-management/components/Modals/`
com `lazy()`. É a tela com maior acoplamento cruzado do repositório: ela não tem modais próprios.
Usa `MobilePageShell` e `DgpPageFrame`, com abas de rótulo curto para mobile.

---

## 3. Financeiro

### `/financial-invoices` — Faturas
**Função.** Lista e detalhe de faturas emitidas, com exportação.
**Quem vê.** Só admin. **Menu:** sidebar ("Invoices").
**Dado.** `/bff/invoices/:invoiceId/details`, `/bff/vendors`, via `useInvoicesQuery`.
**Particularidades.** Usa TanStack Query por hook. Exporta em Excel e gera PDF por `lazy-imports` e
`lib/pdf-utils`. Tem tratamento mobile próprio.

### `/service-partner-invoices` — Faturas do parceiro
**Função.** Fatura mensal do service partner: resumo, deduções, VAT, total geral, geração e
pré-visualização da fatura em PDF.
**Quem vê.** Service partner (5). **Menu:** sidebar.
**Dado.** `lib/service-partner-deductions-api`, `lib/service-partners-api`, pelos hooks
`useServicePartnerDeductions`, `useServicePartnerInvoicesTable`, `useServicePartnerMonthlySummary`.
**Particularidades.** É a **única page que chama `useQuery` diretamente no `page.tsx`** — todas as
outras deixam isso no hook. Tem constantes próprias de identidade visual da fatura
(`constants/baCompany.ts`, `constants/invoiceTheme.ts`) e gera o PDF da fatura.

### `/deductions-disbursements-recharges` — Deduções e recargas
**Função.** Gestão de deduções, desembolsos e recargas: lançamento, parcelamento, validação e
exportação.
**Quem vê.** Só admin. **Menu:** sidebar ("Deductions").
**Dado.** `lib/deductions-api`, `lib/deduction-installments`, `lib/deduction-validators`,
`lib/business-days`, `lib/vendors-api`, `lib/vehicles`, `lib/api/routes`.
**Particularidades.** ~5.700 linhas. Tem regra de parcelamento e validação em módulos próprios de
`lib/` — a lógica financeira não está na tela, e é ali que ela deve continuar. Usa
`useBankHolidays` para calcular dias úteis e `useSubmitGuard` contra duplo envio. Exporta em Excel e
PDF.

### `/adhoc-works-invoice-management` — Faturamento de trabalhos ad hoc
**Função.** Fechamento e faturamento dos trabalhos ad hoc do período, com exportação.
**Quem vê.** Só admin. **Menu:** sidebar.
**Dado.** `lib/adhoc-works-api` (→ `/bff/adhoc-works` e `/bff/adhoc-works/export`), `lib/pdf-utils`.
**Particularidades.** Navegação por semana ("Previous Week"), tabela com `TableFooter` de totais.
Gera PDF e Excel.

### `/daily-financial-insights` — Insights financeiros do dia
**Função.** Visão financeira das operações do dia, com edição e exclusão de operação a partir da
própria tela.
**Quem vê.** Service partner (5). **Menu:** sidebar.
**Dado.** `/bff/operations` (listar, editar e excluir por id), `/bff/reports/by-date-range`,
`/bff/routes`, `/bff/vehicles`, `/bff/vendor`, `/bff/adhoc-services`, mais `lib/api/cost-models` e
`lib/cost-models`.
**Particularidades.** É uma tela de leitura que também **escreve** — edita e exclui operação. Tem
paginação e `in-flight-guard` contra requisição duplicada.

### `/daily-financials` — Financeiro diário
**Função.** Fechamento financeiro por depósito e data, com mudança de status de operação e download
do relatório.
**Quem vê.** Só admin. **Menu:** nenhum — só por URL direta.
**Dado.** `/bff/reports`, `/bff/reports/download`, `/bff/operations/:id/status`,
`/bff/service-types/by-deposit/:depositId`.
**Particularidades.** Órfã de menu apesar de ser funcional e escrever no backend. Usa
`lib/date-store` (estado de data compartilhado, Zustand) — a data selecionada aqui é a mesma de
`/subcontractor` e `/daily-performance-insight`.

### `/invoice-processing-workflow` — Processamento de faturas
**Função.** Fluxo de processamento de faturas recebidas: criação individual e em lote, atualização
de item.
**Quem vê.** Só admin. **Menu:** nenhum.
**Dado.** `lib/invoice-processing-api`, `lib/pdf-utils`, `lib/lazy-imports`.
**Particularidades.** ~2.300 linhas em apenas 4 arquivos — quase toda a tela está no `page.tsx`. Usa
modais do Bootstrap via `window.bootstrap` com declaração global, o que a deixa dependente do script
carregado no `app/layout.tsx`. Órfã de menu, mas funcional.

### `/schedule` — Schedule for Payment
**Função.** Agenda de pagamento das faturas, com status `Scheduled` / `Paid` / `Pending`.
**Quem vê.** Só admin. **Menu:** nenhum.
**Dado.** `/bff/invoices/search`.
**Particularidades.** Faz `fetch` direto dentro do `page.tsx` — uma das quatro violações da regra de
camada de dados. Tem paginação própria.

---

## 4. Pedidos (day-off e afins)

### `/requests` — Meus pedidos (vendor)
**Função.** Onde o vendor cria e acompanha os próprios pedidos — tipicamente day-off.
**Quem vê.** Driver (2) e supervisor (3). **Menu:** barra mobile.
**Dado.** `lib/vendor-requests-api` (`createVendorRequest`, `fetchVendorRequests`).
**Particularidades.** É a ponta de entrada do fluxo de afastamento. Os IDs administrativos que esse
fluxo usa (rota OFF = 48, veículo placeholder = 37, depósito OFF = 4) estão em
`src/constants/businessRules.ts`, não no código da tela.

### `/requests-inbox` — Caixa de pedidos
**Função.** Onde os pedidos dos vendors são aprovados ou rejeitados, com e sem inserção do day-off.
**Quem vê.** Só admin. **Menu:** nenhum.
**Dado.** `lib/vendor-requests-api` (`approveVendorRequestWithoutDayOffInsert`,
`rejectVendorRequest`), `lib/day-off-api`, `lib/vendors-api`, hook `useDayOffItems`.
**Particularidades.** Existem **duas** telas administrativas de pedido — esta e `/requests-admin` —
e nenhuma das duas está em menu. A diferença é que esta trata o day-off em si; vale decidir qual
fica.

### `/requests-admin` — Administração de pedidos
**Função.** Aprovação e rejeição de pedidos de vendor, em tabela.
**Quem vê.** Só admin. **Menu:** nenhum.
**Dado.** `lib/vendor-requests-api`, `lib/vendors-api`, hook `useServicePartners`.
**Particularidades.** Dois arquivos, ~550 linhas. Ver a observação em `/requests-inbox`.

---

## 5. Portal do motorista e do vendor (mobile)

Estas sete telas formam a barra de navegação mobile e são o sistema inteiro do ponto de vista de
quem dirige. Todas são pensadas primeiro para telefone.

### `/daily-performance-insight` — Performance do dia
**Função.** O desempenho do dia do próprio motorista: paradas, códigos de falha ("Not Received",
"Failed Pick"), janela de tempo.
**Quem vê.** Driver (2) e supervisor (3). **Menu:** barra mobile.
**Dado.** `/bff/day-overview/:userId/:date`.
**Particularidades.** É a **home de fallback do driver** — quem tem `userTypeId` 2 e tenta uma rota
proibida cai aqui pelo middleware. Faz `fetch` direto no `page.tsx` (violação conhecida) e usa
`lib/date-store` para a data compartilhada.

### `/subcontractor` — Dia do subcontratado
**Função.** Visão do dia para o subcontratado, por data.
**Quem vê.** Driver (2) e supervisor (3). **Menu:** barra mobile.
**Dado.** `/bff/day-overview/:userId/:date`.
**Particularidades.** Compartilha a data com `/daily-performance-insight` e `/daily-financials` via
`lib/date-store`, com proteção contra data inválida no próprio componente.

### `/current-month` — Mês corrente
**Função.** Resumo do mês do motorista: ganhos, dias trabalhados, detalhe por dia.
**Quem vê.** Driver (2) e supervisor (3). **Menu:** barra mobile.
**Dado.** `/bff/daily-overview/list/:userId/:month/:year` e
`/bff/daily-overview/:userId/:year/:month/:day`.
**Particularidades.** Navegação por `MonthCarousel`, com estados explícitos de `Loading`, `Error` e
`NoData` como componentes separados — é o melhor exemplo de tratamento de estado vazio no
repositório.

### `/current-performance` — Performance do mês
**Função.** Performance agregada do mês com médias, para o motorista.
**Quem vê.** Driver (2) e supervisor (3). **Menu:** barra mobile.
**Dado.** `/bff/daily-overview/list/:userId/:month/:year`.
**Particularidades.** Encapsula o acesso a dado num hook local (`useCurrentPerformanceData`) em vez
de deixar no `page.tsx` — padrão a copiar mesmo sem TanStack Query.

### `/deductions` — Minhas deduções
**Função.** Deduções do mês do motorista, com progresso de quitação.
**Quem vê.** Driver (2), supervisor (3) **e** service partner (5) — é a única rota mobile liberada
para os três perfis. **Menu:** barra mobile.
**Dado.** `/bff/deductions/:userId/:month/:year`.
**Particularidades.** Aceita filtro por service partner na própria query, o que explica a liberação
para o perfil 5.

### `/mobile-invoice` — Minha fatura
**Função.** Faturas do motorista, com detalhe e download.
**Quem vê.** Driver (2) e supervisor (3). **Menu:** barra mobile.
**Dado.** `useInvoicesQuery` (TanStack Query) através de `useMobileInvoices`.
**Particularidades.** Reaproveita `components/invoice-details-modal.tsx`, que é global.

### `/home` — Painel inicial
**Função.** Painel do supervisor e do service partner: KPIs, status do Daily Game Plan, Quick Access,
notificações, performance própria e upload de planilha DISCO.
**Quem vê.** Supervisor (3) e service partner (5). **Menu:** é o destino de fallback do perfil 5.
**Dado.** `/bff/day-overview/:userId/:date`, `/bff/vehicles`, `/bff/vendor`, `/bff/status`,
`/bff/week-planners/day-off-items`, `/bff/liquidation-damage-deductions`, mais chat
(`lib/chat-conversations-api`, `lib/chat-users-api`) e `lib/daily-supervisor-check`.
**Particularidades.** 56 arquivos, ~9.000 linhas. É a única tela que usa **socket** (`use-socket`,
para o chat) e **`react-grid-layout`** (widgets reposicionáveis). Faz parsing de Excel no navegador
(`disco-excel-parser.ts`). Importa `lib/route-permissions` diretamente para montar o Quick Access
por perfil — se você mudar a whitelist, esta tela muda junto. **O `constants.ts` dela aponta para
oito rotas que não existem** (`/admin-settings`, `/admin-settings/backups`, `/security/alerts`,
`/operations-management/routes`, `/operations-management/kpis`, `/vendor/documents`,
`/training/compliance`, `/compliance/audit`).

### `/vendor-performance` — Performance de vendors
**Função.** Comparativo de performance entre vendors por período, com exportação.
**Quem vê.** Supervisor (3) e service partner (5). **Menu:** sidebar.
**Dado.** `/bff/daily-overview/list`, `/bff/daily-overview/summary`, `/bff/daily-overview/all/:month/:year`,
`lib/vendor-performance-api`.
**Particularidades.** 41 arquivos. Exporta em Excel e PDF. Usa `useBodyScrollLock` para travar o
scroll com modal aberto.

---

## 6. Telas órfãs, duplicadas e protótipos

Esta seção não é enfeite: são **onze das 37 rotas privadas**. Cada uma precisa de uma decisão —
completar, remover ou ligar ao menu.

### Duplicatas de operações
`/op-management` (~1.340 linhas) e `/operations-management` (~1.720 linhas) têm o mesmo título na
interface — "Daily Operations Management" — que a tela oficial `/daily-operations-management`. Ambas
consomem `lib/operations-management-api` de verdade, ambas estão fora de qualquer menu e de qualquer
whitelist. `/operations-management` ainda é referenciada pelo `constants.ts` da home. São três telas
para o mesmo trabalho.

### Redirect
`/week-planner-operations` tem `page.tsx` completo, mas o `next.config.ts` a redireciona
permanentemente para `/daily-operations-management` — que por sua vez reexporta este mesmo
`page.tsx`. A rota nunca é alcançada pelo utilizador; a pasta é onde o código realmente mora.

### Protótipos sem camada de dados
Estas cinco telas **não fazem nenhuma chamada ao backend** — renderizam dados fixos no próprio
código:

| Rota | Porte | O que aparenta ser |
|---|---|---|
| `/daily` | ~680 linhas | dashboard diário com calendário de dias úteis e métricas calculadas localmente (`metricsCalculator.ts`) |
| `/logistics` | ~910 linhas | visualização de rotas em loop |
| `/op-dashboard` | ~550 linhas | "Operations Dashboard" |
| `/performance` | ~540 linhas | tabela de performance por dia (stops, SPH, TW, arrive) |
| `/invoice-history` | ~1.370 linhas | "Invoice history and management", com dados fixos |

`/invoice-history` é a mais delicada das cinco: está linkada no `constants.ts` da home, então um
utilizador pode chegar nela e ver números que não são reais.

### Placeholders
`/financial-management` (13 linhas) e `/financial-performance` (44 linhas) renderizam apenas um
título — o segundo diz literalmente que as métricas "serão exibidas aqui". Ambos exibem o mesmo
título "Financial Management".

---

## 7. O que este catálogo torna visível

Cinco coisas que só aparecem quando se olha as 37 telas de uma vez:

**Onze rotas privadas são órfãs, duplicadas ou protótipos** — quase um terço do que existe. Nenhuma
está sinalizada na interface como incompleta.

**Três telas disputam o mesmo trabalho de gestão de operações**, e a que está no menu é a única cujo
código não está na própria pasta.

**Duas telas administrativas de pedidos** (`/requests-inbox` e `/requests-admin`) fazem trabalho
sobreposto e nenhuma está em menu.

**O Quick Access da home aponta para oito rotas inexistentes**, além de linkar um protótipo com
dados fictícios.

**As duas maiores telas do sistema concentram 53.000 das ~141.000 linhas de `app/`** — `/week-planner`
e `/daily-operations-management`. Qualquer refatoração de padrão que não as inclua não muda o
sistema de verdade.

Nenhuma dessas observações é uma decisão. Todas cabem numa conversa de meia hora com quem responde
pelo produto, e as quatro primeiras são reversíveis.
