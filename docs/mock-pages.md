# Dados demonstrativos das páginas

O protótipo usa mocks quando `NEXT_PUBLIC_MOCK_MODE` não é `false`. Nesse modo, as chamadas da API são resolvidas localmente, sem backend.

- `lib/mocks/page-fixtures.ts`: 12 motoristas, 12 veículos, 12 rotas, três depósitos, dois parceiros e registros vinculados de operações, relatórios, faturas, pedidos e deduções.
- `lib/mocks/page-payload.ts`: contratos específicos de cada endpoint, árvores de contratos, resumos de desempenho, detalhes de faturas, filtros e paginação.
- `lib/mock-api.ts`: entrada da camada offline e autenticação de demonstração.

As datas acompanham o dia ou mês solicitado. Listas mensais de desempenho usam 20 dias de exemplo. A paginação aceita `page/limit` e `currentPage/totalItensPerPage`; as buscas podem retornar resultados vazios. IDs relacionam motoristas, veículos, rotas, depósitos e operações. Todos os dados novos são fictícios, com endereços de e-mail `example.test`.

As páginas que já tinham fixtures próprias, como Route Balance, Week Planner, Invoice History e Operations Dashboard, continuam usando seus dados existentes. A nova camada preenche as telas que dependiam das respostas vazias da API.

Esses mocks simulam consultas. A confirmação genérica das mutações não persiste alterações. Eles não substituem a validação de CRUD e exportações contra o backend real.

Validação automatizada: `npm test -- --maxWorkers=1`. Os testes incluem contratos de coleções, paginação, busca sem resultados, vínculos entre entidades, períodos, árvores de depósitos e totais de faturas.
