/**
 * Regras de negocio centralizadas para IDs fixos vindos do banco.
 * Objetivo: evitar "magic numbers" espalhados no codigo e documentar por que cada ID existe.
 * A estrutura e congelada em todos os niveis para reduzir o risco de mutacao acidental em runtime.
 */
export const BUSINESS_RULES = Object.freeze({
  ROUTE: Object.freeze({
    /**
     * [O que é] — Rota administrativa usada para registrar day-off sem criar uma rota operacional real.
     * [Por que esse valor] — O fluxo legado de afastamentos identifica OFF por este ID fixo em vez de derivar a rota dinamicamente.
     * [Origem] — Tabela `routes`, registro administrativo de OFF usado em producao.
     * [Impacto se alterado] — Requests de day-off podem ser gravados na rota errada e deixar de aparecer corretamente nos fluxos que tratam afastamentos.
     * @todo — Confirmar com o time de dados o nome exato do campo PK usado para mapear esta rota entre ambientes.
     */
    DAY_OFF: 48,
    /**
     * [O que é] — Rota BRTE na malha operacional (`route_id` na tabela `routes`).
     * [Por que esse valor] — Servicos e itens ad hoc (fora do planejamento regular) ancoram neste identificador para nao misturar com rotas de linha fixa.
     * [Origem] — Tabela `routes`, registro BRTE com `route_id = 55` em producao.
     * [Impacto se alterado] — Itens ad hoc podem ser classificados na rota errada, sumir de filtros esperados ou distorcer relatorios e conciliacao operacional.
     * @todo — Confirmar com Operacoes se o codigo BRTE e o ID 55 permanecem estaveis em todos os ambientes.
     */
    BRTE: 55,
    /**
     * [O que é] — Rota DHOC na malha operacional (`route_id` na tabela `routes`).
     * [Por que esse valor] — Servicos e itens ad hoc (incluindo variantes DHOC) usam este identificador para separar entregas pontuais da malha regular, em complemento a BRTE quando aplicavel.
     * [Origem] — Tabela `routes`, registro DHOC com `route_id = 57` em producao.
     * [Impacto se alterado] — Itens ad hoc podem ser classificados na rota errada, afetando filtros, relatorios e conciliacao operacional.
     * @todo — Confirmar com Operacoes se o codigo DHOC e o ID 57 permanecem estaveis em todos os ambientes.
     */
    DHOC: 57,
    /**
     * [O que é] — Rota administrativa para itens "NotAllocated" quando ainda nao existe alocacao operacional valida.
     * [Por que esse valor] — O legado usa este ID para manter rastreabilidade e separar pendencias de rotas fisicas da malha.
     * [Origem] — Tabela `routes`, registro administrativo de NotAllocated em producao.
     * [Impacto se alterado] — Registros nao alocados podem cair em filtros incorretos, quebrar conciliacao operacional e mascarar itens pendentes.
     * @todo — Confirmar com Operacoes se o nome funcional oficial continua sendo "NotAllocated" em todos os relatorios.
     */
    NOT_ALLOCATED: 159,
  }),

  VEHICLE: Object.freeze({
    /**
     * [O que é] — Veiculo placeholder usado em registros de day-off quando nao existe veiculo operacional associado.
     * [Por que esse valor] — O fluxo de OFF precisa persistir um `vehicle_id` valido para manter compatibilidade com validacoes e joins legados.
     * [Origem] — Tabela `vehicles`, registro placeholder reservado para OFF no ambiente atual.
     * [Impacto se alterado] — Validacoes de conflito, consultas de operacao e requests de afastamento podem apontar para um veiculo real ou falhar por referencia invalida.
     * @todo — Confirmar com Operacoes se este ID e exclusivo para OFF em todos os ambientes.
     */
    DAY_OFF_PLACEHOLDER: 37,
    /**
     * [O que é] — Veiculo placeholder padrao BAOP para cenarios sem veiculo real, como OFF e NotAllocated.
     * [Por que esse valor] — Multiplos fluxos legados assumem este fallback para manter consistencia entre planner, vendor requests e operacoes diarias.
     * [Origem] — Tabela `vehicles`, registro placeholder BAOP consumido por fluxos historicos.
     * [Impacto se alterado] — Regras de excecao, filtros de veiculo e sincronizacao com o frontend podem divergir e produzir conflitos falsos ou exibicao incorreta.
     * @todo — Confirmar se pode variar por deposito em ambientes futuros.
     */
    BAOP_DEFAULT_PLACEHOLDER: 55,
  }),

  DEPOSIT: Object.freeze({
    /**
     * [O que é] — Deposito LCY (`deposit_id` na tabela `deposits`).
     * [Por que esse valor] — Identificador fixo do deposito LCY consumido por filtros, permissoes e joins operacionais.
     * [Origem] — Tabela `deposits`, PK `deposit_id = 1`.
     * [Impacto se alterado] — Consultas e regras por deposito podem apontar para o local errado.
     */
    LCY: 1,
    /**
     * [O que é] — Deposito MSE (`deposit_id` na tabela `deposits`).
     * [Por que esse valor] — Identificador fixo do deposito MSE consumido por filtros, permissoes e joins operacionais.
     * [Origem] — Tabela `deposits`, PK `deposit_id = 2`.
     * [Impacto se alterado] — Consultas e regras por deposito podem apontar para o local errado.
     */
    MSE: 2,
    /**
     * [O que é] — Deposito LSE (`deposit_id` na tabela `deposits`).
     * [Por que esse valor] — Identificador fixo do deposito LSE consumido por filtros, permissoes e joins operacionais.
     * [Origem] — Tabela `deposits`, PK `deposit_id = 3`.
     * [Impacto se alterado] — Consultas e regras por deposito podem apontar para o local errado.
     */
    LSE: 3,
    /**
     * [O que é] — Deposito administrativo usado para registrar day-off em vendor requests.
     * [Por que esse valor] — O processo legado de afastamentos ancora OFF neste deposito para manter filtros, permissoes e dashboards coerentes.
     * [Origem] — Tabela `deposits`, deposito administrativo associado ao fluxo de OFF.
     * [Impacto se alterado] — OFF pode desaparecer de consultas esperadas, cair em escopos de permissao errados ou gerar inconsistencias com relatórios existentes.
     * @todo — Confirmar com Operacoes se o OFF deve permanecer fixo neste deposito em todos os ambientes.
     */
    DAY_OFF: 4,
    /**
     * [O que é] — Deposito BAOP usado como fallback para fluxos legados de OFF e NotAllocated.
     * [Por que esse valor] — Integracoes e dados historicos assumem BAOP como deposito neutro quando nao ha alocacao operacional definitiva.
     * [Origem] — Tabela `deposits`, registro BAOP reutilizado como fallback sistêmico.
     * [Impacto se alterado] — Registros podem ser persistidos em deposito incorreto, afetando joins, filtros por deposito e compatibilidade com dados existentes.
     * @todo — Validar com o time de dados se este fallback continua obrigatorio.
     */
    BAOP_DEFAULT: 7,
  }),

  MANAGEMENT_TEAM_FUNCTION: Object.freeze({
    /**
     * [O que é] — Funcao "OPS MANAGER" usada nas regras de acesso de Management & Support.
     * [Por que esse valor] — O Daily Game Plan no deposito BAOP libera a acao apenas para utilizadores com esta funcao especifica.
     * [Origem] — Tabela de funcoes/cargos de utilizador consumida pelo backend de autenticacao e autorizacao.
     * [Impacto se alterado] — Utilizadores podem perder acesso legitimo ao fluxo ou ganhar permissao indevida para criar planejamento.
     * @todo — Confirmar com RH/Operacoes o nome exato da tabela e do campo que representam esta funcao.
     */
    OPS_MANAGER: 1,
  }),

  /**
   * Tipos de utilizador esperados pelos fluxos legados de autenticacao/autorizacao.
   * Estes IDs precisam permanecer centralizados porque tambem chegam via JWT e consultas SQL.
   */
  USER_TYPE: Object.freeze({
    /**
     * [O que é] — Tipo de utilizador Administrador com acesso amplo aos modulos protegidos.
     * [Por que esse valor] — Regras de autorizacao historicas tratam `user_type_id = 1` como bypass de restricoes mais especificas.
     * [Origem] — Campo `user_type_id` no token autenticado e na tabela `users`.
     * [Impacto se alterado] — Middlewares e verificacoes de permissao podem liberar ou bloquear acessos de forma incorreta em backend e frontend.
     */
    ADMIN: 1,
    /**
     * [O que é] — Tipo de utilizador Motorista/Driver usado nos fluxos operacionais.
     * [Por que esse valor] — O dominio de operacoes identifica condutores por este tipo para diferenciar execucao em campo de perfis administrativos.
     * [Origem] — Campo `user_type_id` no token autenticado e na tabela `users`.
     * [Impacto se alterado] — Filtros, validacoes e telas que dependem da distincao entre driver e outros perfis podem deixar de funcionar corretamente.
     */
    DRIVER: 2,
    /**
     * [O que é] — Tipo de utilizador Supervisor, sujeito a restricoes por deposito e rota.
     * [Por que esse valor] — Varias regras de escopo usam `user_type_id = 3` para limitar visualizacao e operacao no planner.
     * [Origem] — Campo `user_type_id` no token autenticado e na tabela `users`.
     * [Impacto se alterado] — O controle de acesso pode divergir do frontend e expor dados indevidos ou ocultar informacao necessaria.
     */
    SUPERVISOR: 3,
    /**
     * [O que é] — Tipo de utilizador Service Partner, com acesso limitado a operacoes de vendor e faturamento.
     * [Por que esse valor] — Parceiros de servico requerem acesso restrito a home, planner semanal, insights financeiros, invoices, e gerenciamento de vendor/veiculo/deducoes.
     * [Origem] — Campo `user_type_id` no token autenticado e na tabela `users`.
     * [Impacto se alterado] — Service partners podem ganhar acesso indevido a dados administrativos ou perder acesso a funcoes essenciais de faturamento.
     */
    SERVICE_PARTNER: 5,
  }),

  COST_MODEL: Object.freeze({
    /**
     * [O que é] — Modelo de custo "Daily Adhoc Fixed".
     * [Por que esse valor] — O faturamento e a classificacao operacional reconhecem este ID como a variante fixa de ad hoc diario.
     * [Origem] — Tabela de modelos de custo (`cost_models` ou equivalente), registro DAF.
     * [Impacto se alterado] — Regras de precificacao e filtros por modelo podem classificar corridas no tipo errado.
     * @todo — Confirmar com Financeiro o nome oficial da tabela e se o ID e estavel entre ambientes.
     */
    DAF: 1,
    /**
     * [O que é] — Modelo de custo "Daily Rate".
     * [Por que esse valor] — O motor de negocio trata este ID como modalidade diaria padrao nas comparacoes de custo.
     * [Origem] — Tabela de modelos de custo (`cost_models` ou equivalente), registro Daily Rate.
     * [Impacto se alterado] — Calculos financeiros e filtros operacionais podem usar a regra errada para este tipo de servico.
     * @todo — Confirmar com Financeiro se o cadastro continua unificado para todos os depositos.
     */
    DR: 2,
    /**
     * [O que é] — Modelo de custo "Fixed Service Rate".
     * [Por que esse valor] — Este ID distingue servicos com remuneracao fixa das modalidades variaveis ou horarias.
     * [Origem] — Tabela de modelos de custo (`cost_models` ou equivalente), registro FSR.
     * [Impacto se alterado] — Relatorios e regras de faturamento podem aplicar uma composicao financeira incorreta.
     * @todo — Confirmar com Financeiro se existe dependencia externa consumindo este ID diretamente.
     */
    FSR: 3,
    /**
     * [O que é] — Modelo de custo "Variable Service Rate".
     * [Por que esse valor] — O dominio financeiro usa este ID para aplicar regras variaveis de remuneracao por servico.
     * [Origem] — Tabela de modelos de custo (`cost_models` ou equivalente), registro VSR.
     * [Impacto se alterado] — Simulacoes, faturamento e exportacoes podem deixar de reconhecer corretamente servicos variaveis.
     * @todo — Confirmar com Financeiro se ha aliases legados para este modelo em relatorios antigos.
     */
    VSR: 4,
    /**
     * [O que é] — Modelo de custo "Hourly Rate".
     * [Por que esse valor] — O calculo por hora depende deste ID para separar contratos horarios das demais estruturas de pagamento.
     * [Origem] — Tabela de modelos de custo (`cost_models` ou equivalente), registro Hourly Rate.
     * [Impacto se alterado] — Contratos horarios podem ser tarifados como outro modelo e gerar divergencias financeiras.
     * @todo — Confirmar com Financeiro se este modelo ainda e usado em todos os fluxos ou apenas em cenarios especificos.
     */
    HOURLY_RATE: 7,
    /**
     * [O que é] — Modelo de custo administrativo para OFF, day-off e cenarios not-allocated.
     * [Por que esse valor] — Fluxos sem servico faturavel usam este ID para distinguir indisponibilidade/placeholder de uma operacao remunerada.
     * [Origem] — Tabela de modelos de custo (`cost_models` ou equivalente), registro OFF administrativo.
     * [Impacto se alterado] — Registros de OFF podem entrar em calculos financeiros ou dashboards como servicos reais, distorcendo indicadores.
     * @todo — Confirmar com Operacoes e Financeiro se OFF, day-off e not-allocated continuam consolidados no mesmo modelo.
     */
    OFF: 9,
    /**
     * [O que é] — Modelo de custo "Service Partner Variable Service Rate".
     * [Por que esse valor] — Variante VSR para Service Partners com 4 faixas (bandas) de stops ao inves de 2.
     *   Cada faixa define um intervalo de stops (minStops/maxStops) e um preco por stop (pricePerStop).
     * [Origem] — Tabela de modelos de custo (`cost_models` ou equivalente), registro SP_VSR.
     * [Impacto se alterado] — Calculos financeiros, filtros operacionais e o mapa de bandas no VendorModal
     *   podem classificar ou exibir o modelo incorretamente.
     * @todo — Confirmar com Financeiro se o ID 12 e estavel entre ambientes e se havera variante eletrica.
     */
    SP_VSR: 12,
  }),

  VEHICLE_EXEMPTIONS: Object.freeze({
    /**
     * [O que é] — Lista de IDs de veículos isentos da regra de conflict validation (1 placa por dia).
     * [Por que esses IDs] — 
     *  - 37: Veículo placeholder de Day-Off.
     *  - 55: Veículo placeholder genérico BAOP. 
     * Ambos são virtuais e podem ser usados em múltiplas operações simultâneas.
     * [Origem] — Mapeamento histórico de veículos administrativos.
     * [Impacto se alterado] — Bloqueia a criação de múltiplas folgas ou registros administrativos no mesmo dia.
     */
    MULTI_OP_ALLOWED: Object.freeze([37, 55]),
  }),

  DRIVER_TYPE: Object.freeze({
    /**
     * [O que é] — Tipo de motorista "SPARE" (Reserva).
     * [Por que esse valor] — O ID 7 identifica motoristas reserva que podem ser escalados em várias rotas ou ficar de stand-by.
     * [Origem] — Tabela `driver_types`, registro SPARE.
     * [Impacto se alterado] — Filtros de motoristas e regras de "day-off" automático para spares podem falhar.
     */
    SPARE: 7,
  }),

  WORKING_STATUS: Object.freeze({
    /**
     * [O que é] — Status administrativo de folga/afastamento do motorista.
     * [Por que esse valor] — Identifica registros de day-off, sem operação associada, separando-os de status operacionais reais.
     * [Origem] — Tabela `statuses` (ou equivalente), registro OFF administrativo.
     * [Impacto se alterado] — Filtros de operação e dashboards podem tratar folgas como rotas ativas.
     * @todo — Confirmar o nome exato do campo e da tabela de origem com o time de dados.
     */
    OFF: "OFF",
    /**
     * [O que é] — Status de motorista sem alocação operacional definida.
     * [Por que esse valor] — Distingue pendências de alocação de registros operacionais definitivos, mantendo rastreabilidade no planner.
     * [Origem] — Tabela `statuses` (ou equivalente), registro NotAllocated.
     * [Impacto se alterado] — Registros pendentes podem cair em filtros incorretos e mascarar itens aguardando alocação.
     * @todo — Confirmar com Operações se o nome funcional "NotAllocated" é estável em todos os relatórios.
     */
    NOT_ALLOCATED: "NotAllocated",
    /**
     * [O que é] — Status de motorista em operação ativa/trabalhando.
     * [Por que esse valor] — Representa o estado padrão de um motorista em execução de rota no dia.
     * [Origem] — Tabela `statuses` (ou equivalente), registro Working.
     * [Impacto se alterado] — KPIs de presença, filtros operacionais e conciliação de rotas podem divergir.
     */
    WORKING: "Working",
    /**
     * [O que é] — Status de motorista em feriado reconhecido.
     * [Por que esse valor] — Diferencia ausências por feriado de folgas voluntárias (OFF), permitindo controle financeiro e operacional separado.
     * [Origem] — Tabela `statuses` (ou equivalente), registro Holiday.
     * [Impacto se alterado] — Relatórios financeiros e de presença podem classificar feriados incorretamente como folgas ou vice-versa.
     * @todo — Confirmar com RH/Financeiro se Holiday tem tratamento diferenciado em todos os ambientes.
     */
    HOLIDAY: "Holiday",
  }),
});
