# Design — Week Planner (protótipo Next.js isolado)

**Data:** 21/09/2026
**Status:** aprovado para escrita do plano de implementação
**Fonte visual:** Artifact `CV66ZrFMzUYLHePHHXWF2i` ("LogixSphere Week Planner" — protótipo HTML/CSS/JS com dados de exemplo, baseado no Figma "Week-Planner")
**Fonte de convenções:** `ANATOMIA-DE-UMA-PAGE.md`, `CATALOGO-DE-PAGES.md`, `CONTRATO-DE-API-PARA-PAGES.md`, `INVENTARIO-DE-UI-POR-PAGE.md` (documentação do repositório real `logix-sphere-frontend-nextjs`, não presente nesta pasta)

---

## 1. Em uma frase

Um projeto Next.js 14 (App Router, TypeScript) novo e isolado — sem conexão com o
repositório real do LogixSphere — que reproduz a page `/week-planner` do protótipo
visual, seguindo a mesma anatomia de pastas, camadas e nomenclatura descrita nos
quatro documentos de convenção, mas alimentado por dados mock em vez do backend
real, de um jeito pensado para que a troca de mock por API real seja uma
substituição de arquivo, não uma reescrita.

---

## 2. Por que um projeto isolado (e não o repo real)

Não há repositório do LogixSphere nesta máquina/pasta. O usuário confirmou que
quer um protótipo isolado, para validação, que sirva de base fácil de "religar"
a um backend depois. Por isso este design **imita a estrutura real** (mesmos
nomes de pasta, mesma separação de camadas) em vez de tentar reproduzir o
projeto inteiro — não há sidebar real, não há as outras 36 pages, não há
middleware de autenticação real.

O que É replicado fielmente: a forma como uma page do LogixSphere é organizada
(`page.tsx` orquestrador, `hooks/`, `lib/`, `types.ts`, `utils/*Mappers.ts`,
Padrão A de dados com TanStack Query) — porque é isso que torna a base fácil de
"portar" para o repositório real no futuro.

O que NÃO é replicado: autenticação, `middleware.ts`, `route-permissions.ts`,
sidebar real, as outras 36 pages, o backend Express. Ficam substituídos por
stubs mínimos (ver seção 6).

---

## 3. Escopo funcional

Réplica do protótipo do artifact, com todas as interações "básicas" tornadas
reais (estado React em vez de manipulação de DOM manual), mas sem persistência
— toda ação de escrita termina em um toast confirmando a ação, igual ao
protótipo original.

### 3.1 Cabeçalho
- **Week picker**: botão mostra semana atual (`W34 · 13 JUL — 19 JUL 2024`);
  clique abre popover com navegação de mês (`◂ JULY ▸`), botão "GO TO CURRENT
  WEEK" e lista de semanas (passado/atual/próxima/rascunho/futuro, cada uma com
  estilo visual distinto). Selecionar uma semana atualiza o rótulo e fecha o
  popover.
- **Ações do cabeçalho** (7 botões): Save, Management and Support, Add
  Annotations, Day Off, Export Week, Export Day, Generate Week. Cada uma abre o
  modal correspondente (Save e Generate Week têm comportamento especial — ver
  3.5).

### 3.2 Controles
- **Tabs de depósito**: LCY / MSE / LSE / BASP, seleção única, com toast ao
  trocar.
- **Toggle "SHOW WEEKEND"**: mostra/esconde sábado e domingo nas duas grids
  (principal e ADHOC).
- **Botões "+ ADD NEW FLEXROUTE"** e **"+ TEAM LEADERS"**.

### 3.3 Quadro principal
- **Team Leader track**: chips horizontais roláveis, seleção única, botão de
  "próximo" faz scroll suave.
- **Grid principal**: uma coluna por dia visível. Cada coluna tem:
  - cabeçalho com nome do dia, número, badge opcional (✓ REV / RE-REV /
    SELECTED) e botão "+" para adicionar assignment naquele dia;
  - lista de route cards (ver 3.4);
  - clicar no cabeçalho do dia seleciona/deseleciona aquele dia (afeta a seção
    Exceptions do rail).
