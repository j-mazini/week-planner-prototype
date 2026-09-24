# Limpeza e otimização — 24/09/2026

Mudanças:

- Removidos sete pacotes diretos sem uso restante: Font Awesome, TanStack Table, jwt-decode, pdf-lib, React Bootstrap, tw-animate-css e critters. O npm removeu 47 pacotes incluindo dependências transitivas; `node_modules` caiu de aproximadamente 864 MiB para 732 MiB.
- Os dois ícones do login usam o Bootstrap Icons já carregado. A importação de Font Awesome no relatório também foi removida.
- Links do menu e do hub deixam de pré-carregar todas as páginas visíveis. A navegação permanece no cliente; o destino é carregado ao abrir.
- Formulários de veículos, motoristas e faturas são carregados na primeira abertura, com indicação de carregamento.
- Removido o JavaScript do Bootstrap em duas telas que usam apenas eventos React.
- Resultados do React Query podem ser reutilizados por um minuto no modo mock. A política de atualização contra o backend real foi preservada.
- Ferramentas do React Query carregadas apenas em desenvolvimento. Removido um listener de resize cujo estado nunca era utilizado.
- Worktrees excluídas da análise TypeScript. `npm run clean` remove apenas os caches gerados; deve ser executado com o servidor local parado. `dev:lowmem` agora funciona também fora do Windows.

## Medição em produção

Mesmo navegador, viewport 1440×1000, contexto novo por página, sem interações, dois segundos após network idle. Bytes de JavaScript medidos pelo `encodedBodySize` dos recursos efetivamente baixados; incluem pré-carregamentos. Valores de tempo não são usados para afirmar ganho de velocidade, pois dependem da rede e da máquina.

| Página | Requisições antes/depois | JavaScript antes/depois | Redução de JS |
| --- | --- | --- | --- |
| Veículos | 88 → 41 | 460.327 → 297.718 bytes | 35,3% |
| Faturas | 105 → 41 | 605.149 → 312.758 bytes | 48,3% |
| Home | 29 → 28 | 187.604 → 188.768 bytes | Sem redução relevante |
| Login | 34 → 33 | 258.136 → 259.249 bytes | Sem redução relevante |

Pré-carregamentos de outras rotas: veículos 14 → 0; faturas 18 → 0. CSS no login: 111.455 → 88.143 bytes.

Validação: 80 testes passaram; build Vercel concluído com 48 páginas. O projeto continua com a verificação completa de tipos desativada no build e avisos legados de lint. O histórico de trabalho e as worktrees foram preservados.
