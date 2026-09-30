# Revisão de páginas — 29/09/2026

## Escopo

45 páginas (39 privadas e 6 públicas), mais a raiz `/`, que redireciona para `/home`. Revisão local no Chrome, com perfil Admin e dados mock. As alterações anteriores no workspace foram preservadas.

Cada página foi visitada em **390, 768 e 1440 px** de largura, com 1000 px de altura. São **135 estados-base**. Oito páginas receberam uma rodada adicional de revalidação, após correções ou reinício do servidor. A evidência consolidada está em [pages.json](pages.json); a primeira rodada, com falhas transitórias, está em [initial-pass.json](initial-pass.json).

As medidas verificam largura da página e elementos fora da área visível sem contêiner de rolagem, colisão entre título e ferramentas do cabeçalho, presença de mais de uma estrutura de navegação, erros JavaScript e conteúdo oculto por animações antigas. Capturas complementaram as medidas: largura correta, sozinha, não detectava os blocos invisíveis nem os números truncados.

## Problemas corrigidos

- **Cabeçalho compartilhado:** altura flexível, quebra de linha, busca acessível no celular e conta compacta. Substituída a data fixa de agosto pela data atual.
- **Grades e métricas:** uma coluna onde os blocos não cabiam; rótulos e valores deixam de depender de truncamento. Cabeçalhos compartilhados abandonam os efeitos de vidro antigos; cabeçalhos sem conteúdo não geram um bloco vazio.
- **Contratos:** a estrutura mobile reservava `min-h-screen` apenas para o cabeçalho e as abas, empurrando o conteúdo útil para baixo. Corrigidos altura e cortes nas abas.
- **Faturas e operações:** classes `.reveal` deixavam blocos permanentemente transparentes sem código que os revelasse. Conteúdo visível por padrão nas três páginas afetadas.
- **Financial Invoices:** filtros e ações ultrapassavam a tela de tablet; corrigidos. Removida uma seção que repetia o total do cabeçalho e acrescentava dois valores fixos de zero. Seus cartões também cortavam rótulos e valores.
- **Tabelas compartilhadas:** cabeçalhos ordenáveis agora mostram o nome da coluna e alternam corretamente a ordem crescente/decrescente, com `aria-sort`.
- **Páginas antigas/redundantes:** o endereço de performance de 2025 e a página financeira incompleta encaminham para painéis existentes. Financial Management agora é um índice funcional dos módulos. Atalhos duplicados foram removidos do menu e da Home; URLs compatíveis foram mantidas.
- **Identidade visual:** alinhadas cores e fontes de telas Bootstrap, removidos fundos animados antigos de faturas e isolado o CSS de Daily para não alterar outras páginas. Os formulários de solicitações usam a mesma cor de ação principal.
- **Páginas públicas:** cadastro, confirmação e recuperação de senha usam altura mínima, permitindo rolagem com formulário maior que a tela, e a paleta atual. Nome e sobrenome se empilham no celular.

## Cobertura por página

“3 larguras” indica verificação do estado inicial carregado em 390/768/1440 px, não aprovação de todos os fluxos possíveis.

