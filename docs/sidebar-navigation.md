# Sidebar Logixsphere

A navegação do shell segue os nomes, caminhos e ordem de `components/beam-sidebar.tsx`, também conferidos na cópia local do frontend original da Logixsphere.

- Principal: Home, MY PERFORMANCE e Vendor Requests.
- Operations: Vendor, Vehicles, Contract Management, Assets, Week Planner, Daily Game Plan, Daily Operations Management, Daily Operations Insights e Vendor performance.
- Financial: Daily Financial Insights, Deductions, Invoices, Service Partner Invoices e Adhoc Works Invoice Management.

As outras páginas do protótipo permanecem na Home e na busca do sistema. Route Balance está entre elas. O botão Cleaning Desk, sem destino implementado, foi retirado do menu.

## Referência visual

Export do Figma disponível em `public/route-balance/screens/132-8083.json`: frame `132:8086` (Aside - SideNavBar), largura aberta 175 px, fundo #e9e9de, borda #bfc8c9, marca Space Grotesk 32 px, itens IBM Plex Mono 12 px, seleção #b2f746 e borda esquerda #003b3e de 4 px. A variante compacta de 58 px e o botão quadrado foram conferidos no export local `Downloads/Week Planner (2)/LogixSphere [Week Planner].png`.

Os rótulos longos do produto quebram em linhas. O menu rola independentemente do conteúdo, mantém a preferência de expansão durante a sessão, destaca a rota atual e fecha com Escape. No celular, expande sobre o conteúdo e recolhe ao escolher um destino. O pré-carregamento dos links continua desativado.
