/**
 * Tipos de campo de custo manipulados nos handlers de edição de validade do VendorModal.
 */
export type CostModelFieldType =
  | 'vsr'
  | 'vsrEletric'
  | 'spVsr'
  | 'spVsrEletric'
  | 'daf'
  | 'dafEletric'
  | 'fsr'
  | 'fsrEletric'
  | 'dr'
  | 'drEletric'
  | 'hourlyEletric';

/** Resultado do mapeamento de um tipo de campo para o cost model correspondente. */
export interface CostModelMapping {
  /** Identificador do cost model no backend. */
  costModelId: number;
  /** Indica se o cost model é da variante elétrica. */
  isElectric: boolean;
}

/**
 * Mapeia um tipo de campo de custo para o seu `costModelId` e flag `isElectric`.
 *
 * Fonte única de verdade usada pelos handlers de edição de validade
 * (`handleValidityStartDateEdit`) e de cascata de endDate
 * (`updatePreviousItemEndDate`), evitando divergência entre os dois switches.
 *
 * @param type - Tipo do campo de custo (ex.: 'spVsr', 'spVsrEletric').
 * @returns O `costModelId` e a flag `isElectric` correspondentes.
 */
export function resolveCostModelMapping(type: CostModelFieldType): CostModelMapping {
  switch (type) {
    case 'vsr':
      return { costModelId: 4, isElectric: false };
    case 'vsrEletric':
      return { costModelId: 4, isElectric: true };
    case 'spVsr':
      return { costModelId: 12, isElectric: false };
    case 'spVsrEletric':
      return { costModelId: 12, isElectric: true };
    case 'daf':
      return { costModelId: 1, isElectric: false };
    case 'dafEletric':
      return { costModelId: 1, isElectric: true };
    case 'fsr':
      return { costModelId: 3, isElectric: false };
    case 'fsrEletric':
      return { costModelId: 3, isElectric: true };
    case 'dr':
      return { costModelId: 2, isElectric: false };
    case 'drEletric':
      return { costModelId: 2, isElectric: true };
    case 'hourlyEletric':
      return { costModelId: 7, isElectric: true };
  }
}
