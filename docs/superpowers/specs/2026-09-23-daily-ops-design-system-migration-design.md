# Design — Sistema de Design "Industrial Terminal" + módulo Daily Ops (6 pages)

**Data:** 23/09/2026
**Status:** aprovado para escrita do plano de implementação
**Fonte do sistema de design:** `logixsphere-page-kit.zip` (tokens, `components/ui/`, `lib/mock-client.ts`, `lib/useMockQuery.ts`, `_template`, `route-balance-demo`, docs 00–07)
**Fonte de conteúdo das pages:** `logix-sphere-frontend-nextjs-main.zip` (código real de produção — apenas lido, nunca importado com backend/DB)
**Fontes históricas consultadas, não usadas como base de estilo:** `route-balance-react.zip`, `week-planner-react.zip` (exports Figma literais — já consumidos pelas pages existentes deste repo, cujo padrão antigo permanece intocado por decisão do usuário)

---

## 1. Em uma frase

Portar o design system tokenizado do `logixsphere-page-kit` (tokens, biblioteca
`components/ui/`, cliente mock, gate de lint de tokens) para este repositório
como a **base central de estilo do sistema**, e usá-lo para reconstruir 6 pages
reais do módulo Daily Ops do LogixSphere — com conteúdo fiel ao código de
produção, mas sem nenhuma chamada de backend/banco, apenas mocks — como piloto
de um padrão que toda page futura deste repositório deve seguir.

---

## 2. Contexto e decisões já tomadas

- O pedido original citava quatro ZIPs. Investigação mostrou que dois deles
  (`route-balance-react`, `week-planner-react`) são exports Figma literais já
  consumidos pelas pages `/route-balance` e `/week-planner` existentes neste
  repo (renderizador `FigmaScreen`, camadas posicionadas). O `logix-sphere-frontend-nextjs-main`
  é o app real de produção (42 rotas, backend/DB acoplados). O
  `logixsphere-page-kit` é um kit de design system tokenizado, já maduro,
  construído exatamente para o problema deste pedido — com `route-balance-demo`
  como implementação de referência (não cópia literal de Figma).
- **Decisão do usuário:** o kit tokenizado — não a cópia literal de Figma — é a
  base central de estilo. As pages antigas (`week-planner`, `route-balance`)
  **não** serão migradas agora; ficam como estão, o novo padrão vale só para
  pages novas a partir daqui.
- **Decisão do usuário:** o trabalho acontece neste repositório (não dentro do
  `logixsphere-page-kit`).
- **Decisão do usuário:** o primeiro lote é o módulo "Daily Ops" inteiro.
  Investigação do código real mostrou que das 10 rotas candidatas por nome, só
  **6 são telas distintas de verdade**:
  - `daily`, `daily-financials`, `performance` são predecessoras órfãs, sem
    nenhum link de navegação no app real, com conteúdo idêntico às versões
    novas (`daily-performance-insight`, `daily-financial-insights`,
    `current-performance`, respectivamente) — **não serão construídas**.
  - `daily-operations-management` é um re-export puro de
    `week-planner-operations` (outro módulo) — **não será construída aqui**.
  - As 6 reais: `daily-game-plan`, `daily-operations-reports`,
    `daily-financial-insights`, `daily-performance-insight`, `current-month`,
    `current-performance`.
- **Decisão do usuário:** navegação por um hub único "Daily Ops" na sidebar,
  não 6 ícones separados.
- **Decisão do usuário:** criar agora a skill Claude `logixsphere-page`
  (mencionada nos docs do kit, nunca escrita) para tornar a regra executável
  em pedidos futuros.

---

## 3. Escopo funcional das 6 pages

Conteúdo derivado da leitura do código real de cada rota (não inventado). Onde
uma decisão depende só de lógica de backend (validação, cálculo de custo,
permissão), a tela mostra a interação normalmente mas a ação termina em um
aviso "não disponível neste protótipo" — o mesmo padrão já usado por
`/route-balance` para importação de planilha e envio a motoristas.

### 3.1 `current-performance` (piloto — construir primeiro)
Tela mobile do motorista: carrossel de meses, médias mensais, tabela de
detalhamento diário (paradas/SPOR-H/TW/chegada) com classes condicionais para
valores fora da faixa-alvo (mesma regra de negócio 95–105% documentada em
`components/ui/status.ts` do kit). Já vem de um hook único no real
(`useCurrentPerformanceData`) — o mais simples de portar, por isso é o piloto
que valida o padrão antes de escalar.

