import { NavigationCard, TypeStylesMap, HomeDashboardData } from './types';

/** Ordem das URLs para Quick Access de `SUPERVISOR` (whitelist estrita) */
const QUICK_ACCESS_USER_TYPE_3_URLS = [
  '/week-planner',
  '/daily-operations-reports',
  '/vendor-performance',
  '/daily-game-plan',
] as const;

const ALL_QUICK_ACCESS_CARDS: Record<string, Omit<NavigationCard, 'href'>> = {
  '/vendor': {
    icon: 'bi-people',
    title: 'Vendor Management',
    description: 'Vendors & partners overview',
    type: 'ops',
  },
  '/vehicles': {
    icon: 'bi-truck-front',
    title: 'Manage Vehicles',
    description: 'Fleet control & maintenance logs',
    type: 'ops',
  },
  '/vendor-performance': {
    icon: 'bi-graph-up-arrow',
    title: 'Vendor Performance',
    description: 'Performance metrics & analytics',
    type: 'ops',
  },
  '/contract-management': {
    icon: 'bi-file-earmark-text',
    title: 'Contract Management',
    description: 'Contracts & agreements',
    type: 'ops',
  },
  '/assets': {
    icon: 'bi-boxes',
    title: 'Assets Management',
    description: 'Vendor types, user types, vendors & more',
    type: 'ops',
  },
  '/week-planner': {
    icon: 'bi-calendar4-week',
    title: 'Weekly Planner',
    description: 'Task organization & agenda',
    type: 'plan',
  },
  '/daily-game-plan': {
    icon: 'bi-clipboard2-check',
    title: 'Daily Game Plan',
    description: 'Daily planning & objectives',
    type: 'plan',
  },
  '/daily-operations-management': {
    icon: 'bi-clipboard2-pulse',
    title: 'Daily Operations Management',
    description: 'Operations planning & execution',
    type: 'ops',
  },
  '/daily-operations-reports': {
    icon: 'bi-graph-up',
    title: 'Operations Report',
    description: 'Operational performance metrics',
    type: 'ops',
  },
  '/operations-management': {
    icon: 'bi-clipboard2-check',
    title: 'Daily Operations',
    description: 'Logistics & daily activities',
    type: 'ops',
  },
  '/financial-invoices': {
    icon: 'bi-receipt-cutoff',
    title: 'Process Invoices',
    description: 'Billing & collection management',
    type: 'fin',
  },
  '/deductions-disbursements-recharges': {
    icon: 'bi-wallet',
    title: 'Deductions',
    description: 'Cost control & recharges',
    type: 'fin',
  },
  '/daily-financial-insights': {
    icon: 'bi-activity',
    title: 'Financial Insights',
    description: 'Daily P&L & Balance sheets',
    type: 'fin',
  },
};

/** Quick Access para `SUPERVISOR` - somente rotas permitidas */
export const quickAccessCardsUserType3: NavigationCard[] = QUICK_ACCESS_USER_TYPE_3_URLS.map(
  (href) => ({ ...ALL_QUICK_ACCESS_CARDS[href], href })
);

/** Quick Access para `ADMIN` - todos os cards */
export const navigationCards: NavigationCard[] = [
  ...quickAccessCardsUserType3,
  {
    href: '/operations-management',
    ...ALL_QUICK_ACCESS_CARDS['/operations-management'],
  },
  {
    href: '/financial-invoices',
    ...ALL_QUICK_ACCESS_CARDS['/financial-invoices'],
  },
  {
    href: '/deductions-disbursements-recharges',
    ...ALL_QUICK_ACCESS_CARDS['/deductions-disbursements-recharges'],
  },
  {
    href: '/daily-financial-insights',
    ...ALL_QUICK_ACCESS_CARDS['/daily-financial-insights'],
  },
];

export const typeStyles: TypeStylesMap = {
  ops: {
    accent: 'bg-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-500',
    hover: 'hover:border-blue-500'
  },
  fin: {
    accent: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-500',
    hover: 'hover:border-emerald-500'
  },
  plan: {
    accent: 'bg-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-500',
    hover: 'hover:border-purple-500'
  }
};