- **Seção ADHOC**: mesma estrutura de grid por dia, cards mais simples, botão
  "+ ADD ADHOC" no cabeçalho da seção.

### 3.4 Route cards
Cinco variantes visuais por status: `ok`, `warning`, `conflict`, `error`
(flex sem alocação), `open` (vaga vazia, mostra botão "Assign" em vez de
motorista/veículo). Cada card mostra código da rota, disco de status (com
ícone svg check/warning/exclamação/+), nome do motorista e badge do veículo
(placa normal, "NO VEHICLE" tracejado, ou veículo substituto). Clique em
qualquer card abre o modal "Edit Assignment" com o contexto (rota + data)
pré-preenchido.

### 3.5 Rail lateral (direita, empilhada verticalmente)
1. **Notes** — cabeçalho com contador visual (bolinha vermelha), botão "+ Nova
   Nota" (abre modal Add Note) e "Expandir/Recolher". Expandida, lista notas
   com severidade (URGENT/CRITICAL), corpo, contagem de caracteres e botão
   Editar → Salvo (muda de estado local).
2. **Management & Support** — grid 5 dias × 4 linhas de cards "TL·SORT" com
   nome do responsável; uma célula tem tooltip on-hover/focus.
3. **Off · Holiday** — grid 5 dias com chips hachurados por ausência (OFF /
   LEAVE), contador "+N MORE" quando excede o espaço, estado vazio "NO ONE
   OFF".
4. **Exceptions** — segue o dia selecionado no quadro principal (ou "WEEK" se
   nada selecionado). Dois cards lado a lado:
   - **Vehicles**: utilização (12/15 · 80%), lista de veículos sobressalentes
     com botão "Use" (toast) e um "VOR" (fora de rota, sem ação);
   - **Drivers**: um motorista não alocado em destaque com botão "Place"
     (toast), mais sobressalentes/flex listados.
5. **Plan Horizon** — seis semanas, cada linha com: nome/intervalo, tira de 7
   letras (M T W T F S S) coloridas ok/problema/fim-de-semana, botões de ação
   contextual (ex. "APPROVE LSE ▸", "GENERATE…"), selos por depósito
   (aprovado/pendente) e estatística (SEALED / N OF 3 / N TO FIX / OPEN). Rodapé
   com uma linha de texto-resumo.

