"use client";

import './styles.css';
import React, { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { dailyGamePlanStyles } from './styles';
import { useDailyGamePlan } from './hooks/useDailyGamePlan';
import ActionBar from './components/DailyGamePlan/ActionBar';
import DepositGroup from './components/DailyGamePlan/DepositGroup';
import VendorsOffPanel from './components/DailyGamePlan/VendorsOffPanel';
import NotAllocatedPanel from './components/DailyGamePlan/NotAllocatedPanel';
import ModalsSection from './components/DailyGamePlan/ModalsSection';
import OperationFormModal from './components/DailyGamePlan/OperationFormModal';
import { isAllowedDeposit } from '@/lib/allowedDeposits';
import { groupOperationsByDeposit } from './utils/mappers';
import { FrontendOperationRecord } from './types';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

/**
 * Main Daily Game Plan Content component.
 * Responsibility: Orchestrate UI elements and manage the main layout of the page.
 * Logic is handled by useDailyGamePlan hook.
 * Target: < 300 lines.
 */
export default function DailyGamePlanContent() {
    const {
        selectedDate,
        viewDate,
        loading, error,
        weekPlannersData,
        dailyGamePlans,
        adhocServices,
        deposits,
        isAdmin, isSupervisor, userId,
        messageModal, setMessageModal,
        confirmationModal, setConfirmationModal,
        pendingDayModal, setPendingDayModal,
        pendingDayModalSummary,
        openOperationModal, setOpenOperationModal,
        openOperationSummary,
        formatDateDisplay,
        isFinishing, isPendingDayFinishing, isOpenOperationFinishing,
        collapsedDeposits, handleToggleCollapse,
        isOffPanelCollapsed, handleToggleOffPanel,
        isNotAllocatedPanelCollapsed, handleToggleNotAllocatedPanel,
        showModal, setShowModal,
        editingIndex,
        formData,
        handleStartStop,
        handleEditItem,
        handleDeleteItem,
        handleSubmit,
        handlePendingDayFinish,
        handleOpenOperationFinish,
        onOpenNotesModal,
        fetchData,
        lookupMaps,
        supervisorDepositIds,
        isDailyGamePlanFinished,
        handleSaveDepositNotes,
        handleCreateAdHoc,
        handleCreateFlexRoute,
        vendorsOffDisplay,
        notAllocatedDisplay,
        handleFormFieldChange,
        searchTerm,
        setSearchTerm,
    } = useDailyGamePlan();

    // Grouping and Display logic moved to mappers
    const dataByDeposit = useMemo(() =>
        groupOperationsByDeposit(
            weekPlannersData,
            deposits,
            isAdmin,
            isSupervisor,
            supervisorDepositIds,
            isAllowedDeposit
        ),
    [weekPlannersData, deposits, isAdmin, isSupervisor, supervisorDepositIds]);

    // Filter out OFF deposit (depositId 4) to avoid duplicate display with VendorsOffPanel
    const filteredDataByDeposit = useMemo(() => {
        const filtered = new Map(dataByDeposit);
        filtered.delete(4); // Remove OFF deposit
        return filtered;
    }, [dataByDeposit]);

    // Compute route options for modal based on selected deposit in the form
    const routeOptions = useMemo(() => {
        if (!lookupMaps?.routeMap) return [];
        const depId = formData.depositId;
        const allRoutes = Array.from(lookupMaps.routeMap.values());
        const scopedRoutes = depId ? allRoutes.filter(r => r.depositId === depId) : allRoutes;
        return scopedRoutes.filter((r): r is typeof r & { routeId: number } => r.routeId != null);
    }, [formData.depositId, lookupMaps]);

    const notAllocatedByDeposit = useMemo(() => {
        const map = new Map<number, FrontendOperationRecord[]>();
        weekPlannersData.forEach(op => {
            const depId = op.depositId ?? 0;
            // Para depositId 7 (BAOP), incluir todos os tipos; caso contrário, apenas NOT_ALLOCATED
            const isBAOP = depId === BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT;
            const shouldInclude = isBAOP ? true : op.status === BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED;
            
            if (shouldInclude) {
                if (!map.has(depId)) map.set(depId, []);
                map.get(depId)!.push(op);
            }
        });
        return map;
    }, [weekPlannersData]);

    const dayOffByDeposit = useMemo(() => {
        const map = new Map<number, FrontendOperationRecord[]>();
        weekPlannersData.forEach(op => {
            const depId = op.depositId ?? 0;
            // Para depositId 7 (BAOP), não incluir nada aqui (já está em notAllocatedByDeposit)
            // Para outros depósitos, incluir OFF e Day Off
            const isBAOP = depId === BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT;
            const shouldInclude = isBAOP ? false : (op.isDayOff || op.status === BUSINESS_RULES.WORKING_STATUS.OFF);
            
            if (shouldInclude) {
                if (!map.has(depId)) map.set(depId, []);
                map.get(depId)!.push(op);
            }
        });
        return map;
    }, [weekPlannersData]);

    if (error) {
        return <div className="p-8 text-red-600 font-bold bg-red-50 rounded-xl border border-red-200">{error}</div>;
    }

    return (
        <>
        {/* Fundo animado — fixo, atrás do conteúdo, aria-hidden */}
        <div className="fixed inset-0 liquid-glass-page-bg -z-10" aria-hidden />
        {/* Conteúdo — fluxo normal do documento, permite scroll */}
        <div className={dailyGamePlanStyles.pageContainer}>
            <ActionBar
                onRefresh={() => fetchData()}
                isLoading={loading}
                viewDate={viewDate || selectedDate}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <main className="space-y-8 pb-32">
                {loading && <p role="status" className="p-6">Loading daily plan...</p>}
                {!loading && filteredDataByDeposit.size === 0 && (
                    <section className="border rounded-md bg-card p-6" role="status">
                        <h2 className="mb-2">{searchTerm ? "No matching operations" : "No operations for this date"}</h2>
                        <p>{searchTerm ? "Try another route, vendor or vehicle, or clear the search." : "The mock dataset has no scheduled operations for this date."}</p>
                    </section>
                )}
                <AnimatePresence>
                    {Array.from(filteredDataByDeposit.entries()).map(([depId, { depositName, operations }]) => (
                        <DepositGroup
                            key={depId}
                            depositId={depId}
                            depositName={depositName}
                            operations={operations}
                            dailyGamePlan={dailyGamePlans.get(depId)}
                            supervisorName={dailyGamePlans.get(depId)?.dailyTeamSupport?.fullName}
                            isOperationStarted={dailyGamePlans.get(depId)?.status === 'start'}
                            onStartStop={() => handleStartStop(depId)}
                            isFinishing={isFinishing}
                            isCollapsed={collapsedDeposits.has(depId)}
                            onToggleCollapse={() => handleToggleCollapse(depId)}
                            canEdit={isAdmin}
                            isAdmin={isAdmin}
                            userId={userId}
                            adhocServices={adhocServices}
                            depositNotes={dailyGamePlans.get(depId)?.notes ?? ""}
                            onSaveDepositNotes={(notes) => handleSaveDepositNotes(depId, notes)}
                            handleEdit={(did, idx) => {
                                const op = operations[idx];
                                if (op) handleEditItem(op);
                            }}
                            handleDelete={(did, idx) => {
                                const op = operations[idx];
                                if (op) handleDeleteItem(op);
                            }}
                            handleEditItem={handleEditItem}
                            handleDeleteItem={handleDeleteItem}
                            handleCreateAdHoc={handleCreateAdHoc}
                            handleCreateFlexRoute={handleCreateFlexRoute}
                            onOpenNotesModal={onOpenNotesModal}
                            getVehicleBadgeVariant={(v) => v === 'NOVEHICLE' ? 'blue' : 'green'}
                            isDailyGamePlanFinished={isDailyGamePlanFinished}
                            baopNotAllocatedTableRows={notAllocatedByDeposit.get(depId) || []}
                                                baopDayOffTableRows={dayOffByDeposit.get(depId) || []}
                        />
                    ))}
                </AnimatePresence>


                <VendorsOffPanel
                    isCollapsed={isOffPanelCollapsed}
                    onToggleCollapse={handleToggleOffPanel}
                    vendorsOffCount={vendorsOffDisplay.length}
                    vendorsOffDisplay={vendorsOffDisplay}
                    handleEditItem={handleEditItem}
                    handleDeleteItem={handleDeleteItem}
                    onOpenNotesModal={onOpenNotesModal}
                    canEdit={false}
                    getVehicleBadgeVariant={(v) => v === 'NOVEHICLE' ? 'blue' : 'green'}
                />

                <NotAllocatedPanel
                    isCollapsed={isNotAllocatedPanelCollapsed}
                    onToggleCollapse={handleToggleNotAllocatedPanel}
                    notAllocatedCount={notAllocatedDisplay.length}
                    notAllocatedDisplay={notAllocatedDisplay}
                    handleEditItem={handleEditItem}
                    handleDeleteItem={handleDeleteItem}
                    onOpenNotesModal={onOpenNotesModal}
                    canEdit={false}
                    getVehicleBadgeVariant={(v) => v === 'NOVEHICLE' ? 'blue' : 'green'}
                />
            </main>


            <ModalsSection
                messageModal={messageModal}
                setMessageModal={setMessageModal}
                confirmationModal={confirmationModal}
                setConfirmationModal={setConfirmationModal}
                pendingDayModal={pendingDayModal}
                setPendingDayModal={setPendingDayModal}
                pendingDaySummary={pendingDayModalSummary}
                handlePendingDayFinish={handlePendingDayFinish}
                openOperationModal={openOperationModal}
                setOpenOperationModal={setOpenOperationModal}
                openOperationSummary={openOperationSummary}
                viewDate={viewDate || selectedDate}
                formatDate={formatDateDisplay}
                handleOpenOperationFinish={handleOpenOperationFinish}
                isFinishing={isFinishing}
                isPendingDayFinishing={isPendingDayFinishing}
                isOpenOperationFinishing={isOpenOperationFinishing}
            />

            <OperationFormModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                formData={formData}
                onChange={handleFormFieldChange}
                title={editingIndex !== null ? 'Edit Operation' : 'New Operation'}
                isEditing={editingIndex !== null}
                isAdmin={isAdmin}
                isSupervisor={isSupervisor}
                vendors={lookupMaps?.vendorMap ? Array.from(lookupMaps.vendorMap.values()) : []}
                routes={lookupMaps?.routeMap ? Array.from(lookupMaps.routeMap.values()) : []}
                vehicles={lookupMaps?.vehicleMap ? Array.from(lookupMaps.vehicleMap.values()) : []}
                adhocServices={adhocServices}
                routeOptions={routeOptions}
            />
        </div>
        </>
    );
}
