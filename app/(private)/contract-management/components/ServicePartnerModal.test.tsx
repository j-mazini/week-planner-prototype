// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import ServicePartnerModal from './ServicePartnerModal';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';

afterEach(() => cleanup());

const baseServicePartner: ServicePartnerDTO = {
  servicePartnerId: 1,
  partnerName: 'Acme Logistics',
  companyId: 10,
  createdBy: 'tester',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  dailyServiceCharge: 5,
  reimbursement: 18,
  costModels: [
    { costModelId: 12, minStops: 1, maxStops: 10, pricePerStop: 1.5, validityStartDate: '2024-01-01', validityEndDate: '2024-06-30', isElectric: false },
    { costModelId: 12, minStops: 11, maxStops: 20, pricePerStop: 1.7, validityStartDate: '2024-01-01', validityEndDate: '2024-06-30', isElectric: false },
    { costModelId: 12, minStops: 21, maxStops: 30, pricePerStop: 1.9, validityStartDate: '2024-01-01', validityEndDate: '2024-06-30', isElectric: false },
    { costModelId: 12, minStops: 31, maxStops: 999999, pricePerStop: 2.1, validityStartDate: '2024-01-01', validityEndDate: '2024-06-30', isElectric: false },
    { costModelId: 12, minStops: 1, maxStops: 12, pricePerStop: 1.6, validityStartDate: '2024-07-01', validityEndDate: null, isElectric: false },
    { costModelId: 12, minStops: 13, maxStops: 22, pricePerStop: 1.8, validityStartDate: '2024-07-01', validityEndDate: null, isElectric: false },
    { costModelId: 12, minStops: 23, maxStops: 32, pricePerStop: 2.0, validityStartDate: '2024-07-01', validityEndDate: null, isElectric: false },
    { costModelId: 12, minStops: 33, maxStops: 999999, pricePerStop: 2.2, validityStartDate: '2024-07-01', validityEndDate: null, isElectric: false },
    { costModelId: 12, minStops: 1, maxStops: 8, pricePerStop: 2.5, validityStartDate: '2024-03-01', validityEndDate: null, isElectric: true },
    { costModelId: 12, minStops: 9, maxStops: 16, pricePerStop: 2.7, validityStartDate: '2024-03-01', validityEndDate: null, isElectric: true },
    { costModelId: 12, minStops: 17, maxStops: 24, pricePerStop: 2.9, validityStartDate: '2024-03-01', validityEndDate: null, isElectric: true },
    { costModelId: 12, minStops: 25, maxStops: 999999, pricePerStop: 3.1, validityStartDate: '2024-03-01', validityEndDate: null, isElectric: true },
  ],
};

