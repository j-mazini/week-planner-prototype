import { describe, it, expect } from 'vitest';
import { resolveCostModelMapping } from './cost-model-mapping';

describe('resolveCostModelMapping', () => {
  // Regressão: SP_VSR e SP_VSR Electric devem usar costModelId = 12 (não 5).
  // Cobre os handlers handleValidityStartDateEdit e updatePreviousItemEndDate
  // do VendorModal, que compartilham este mapeamento.
  describe('SP_VSR', () => {
    it('mapeia spVsr para costModelId 12 e isElectric false', () => {
      expect(resolveCostModelMapping('spVsr')).toEqual({
        costModelId: 12,
        isElectric: false,
      });
    });

    it('mapeia spVsrEletric para costModelId 12 e isElectric true', () => {
      expect(resolveCostModelMapping('spVsrEletric')).toEqual({
        costModelId: 12,
        isElectric: true,
      });
    });

    it('nunca retorna o costModelId 5 (valor incorreto do bug)', () => {
      expect(resolveCostModelMapping('spVsr').costModelId).not.toBe(5);
      expect(resolveCostModelMapping('spVsrEletric').costModelId).not.toBe(5);
    });
  });

  // Garante que a correção não alterou as regras de outros cost models.
  it('mantém o mapeamento dos demais tipos inalterado', () => {
    expect(resolveCostModelMapping('vsr')).toEqual({ costModelId: 4, isElectric: false });
    expect(resolveCostModelMapping('vsrEletric')).toEqual({ costModelId: 4, isElectric: true });
    expect(resolveCostModelMapping('daf')).toEqual({ costModelId: 1, isElectric: false });
    expect(resolveCostModelMapping('dafEletric')).toEqual({ costModelId: 1, isElectric: true });
    expect(resolveCostModelMapping('fsr')).toEqual({ costModelId: 3, isElectric: false });
    expect(resolveCostModelMapping('fsrEletric')).toEqual({ costModelId: 3, isElectric: true });
    expect(resolveCostModelMapping('dr')).toEqual({ costModelId: 2, isElectric: false });
    expect(resolveCostModelMapping('drEletric')).toEqual({ costModelId: 2, isElectric: true });
    expect(resolveCostModelMapping('hourlyEletric')).toEqual({ costModelId: 7, isElectric: true });
  });
});
