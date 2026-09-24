// Display format for deductions
export interface DisplayDeduction {
  id: string;
  dateOfIncident: string;
  courierName: string;
  type: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Disputed';
  backendId: number;
  backendType: 'fix-damage' | 'traffic-penalty' | 'pre-payment' | 'liquidation-damage' | 'other';
  userId: number;
  /** Pre-payment fee (Pre-Payments only) */
  fee_value?: number;
  [key: string]: unknown;
}

export interface FormDataState {
  [key: string]: string | boolean | number | undefined;
}

