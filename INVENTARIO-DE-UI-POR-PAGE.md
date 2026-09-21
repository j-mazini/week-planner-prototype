# Inventário de UI por page — logix-sphere-frontend-nextjs

**Para:** quem vai mexer numa tela e precisa saber, antes de abrir o editor, quais menus, modais,
cards, tabelas e ações já existem ali — e quais já existem em outra tela e podem ser reaproveitados.
**Data do mapeamento:** 21/09/2026, a partir do código real de `main`.
**Documentos irmãos:** `docs/CATALOGO-DE-PAGES.md` (o que cada tela faz) e
`docs/ANATOMIA-DE-UMA-PAGE.md` (como uma tela é construída).

Números de referência: **311 componentes distintos** em `app/(private)/*/components/`, em **384
instâncias** — ou seja, 73 arquivos são cópias de um componente que já existe com o mesmo nome em
outra tela. A seção 3 lista quais.

---

## 1. Os três menus do sistema

Não existe um arquivo único de navegação. A rota nova precisa ser declarada em até três lugares
diferentes, e os três têm conteúdo distinto.

### Sidebar desktop — `components/beam-sidebar.tsx`

Uma constante `NAVIGATION_DATA` com dois grupos. A visibilidade de cada grupo vem de
`getBeamSidebarAccess(userTypeId)` em `lib/route-permissions.ts`: admin vê tudo; supervisor vê a
sidebar mas **não** o grupo financeiro nem vendor requests; service partner vê sidebar e financeiro,
mas não vendor requests; qualquer outro perfil não vê sidebar nenhuma.

| Grupo `projects` | Rota | | Grupo `financial` | Rota |
|---|---|---|---|---|
| Vendor | `/vendor` | | Daily Financial Insights | `/daily-financial-insights` |
| Vehicles | `/vehicles` | | Deductions | `/deductions-disbursements-recharges` |
| Contract Management | `/contract-management` | | Invoices | `/financial-invoices` |
| Assets | `/assets` | | Service Partner Invoices | `/service-partner-invoices` |
| Week Planner | `/week-planner` | | Adhoc Works Invoice Management | `/adhoc-works-invoice-management` |
| Daily Game Plan | `/daily-game-plan` | | | |
| Daily Operations Management | `/daily-operations-management` | | | |
| Daily Operations Insights | `/daily-operations-reports` | | | |
| Vendor performance | `/vendor-performance` | | | |

### Barra mobile — `app/(private)/components/MobileNavBar.tsx`

Sete itens, renderizados no layout privado para todos os perfis:

| Rótulo | Rota |
|---|---|
| Insights | `/daily-performance-insight` |
| Profile | `/subcontractor` |
| Deductions | `/deductions` |
| Mês | `/current-month` |
| Performance | `/current-performance` |
| Invoice | `/mobile-invoice` |
| Pedidos | `/requests` |

Dois dos sete rótulos estão em português ("Mês", "Pedidos") num sistema cuja interface é toda em
inglês. É a correção mais barata deste documento.

### Quick Access e menu mobile da home — `app/(private)/home/`

`components/MobileMenuButton.tsx` repete, item por item, a mesma lista da sidebar — mantê-las em
sincronia é manual. Já `constants.ts` monta o Quick Access e as notificações com uma lista própria,
que inclui **oito rotas que não existem** (`/admin-settings`, `/admin-settings/backups`,
`/security/alerts`, `/operations-management/routes`, `/operations-management/kpis`,
`/vendor/documents`, `/training/compliance`, `/compliance/audit`) e uma que é protótipo com dados
fixos (`/invoice-history`).

### Botões flutuantes globais

Montados no `app/(private)/layout.tsx`, presentes em toda tela privada: `GlobalChatButton` (só
quando `NEXT_PUBLIC_CHAT !== 'false'`), `GlobalNavigationButton` e `BeamSidebar`.

---

## 2. O vocabulário de UI

Antes de criar um componente novo, procure por estes nomes — eles já existem e definem o padrão da
casa.

