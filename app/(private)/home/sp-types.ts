export interface SpStatusDaily {
  totalStops: number;
  totalRoutes: number;
  totalDhlRouteCost: number;
  totalBaRouteCost: number;
  totalAmount: number;
  totalDhlSpr: number;
  totalDhlAvrgPerStops: number;
  totalAvrg: number;
}

export interface SpStatusMonthly {
  totalStops: number;
  totalRoutes: number;
  totalDhlRouteCost: number;
  totalBaRouteCost: number;
  totalPendingDeductions: number;
  totalAmount: number;
}

export interface SpStatusDTO {
  status: {
    daily: SpStatusDaily;
    monthly: SpStatusMonthly;
  };
}
