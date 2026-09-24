import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';

/**
 * A página daily-financial-insights renderiza até 500 linhas
 * (SINGLE_DAY_ITEMS_PER_PAGE) e cada linha monta este hook. Sem cache
 * partilhado, cada instância dispara o seu próprio GET /bff/vendors e o
 * browser esgota recursos ("TypeError: Failed to fetch").
 */

const fetchVendorsMock = vi.fn();

vi.mock('@/lib/vendors', () => ({
  fetchVendors: (...args: unknown[]) => fetchVendorsMock(...args),
}));

vi.mock('./useServicePartners', () => ({
  useServicePartners: () => ({
    servicePartners: [{ servicePartnerId: 7, partnerName: 'Acme Logistics' }],
  }),
}));

async function loadHook() {
  // resetModules limpa o cache module-level entre testes.
  vi.resetModules();
  const mod = await import('./useServicePartnerNameByUserId');
  return mod.useServicePartnerNameByUserId;
}

beforeEach(() => {
  fetchVendorsMock.mockReset();
  fetchVendorsMock.mockResolvedValue([
    { userId: 42, fullName: 'Jane Doe', servicePartnerId: 7 },
  ]);
});

afterEach(() => cleanup());

describe('useServicePartnerNameByUserId', () => {
  it('dispara apenas um GET /bff/vendors quando muitas linhas montam o hook', async () => {
    const useHook = await loadHook();

    function Row() {
      useHook();
      return null;
    }

    render(
      <>
        {Array.from({ length: 25 }, (_, i) => (
          <Row key={i} />
        ))}
      </>
    );

    await waitFor(() => expect(fetchVendorsMock).toHaveBeenCalled());
    expect(fetchVendorsMock).toHaveBeenCalledTimes(1);
  });

  it('mapeia userId -> partnerName a partir do servicePartnerId do vendor', async () => {
    const useHook = await loadHook();
    let result: Map<number, string> = new Map();

    function Probe() {
      result = useHook();
      return null;
    }

    render(<Probe />);

    await waitFor(() => expect(result.get(42)).toBe('Acme Logistics'));
  });
});