**Casca de página.** `StandardPageLayout` (fundo em gradiente, safe areas, animação de entrada),
`PageHeader`, `PageContent`, `PageSection`, `MobilePageShell`, `TodayDateLine`. Para o Daily Game
Plan há um frame próprio: `DgpPageFrame` e `DgpPageHeaderCard`. Quase toda tela envolve o conteúdo
em `NavbarWrapper`.

**Modal de confirmação de exclusão.** `DeleteConfirmModal` existe em cinco telas —
`contract-management`, `daily-financial-insights`, `deductions-disbursements-recharges`, `vendor` e
`week-planner-operations` — cada uma com a própria cópia. `vehicles` tem a sua com outro nome
(`DeleteVehicleModal`), e `service-partner-invoices` também (`DeleteDeductionModal`).

**Estados de carregamento, erro e vazio.** `LoadingState` (5 telas), `EmptyState` (5),
`ErrorState` (4), `LoadingSpinner` (3), `ErrorMessage` (2), mais os skeletons da home. Não há um
conjunto compartilhado.

**Navegação temporal.** `MonthCarousel` (4 telas), `MonthSelector` (4), `DaysCarousel` (2),
`PeriodCarousel`, `DateCarousel`, `MonthYearSelect`, e o componente global `month-select.tsx` /
`period-picker.tsx`.

**Desktop vs mobile.** O padrão é um par `DesktopView` / `MobileView` (3 e 4 telas), com
`MobileCard`, `MobileFilters` e `MobileVendorCard` como variantes. Alternativamente, a tela usa
`use-mobile` e ramifica internamente.

**Tabela, filtro e paginação.** `TableHeader` (3), `FilterBar` (3), `FilterToggles` (2),
`Pagination` (4 cópias independentes), `SortableHeader`, `SearchInput` (2), `SearchBar`.

**Componentes globais reutilizados de verdade.** Estes estão em `components/` e são compartilhados:
`invoice-details-modal`, `new-invoice-modal`, `multiple-invoices-modal`,
`service-partner-invoice-preview-modal`, `status-badge`, `service-partner-badge`, `vrn-plate`,
`user-card`, `export-button`, `modern-page-header`, `page-header`, `table-header`, `styled-button`,
`andon-status`, `period-picker`, `month-select`.

---

## 3. Inventário por page

### 3.1 Operação diária

#### `/week-planner`
**Views.** `PlannerView`, `WeeklyView`, `DailyView`, `DailyComparisonView`.
**Modais (19).** `AssignmentModal`, `EditAssignmentModal`, `DayOffModal`, `DayScheduleModal`,
`EditVehicleModal`, `AdHocServiceModal`, `DailyTeamSupportModal`, `ManagementSupportModal`,
`ManagementSupportEmployeeModal`, `EditManagementSupportModal`, `EditManagementFunctionModal`,
`FlexRouteSelectionModal`, `RemoveFlexRouteModal`, `DepositDashboardModal`, `ConfirmationModal`,
`BAOPLineAndEntryModals`, `PdfPreviewModal`, `ExportDayScheduleModal`, `ExportWeekScheduleModal`.
**Cards.** `VendorCard`, `VendorAssignCard`, `DayCard`, `ManagementCard`, `StatCard`, `AlertCard`.
**Seções e grids.** `DepositSection`, `FlexRoutesSection`, `AdHocServicesSection`,
`AdHocServicesSectionDaily`, `BAOPServicesSection`, `WeekGrid`, `RouteGrid`, `StickyVendorsPanel`.
**Abas de configuração.** `VendorTypeTab`, `UserTypeTab`, `CostModelTab`, `VehicleTypeTab`,
`DriverTypeTab` — **os cinco existem também em `/contract-management`**, como arquivos separados.
**Apoio.** `VendorChip`, `VendorList`, `VendorsDrawer`, `DayCell`, `RouteLabel`,
`SearchableCombobox`, `ColorLegend`, `FlexRouteVisibilityControls`, `OpenFlexRouteButton`,
`PlannerContext`.
**Ações.** 81 handlers — a maior superfície de ação do sistema. Atribuição
(`handleAssignVendor`, `handleAssignWeek`, `handleAssignmentDelete`), arrastar e soltar
(`handleCardDragStart`, `handleChipDragStart`, `handleCellDrop`), day-off (`handleDayOffChange`,
`handleDayToggle`), criação (`handleCreateAdHocService`, `handleCreateBaopService`,
`handleCreateDailyTeamSupport`, `handleCreateManagementSupport`), escala padrão
(`handleDefaultSchedule`), depósito (`handleDepotToggle`), e exportação.

