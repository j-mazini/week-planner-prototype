# Consolidação do sistema de cores e identidade do service partner — design

**Data:** 24/09/2026
**Escopo:** os quatro sistemas de cor que hoje convivem no app, e o selo que marca service
partner nas 24 chamadas espalhadas pela interface.
**Fora de escopo:** as 17 paletas por página (sistema D abaixo). Elas migram num trabalho
seguinte, tela a tela, depois que existir um sistema para o qual migrar.

---

## 1. O problema

### Quatro sistemas de cor

| Sistema | Onde vive | O que é |
|---|---|---|
| **A** | `app/globals.css:10-24` | Tokens semânticos em HSL (`--primary`, `--background`, `--accent`…), consumidos pelo `tailwind.config.js` |
| **B** | `tailwind.config.js:83-92` | Dez hexadecimais `rm-*` em indigo/magenta |
| **C** | `NavbarWrapper.css:69-79` **e** `week-planner/styles.css:10-30` | A paleta "Figma shell" — `--paper`, `--line`, `--ink`, `--teal`, `--lime`, `--olive` |
| **D** | 17 arquivos CSS de página | Cada tela redefine as suas próprias cores |

A descoberta que reenquadra o trabalho: **A e C são a mesma paleta escrita duas vezes.** O
`--primary: 184 47% 29%` do sistema A, convertido, dá ≈`#27686D`; o `--teal: #27676c` do sistema
C é o mesmo tom. Não são dois sistemas disputando intenções diferentes — é uma paleta só, em HSL
num lugar e em hex noutro. É exatamente por isso que os valores começaram a divergir sem ninguém
notar: nada liga os dois, então editar um não toca o outro.

A divergência já aconteceu, entre as duas cópias de C:

| Token | `NavbarWrapper.css` | `week-planner/styles.css` |
|---|---|---|
| `--paper` | `#fffef8` | `#ffffff` |
| `--line` | `#c7cdbb` | `#bfc8c9` |

Duas telas do mesmo produto pintam o mesmo papel com brancos diferentes, e a mesma linha com
cinzas de temperatura diferente. Ninguém decidiu isso.

### O selo de service partner

`components/service-partner-badge.tsx`, um componente só, consumido em 24 lugares. Renderiza uma
pílula violeta com o texto literal **"SP"** e esconde o nome do parceiro num tooltip.

Três defeitos, em ordem de gravidade:

**Não distingue nada.** Numa tabela de quarenta linhas, as quarenta mostram o mesmo selo
idêntico. O selo ocupa espaço em cada linha para comunicar um fato — "isto é um service
partner" — que é constante naquela coluna. A informação que o utilizador quer, *qual* parceiro,
está escondida.

**Esconde a informação atrás de hover.** `cursor-help` e tooltip não existem em toque, e um
tooltip por linha é inutilizável para comparar duas linhas.

**A cor não pertence a sistema nenhum.** `bg-violet-600` é um tom cru do Tailwind, estranho aos
quatro sistemas acima — uma quinta ilha de cor.

---

## 2. A decisão: cores

**B morre.** Os dez `rm-*` têm zero usos em `app/`, `components/` e `lib/` — verificado por grep
de todas as formas de utility (`bg-`, `text-`, `border-`, `ring-`, `from-`, `to-`, `via-`).
Deleção limpa.

**C sobe para o `:root` e funde em A.** Os tokens do shell passam a ser definidos uma vez, em
`app/globals.css`, derivados dos tokens semânticos que já existem em vez de repetir os valores.
As definições em `NavbarWrapper.css:69-79` e `week-planner/styles.css:10-30` são removidas.

Onde as duas cópias divergem, **vencem os valores do `NavbarWrapper`** (`--paper: #fffef8`,
`--line: #c7cdbb`). O critério é alcance: o shell envolve todas as páginas importadas, então
esses são os valores que o utilizador vê na maioria das telas hoje; adotar os do week-planner
mudaria muitas telas para consertar uma.

Os tokens que existem **só** no week-planner e não têm par no shell continuam onde estão. Este
trabalho remove duplicação, não centraliza por centralizar.

**D fica.** As 17 paletas por página são o volume do problema, mas migrá-las agora significaria
tocar 17 arquivos CSS de telas grandes sem verificação visual disponível. Elas migram depois,
uma a uma, contra o sistema que este trabalho cria.

## 3. A decisão: identidade do parceiro

**O selo passa a mostrar a sigla do parceiro em vez de "SP".** "ACM" ao lado de "NOR" distingue
num relance; quarenta selos "SP" não distinguem nada.

### Por que a cor não carrega a identidade

A ideia óbvia — uma cor por parceiro — foi testada e reprovada, com números.

Selos de parceiro numa tabela são o caso **all-pairs**: dois parceiros quaisquer podem aparecer
lado a lado, em qualquer combinação. Não é o caso *adjacente* de uma barra empilhada, onde só
vizinhos precisam se distinguir. Rodando o validador de paletas categóricas contra a superfície
real do app (`#fffef8`):