### 3.6 Modais (9, genéricos por um único componente `<PlannerModal>` + config)
`registerDayOff`, `addAssignment`, `editAssignment`, `exportDay`, `exportWeek`,
`addNote`, `managementSupport`, `addAdhoc`, `addTeamLeader`, e o resultado
especial `generateWeekResult` (sem formulário, só resumo de números). Campos
compartilhados entre modais: seletor de vendor/veículo/função/gestor
(`<select>`), toggle Single Day/Period (segmented control), seletor de dias
(radio "Full Week" + cards por dia com contagem de assignments), seletor de
depósitos (checkbox "All depots" + chips individuais, com resumo ao vivo de
quantos PDFs serão gerados em `exportWeek`), textarea de notas. Todo modal
fecha com Cancel (sem efeito) ou o botão primário (fecha + toast "ação
enviada — protótipo, nada foi gravado").

### 3.7 Toast
Notificação única no rodapé da tela, 2.6s, reaproveitada por todas as ações
acima.

### Fora de escopo (deliberado)
- Drag-and-drop de cards entre dias/rotas (não está no protótipo original).
- Persistência real de qualquer ação — é sempre mock + toast.
- Autenticação, permissões por perfil, sidebar/navegação real do LogixSphere.
- Exportação de PDF/Excel de verdade — os botões de export mostram o resumo e
  terminam em toast.

---

## 4. Estrutura de pastas

```
week-planner-prototype/                  (raiz do projeto Next.js)
  app/
    layout.tsx                            html, fontes (IBM Plex Mono, Space Grotesk)
    providers.tsx                         QueryClientProvider (TanStack Query)
    (private)/
      layout.tsx                          casca mínima: <NavbarWrapper> fixo
      components/
        NavbarWrapper.tsx                 stub — título fixo "WEEK PLANNER" + tag "Protótipo"
        PrivateRouteLoading.tsx           skeleton de uma linha
      week-planner/
        page.tsx                          "use client"; orquestrador
        loading.tsx                       return <PrivateRouteLoading />
        types.ts                          modelo da tela
        constants.ts                      DEPOTS, LEADERS, HEADER_ACTIONS, OPTS, WEEKS...
        styles.css                        tokens + estilos portados do protótipo
        components/
          WeekPickerButton.tsx
          WeekPickerPopover.tsx
          DepotTabs.tsx
          TeamLeaderTrack.tsx
          DayGrid.tsx                     usado para o quadro principal e o ADHOC
          RouteCard.tsx
          StatusDisc.tsx
          AdhocSection.tsx
          Toast.tsx
          rail/
            NotesPanel.tsx
            ManagementSupportPanel.tsx
            OffHolidayPanel.tsx
            ExceptionsPanel.tsx
            PlanHorizonPanel.tsx
          modals/
            PlannerModal.tsx              shell genérico (header, desc, footer, esc/click-outside)
            modalConfigs.tsx              os 9 configs de campo (equivalente ao objeto MODALS)
            fields/                       Select, TextInput, Textarea, DateInput, DaySelector,
                                           DepotPicker, SegmentedControl, ReadonlyField
        hooks/
          useWeekPlannerBoard.ts          useQuery — carrega semana + depósito selecionados
          useWeekPlannerActions.ts        useMutation stubs (assign, save, generateWeek, export…)
          useToast.ts
        utils/
          weekPlannerMappers.ts           DTO mock (snake_case) → modelo da tela (camelCase)
  lib/
    week-planner-api.ts                   "acesso a dado" — única camada que sabe que hoje é mock
    mocks/
      week-planner-fixtures.ts            os dados de exemplo (portados de DAYS/WEEKS/NOTES/...)
  package.json, tsconfig.json, next.config.ts, ...
```

Esta árvore espelha a tabela "Onde cada coisa mora" do `ANATOMIA-DE-UMA-PAGE.md`:
rota em `page.tsx`, loading de uma linha, componentes/hooks/tipos/mappers/estilos
locais da própria pasta da rota, acesso a dado isolado em `lib/`.

---

## 5. Camada de dados: mock hoje, API real amanhã

### 5.1 Contrato de `lib/week-planner-api.ts`

Cada função tem a assinatura que teria contra o backend real, documentada com
um comentário apontando o endpoint real equivalente (do
`CONTRATO-DE-API-PARA-PAGES.md`):

```ts
// hoje: resolve com fixture + delay simulado.
// amanhã: trocar o corpo por `api.get(...)` de lib/api-client.ts.

// GET /bff/week-planners?depot=&week=
export async function fetchWeekPlannerBoard(params: { depotId: string; weekId: string }): Promise<WeekPlannerBoardDTO>

// GET /bff/vendor  (para os selects de vendor dos modais)
export async function fetchVendorOptions(): Promise<VendorOptionDTO[]>

// POST /bff/week-planners  (ou o endpoint específico de assignment, a confirmar com o backend)
export async function createAssignment(input: CreateAssignmentInput): Promise<AssignmentDTO>

// PATCH /bff/week-planners/:id
export async function updateAssignment(id: string, input: UpdateAssignmentInput): Promise<AssignmentDTO>

// POST /bff/week-planners/bulk-approve  (Generate Week / Plan Horizon actions)
export async function generateDefaultSchedule(params: { weekId: string; depotId: string }): Promise<GenerateScheduleResultDTO>

// GET /bff/week-planners/export  (Export Day / Export Week)
export async function exportSchedule(params: ExportScheduleParams): Promise<{ url: string }>
```

Os DTOs de saída são declarados em `snake_case` (mesma convenção do backend
real), e `utils/weekPlannerMappers.ts` converte para o modelo `camelCase` da
tela — exatamente o papel que os docs descrevem para uma page nova, só que
hoje o "servidor" é a fixture local.

### 5.2 Hooks — Padrão A (TanStack Query), como os docs recomendam para page nova

```ts
// hooks/useWeekPlannerBoard.ts
export function useWeekPlannerBoard(depotId: string, weekId: string) {
  return useQuery({
    queryKey: ["week-planner-board", depotId, weekId],
    queryFn: () => fetchWeekPlannerBoard({ depotId, weekId }),
  });
}
```

Mutations (`useWeekPlannerActions.ts`) chamam `invalidateQueries(["week-planner-board"])`
no `onSuccess`, mesmo comportamento que uma mutation real teria — só a função
de fetch por trás é mock.

### 5.3 Checklist "ligar ao banco depois"
Documentado no `README.md` do projeto gerado:
1. Trocar o corpo de cada função de `lib/week-planner-api.ts` por uma chamada
   via `lib/api-client.ts` (a criar, seguindo o modelo descrito no
   `ANATOMIA-DE-UMA-PAGE.md`) contra o path real em `logix-sphere-backend/src/router/routes.ts`.
2. Conferir se os nomes de campo dos DTOs mock batem com os `snake_case` reais
   do backend (o contrato deixa isso como ponto de atenção — os docs mostram
   que isso já causou bugs em `/vehicles`).
3. Nada em `page.tsx`, hooks ou componentes muda — a troca é isolada em `lib/`
   e `utils/*Mappers.ts`.

---

## 6. Stubs de casca (fora do escopo real, mas necessários para rodar)

- `NavbarWrapper`: barra fixa simples com o título da tela — não é a navbar
  real do LogixSphere (que depende de sidebar, autenticação, chat etc.).
- `PrivateRouteLoading`: skeleton mínimo, mesmo papel do real.
- Não há `middleware.ts` nem `route-permissions.ts` — rota única, sempre
  acessível.

---

## 7. Estilo visual

CSS portado quase literal do protótipo (tokens de cor, `IBM Plex Mono` +
`Space Grotesk`, gradientes dos route cards, discos de status, hachuras de
ausência) para `app/(private)/week-planner/styles.css`, importado só pela
page — não é um design system compartilhado, é o visual desta tela, como os
docs descrevem para o campo "Estilos" de uma page. Convertido de manipulação de
DOM (`el()`, `innerHTML`) para JSX idiomático, preservando classes e estrutura
para manter fidelidade pixel a pixel.

---

## 8. Testes e validação
- `npx tsc --noEmit`, `npx eslint .`, `npm run build` — mesmos gates que os
  docs pedem para uma page real (adaptados ao projeto isolado, sem CI).
- Validação manual dos três estados (loading via delay artificial no mock,
  vazio — ex. semana sem assignments —, e o board populado) e dos dois
  tamanhos (desktop ≥1280px com colunas lado a lado, mobile empilhado).
- Sem testes automatizados de UI nesta primeira validação (fora de escopo);
  pode entrar depois se o protótipo for aprovado para virar page real.

---

## 9. Divergências assumidas em relação aos docs (documentadas, não escondidas)

1. O projeto real usa Radix + Tailwind + `class-variance-authority` como design
   system. Este protótipo isolado usa CSS puro portado do artifact, porque o
   visual já está definido pixel a pixel no Figma/protótipo e não há um design
   system compartilhado para reaproveitar fora do repo real.
2. `lib/api-client.ts` não existe aqui — é mencionado no design como o alvo
   futuro, mas hoje `lib/week-planner-api.ts` resolve fixtures diretamente.
3. Sem as três camadas de autenticação/permissão — assumido aceitável para um
   protótipo de validação isolado.