#### `/daily-operations-management` (código em `week-planner-operations/`)
**Views.** `PlannerView`, `WeeklyView`, `DailyView`, `Planner`.
**Modais (9).** `OperationsFormModal`, `OperationsReviewModal`, `OperationsHistoryModal`,
`AssignmentModal`, `DayOffModal`, `FlexRouteModal`, `RateBandsModal`, `BulkSubmitWarningModal`,
`DeleteConfirmModal`.
**Tabelas.** `OperationsTable`, `OperationsReviewTable`, `ReviewTable`, `DayOffTable`,
`week-planner-table`.
**Cabeçalhos e filtros.** `OperationsHeaderControls`, `OperationsFiltersBar`, `RouteGroupHeader`,
`LoopSectionHeader`, `LoopSection`.
**Feedback.** `SuccessAnimation`, `SuccessCelebration`, `ValidationError`.
**Ações.** 54 handlers, com o mesmo vocabulário de arrastar e soltar do week-planner
(`handleDragStart`, `handleDragOver`, `handleDragEnter`, `handleDragLeave`, `handleDrop`,
`handleDragEnd`, e as variantes `...Card` e `...Chip`), envio em lote (`handleBatchSubmit`),
rota flex (`handleAddFlexRoute`) e exportação CSV.
**Atenção.** Doze componentes desta pasta têm nome idêntico aos do `/week-planner`: `DailyView`,
`WeeklyView`, `PlannerView`, `PlannerContext`, `DayCell`, `VendorChip`, `VendorList`, `RouteLabel`,
`VendorCard`, `AssignmentModal`, `DayOffModal` e `FlexRouteVisibilityControls`. As duas telas são um
fork uma da outra. Há ainda um `page.new.tsx` aqui, fora da rota.

#### `/daily-game-plan`
**Modais.** `OperationFormModal`, `OpenOperationModal`, `PendingDayModal`, `MessageModal`,
agregados por `ModalsSection`.
**Blocos.** `DepositGroup`, `OperationRow`, `NotAllocatedPanel`, `VendorsOffPanel`,
`FinalizedOperationView`, `ActionBar`.
**API local (`api.ts`).** 19 funções exportadas, incluindo `fetchDailyGamePlansByDate`,
`createDailyGamePlanOperation`, `stopDailyGamePlanOperation`, `transitionDailyGamePlanOperation`,
`bulkFinishDailyGamePlanOperations`, `bulkApproveWeekPlanners`,
`bulkDayOffDailyOperationsManagement`, `fetchDailySupervisorCheck`,
`normalizeDailyGamePlanStatus`, `isDailyGamePlanOpNotAllocatedStatus`, `mapToStartOperationRequest`.
**Ações.** `handleStartStop` (o botão central da tela), `handleOpenOperationFinish`,
`handlePendingDayFinish`, `handleCreateAdHoc`, `handleCreateFlexRoute`, `handleSaveDepositNotes`,
`handleToggleNotAllocatedPanel`, `handleToggleOffPanel`, `handleToggleCollapse`.

#### `/daily-operations-reports`
**Modal.** `VendorDetailsModal`.
**Tabela.** `DataTable` com células especializadas: `TableCellArrive`, `TableCellBreak`,
`TableCellWorkHours`, mais `TableHeader` e `TableRow`.
**Mobile.** `MobileView`, `MobileCard`, `MobileFilters`.
**Apoio.** `FilterBar`, `FilterToggles`, `Pagination`, `LoadingOverlay`, `ErrorAlert`, `NoteIcon`.
**Colunas.** Date, Route, VRN, Vendor, Stops, Depart, Arrive, Break, Work Hours, Total Hours, TW %,
Note.
**Ações.** Ordenação e paginação, filtro por depósito e por loop, exportação
(`handleExport` / `handleExportInternal` / `handleExportError`), abertura do detalhe do vendor, e
fechamento por clique fora ou tecla Esc.

### 3.2 Cadastro e configuração

