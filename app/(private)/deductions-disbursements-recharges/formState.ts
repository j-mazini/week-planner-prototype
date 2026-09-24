import type { FormDataState } from './types';
import { getTodayString } from './utils';

export const getInitialFormState = (): FormDataState => ({
  type: '',
  confirmCheck: false,
  dateOfNotification: '',
  notificationMethod: 'Email',
  customerRef: '',
  briefDescription: '',
  rep_refNumber: '',
  rep_vendor: '',
  rep_vehicleReg: '',
  rep_incidentDate: getTodayString(),
  rep_repairCost: '',
  rep_totalRepairCost: '',
  rep_amount: '',
  rep_dateOfEntry: '',
  rep_paymentDate: getTodayString(),
  rep_scheduleTerms: '',
  rep_installmentDate: '',
  rep_installmentValue: '',
  rep_description: '',
  pen_refNumber: '',
  pen_vendor: '',
  pen_vehicleReg: '',
  pen_pcnRef: '',
  pen_amount: '',
  pen_penaltyDate: getTodayString(),
  pen_issuingAuth: '',
  pen_appealStatus: '',
  pen_paidBy: '',
  pen_paymentDate: getTodayString(),
  pen_dateOfEntry: '',
  pen_council: '',
  oth_refNumber: '',
  oth_vendor: '',
  oth_amount: '',
  oth_dateOfEntry: '',
  oth_incidentDate: getTodayString(),
  oth_scheduleTerms: '',
  oth_installmentDate: '',
  oth_installmentValue: '',
  oth_paymentDate: getTodayString(),
  oth_description: '',
  oth_details: '',
  pre_refNumber: '',
  pre_vendor: '',
  pre_amount: '',
  pre_totalAmount: '',
  pre_fee: '0',
  pre_dateOfEntry: getTodayString(),
  pre_paymentDate: getTodayString(),
  pre_scheduleTerms: '',
  pre_installmentDate: '',
  pre_installmentValue: '',
  pre_description: '',
  pre_initialPaymentDate: '',
  liq_refNumber: '',
  liq_vendor: '',
  liq_routeId: '',
  liq_awbNumber: '',
  liq_lqCode: '',
  liq_amount: '',
  liq_lqDate: getTodayString(),
  liq_paidBy: '',
  liq_paymentDate: getTodayString(),
  liq_dateOfEntry: '',
  liq_failureCode: '',
  liq_description: ''
});

export const formatCurrency = (value: number | string | null | undefined) => {
  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value ?? 0;
  const number = Number.parseFloat(String(numValue));
  if (Number.isNaN(number)) {
    return '£0.00';
  }
  return `£${number.toFixed(2)}`;
};