### 3.2 `current-month`
Tela mobile do motorista: carrossel de meses, card de resumo por dia, grid de
informações, lista de ganhos (`Intl.NumberFormat('en-GB', 'GBP')` — moeda a
preservar nos mocks), drill-down de detalhes do dia (cabeçalho da rota,
paradas, horas trabalhadas, quebra de pagamento, notas).

### 3.3 `daily-performance-insight`
Tela mobile "Insights": seletor de mês, carrossel de dias, card de operação com
métricas, timeline, informação de veículo, selo de verificado, card de entregas
falhadas, notas. No real, restrita a Admin/Supervisor por comentário no código
— gate de permissão é lógica de rota/backend, não visual; não simulada aqui
(sem autenticação real neste repo).

### 3.4 `daily-operations-reports`
Tabela de relatório operacional filtrável/ordenável/paginada: modo por
intervalo de datas ou dia único (paginação 500 vs 50 itens), filtros de
depósito/loop, células de chegada/intervalo/horas trabalhadas por linha, modal
de detalhes de vendor, exportação em PDF (→ aviso "não disponível neste
protótipo"), visão em cards no mobile.

### 3.5 `daily-financial-insights`
Mesmo padrão de tabela/filtro/paginação/mobile/modal de 3.4, para linhas
financeiras ligadas a service partners, com modais de editar/excluir operação e
notas inline. Por ter o mesmo esqueleto de `daily-operations-reports`, as duas
pages compartilham um novo par `DataTable` + barra de filtros em
`components/ui/`, em vez de duas implementações bespoke.

### 3.6 `daily-game-plan` (construir por último — maior/mais complexa)
Painel do despachante: grupos de "deposits" com linhas de operação, painel de
vendors "off", painel de "não alocados", barra de ações, modais de
abrir/finalizar/mensagem de operação. Validação de payload em lote é lógica de
backend (`validateBulkPayload.ts` no real) — não simulada; o botão de
submissão em lote mostra o resumo e termina em toast "protótipo, nada foi
enviado", igual ao padrão já usado no Week Planner.

### Fora de escopo (deliberado)
- Qualquer chamada real de API, autenticação, middleware de permissão,
  `route-permissions.ts`.
- PDF real, envio de mensagens reais, validação de payload em lote real.
- Migração das pages `week-planner`/`route-balance` existentes para o novo
  sistema.
- As outras ~31 pages do app real fora do módulo Daily Ops (ficam para lotes
  futuros, usando o mesmo padrão e a skill criada aqui).

---

## 4. Estrutura de pastas

```
Pasta Sem Título/                          (raiz do projeto Next.js, existente)
  styles/
    tokens.css                             NOVO — portado do kit, fonte única de valores visuais
  components/
    ui/                                    NOVO — biblioteca portada do kit (20 componentes)
      Button.tsx, CollapsibleSection.tsx, DataTable.tsx, EntityCard.tsx,
      ExpandButton.tsx, InfoChip.tsx, KpiCard.tsx, OptionSwitcher.tsx,
      ProgressBar.tsx, SearchField.tsx, SectionBox.tsx, Skeleton.tsx,
      StatTile.tsx, States.tsx, StatusPill.tsx, Toast.tsx, icons.tsx,
      index.ts, status.ts, ui.module.css
      FilterBar.tsx                        NOVO (não vem do kit) — extraído do
                                            padrão comum de 3.4/3.5
  lib/
    mock-client.ts                         NOVO — portado do kit (api.get/api.post, cenários ?mock=)
    useMockQuery.ts                        NOVO — portado do kit (mesma forma de retorno do useQuery real)
    mocks/
      daily-ops/
        current-performance-fixtures.ts    NOVO — snake_case, formato real do backend
        current-month-fixtures.ts
        daily-performance-insight-fixtures.ts
        daily-operations-reports-fixtures.ts
        daily-financial-insights-fixtures.ts
        daily-game-plan-fixtures.ts
  scripts/
    check-tokens.mjs                       NOVO — portado do kit, reprova valor literal fora de tokens.css
  app/
    (private)/
      components/
        NavbarWrapper.tsx                  EDITADO — novo NavKey "daily-ops", ícone hub
      daily-ops/
        page.tsx                           NOVO — índice com 6 cards (hub)
        current-performance/
          page.tsx / loading.tsx / types.ts / constants.ts
          components/Content.tsx (+ subcomponentes)
          hooks/useCurrentPerformance.ts
          utils/currentPerformanceMappers.ts
        current-month/            (mesma forma)
        daily-performance-insight/(mesma forma)
        daily-operations-reports/ (mesma forma, usa components/ui/DataTable + FilterBar)
        daily-financial-insights/ (mesma forma, usa components/ui/DataTable + FilterBar)
        daily-game-plan/          (mesma forma, maior número de subcomponentes)
  docs/
    design-system/
      00-COMECE-AQUI.md ... 07-INTEGRACAO.md   NOVO — docs do kit adaptados a
                                                este repo (sem a camada de
                                                governança por pessoa nomeada,
                                                que não se aplica aqui)
  .claude/
    skills/
      logixsphere-page/
        SKILL.md                NOVO — ver seção 7
  package.json                  EDITADO — script "check:tokens"
```

Cada page segue exatamente a forma do `_template` do kit — `page.tsx`
orquestra, `loading.tsx` é um fallback de uma linha, `types.ts` é o modelo de
tela (não o DTO do backend), `constants.ts` guarda valores fixos e o path do
endpoint real (comentado, para quando este protótipo for integrado), e
`utils/*Mappers.ts` converte `snake_case` → modelo de tela — mesmo padrão já
usado por `week-planner` e recomendado pelos quatro docs originais deste repo.

---

## 5. Sistema de estilo

- `styles/tokens.css`: ~114 custom properties portadas do kit sem alteração —
  cores (paleta Material Design 3 adaptada: `--primary`, `--on-surface`,
  `--container-low`, `--error-container`, `--state-critical`...), tipografia
  (`--font-display` = Space Grotesk, `--font-mono` = IBM Plex Mono,
  `--font-ui` = Inter), espaçamento (`--space-xs` … `--space-2xl`), raio
  (`--radius-pill`, `--radius-track`), elevação (`--elevation-card`).
  Importado uma vez em `app/globals.css` (hoje só 3 linhas — sem conflito).
- `components/ui/`: portado do kit; qualquer page nova busca aqui antes de
  criar um componente do zero.
- **Regra de ouro (do kit, mantida sem alteração):** nenhum valor literal de
  cor, fonte, espaçamento, raio ou sombra em `.tsx`/`.css` das pages novas —
  tudo vem de `var(--token)`. `npm run check:tokens` (novo script,
  `scripts/check-tokens.mjs` portado do kit) reprova a build se isso for
  violado — a regra vira portão automático, não só recomendação.
- Fontes (Space Grotesk, IBM Plex Mono, Inter) via pacotes Fontsource locais,
  como já é o padrão de `route-balance` e `week-planner` neste repo — sem
  dependência de URL do Figma ou de fonte remota.

---

## 6. Navegação

`NavbarWrapper` ganha um quinto item na sidebar: ícone "Daily Ops" →
`/daily-ops`. Essa page é um índice com 6 cards (usando `EntityCard` do
`components/ui`), um por tela do módulo, espelhando o agrupamento que o app
real já faz no seu próprio menu admin. O tipo `NavKey` é estendido de
`"home" | "week-planner" | "route-balance" | "cleaning-desk"` para incluir
`"daily-ops"`. As 6 pages individuais não aparecem na sidebar — só no índice —
para não sobrecarregar a barra lateral enxuta existente.

---

## 7. Camada de dados: mock hoje, API real amanhã

Mesmo contrato que `lib/week-planner-api.ts` já estabelece neste repo, agora
generalizado pelo par portado do kit:

- `lib/mock-client.ts` expõe `api.get<T>(path, source)` / `api.post<T>(path, body)`
  com a mesma assinatura que um `lib/api-client.ts` real teria — só a
  implementação por trás resolve fixture + delay simulado, com suporte a
  `?mock=empty|error|slow` na URL para forçar cada estado sem editar código.
- `lib/useMockQuery.ts` replica a forma de retorno do `useQuery` do TanStack
  Query (`{ data, isLoading, isError, error, refetch }`), para que a troca por
  `useQuery` real seja um diff de poucas linhas, sem tocar em componentes.
- Fixtures em `lib/mocks/daily-ops/*.ts` usam nomes de campo `snake_case`
  idênticos ao que o código real de cada page consome hoje (lido diretamente
  do `logix-sphere-frontend-nextjs-main`), para que os `utils/*Mappers.ts`
  exercitem a conversão de verdade, não um atalho.
- **Os 4 estados obrigatórios** (carregando, vazio, erro, crítico) são
  construídos em cada page desde o início, usando `components/ui/States.tsx` e
  `status.ts` do kit — crítico é sempre cor **+** rótulo **+** ícone, nunca só
  cor.

---

## 8. Ordem de construção

1. `current-performance` — piloto; valida a forma do `_template`, o
   `mock-client`, os tokens e os 4 estados numa tela pequena antes de escalar.
2. `current-month`
3. `daily-performance-insight`
4. `daily-operations-reports` — introduz `components/ui/DataTable` +
   `FilterBar`, reaproveitados por:
5. `daily-financial-insights`
6. `daily-game-plan` — maior e mais complexa, por último.

Depois de (1), antes de seguir para (2)–(6), há um checkpoint: rodar
`typecheck`, `check:tokens`, `build` e uma verificação visual no Chrome da
tela piloto, para confirmar que o padrão está correto antes de repeti-lo mais
5 vezes.

---

## 9. A regra durável: skill `logixsphere-page`

Nova skill de projeto em `.claude/skills/logixsphere-page/SKILL.md`, para que
qualquer pedido futuro de "criar/importar uma page do LogixSphere" siga este
sistema automaticamente, sem precisar reexplicar. Conteúdo, adaptado dos docs
00–07 do kit (removendo a camada de governança por pessoa nomeada — Aline,
Thiago — que não se aplica a este repositório sem esses stakeholders reais):

- As 6 regras de estilo/arquitetura do kit (tokens, sem `fetch` em `.tsx`,
  procurar componente existente antes de criar, copiar a referência
  (`current-performance` vira a nova referência deste repo, além de
  `route-balance-demo` do kit original), estado crítico = cor+rótulo+ícone,
  dado que falta se marca, não se inventa).
- O processo de derivar conteúdo: se existe código real de origem (como no
  caso das 42 pages do `logix-sphere-frontend-nextjs-main`), ler o código
  real em vez de perguntar — a "entrevista" do kit vira leitura de código
  quando a fonte existe, e vira pergunta ao usuário só quando não existe fonte
  nenhuma ou quando a lógica é comprovadamente só de backend.
  Nesse segundo caso, a tela marca a lacuna visivelmente (aviso "não
  disponível neste protótipo" ou `<MissingData />`) em vez de inventar.
- A estrutura de pastas obrigatória por page (seção 4) e o checklist de
  publicação (typecheck, check:tokens, build, 4 estados presentes).
- Onde tudo vive neste repo (`styles/tokens.css`, `components/ui/`,
  `lib/mock-client.ts`, `lib/useMockQuery.ts`, `docs/design-system/`).

---

## 10. Testes e validação

- `npm run typecheck`, `npm run check:tokens`, `npm run lint`, `npm run build`
  — mesmos gates que `week-planner` já usa, mais o novo verificador de tokens.
- `npm run test` (vitest) para os `*Mappers.ts` novos, mesmo padrão de
  `weekPlannerMappers.test.ts` já existente.
- Validação manual dos 4 estados (via `?mock=empty|error|slow`) e dos dois
  tamanhos (desktop ≥1280px, mobile) para cada uma das 6 pages, com
  verificação de interação no Chrome pelo menos na tela piloto
  (`current-performance`) antes de escalar às outras 5 — mesmo hábito de
  validação já registrado no `README.md` deste repo para `route-balance`.

---

## 11. Divergências assumidas (documentadas, não escondidas)

1. O app real usa Radix + Tailwind + `class-variance-authority`; este
   protótipo usa CSS puro + tokens portados do kit, porque é essa a base que
   o usuário definiu como central — não Tailwind.
2. As pages antigas (`week-planner`, `route-balance`) continuam no padrão de
   cópia literal de Figma; não há tentativa de unificar os dois padrões nesta
   entrega, por decisão explícita do usuário.
3. `daily`, `daily-financials`, `performance` (predecessoras órfãs) e
   `daily-operations-management` (alias de outro módulo) não são construídas
   — risco assumido: se alguma dessas rotas tiver, na verdade, algum
   consumidor externo não encontrado na busca por links de navegação, isso só
   aparece depois. Mitigação: a busca cobriu sidebar e nav mobile, as duas
   fontes de navegação do app real.
4. Sem as três camadas de autenticação/permissão do app real — aceitável para
   protótipo de validação isolado, mesmo padrão já assumido por
   `week-planner`.
5. `check:tokens` varre só os caminhos "governados" pela nova regra
   (`styles/`, `components/ui/`, `lib/mock-client.ts`, `lib/useMockQuery.ts`,
   `lib/case.ts`, `app/(private)/daily-ops/`), não o repositório inteiro — o
   kit original varre tudo porque o kit inteiro segue o Design System; aqui a
   maior parte do repositório (código antigo) ainda não segue.
6. `daily-performance-insight` usa DTOs já em camelCase no código real (não
   snake_case) — achado durante a pesquisa de código, diferente da suposição
   inicial do design. As fixtures desta page são escritas com o snake_case
   equivalente de cada campo, para que `camelizeKeys` do mock-client faça a
   mesma conversão que faria em produção.