#### `/contract-management`
**Abas (13).** Depot Management, Ad-Hoc Services, Adhoc Service Config, Adhoc Category,
BA Costs Centers, Cost Model, Driver Type, Management Team Function, Service Partner, User Type,
Vehicle Type, Vendor Type — orquestradas por `ContractManagementTabBody`.
**Modais (17).** `DepositModal`, `DepositEditModal`, `RouteModal`, `RouteViewModal`,
`ServiceTypeModal`, `ServicePartnerModal`, `AdhocServiceModal`, `AdhocCategoryModal`,
`CostModelModal`, `DriverTypeModal`, `UserTypeModal`, `VehicleTypeModal`, `VendorTypeModal`,
`ManagementTeamFunctionModal`, `LoopModal`, `DeleteConfirmModal`.
**Cards (13).** Um por entidade: `DepositCard`, `RouteCard`, `ServiceTypeCard`,
`ServicePartnerCard`, `AdhocServiceCard`, `AdhocCategoryCard`, `CostModelCard`, `DriverTypeCard`,
`UserTypeCard`, `VehicleTypeCard`, `VendorTypeCard`, `LoopCard`, `UnassignedLoopsCard`.
**Tabela e filtros.** `RouteTable`, `RouteFilters`, `FiltersPanel`, `RouteTypeFilter`, `LoopFilter`,
`StatusFilter`, `DepositSelect`, `SearchInput`.
**Ações.** 28 handlers, o padrão `handleNew*` / `handleEdit*` / `handleSave*` / `handleDelete*` por
entidade, mais `handleExport`.
**Atenção.** A pasta `components/Modals/` é importada por `/assets`. Seis dos modais servem às duas
telas.

#### `/assets`
**Abas (6).** Vendor Types, User Types, Cost Models, Vehicle Types, Management & Support Team,
Adhoc Categories — com rótulo curto para mobile (Vendor, User, Cost, Vehicle, Team, Categories).
**Componentes próprios.** Só dois: `AssetsHeader` e `AssetsTabBody`.
**Modais.** Nenhum próprio — os seis vêm de `../contract-management/components/Modals/`, carregados
com `lazy()`.
**Estado.** Tudo passa por um hook único, `useAssetsPage`.

#### `/vendor`
**Modais.** `VendorModal` (criar/editar), `VendorInfoModal` (documentos e treinamento),
`DeleteConfirmModal`.
**Tabela e cards.** `VendorTable`, `VendorCardGrid`, `VendorUserCard`, `VendorMobileView`.
**Filtros.** `VendorFilters` — status, tipo de vendor e busca.
**Abas do detalhe.** Personal, Address, Contract, Cost Model, Compliance, Training, com campos como
DVLA Check, Criminal Record Check e DHL Training Number.
**Ações.** 30 handlers. Além do CRUD, tem máscaras de entrada dedicadas
(`handleIntegerKeyDown`, `handleDecimalKeyDown`, `handleDateKeyDown`, `handleNumericInput`),
navegação entre registros (`handlePrev`, `handleNext`), seleção (`handleSelectVendor`,
`handleClearSelection`) e os atalhos `handleShowDocuments` / `handleShowTraining`.

#### `/vehicles`
**Modais.** `VehicleModal` (criar/editar), `DeleteVehicleModal`.
**Tabela e cards.** `VehicleTable`, `VehicleCard`, `VehicleCardGrid`, `MobileVehicleCard`.
**Filtros.** `VehicleFilters` e `MobileVehicleFilters` — status, combustível, fabricante, modelo,
placa, parceiro.
**Campos com tratamento próprio.** 270° Doors, Slam Lock, Bulkhead, Camera, GPS, Wrapped, Painted,
Electric Vehicle.
**Ações.** 13 handlers, incluindo `handleEsc` para fechar o modal pelo teclado, paginação e
exportação.

### 3.3 Financeiro