| Página | Cobertura | Observação |
|---|---|---|
| `/adhoc-works-invoice-management` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/admin-login` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/assets` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/contract-management` | 3 larguras | Removido espaço de uma tela inteira antes dos dados; abas móveis em duas colunas. |
| `/current-month` | 3 larguras | Grade retorna a uma coluna em telas menores. |
| `/current-performance` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/daily` | 3 larguras | Removida identificação fixa de outro usuário; CSS isolado e paleta atualizada. |
| `/daily-financial-insights` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/daily-financials` | 3 larguras | Filtros e download quebram linha; títulos de seção corrigidos. |
| `/daily-game-plan` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/daily-operations-management` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/daily-operations-reports` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/daily-performance-insight` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/deductions` | 3 larguras | Grade retorna a uma coluna em telas menores. |
| `/deductions-disbursements-recharges` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/driver-route-balance` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/financial-invoices` | 3 larguras | Ações responsivas; removidos total duplicado e dois indicadores fixos de zero. |
| `/financial-management` | 3 larguras | Página vazia substituída por acessos aos módulos financeiros existentes. |
| `/financial-performance` | 3 larguras | Redireciona para /daily-financial-insights. |
| `/home` | 3 larguras | Removidos atalhos duplicados para indicadores financeiros e operações. |
| `/invoice-history` | 3 larguras | Removidos fundos animados antigos; paleta e tipografia alinhadas. |
| `/invoice-processing-workflow` | 3 larguras | Conteúdo deixa de ficar invisível; removido fundo animado antigo. |
| `/login` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/logistics` | 3 larguras | Paleta e tipografia alinhadas. |
| `/mobile-invoice` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/op-dashboard` | 3 larguras | Paleta e tipografia alinhadas. |
| `/op-management` | 3 larguras | Filtros, dados e ações deixam de ficar invisíveis. |
| `/operations-management` | 3 larguras | Filtros deixam de ficar invisíveis. |
| `/performance` | 3 larguras | Redireciona para /current-performance; sai de circulação o protótipo fixo em 2025. |
| `/register` | 3 larguras | Formulário cresce com o conteúdo; nomes se empilham no celular; visual atualizado. |
| `/register-successful` | 3 larguras | Altura flexível e visual atualizado. |
| `/requests` | 3 larguras | Ações dos três formulários usam a mesma paleta; abas verificadas. |
| `/requests-admin` | 3 larguras | Cabeçalho e filtros se empilham para manter a descrição legível. |
| `/requests-inbox` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/reset-password` | 3 larguras | Altura flexível e visual atualizado; estado sem token verificado. |
| `/route-balance` | 3 larguras | Canvas administrativo preserva rolagem horizontal interna no celular. |
| `/schedule` | 3 larguras | Paleta e tipografia alinhadas. |
| `/send-password-reset-token` | 3 larguras | Altura flexível e visual atualizado. |
| `/service-partner-invoices` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/subcontractor` | 3 larguras | Cartões retornam a uma coluna em telas menores. |
| `/vehicles` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/vendor` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/vendor-performance` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/week-planner` | 3 larguras | Revisada; recebe os ajustes compartilhados quando aplicáveis. |
| `/week-planner-operations` | 3 larguras | Mantida como URL compatível; mesmo conteúdo de /daily-operations-management. |

## Conferência adicional e evidências

- **16 estados adicionais:** oito páginas em 320 e 2560 px, com altura de 568 px. Sem vazamento de largura da página ou colisão do cabeçalho nos estados observados. Evidência: [extremes.json](extremes.json).
- **14 estados de interação:** modais de Assets e nova fatura, abas Holiday/Pre-Payment/History e menu expandido com grupo financeiro aberto, em 390 e 1440 px. Sem erros da verificação; formulários não foram enviados. Evidência: [interactions.json](interactions.json).
- **20 estados dos formulários públicos:** quatro páginas em 320/390/768/1440/2560 px e altura de 568 px, sem vazamento de largura ou erros de execução. Capturas feitas após aguardar as animações de entrada; o DOM com texto já presente não garante que a animação terminou. Evidência: [public-forms.json](public-forms.json).
- Capturas selecionadas: [contratos](contracts-mobile.png), [faturas no tablet](invoices-tablet.png), [fluxo de faturas](invoice-workflow-mobile.png), [operações](operations-mobile.png), [solicitações administrativas em 320 px](requests-admin-small.png), [cadastro em 320 px](register-small.png) e [modal de fatura](invoice-modal-mobile.png).
- Os controles flutuantes de desenvolvimento presentes nas capturas pertencem ao Next.js/React Query Devtools. Não fazem parte da interface de produção.

## Verificações técnicas e limites da primeira rodada