describe('ServicePartnerModal — Cost Model (SP_VSR / SP_VSR Electric)', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('add mode: renders both independent groups with no New/Delete/history controls', () => {
    render(
      <ServicePartnerModal
        show
        onClose={vi.fn()}
        onSave={vi.fn()}
        servicePartner={null}
      />
    );

    expect(screen.getByTestId('standard-active-band-1-max')).toBeInTheDocument();
    expect(screen.getByTestId('electric-active-band-1-max')).toBeInTheDocument();
    expect(screen.queryByTestId('standard-new-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('electric-new-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('standard-history-toggle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('electric-history-toggle')).not.toBeInTheDocument();
  });

  it('edit mode: SP_VSR and SP_VSR Electric load independently from their own cost model items', () => {
    render(
      <ServicePartnerModal
        show
        onClose={vi.fn()}
        onSave={vi.fn()}
        servicePartner={baseServicePartner}
      />
    );

    expect(screen.getByTestId('standard-active-band-1-max')).toHaveValue(12);
    expect(screen.getByTestId('standard-active-validity-start')).toHaveValue('2024-07-01');
    expect(screen.getByTestId('standard-history-toggle')).toBeInTheDocument();

    expect(screen.getByTestId('electric-active-band-1-max')).toHaveValue(8);
    expect(screen.getByTestId('electric-active-validity-start')).toHaveValue('2024-03-01');
    expect(screen.queryByTestId('electric-history-toggle')).not.toBeInTheDocument();
  });

  it('switching periods in one group does not affect the other group', () => {
    render(
      <ServicePartnerModal
        show
        onClose={vi.fn()}
        onSave={vi.fn()}
        servicePartner={baseServicePartner}
      />
    );

    fireEvent.click(screen.getByTestId('standard-history-item-1'));
    expect(screen.getByTestId('standard-active-validity-start')).toHaveValue('2024-01-01');
    expect(screen.getByTestId('electric-active-validity-start')).toHaveValue('2024-03-01');
  });

  it('"New" on the standard group cascades onto its own newest period, leaving the electric group untouched', () => {
    render(
      <ServicePartnerModal
        show
        onClose={vi.fn()}
        onSave={vi.fn()}
        servicePartner={baseServicePartner}
      />
    );

    fireEvent.click(screen.getByTestId('standard-new-btn'));
    expect(screen.getByTestId('standard-new-band-1-max')).toBeInTheDocument();
    expect(screen.queryByTestId('electric-new-band-1-max')).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('standard-new-validity-start'), {
      target: { value: '2024-12-01' },
    });
    expect(screen.getByTestId('standard-active-validity-end')).toHaveValue('2024-11-30');
    expect(screen.getByTestId('electric-active-validity-end')).toHaveValue('');

    fireEvent.click(screen.getByTestId('standard-new-btn'));
    expect(screen.getByTestId('standard-active-validity-end')).toHaveValue('');
  });

  it('"Delete" on the electric group removes its period without affecting the standard group', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(
      <ServicePartnerModal
        show
        onClose={vi.fn()}
        onSave={vi.fn()}
        servicePartner={baseServicePartner}
      />
    );

    fireEvent.click(screen.getByTestId('electric-delete-btn'));
    expect(screen.getByTestId('electric-active-validity-start')).toHaveValue('');
    expect(screen.getByTestId('standard-active-validity-start')).toHaveValue('2024-07-01');
  });

  it('blocks a new period start date that collides with an existing period in the same group', () => {
    render(
      <ServicePartnerModal
        show
        onClose={vi.fn()}
        onSave={vi.fn()}
        servicePartner={baseServicePartner}
      />
    );

    fireEvent.click(screen.getByTestId('standard-new-btn'));
    fireEvent.change(screen.getByTestId('standard-new-validity-start'), {
      target: { value: '2024-01-01' },
    });

    expect(screen.getByTestId('standard-new-validity-start')).toHaveValue('');
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('already exists'));
  });

  it('blocks submit and lists missing fields, labeled per group, when bands are only partially filled', () => {
    const onSave = vi.fn();
    render(
      <ServicePartnerModal
        show
        onClose={vi.fn()}
        onSave={onSave}
        servicePartner={null}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Enter partner name'), {
      target: { value: 'New Partner' },
    });
    fireEvent.change(screen.getByTestId('standard-active-band-1-max'), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByTestId('standard-active-band-1-rate'), {
      target: { value: '1.5' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Service Partner/i }));

    const errors = screen.getByTestId('cost-model-errors');
    expect(within(errors).getByText(/SP_VSR — Period 1.*Band 2 Max Stops/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits costModels with the right isElectric flag per group, flattened across periods', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <ServicePartnerModal
        show
        onClose={vi.fn()}
        onSave={onSave}
        servicePartner={baseServicePartner}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Update Service Partner/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const [payload] = onSave.mock.calls[0];
    expect(payload.costModels).toHaveLength(12);
    expect(payload.costModels.filter((cm: { isElectric?: boolean }) => cm.isElectric === true)).toHaveLength(4);
    expect(payload.costModels.filter((cm: { isElectric?: boolean }) => cm.isElectric === false)).toHaveLength(8);
  });
});