#### `/financial-invoices`
**Cards e estatísticas.** `StatCard`, `MobileStatCard`, `StatsSection`, `InvoiceCard`.
**Tabela.** `InvoiceTable`, `InvoiceTableRow`, `SortableHeader`.
**Views.** `DesktopView`, `MobileContentView`, `MobileInvoiceList`.
**Barras.** `ActionsBar`, `FilterBar`, `SearchInput`, `MonthSelector`.
**Efeitos.** `Reveal` e `Ripples` — animações de entrada e de clique próprias desta tela.
**Ações.** Seleção de mês, ordenação, exportação e abertura da fatura.

#### `/service-partner-invoices`
**Modais.** `ServicePartnerInvoiceModal`, `GenerateInvoiceModal`, `DeductionFormModal`,
`DeleteDeductionModal`.
**Blocos da fatura.** `BaExpressHeader`, `ServicePartnerDetailsBlock`, `PartnerInvoiceBlock`,
`DeductionsBlock`, `VatBlock`, `GrandTotalBar`, `InvoiceSummaryStats`.
**Abas e views.** `DeductionsTabView`, `ServicePartnerMonthView`.
**Ações.** `handleGenerate` e `handleGenerateSuccess` (emissão), `handleAddDeduction`,
`handleEditDeduction`, `handleDeleteDeduction`, `handleDeductionSuccess`, `handleDownload`.

#### `/deductions-disbursements-recharges`
**Modais.** `DeductionModal`, `DeleteConfirmModal`.
**KPIs.** `KpiCard` e `KpiGrid`, clicáveis: `handleKpiFilterChange` filtra a tabela pelo cartão, e
`handleKpiAddClick` abre o lançamento já no tipo daquele KPI.
**Tabela e views.** `DeductionsTable`, `DesktopView`, `MobileView`, `SearchBar`, `MonthSelector`.
**Ações.** 27 handlers. Tem lançamento em passos (`handleNextStep`, `handlePrevStep`), upload de
arquivo por seleção e por arrastar (`handleFileInputChange`, `handleDrop`), e entrada numérica
controlada (`handleNumericInput`).

#### `/adhoc-works-invoice-management`
**Componentes.** Nenhum componente próprio — a tela inteira está no `page.tsx`, usando `Table`,
`TableFooter` e os componentes globais.
**Colunas.** Period, Total Records, Total Vendor Payment, Total Received Payment, Generated.
**Ações.** Navegação por semana (`handlePrevWeek`, `handleNextWeek`, `handleTodayWeek`), troca de
mês e ano, ordenação e exportação.

#### `/invoice-processing-workflow`
**Componentes.** Nenhum componente próprio — ~2.300 linhas concentradas em 4 arquivos, com modais do
Bootstrap acionados por `window.bootstrap`.
**Estados de fatura.** Pending Verification, Ready for Invoicing.
**Ações.** `handleNewInvoiceSubmit`, `handleMultiInvoiceCreate`, `handleEditSubmit`,
`handleLoopSubmit`, ordenação e exportação.

#### `/daily-financial-insights`
**Modais.** `OperationModal` (editar operação), `DeleteConfirmModal`.
**Tabela.** `InsightsTable`, `InsightsTableRow`, `TableHeader`, com `NoteIcon` e `FSRInfoIcon` nas
células.
**Mobile.** `MobileView`, `MobileCard`, `MobileFilters`.
**Apoio.** `FilterBar`, `FilterToggles`, `Pagination`, `Toast`, `EmptyState`, `LoadingSpinner`.
**Ações.** 15 handlers, incluindo criação (`handleAddNewRegister`), edição e exclusão de operação a
partir da linha, e limpeza de filtros.
**Atenção.** Existe um `page-refactored.tsx` na pasta, fora da rota.

#### `/daily-financials`
**Componentes.** Nenhum próprio. Selects de depósito e de service type, e download do relatório.
**Ações.** `handleDateChange`, `handleDepositChange`, `handleServiceTypeChange`,
`handleStatusChange` (muda o status da operação no backend), `handleDownload`.

#### `/schedule`
**Componentes.** Nenhum próprio.
**Estados.** Scheduled, Paid, Pending.
**Ações.** Seleção múltipla (`handleSelectAll`, `handleSelectOne`), edição em modal
(`handleEditClick`, `handleModalSave`, `handleModalClose`), exclusão e troca de aba.

### 3.4 Pedidos

