import { api } from '@/lib/api-client';
import type { ClearingDeskBoardDTO } from '@/app/(private)/clearing-desk/utils/mappers';
import type { PayeeUpdate } from '@/app/(private)/clearing-desk/types';

/**
 * These paths do not exist in logix-sphere-backend yet — see the spec, section 5.2.
 * Until they do, lib/mocks/page-payload.ts answers the GET and api-client returns a
 * generic success for the mutations.
 */
export const fetchClearingDeskBoard = (params: { depot?: string; date?: string }) =>
  api.get<ClearingDeskBoardDTO>('/bff/clearing-desk', { params });

export const approveClearing = (id: string) =>
  api.post(`/bff/clearing-desk/${id}/approve`, {});

export const returnToQueue = (id: string) =>
  api.post(`/bff/clearing-desk/${id}/return`, {});

export const updatePayee = (id: string, body: PayeeUpdate) =>
  api.patch(`/bff/clearing-desk/${id}`, body);

export const saveRouteNote = (id: string, note: string) =>
  api.put(`/bff/clearing-desk/${id}/note`, { note });
