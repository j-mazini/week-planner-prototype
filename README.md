# Week Planner — Protótipo (LogixSphere)

Protótipo Next.js isolado da page `/week-planner`, construído seguindo a
anatomia de page real do LogixSphere (ver `docs/superpowers/specs/2026-09-21-week-planner-prototype-design.md`),
mas alimentado por dados mock.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000/week-planner`.

## Testes e gates

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Como ligar ao banco de dados / backend real

Toda a camada de dados está isolada em `lib/week-planner-api.ts`. Hoje cada
função resolve uma fixture local (`lib/mocks/week-planner-fixtures.ts`) com um
delay simulado. Para ligar ao backend real:

1. Crie `lib/api-client.ts` seguindo o modelo descrito em
   `ANATOMIA-DE-UMA-PAGE.md` (monta query params, injeta Bearer, converte
   `snake_case` → `camelCase`).
2. Em `lib/week-planner-api.ts`, troque o corpo de cada função:
   - `fetchWeekPlannerBoard` → `GET /bff/week-planners?depot=&week=`
   - `submitPlannerAction` → o endpoint específico de cada ação (a confirmar
     com o backend — hoje é uma função genérica no protótipo)
   - `generateDefaultSchedule` → `POST /bff/week-planners/bulk-approve` (ou
     equivalente)
3. Confira se os nomes de campo do DTO real batem com os definidos em
   `lib/mocks/week-planner-fixtures.ts` (`WeekPlannerBoardDTO`) — ajuste
   `app/(private)/week-planner/utils/weekPlannerMappers.ts` se os nomes
   divergirem. Confirme sempre no Network do navegador, não apenas na
   tipagem (ver `CONTRATO-DE-API-PARA-PAGES.md`, seção de divergências).
4. Nenhum componente, hook ou `page.tsx` precisa mudar — a troca é isolada em
   `lib/` e `utils/weekPlannerMappers.ts`.

## Fora de escopo (deliberado)

- Autenticação, permissões por perfil, sidebar real, middleware — este é um
  protótipo de validação isolado, não uma rota do repositório real.
- Persistência: toda ação de escrita termina em um toast, nada é salvo.
- Drag-and-drop de assignments — não estava no protótipo visual original.

## Route Balance — Operations e Rebalance

- `/route-balance`: Operations, baseada no frame `198:6865` do ZIP fornecido.
- `/route-balance?mode=rebalance`: Rebalance, baseada no frame `200:9214`.
- A navegação lateral do Week Planner inclui o acesso a Route Balance.

As telas usam as camadas, coordenadas, SVGs e fontes locais da referência. O canvas
mantém as proporções do desktop; em janelas estreitas, a área operacional permite
rolagem horizontal. Os estados iniciais preservam os dados e textos do arquivo original.

A interface permite alternar abas e turno, buscar rotas, expandir/recolher cards,
abrir detalhes/paradas/entregas especiais, validar cards e criar rotas flex no rascunho.
Save persiste o rascunho neste navegador. Importação de planilhas e envio aos
motoristas dependem de serviços não incluídos no projeto; a interface informa essa
limitação e não simula processamento nem envio.

Validação: build de produção, TypeScript, testes do projeto e testes de interação
no Chrome. As capturas em 1281px foram comparadas com o renderer original do ZIP.