#### `/requests` (vendor)
**Abas.** Day Off, Holiday, Pre-Payment, History.
**Formulários.** `DayOffRequestForm`, `HolidayRequestForm`, `PrePaymentRequestForm`.
**Histórico.** `RequestsHistory`.
**Ações.** Um submit por tipo de pedido, mais navegação por mês.

#### `/requests-inbox`
**Modais.** `RequestDetailModal`, `VendorsOffModal`.
**View.** `VendorsOffWeekView`.
**Ações.** `handleApprove` e `handleApproveClick`, `handleConfirmApprove`,
`handleApprovePrePayment`, `handleConfirmScheduleTerms`, `handleDenyClick`, `handleReject`, mais
navegação por mês.

#### `/requests-admin`
**Componentes.** Nenhum próprio — tabela e `Dialog` diretos.
**Ações.** `handleApprove`, `handleApproveClick`, `handleReject`.
**Atenção.** Faz o mesmo trabalho de `/requests-inbox` com menos recursos.

### 3.5 Portal mobile

#### `/home`
**Widgets.** `DashboardWidget`, `DashboardWidgetCard`, `DashboardGrid`, `DashboardGridToolbar` —
grade reposicionável com `react-grid-layout`.
**KPIs.** `KPICard`, `KPISection`, `KPISkeleton`, com métricas como Income, Avg Income / Stop,
Avg Paid / Stop, DHL Route Cost, % vs target.
**Blocos do service partner.** `SpDashboardHeader`, `SpDayViewBlock`, `SpOperationsBlock`,
`SpVehiclesBlock`, `SpComplianceBlock`, `SpComplianceVehiclesBlock`, `SpDiscoBlock`.
**Blocos do supervisor.** `DailyGamePlanStatus` (+ `DailyGamePlanSkeleton`), `VendorsOffToday`
(+ `VendorsOffSkeleton`), `MyPerformanceBlock`, `MobileDashboardBlocks`.
**Notificações.** `NotificationCategoryCard`, `NotificationPreview`, `NotificationModal`, com
`handleClearNotifications`.
**Chat.** `VendorVoiceChat`, com `handleNewMessage` e `handleConversationSeen` sobre socket.
**Upload.** `DiscoExcelUpload` e `handleFileSelect` — parsing de Excel no navegador.
**Navegação.** `QuickAccessSection`, `NavigationCard`, `MobileMenuButton`.
**API local.** `fetchDayOverview`, `fetchStatus`, `fetchSpStatus`, `getVehicles`, `getVendors`,
`getVehiclesForCompliance`, `getVendorsForCompliance`, `getLiquidationDamageDeductions`,
`getLiquidationDamagesWithDetails` — distribuídas em cinco arquivos (`api.ts`, `sp-api.ts`,
`ld-api.ts`, `last-day-api.ts`, `compliance-api.ts`).

#### `/daily-performance-insight`
**Cards.** `MetricsCard`, `OperationCard`, `VerifiedCard`, `FailedDeliveriesCard`.
**Apoio.** `Timeline`, `DaysCarousel`, `MonthSelector`, `VehicleInfo`, `NotesSection`.
**Siglas na interface.** SPOR-H, SPR, TW, NR, NH, FP, AFD, SHP, CA, CM, BA, Arrived, Departed, Break
— **não há glossário no repositório para elas**.

#### `/subcontractor`
**Cards.** `DayCard`, `OperationCard`, `PaymentBreakdownCard`.
**Seções.** `MetricsSection`, `StopsSection`, `NoteSection`, `RouteHeader`, `PaymentBreakdown`.
**Listas.** `OperationsList`, `DaysCarousel`, `DaysCarouselSubcontractor`, `MonthSelector`.
**Métricas.** Total Stops, Total £, Avg H/R, PD, PU, OK, HN.

#### `/current-month`
**Cards e blocos.** `SummaryCard`, `OperationCard`, `InfoGrid`, `MetricsGrid`, `DayDetails`,
`EarningsList`, `PaymentBreakdown`, `RouteHeader`, `StopsSection`, `WorkHoursSection`,
`NoteSection`.
**Estados.** `LoadingState`, `ErrorState`, `NoDataState` — o conjunto mais completo do repositório.
**Navegação.** `MonthCarousel`, `handleDayClick`, `handleBack`.

