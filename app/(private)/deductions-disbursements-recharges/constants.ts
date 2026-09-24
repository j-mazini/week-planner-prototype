export interface KPICard {
  key: string;
  title: string;
  icon: string;
  bg: string;
  color: string;
  filterType: string;
  hasAdd: boolean;
}

export const KPI_CARDS: KPICard[] = [
  { key: 'all', title: 'Total', icon: 'bi-journal-text', bg: '#e7f0ff', color: '#0d6efd', filterType: 'All', hasAdd: false },
  { key: 'repairs', title: 'Repairs & Damages', icon: 'bi-tools', bg: '#fff0f0', color: '#f5222d', filterType: 'Repairs & Damages', hasAdd: true },
  { key: 'prepayments', title: 'Pre-Payments', icon: 'bi-cash-stack', bg: '#e6f7ff', color: '#1890ff', filterType: 'Pre-Payments', hasAdd: true },
  { key: 'liquidation', title: 'Liquidation Damages', icon: 'bi-exclamation-triangle-fill', bg: '#ffeeed', color: '#f5222d', filterType: 'Liquidation Damages', hasAdd: true },
  { key: 'penalties', title: 'Traffic Penalties', icon: 'bi-cone-striped', bg: '#feefc7', color: '#92400e', filterType: 'Traffic Penalties', hasAdd: true },
  { key: 'other', title: 'Other', icon: 'bi-three-dots', bg: '#f4f4f5', color: '#71717a', filterType: 'Other', hasAdd: true }
];

export const REQUIRED_FIELDS_BY_CATEGORY: Record<string, string[]> = {
  'Repairs & Damages': ['rep_refNumber', 'rep_vendor', 'rep_incidentDate', 'rep_paymentDate', 'rep_totalRepairCost'],
  'Traffic Penalties': ['pen_refNumber', 'pen_vendor', 'pen_penaltyDate', 'pen_paymentDate', 'pen_amount'],
  'Pre-Payments': ['pre_refNumber', 'pre_vendor', 'pre_totalAmount', 'pre_paymentDate'],
  'Liquidation Damages': ['liq_refNumber', 'liq_vendor', 'liq_lqDate', 'liq_paymentDate', 'liq_amount'],
  Other: ['oth_refNumber', 'oth_vendor', 'oth_incidentDate', 'oth_paymentDate', 'oth_amount']
};

export const AMOUNT_FIELD_BY_CATEGORY: Record<string, string> = {
  'Repairs & Damages': 'rep_totalRepairCost',
  'Traffic Penalties': 'pen_amount',
  'Pre-Payments': 'pre_totalAmount',
  'Liquidation Damages': 'liq_amount',
  Other: 'oth_amount'
};

export const DATE_OF_INCIDENT_FIELD_BY_CATEGORY: Record<string, string> = {
  'Repairs & Damages': 'rep_incidentDate',
  'Traffic Penalties': 'pen_penaltyDate',
  'Pre-Payments': 'pre_paymentDate',
  'Liquidation Damages': 'liq_lqDate',
  Other: 'oth_incidentDate'
};

export const VENDOR_FIELD_BY_CATEGORY: Record<string, string> = {
  'Repairs & Damages': 'rep_vendor',
  'Traffic Penalties': 'pen_vendor',
  'Pre-Payments': 'pre_vendor',
  'Liquidation Damages': 'liq_vendor',
  Other: 'oth_vendor'
};

export const ENTRY_TYPES = ['Repairs & Damages', 'Traffic Penalties', 'Pre-Payments', 'Liquidation Damages', 'Other'] as const;