| Nº de cores | Adjacente | All-pairs |
|---|---|---|
| 8 | passa | **falha** — verde↔laranja ΔE 3.2 (protanopia); vermelho↔laranja ΔE 7.1 na visão normal |
| 5 | — | **falha** — amarelo↔laranja ΔE 13.7, abaixo do piso de 15 |
| 4 | — | passa (pior par: ΔE 9.2 CVD, 16.3 visão normal) |

O teto validado é **quatro**. O negócio tem até oito parceiros. Com 28 pares em jogo, nenhuma
ordenação resolve — a lista de pares deixa de depender da ordem.

Quatro cores ciclando entre oito parceiros seria pior que não ter cor: duas empresas diferentes
apareceriam com a mesma cor, e o utilizador leria isso como "mesmo parceiro". O modo de falha da
versão com oito é ainda pior por ser silencioso — um utilizador protanope veria dois parceiros
como idênticos e nada na interface indicaria o problema.

**A sigla é texto.** Funciona para qualquer número de parceiros, é legível por leitor de tela,
não tem piso de contraste entre pares, e não quebra quando o nono parceiro é cadastrado.

### A cor que fica

Um tom único para todos os selos, vindo da paleta consolidada da seção 2, no lugar do
`violet-600` órfão.

E o selo passa a ser **discreto**, não vistoso: fundo `--paper`, borda `--line`, texto `--ink`.
A razão é a mesma que motivou o trabalho. O violeta saturado fazia sentido quando o selo
precisava gritar "atenção, service partner" em meio à linha; agora que ele carrega uma sigla
legível, ele é um dado como os outros da linha, e quarenta pílulas saturadas numa tabela são
ruído. O contraste do texto contra esse fundo tem de passar em WCAG AA (≥ 4.5:1 para o tamanho
`xs`, que é o menor).

### Derivação da sigla

Não existe campo de código no `ServicePartnerDTO` — só `partnerName` e `companyName`
(`lib/service-partners-api.ts:135-149`), então a sigla é derivada do nome.

**A regra:** as três primeiras letras do `partnerName`, em maiúsculas, ignorando caracteres não
alfabéticos. "Acme Logistics" → `ACM`; "Nordic Freight" → `NOR`; "J&M Transportes" → `JMT`.

Três letras fixas, e não iniciais de palavras, por previsibilidade: iniciais dariam larguras
diferentes ("AL" contra "JMT") e obrigariam a decidir o que fazer com nomes de uma palavra só.
Uma regra que o utilizador consegue prever de cabeça vale mais que uma que acerta mais casos.

Casos-limite: nome com menos de três letras usa o que houver; `partnerName` ausente, vazio ou só
com símbolos cai em **"SP"** — exatamente o que o selo mostra hoje, o que mantém o comportamento
atual para os dados em que não há nome.

**Colisões são inevitáveis** — "Acme Logistics" e "Acme Couriers" dão ambos `ACM`. A spec não
tenta eliminá-las, e nenhuma regra de derivação eliminaria. O tooltip continua sendo a resposta
autoritativa; o que muda é que ele vira o desempate de um caso raro, em vez de ser o único
caminho para uma informação que todo mundo precisa o tempo todo.

### As três modais

`invoice-details-modal.tsx:754`, `multiple-invoices-modal.tsx:1441` e
`new-invoice-modal.tsx:1222` montam cada uma o seu próprio avatar de iniciais, com `'SP'` como
fallback. São a mesma ideia reimplementada três vezes, e passam a usar o componente.

## 4. O que muda visualmente, e o que não

Três coisas mudam na tela, e só três:

1. O selo passa de "SP" violeta para a sigla do parceiro num chip discreto.
2. O week-planner passa a usar o `--paper` e o `--line` do shell, corrigindo a divergência.
3. As três modais de fatura trocam o avatar próprio pelo componente, o que pode alterar
   ligeiramente o tamanho e o espaçamento do avatar nelas.

Fora isso, **nenhuma cor renderizada muda**: o resto da seção 2 é dedupe e remoção de código
morto, e um token que passa a ser definido no `:root` em vez de numa classe resolve para o mesmo
valor.

A posição do selo, o seu tamanho e as três variantes (`xs`/`sm`/`md`) continuam como estão — as
24 chamadas não mudam de layout nem de assinatura.

Os handlers de supressão de arraste (`service-partner-badge.tsx:39-49`) **ficam**. Eles existem
porque o selo vive dentro de cards `draggable` no week-planner e o navegador roubava o hover;
removê-los reintroduz um bug já consertado.

## 5. Verificação

Cores: nenhuma cor renderizada deve mudar fora do week-planner. A prova é comparar os valores
computados antes e depois nos tokens do shell, e conferir que os `rm-*` não têm consumidor.

Selo: as 24 chamadas continuam renderizando, a sigla aparece no lugar de "SP", o tooltip ainda
revela o nome completo, e o contraste do texto do selo contra o novo fundo passa em WCAG AA.

A verificação visual em browser não está disponível nesta sessão — a extensão não tem permissão
para `localhost`. As telas de maior risco para inspeção manual são o week-planner (é a que muda
de cor) e qualquer tabela com muitos parceiros (é onde o selo novo prova o seu valor).
