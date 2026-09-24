"use client";

import React, { useMemo } from 'react';
import type { Vendor } from '@/lib/vendors';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { Route } from '@/lib/api/routes';
import VrnPlate from '@/components/vrn-plate';
import ServicePartnerBadge from '@/components/service-partner-badge';
import { useServicePartners } from '@/hooks/useServicePartners';

type VendorCardProps = {
  vendor: Vendor; // Vendor (Vendor type from lib)
  assignment: WeekPlannerRecord;
  routes: Route[];
  onEdit: (assignment: WeekPlannerRecord) => void;
  onDragStart?: (e: React.DragEvent, data: { type: string; id: number; assignmentId?: number; userId: number }) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  compact?: boolean;
};

const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  assignment,
  routes,
  onEdit,
  onDragStart,
  onDragEnd,
  compact = false,
}) => {
  // Find route by ID or name
  const findRouteById = (routeIdOrName: string | number | undefined): Route | null => {
    if (!routeIdOrName) return null;

    const routeIdStr = String(routeIdOrName);

    // Check if it's an ad-hoc route
    if (routeIdStr.startsWith('adhoc_board_')) {
      return {
        routeId: 0,
        routeName: 'Ad-hoc',
        routeDefaultId: 0,
        category: 'ad_hoc',
      } as Route;
    }

    // Search in routes array
    const route = routes.find(
      (r) =>
        String(r.routeId) === routeIdStr ||
        String(r.routeDefaultId) === routeIdStr ||
        r.routeName === routeIdStr
    );

    return route || null;
  };

  const route = findRouteById(assignment.route);
  const category = (route as Route & { category?: string })?.category || '';
  const isManagementOrOther =
    category === 'management' ||
    (category && !['loop', 'rota', 'ad_hoc'].includes(category));

  // Check if it's an adhoc service � always orange, regardless of sort
  const raw = assignment.raw as Record<string, unknown> | undefined;
  const routeIdStr = String(assignment.route || '');
  const routeNameFromRaw = raw?.route && typeof raw.route === 'object' ? String((raw.route as Record<string, unknown>).routeName || '') : '';
  const adhocServiceObj = raw?.adhocService && typeof raw.adhocService === 'object'
    ? (raw.adhocService as Record<string, unknown>)
    : null;
  // New DTO nests adhocServiceId inside raw.adhocService; fall back to legacy flat field
  const hasAdhocServiceId =
    (raw?.adhocServiceId != null && Number(raw.adhocServiceId) > 0) ||
    (adhocServiceObj?.adhocServiceId != null && Number(adhocServiceObj.adhocServiceId) > 0);
  const isRoute55 = Number(raw?.routeId ?? (raw?.route && typeof raw.route === 'object' ? (raw.route as Record<string, unknown>).routeId : null)) === 55;
  const routeNameLower = `${routeIdStr} ${routeNameFromRaw}`.toLowerCase();
  const isAdhoc =
    routeIdStr.startsWith('adhoc_board_') ||
    category === 'ad_hoc' ||
    hasAdhocServiceId ||
    isRoute55 ||
    routeNameLower.includes('adhoc') ||
    routeNameLower.includes('ad-hoc') ||
    routeNameLower.includes('brte');

  // Task 2: itens vinculados a um adhoc service com is_adhoc_sort = true usam o veículo
  // placeholder (NOVEHICLE) e não devem exibir veículo na tabela.
  const isAdhocSort =
    adhocServiceObj?.isAdhocSort === true ||
    raw?.isAdhocSort === true;

  // Check if it's a day off / OFF slot
  const statusRaw = String((assignment.raw as Record<string, unknown>)?.status ?? assignment.status ?? '').trim().toLowerCase();
  const isOffStatus = statusRaw === 'off' || statusRaw === 'notallocated' || statusRaw === 'not allocated';
  const isOffRouteName =
    routeNameLower.includes(' off') ||
    routeNameLower === 'off' ||
    routeNameLower.startsWith('off ');
  const isOffRouteId = Number((assignment.raw as Record<string, unknown>)?.routeId ?? 0) === 48;
  const isDayOff =
    assignment.isDayOff === 'true' ||
    assignment.isDayOff === '1' ||
    (assignment.raw as Record<string, unknown>)?.isDayOff === true ||
    String((assignment.raw as Record<string, unknown>)?.isDayOff).toLowerCase() === 'true' ||
    isOffStatus ||
    isOffRouteName ||
    isOffRouteId;

  // Check if finished (isFinished from API - item gets white color)
  const rawFinished = (assignment.raw as Record<string, unknown>)?.isFinished;
  const isFinished = rawFinished === true || rawFinished === 'true' || rawFinished === 1;

  // Check sort status - prefer isSort (API) over routeSort when available
  const rawIsSort = (assignment.raw as Record<string, unknown>)?.isSort;
  const sortStatus = assignment.routeSort?.toLowerCase() || '';
  const rawSort = (assignment.raw as Record<string, unknown>)?.routeSort;

  // Determine effective sort status
  let effectiveSortStatus = 'yes'; // default is sort
  if (rawIsSort !== null && rawIsSort !== undefined) {
    effectiveSortStatus = rawIsSort === true || rawIsSort === 'true' || rawIsSort === 1 ? 'yes' : 'no';
  } else if (sortStatus) {
    effectiveSortStatus = sortStatus;
  } else if (rawSort !== null && rawSort !== undefined) {
    if (typeof rawSort === 'string') {
      const sortStr = rawSort.toLowerCase();
      if (sortStr === 'no' || sortStr === '0') {
        effectiveSortStatus = 'no';
      } else if (sortStr === 'yes' || sortStr === '1') {
        effectiveSortStatus = 'yes';
      }
    } else if (typeof rawSort === 'number') {
      // Backend usa `routeSort` como num�rico e pode mandar valores como:
      // - 0 => No Sort
      // - 1 => Late (ainda deve ser tratado como "sort ativo" na UI quando n�o h� `isSort`)
      // - 20 => Sort (ver `services/apiService.ts`)
      effectiveSortStatus = (rawSort === 1 || rawSort === 20) ? 'yes' : 'no';
    }
  }

  const _isSortYes = effectiveSortStatus === 'yes' || effectiveSortStatus === '1';
  const isSortNo = effectiveSortStatus === 'no' || effectiveSortStatus === '0';

  const notesText = (assignment.notes || '').trim();
  const hasNotes = notesText.length > 0 && !isManagementOrOther;

  const { servicePartners } = useServicePartners();
  const vendorSpId = useMemo(() => {
    const raw = (vendor as Vendor & { servicePartnerId?: number | string | null }).servicePartnerId;
    if (raw == null) return null;
    const n = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [vendor]);
  const servicePartnerName = useMemo(() => {
    if (vendorSpId == null) return null;
    const found = servicePartners.find((sp) => Number(sp.servicePartnerId) === vendorSpId);
    return found?.partnerName ?? null;
  }, [servicePartners, vendorSpId]);
  const showSpBadge = vendorSpId != null && !isManagementOrOther;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(assignment);
  };

  const handleDragStartCard = (e: React.DragEvent) => {
    if (onDragStart) {
      const isDraft = !assignment.weekPlannerId || assignment.weekPlannerId <= 0;
      const raw = assignment.raw as Record<string, unknown> | undefined;
      onDragStart(e, {
        type: isDraft ? 'draft-card' : 'card',
        id: assignment.weekPlannerId,
        userId: vendor.userId,
        ...(isDraft
          ? { draftKey: raw?.__draft_key as string | undefined }
          : { assignmentId: assignment.weekPlannerId }),
      });
    }
  };

  const handleDragEndCard = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  // Regra de cores: Sort / No Sort / Adhoc mant�m-se vis�veis ap�s guardar (n�o sobrepor por Finished).
  // Apenas management/other usa branco quando isFinished; rotas (loop, rota, ad_hoc) mant�m sempre Sort=verde, No Sort=vermelho, Adhoc=laranja.
  const toneClasses =
    isManagementOrOther && isFinished
      ? [
        // Finished (s� para management/other): Branco
        'bg-white',
        'border-slate-200',
        'shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
        'hover:bg-slate-50',
        'hover:border-slate-300',
      ].join(' ')
      : isManagementOrOther
        ? [
          // Manager: Azul
          'bg-[linear-gradient(135deg,rgba(59,130,246,0.25),rgba(37,99,235,0.3))]',
          'border-[rgba(59,130,246,0.5)]',
          'shadow-[0_10px_18px_rgba(59,130,246,0.15)]',
          'hover:bg-[linear-gradient(135deg,rgba(59,130,246,0.35),rgba(37,99,235,0.4))]',
          'hover:border-[rgba(59,130,246,0.7)]',
        ].join(' ')
        : isDayOff
          ? [
            // Off: Neutro
            'bg-[linear-gradient(135deg,rgba(148,163,184,0.20),rgba(100,116,139,0.26))]',
            'border-[rgba(148,163,184,0.45)]',
            'shadow-[0_10px_18px_rgba(15,23,42,0.10)]',
            'hover:bg-[linear-gradient(135deg,rgba(148,163,184,0.26),rgba(100,116,139,0.32))]',
            'hover:border-[rgba(148,163,184,0.60)]',
          ].join(' ')
          : isAdhoc
            ? [
              // Adhoc Service: Laranja (vis�vel mesmo ap�s guardar)
              'bg-[linear-gradient(135deg,rgba(249,115,22,0.25),rgba(234,88,12,0.3))]',
              'border-[rgba(249,115,22,0.5)]',
              'shadow-[0_10px_18px_rgba(249,115,22,0.15)]',
              'hover:bg-[linear-gradient(135deg,rgba(249,115,22,0.35),rgba(234,88,12,0.4))]',
              'hover:border-[rgba(249,115,22,0.7)]',
            ].join(' ')
            : isSortNo
              ? [
                // No Sort: Vermelho (vis�vel mesmo ap�s guardar)
                'bg-[linear-gradient(135deg,rgba(239,68,68,0.22),rgba(220,38,38,0.28))]',
                'border-[rgba(239,68,68,0.50)]',
                'shadow-[0_10px_18px_rgba(239,68,68,0.14)]',
                'hover:bg-[linear-gradient(135deg,rgba(239,68,68,0.30),rgba(220,38,38,0.36))]',
                'hover:border-[rgba(239,68,68,0.70)]',
              ].join(' ')
              : [
                // Sort: Verde (vis�vel mesmo ap�s guardar)
                'bg-[linear-gradient(135deg,rgba(34,197,94,0.25),rgba(22,163,74,0.3))]',
                'border-[rgba(34,197,94,0.5)]',
                'shadow-[0_10px_18px_rgba(34,197,94,0.15)]',
                'hover:bg-[linear-gradient(135deg,rgba(34,197,94,0.35),rgba(22,163,74,0.4))]',
                'hover:border-[rgba(34,197,94,0.7)]',
              ].join(' ');

  // Altura mínima canônica (48px) para uniformizar TODOS os cards do week planner,
  // independente de compact (management = 1 linha vs sort = 2 linhas com VRN).
  // Referência: RouteGrid/DayCell. Apenas a fonte/padding muda em compact, não a altura.
  const sizeClasses = compact
    ? 'text-[0.65rem] px-1 py-0.5 gap-0.5 min-h-[48px]'
    : 'text-[0.72rem] px-1.5 py-0.5 gap-0.5 min-h-[48px]';

  return (
    <div
      className={[
        'group relative overflow-hidden w-full flex-shrink-0',
        'flex flex-col justify-between items-start',
        'border rounded-lg',
        isManagementOrOther ? 'cursor-pointer' : 'cursor-move',
        isManagementOrOther ? '' : 'transition-[box-shadow,transform,border-color,background] duration-200',
        'select-none',
        sizeClasses,
        toneClasses,
      ].join(' ')}
      draggable={!isManagementOrOther}
      data-assignment-id={assignment.weekPlannerId}
      data-vendor-id={vendor.userId}
      onClick={handleClick}
      onDragStart={!isManagementOrOther ? handleDragStartCard : undefined}
      onDragEnd={!isManagementOrOther ? handleDragEndCard : undefined}
    >
      {/* Hover highlight overlay (replaces legacy ::after) - only for non-management cards */}
      {!isManagementOrOther && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 left-1/3 right-1/3 h-3/4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.18),transparent_70%)]"
        />
      )}

      <div className="flex items-center gap-1 w-full min-w-0 justify-between">
        <span className={`font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 ${compact ? 'text-[0.65rem]' : ''}`}>
          {vendor.fullName || assignment.name}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {showSpBadge && (
            <ServicePartnerBadge
              partnerName={servicePartnerName}
              size="xs"
              className="py-0 leading-none self-center"
            />
          )}
          {hasNotes && !isManagementOrOther && (
            <span
              className={`inline-flex items-center justify-center rounded-full bg-pink-500/20 text-pink-500 font-bold cursor-help ${compact ? 'w-3.5 h-3.5 text-[0.55rem]' : 'w-4 h-4 text-[0.6rem]'
                }`}
              aria-label="Assignment notes"
              title={notesText}
            >
              !
            </span>
          )}
          {isManagementOrOther && (
            <span
              className={[
                'font-semibold whitespace-nowrap rounded',
                compact ? 'text-[0.55rem] px-1 py-0.5' : 'text-[0.6rem] px-1.5 py-0.5',
                'bg-sky-500/15 text-sky-700',
              ].join(' ')}
            >
              Management and Support
            </span>
          )}
        </div>
      </div>
      {!isManagementOrOther && !isAdhocSort && (
        <span className={`w-full whitespace-nowrap overflow-hidden text-ellipsis inline-flex items-center ${compact ? 'text-[0.6rem]' : 'text-[0.65rem]'}`}>
          <VrnPlate
            vrn={
              assignment.registrationPlate ||
              (assignment.raw?.registration_plate ? String(assignment.raw.registration_plate) : '') ||
              (assignment.raw?.vehicleRegistration_plate ? String(assignment.raw.vehicleRegistration_plate) : '') ||
              (assignment.raw?.vehicleRegistrationPlate ? String(assignment.raw.vehicleRegistrationPlate) : '') ||
              (assignment.raw?.vehicleDefaultRegistrationPlate ? String(assignment.raw.vehicleDefaultRegistrationPlate) : '') ||
              (assignment.raw?.vehicle_default_registrationPlate ? String(assignment.raw.vehicle_default_registrationPlate) : '') ||
              (assignment.raw?.registration_plates ? String(assignment.raw.registration_plates) : '') ||
              (assignment.raw?.vehicle && typeof assignment.raw.vehicle === 'object'
                ? String((assignment.raw.vehicle as Record<string, unknown>).vehicleRegistration_plate ||
                  (assignment.raw.vehicle as Record<string, unknown>).vehicleRegistrationPlate ||
                  (assignment.raw.vehicle as Record<string, unknown>).vehicleDefaultRegistrationPlate ||
                  (assignment.raw.vehicle as Record<string, unknown>).vehicle_default_registrationPlate ||
                  (assignment.raw.vehicle as Record<string, unknown>).registration_plate ||
                  (assignment.raw.vehicle as Record<string, unknown>).registrationPlate || '')
                : '') ||
              (Number(assignment.raw?.vehicleId ?? assignment.raw?.vehicleId ?? 0) === 55 ? 'NOVEHICLE' : undefined) ||
              undefined
            }
            size="sm"
            showBadge={false}
          />
        </span>
      )}
    </div>
  );
};

export default VendorCard;