- Testes de navegação e tabela: **3 testes passaram em 2 arquivos**. O teste da tabela verifica rótulo, ordem real das linhas e `aria-sort`.
- ESLint dos sete componentes/páginas principais alterados: passou com `ESLINT_USE_FLAT_CONFIG=false`, necessário para a configuração `.eslintrc` existente. O comando padrão do ESLint 9 não encontra configuração flat neste projeto.
- **Typecheck global não aprovado.** A execução registrou 274 diagnósticos frente a um baseline de 204. Entre os problemas estão arquivos da cópia `Logix-new-front`, importações `Modals`/`modals`, uma referência a `BUSINESS_RULES` sem importação e props antigas em Current Month. Ver [saída do typecheck](typecheck.txt). O baseline não foi atualizado para esconder esses erros.
- Não foi executado build de produção. A validação de renderização ocorreu no servidor de desenvolvimento, que sofreu reinícios durante a varredura; os casos afetados foram repetidos.
- Tabelas extensas e o canvas administrativo de Route Balance mantêm rolagem horizontal interna. Não se escondeu overflow da página para mascarar os problemas encontrados.
- Escopo funcional: leitura, abertura/fechamento de modais, abas e navegação. Não valida todos os estados de dados reais, permissões por perfil, operações de gravação, exportação ou integrações. Os dados são mocks; o resultado não equivale a garantia absoluta para todo conteúdo futuro.


## Correção dos erros técnicos — segunda rodada

- A checagem completa do aplicativo passou sem diagnósticos TypeScript. A cópia independente e ignorada pelo Git em `Logix-new-front` foi retirada do escopo do `tsconfig` principal; ela não usa a configuração nem os aliases do aplicativo ativo.
- Corrigidas importações, propriedades antigas do cabeçalho, ícones do painel, configuração da grade, seleção de parceiros e contratos de dados dos formulários.
- PDFs agora preservam explicitamente a família da fonte ao alternar negrito/normal. Exportações do planner usam o nome do motorista existente no modelo.
- Corrigidos identificação do motorista em folgas, agrupamento de rotas, classificação de disponibilidade e resolução de nomes na confirmação de substituição.
- Removidos três hooks antigos de operações sem consumidores (`useApi`, `useDateNavigation`, `usePlannerData`), que ainda dependiam de um contexto incompatível. As páginas ativas mantêm seus fluxos de dados existentes.
- Unificada a inicialização Bootstrap dos planners, com descarte das instâncias e preservação do estado recolhido. Eliminadas propriedades sem uso repassadas às células do calendário.
- Tornadas explícitas as propriedades de transição em cinco componentes, eliminando classes de animação ambíguas no Tailwind.
- Adicionada configuração compatível com ESLint 9. Corrigidas dependências de efeitos, restauração do menu e liberação de URLs dos previews PDF.
- `npm run typecheck` agora executa o compilador completo. O baseline antigo foi zerado e o build deixou de usar `ignoreBuildErrors`.

As evidências da primeira rodada foram preservadas como histórico. Os limites de dados mockados e cobertura funcional descritos acima continuam válidos.


### Resultado final da segunda rodada

- TypeScript completo: **0 erros** ([log](typecheck-fixed.txt)); a validação de tipos também passou no build final.
- ESLint do projeto: **0 erros e 10 avisos** sobre otimização de elementos `<img>` ([log](eslint-fixed.txt)).
- Testes: **152 aprovados em 27 arquivos**, incluindo os seis novos testes de regressão ([log](tests-fixed.txt)).
- Build de produção: **aprovado**, com geração de **50/50 páginas**, sem ignorar erros TypeScript ([log](build-fixed.txt)).
- `git diff --check`: aprovado.
- O executor de testes ainda emite um aviso de compatibilidade futura sobre o formato do arquivo de configuração do Vite; não houve falha de execução.
- Alterações locais; nenhum deploy foi executado nesta rodada.