#### `/current-performance`
**Tabela.** `DailyBreakdownTable`.
**Blocos.** `MonthlyAverages`, `MonthCarousel`, `LoadingState`, `ErrorState`.
**Métricas.** SPOR-H, SPR, TW.

#### `/deductions`
**Blocos.** `SummaryCard`, `DeductionsList`, `DeductionItem`, `ProgressSection`, `ProgressBar`,
`MonthCarousel`, `LoadingState`, `ErrorState`.

#### `/mobile-invoice`
**Blocos.** `InvoiceListContainer`, `InvoiceItem`, `InvoiceMonthSection`, `InvoiceActionButton`,
`AnimatedCurrency`, `LoadingSkeleton`, `EmptyState`.
**Modal.** Reaproveita o global `components/invoice-details-modal.tsx`.

#### `/vendor-performance`
**Modais.** `PerformanceModal`, `OverviewModal`.
**Dashboards.** `PerformanceBentoGrid`, `DepotSummaryBento`, `GeneralDashboardBento`,
`GeneralPerformanceDashboard`, `KpiDashboardAlt`, `AnimatedMetricChart` — é a única tela com
componente de gráfico próprio.
**Tabela.** `VendorsTable`, `PerformanceTableRow`, `TableHeader`, com skeletons dedicados.
**Seletores.** `DepotSelect`, `VendorSelect`, `DateSelect`, `MonthYearSelect`, `DateCarousel`,
`PeriodCarousel`.
**Métricas.** Stops per hour, Stops per route, Time window, Attempted failed deliveries.

### 3.6 Órfãs e protótipos

`/op-management` e `/operations-management` não têm componentes próprios; concentram tudo no
`page.tsx` e repetem os mesmos nove handlers (`handleEdit`, `handleDelete`, `handleSubmit`,
`handleMainSubmit`, `handleOpenMainReviewModal`, `handleExportCSV`, `handleSort`,
`handleInputChange`, `handleReturnToToday`), com `/operations-management` acrescentando
`handlePageChange`.

`/performance` tem `DailyBreakdownTable`, `MonthlyAverages`, `MonthCarousel` e `PerformanceHeader` —
os três primeiros com o mesmo nome dos de `/current-performance`. `/daily`, `/logistics`,
`/op-dashboard` e `/invoice-history` não têm componentes próprios. `/logistics` tem um CRUD completo
de rotas em memória (`handleOpenModal`, `handleSaveRoute`, `handleDeleteRoute`) que não persiste
nada.

---

## 4. O que o inventário torna visível

**Quarenta e nove nomes de componente se repetem em duas ou mais telas.** Não são importações
compartilhadas: são arquivos distintos com o mesmo nome e propósito. Corrigir um bug de estado vazio,
de paginação ou de modal de exclusão hoje significa corrigi-lo de três a cinco vezes.

**`/week-planner` e `/daily-operations-management` são um fork.** Doze componentes homônimos,
incluindo o contexto (`PlannerContext`) e as três views. São 53.000 linhas mantidas em paralelo.

**As telas de configuração se sobrepõem.** Cinco abas de tipo (`VendorTypeTab`, `UserTypeTab`,
`CostModelTab`, `VehicleTypeTab`, `DriverTypeTab`) e o `ColorLegend` existem tanto em
`/contract-management` quanto em `/week-planner`, e `/assets` importa os modais de
`/contract-management`. Três telas configuram as mesmas entidades.

**Quatro telas grandes não têm nenhum componente próprio** — `/adhoc-works-invoice-management`,
`/invoice-processing-workflow`, `/schedule` e `/daily-financials` somam ~5.500 linhas concentradas
em arquivos únicos.

**As siglas da operação não estão documentadas em lugar nenhum.** SPOR-H, SPR, TW, NR, NH, FP, AFD,
SHP, PD, PU, HN, CA, CM, BA aparecem na interface de pelo menos cinco telas sem glossário no
repositório. Para quem chega — e para o Design — esse glossário vale mais do que qualquer
refatoração desta lista.

Nada aqui é uma decisão; são cinco fatos verificáveis no código. Os dois primeiros são os que custam
dinheiro todo mês.
