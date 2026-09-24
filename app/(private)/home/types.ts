export interface NavigationCard {
  href: string;
  icon: string;
  title: string;
  description: string;
  type: 'ops' | 'fin' | 'plan';
}

export interface TypeStyles {
  accent: string;
  bg: string;
  text: string;
  border: string;
  hover: string;
}

export interface TypeStylesMap {
  ops: TypeStyles;
  fin: TypeStyles;
  plan: TypeStyles;
}

export type NotificationSeverity = 'info' | 'warning' | 'danger' | 'success';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon?: string;
  severity: NotificationSeverity;
  href?: string; // Link to redirect to the specific notification page
}

export type NotificationCategoryKey = 'admin' | 'ops' | 'invoices' | 'compliance';

export interface NotificationCategory {
  key: NotificationCategoryKey;
  title: string;
  subtitle: string;
  icon: string;
  badgeCount?: number;
  link?: string;
  notifications: NotificationItem[];
}

export interface KpiCard {
  id: string;
  title: string;
  value: string;
  trendLabel?: string;
  trendDirection?: 'up' | 'down';
  accent: string;
  icon: string;
}

export interface QuickAction {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export interface HomeDashboardData {
  categories: NotificationCategory[];
  kpis: KpiCard[];
  quickActions: QuickAction[];
}

/**
 * Status data from GET /status endpoint
 */
export interface StatusDTO {
  status: {
    monthly: {
      totalStops: number;
      totalRoutes: number;
      totalDhlRouteCost: number;
      totalBaRouteCost: number;
      totalPendingDeductions: number;
      totalAmount: number;
    };
    daily: {
      totalStops: number;
      totalRoutes: number;
      totalDhlRouteCost: number;
      totalBaRouteCost: number;
      totalAmount: number;
      totalDhlSpr: number;
      totalDhlAvrgPerStops: number;
      totalAvrg: number;
    };
  };
}