export const fallbackDashboardData: HomeDashboardData = {
  kpis: [
    {
      id: 'vehicles',
      title: 'Total Vehicles',
      value: '24',
      trendLabel: '2 new',
      trendDirection: 'up',
      accent: 'from-sky-500 to-sky-400',
      icon: 'bi-truck'
    },
    {
      id: 'vendors',
      title: 'Active Vendors',
      value: '18',
      trendLabel: '1 new',
      trendDirection: 'up',
      accent: 'from-violet-500 to-violet-400',
      icon: 'bi-person-badge'
    },
    {
      id: 'deductions',
      title: 'Pending Deductions',
      value: '£1,250',
      trendLabel: '£320',
      trendDirection: 'down',
      accent: 'from-rose-500 to-rose-400',
      icon: 'bi-cash-stack'
    },
    {
      id: 'operations',
      title: "Today's Operations",
      value: '7/9',
      trendLabel: '78%',
      trendDirection: 'up',
      accent: 'from-emerald-500 to-emerald-400',
      icon: 'bi-check2-circle'
    }
  ],
  categories: [
    {
      key: 'admin' as const,
      title: 'Admin',
      subtitle: 'System Management',
      icon: 'bi-gear',
      badgeCount: 3,
      link: '#',
      notifications: [
        {
          id: 'admin-1',
          severity: 'warning',
          title: 'System Update Required',
          description: 'New version available for installation. Please schedule maintenance window.',
          time: '2 hours ago',
          href: '/admin-settings'
        },
        {
          id: 'admin-2',
          severity: 'info',
          title: 'Backup Completed',
          description: 'Daily system backup was successful. All data secured.',
          time: 'Yesterday, 2:30 AM',
          href: '/admin-settings/backups'
        },
        {
          id: 'admin-3',
          severity: 'danger',
          title: 'Security Alert',
          description: 'Multiple failed login attempts detected from unknown IP addresses.',
          time: '2 days ago',
          href: '/security/alerts'
        }
      ]
    },
    {
      key: 'ops' as const,
      title: 'Operations Report',
      subtitle: 'Performance & KPIs',
      icon: 'bi-graph-up',
      badgeCount: 5,
      link: '/operations-management',
      notifications: [
        {
          id: 'ops-1',
          severity: 'warning',
          title: 'Daily Report Pending',
          description: "Today's operations report not yet submitted by team leads.",
          time: 'Today, 8:15 AM',
          href: '/daily-operations-reports'
        },
        {
          id: 'ops-2',
          severity: 'danger',
          title: 'Route Performance Alert',
          description: 'Route MD7B below target performance for 3 consecutive days.',
          time: 'Yesterday, 5:45 PM',
          href: '/operations-management/routes'
        },
        {
          id: 'ops-3',
          severity: 'info',
          title: 'Weekly KPIs Met',
          description: 'All weekly performance targets achieved across all departments.',
          time: '3 days ago',
          href: '/operations-management/kpis'
        }
      ]
    },
    {
      key: 'invoices' as const,
      title: 'Invoices',
      subtitle: 'Payment Management',
      icon: 'bi-receipt-cutoff',
      badgeCount: 7,
      link: '/financial-invoices',
      notifications: [
        {
          id: 'inv-1',
          severity: 'warning',
          title: 'Pending Invoices',
          description: '5 invoices awaiting approval from finance department.',
          time: 'Today, 9:30 AM',
          href: '/financial-invoices'
        },
        {
          id: 'inv-2',
          severity: 'danger',
          title: 'Overdue Payments',
          description: '3 vendor payments past due date. Follow up required.',
          time: 'Yesterday, 4:20 PM',
          href: '/financial-invoices'
        },
        {
          id: 'inv-3',
          severity: 'success',
          title: 'Payment Processed',
          description: 'Monthly vendor payments completed successfully.',
          time: '2 days ago',
          href: '/invoice-history'
        }
      ]
    },
    {
      key: 'compliance' as const,
      title: 'Compliance',
      subtitle: 'Regulatory & Training',
      icon: 'bi-shield-check',
      badgeCount: 4,
      link: '/vendor',
      notifications: [
        {
          id: 'comp-1',
          severity: 'danger',
          title: 'Document Expiry',
          description: '3 vendor documents expiring within 30 days. Renewal needed.',
          time: 'Today, 10:15 AM',
          href: '/vendor/documents'
        },
        {
          id: 'comp-2',
          severity: 'warning',
          title: 'Training Compliance',
          description: '2 vendors missing required safety training certification.',
          time: 'Yesterday, 3:40 PM',
          href: '/training/compliance'
        },
        {
          id: 'comp-3',
          severity: 'info',
          title: 'Audit Scheduled',
          description: 'Monthly compliance audit scheduled for next week.',
          time: '3 days ago',
          href: '/compliance/audit'
        }
      ]
    }
  ],
  quickActions: [
    { id: 'vehicles', label: 'Manage Vehicles', href: '/vehicles', icon: 'bi-truck-front' },
    { id: 'vendor', label: 'Vendor Management', href: '/vendor', icon: 'bi-people' },
    { id: 'deductions', label: 'Deductions & Recharges', href: '/deductions-disbursements-recharges', icon: 'bi-wallet' },
    { id: 'operations', label: 'Daily Operations', href: '/operations-management', icon: 'bi-clipboard2-check' },
    { id: 'dop', label: 'Daily Operations Report', href: '/daily-operations-reports', icon: 'bi-graph-up' },
    { id: 'dfi', label: 'Daily Financial Insights', href: '/daily-financial-insights', icon: 'bi-activity' },
    { id: 'invoices', label: 'Invoice Processing', href: '/financial-invoices', icon: 'bi-receipt-cutoff' },
    { id: 'history', label: 'Invoice History', href: '/invoice-history', icon: 'bi-clock-history' },
    { id: 'schedule', label: 'Schedule for Payment', href: '/schedule', icon: 'bi-calendar-check' },
    { id: 'planner', label: 'Weekly Planner', href: '/week-planner', icon: 'bi-calendar4-week' }
  ]
};

