import { createPageFixtures } from './page-fixtures';

type Row = Record<string, unknown>;

function selectedDate(url: URL): string {
  const today = new Date();
  const fallback = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const candidates = ['date', 'initialDate', 'startDate', 'initial_date'].map(k => url.searchParams.get(k));
  candidates.push(url.pathname.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null);
  const supplied = candidates.find(s => s && /^\d{4}-\d{2}-\d{2}$/.test(s));
  if (supplied) return supplied;
  const period = url.pathname.match(/\/(?:daily-overview\/(?:list\/\d+|all|summary)|deductions\/\d+)\/(\d{1,2})\/(\d{4})/);
  const month = period?.[1] ?? url.searchParams.get('month') ?? url.searchParams.get('mes');
  const year = period?.[2] ?? url.searchParams.get('year') ?? url.searchParams.get('ano');
  return month && year ? `${year}-${month.padStart(2, '0')}-01` : fallback;
}

/** Match the legacy API's array/envelope distinction and pagination aliases. */
export function demoCollection(rows: Row[], url: URL, paginated = false): unknown {
  const q = url.searchParams;
  let filtered = rows;
  const aliases: Record<string, string[]> = {
    search: [], registrationPlate: ['registrationPlates', 'vrn'], registration_plate: ['registrationPlates', 'vrn'],
    route_name: ['routeName'], vendorName: ['fullName', 'courierName', 'vendorName'],
    model: ['model'], manufacturer: ['manufacturer'], fuelType: ['fuelType'],
    depositId: ['depositId'], serviceTypeId: ['serviceTypeId'], servicePartnerId: ['servicePartnerId'], userId: ['userId'], active: ['active'], status: ['status'],
  };
  for (const [key, fields] of Object.entries(aliases)) {
    const value = q.get(key);
    if (!value || value === 'all' || value === '0') continue;
    const exact = key.endsWith('Id') || key === 'active' || key === 'status';
    filtered = filtered.filter(row => {
      const values = fields.length ? fields.map(f => row[f]) : Object.values(row).filter(v => typeof v !== 'object');
      return values.some(v => exact ? String(v).toLowerCase() === value.toLowerCase() : String(v ?? '').toLowerCase().includes(value.toLowerCase()));
    });
  }
  if (!paginated) return filtered;
  const positive = (value: string | null, fallback: number) => { const n = Number(value); return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback; };
  const currentPage = positive(q.get('currentPage') ?? q.get('page'), 1);
  const itemsPerPage = Math.min(100, positive(q.get('totalItensPerPage') ?? q.get('pageSize') ?? q.get('limit'), 10));
  const data = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  return { data, items: data, records: data, pagination: { currentPage, totalPages: Math.max(1, Math.ceil(filtered.length / itemsPerPage)), totalItems: filtered.length, itemsPerPage } };
}

export function pagePayload(url: URL): unknown {
  const path = url.pathname.toLowerCase();
  const d = createPageFixtures(selectedDate(url));
  const list = (rows: Row[]) => demoCollection(rows, url, /\/paginated$|\/pagination$|\/daily-operations-insights$/.test(path) || ['page', 'currentPage', 'limit', 'totalItensPerPage'].some(k => url.searchParams.has(k)));
  const detailOrList = (rows: Row[], idKey: string) => {
    const id = path.match(/\/(?:vehicles|routes|service-partners|vendor|vendors|users|operations|deposits)\/(\d+)$/)?.[1];
    return id ? rows.find(row => String(row[idKey]) === id) ?? null : list(rows);
  };
  const overviewUser = Number(path.match(/\/(?:day-overview|daily-overview\/list)\/(\d+)/)?.[1] ?? 101);
  const overview = d.overviews.find(o => o.userId === overviewUser) ?? d.overviews[0];
  if (path.includes('/day-overview/')) return [{ ...overview, userId: overviewUser }];
  if (path.includes('/daily-overview/summary/')) return {
    vendors: d.vendors.map((v, i) => ({ id: v.userId, firstName: v.firstName, lastName: v.lastName, email: v.email, avgTw: String(d.reports[i].percentageOtTwDl), avgSpr: d.reports[i].avgPerStops.toFixed(2), avgSporH: d.reports[i].sporh.toFixed(1), avgAfd: '2.9' })),
    overall: { avgTw: '96.5', avgSpr: '1.8', avgSporH: '13.2', avgAfd: '2.9', totalVendors: d.vendors.length },
  };
  if (path.includes('/daily-overview/list/')) {
    const dailyEarnings = Array.from({ length: 20 }, (_, i) => ({ date: `${d.month}-${String(i + 1).padStart(2, '0')}`, amount: overview.total, dailySpr: overview.spr, dailySporH: overview.sporh, dailyTwPercentage: overview.twPercentage, dailyAfd: overview.afd, operations: [{ ...overview, operationId: overview.operationId * 100 + i, amountTotal: overview.total, totalUnpaidStops: 3, paidStops: overview.deliveryDetails.paidStops, unpaidStops: overview.deliveryDetails.unpaidStops, workedHours: 8, percentageOnTime: overview.twPercentage }] }));
    return { currentMonth: { name: d.month, avgTw: String(overview.twPercentage), avgSpr: overview.spr.toFixed(2), avgSporH: overview.sporh.toFixed(1), avgAfd: overview.afd.toFixed(1), daysWorked: dailyEarnings.length, totalAmount: overview.total * dailyEarnings.length, averagePerDay: overview.total }, dailyEarnings };
  }
  if (path.includes('/daily-overview/all/')) return { vendors: d.vendors.map((v, i) => ({ ...v, operations: [{ ...d.overviews[i], percentageOnTime: d.overviews[i].twPercentage }] })) };
  if (path.includes('/daily-overview/')) return [overview];
  if (path.endsWith('/operations/types')) return { statuses: ['Pending', 'Started', 'Completed'].map(value => ({ value, label: value })), vendorTypes: [{ value: '1', label: 'Service Partner' }] };
  if (path.endsWith('/week-planners/types')) return { statuses: ['Pending', 'Approved', 'Finished'].map(value => ({ value, label: value })), operationStatuses: ['Pending', 'Completed'].map(value => ({ value, label: value })), vendors: d.vendors, vendorTypes: [{ value: '1', label: 'Service Partner' }], vehicles: d.vehicles, routes: d.routes, userTypes: [], costModels: d.costModels };
  if (path.includes('/daily-game-plan/by-date/')) return d.deposits.map((deposit, i) => ({ dailyGamePlanId: i + 1, depositId: deposit.depositId, date: d.date, status: 'Started', dailyTeamSupport: { dailyTeamSupportId: i + 1, userId: 101, fullName: 'João Silva', depositId: deposit.depositId }, notes: 'Demonstration plan' }));
  if (path.includes('/daily-team-support')) return d.deposits.map((deposit, i) => ({ dailyTeamSupportId: i + 1, userId: 101, fullName: 'João Silva', depositId: deposit.depositId, date: d.date, isSupervisor: true }));
  if (/day-off|bank-holidays/.test(path)) return [];
  if (/\/week-planners|\/daily-game-plan-operations|\/daily-operations-management/.test(path)) return list(d.planners);
  if (/\/operations(?:\/|$)/.test(path)) return detailOrList(d.operations, 'operationId');
  if (/\/reports(?:\/|$)/.test(path)) return list(d.reports);
  if (path.endsWith('/companies/me')) return { companyId: 1, companyName: 'BA Express Demo', name: 'BA Express Demo' };
  if (path.includes('/service-partners/') && path.includes('/monthly-summary')) {
    const partnerId = Number(path.match(/service-partners\/(\d+)/)?.[1] ?? 501);
    const invoices = d.invoices.filter(i => i.servicePartnerId === partnerId);
    return { servicePartnerId: partnerId, servicePartnerName: d.partners.find(p => p.servicePartnerId === partnerId)?.partnerName, month: Number(d.month.slice(5)), year: Number(d.month.slice(0, 4)), total: invoices.reduce((s, i) => s + i.totalPayment, 0), invoiceCount: invoices.length, vendors: invoices.map(i => ({ userId: i.userId, vendorName: i.courier, total: i.totalPayment, invoiceCount: 1 })) };
  }
  if (path.includes('/service-partner-invoices') || path.endsWith('/invoices/service-partner')) return d.partners.map(p => {
    const itens = d.reports.filter(r => r.servicePartnerId === p.servicePartnerId).map(r => ({ operationId: r.operationId, routeId: r.routeId, routeName: r.routeName, note: r.note, totalStops: r.totalStops, amount: r.total, date: d.date }));
    const amountTotal = itens.reduce((s, r) => s + r.amount, 0);
    return { servicePartnerInvoiceId: p.servicePartnerId + 9000, invoiceNumber: `DEMO-SP-${p.servicePartnerId}`, companyId: 1, companyName: p.companyName, servicePartnerId: p.servicePartnerId, servicePartnerName: p.partnerName, date: `${d.month.slice(5)}${d.month.slice(0, 4)}`, amountTotal, totalVat: 0, totalDeductions: 0, totalReimbursements: 0, netTotal: amountTotal, itens, deductions: [] };
  });
  if (path.includes('/invoices-processing') || path.includes('/invoice-processing')) return d.invoices.map(i => ({ ...i, id: i.invoiceId, recordId: i.invoiceNumber, subcontractor: i.servicePartnerName, period: i.referenceDate, amount: i.totalPayment }));
  if (/\/invoices\/\d+\/details$/.test(path)) {
    const id = Number(path.match(/invoices\/(\d+)/)?.[1]);
    const invoice = d.invoices.find(i => i.invoiceId === id);
    if (!invoice) return null;
    const vendor = d.vendors.find(v => v.userId === invoice.userId)!;
    const report = d.reports.find(r => r.userId === invoice.userId)!;
    const details = Array.from({ length: 20 }, (_, i) => ({ invoiceDetailId: id * 100 + i, operationId: report.operationId * 100 + i, date: `${d.month}-${String(i + 1).padStart(2, '0')}`, description: report.routeName, stops: report.totalStops, rate: report.rate - report.dailyServiceCharge, routeSort: report.routeSort, adhocSort: report.adhocSort, extra: report.extra, total: report.total, is_spms: true }));
    return { ...invoice, description: 'Demonstration invoice', invoiceDate: d.date, dueDate: d.date, paymentTerms: '30 days', totalVat: '0', totalOtherDeductions: '0', totalLiquidationDamageDeductions: '0', totalPrePaymentDeductions: '0', totalFixDamageDeductions: '0', totalTrafficPenaltyDeductions: '0', totalDetails: String(invoice.totalPayment), totalDeductions: '0', subtotal: String(invoice.totalPayment), total: String(invoice.totalPayment), balanceDue: invoice.totalPayment, referenceMonth: Number(d.month.slice(5)), referenceYear: Number(d.month.slice(0, 4)), company: { companyId: 1, companyName: 'BA Express Demo', companyStreet: 'Demo Business Park', companyCity: 'London', companyPostalCode: 'DEMO', companyPhone: '+44 7700 900123', companyEmail: 'demo@example.test', companyVatNumber: '' }, vendor: { vendorId: vendor.userId, name: vendor.fullName, vendorCode: vendor.userCode, vendorStreet: 'Demo Street', vendorCity: 'London', vendorPostalCode: 'DEMO', vendorPhone: vendor.phone, vendorEmail: vendor.email, vendorVatNumber: '' }, user: vendor, details };
  }
  if (path.includes('/invoices')) {
    const userId = path.match(/\/user\/(\d+)/)?.[1];
    return list(userId ? d.invoices.filter(i => i.userId === Number(userId)) : d.invoices);
  }
  if (path.includes('/service-partners')) return detailOrList(d.partners, 'servicePartnerId');
  if (/\/vendor-requests/.test(path)) {
    const id = path.match(/\/user\/(\d+)/)?.[1];
    return list(id ? d.requests.filter(r => r.userId === Number(id)) : d.requests);
  }
  if (path.includes('/cost-model-employees') || path.includes('/vendor-cost-model')) return d.vendors[0].costModels;
  if (/\/users\/by-company\/\d+\/without-invoice$/.test(path)) {
    return { users: demoCollection(d.vendors.map(v => ({ ...v, userName: v.firstName, userLastName: v.lastName })), url) };
  }
  if (/\/vendors?(?:\/|$)|\/users(?:\/|$)/.test(path)) {
    const depositId = path.match(/by-deposit\/(\d+)/)?.[1];
    return depositId ? d.vendors.filter(v => v.depositId === Number(depositId)) : detailOrList(d.vendors, 'userId');
  }
  if (path.includes('/customers')) return d.customers;
  if (path.includes('/vehicle-types')) return [{ vehicleTypeId: 1, typeName: 'Van', name: 'Van' }, { vehicleTypeId: 2, typeName: 'Electric Van', name: 'Electric Van' }];
  if (path.includes('/vendor-types')) return [{ vendorTypeId: 1, nameType: 'Service Partner', active: true }];
  if (path.includes('/user-types')) return [{ userTypeId: 1, nameType: 'Admin' }, { userTypeId: 2, nameType: 'Driver' }, { userTypeId: 3, nameType: 'Supervisor' }];
  if (path.includes('/management-team-functions')) return [{ managementTeamFunctionId: 1, name: 'Supervisor', functionName: 'Supervisor', active: true }];
  if (path.includes('/cost-models')) return d.costModels;
  if (path.includes('/vehicles')) return detailOrList(d.vehicles, 'vehicleId');
  if (path.endsWith('/routes/nalc')) return { ...d.routes[0], routeId: 999, routeName: 'NALC' };
  if (path.includes('/routes') || path.endsWith('-routes')) {
    // Depot/service-type trees are consumed by the contract and planner screens.
    if (path.includes('/deposits')) return d.deposits.map(depot => ({ ...depot, routes: d.routes.filter(r => r.depositId === depot.depositId), serviceTypes: d.serviceTypes.filter(s => s.depositId === depot.depositId).map(s => ({ ...s, routes: d.routes.filter(r => r.serviceTypeId === s.serviceTypeId) })), loops: [{ loopId: 901 + depot.depositId - 1, loopName: `Loop ${depot.depositId}`, loop_name: `Loop ${depot.depositId}`, routes: d.routes.filter(r => r.depositId === depot.depositId) }] }));
    if (path.includes('/service-types')) return d.serviceTypes.map(s => ({ ...s, routes: d.routes.filter(r => r.serviceTypeId === s.serviceTypeId), deposits: d.deposits.filter(dp => dp.depositId === s.depositId).map(dp => ({ ...dp, routes: d.routes.filter(r => r.serviceTypeId === s.serviceTypeId) })) }));
    return detailOrList(d.routes, 'routeId');
  }
  if (path.includes('/deposits')) return detailOrList(d.deposits, 'depositId');
  if (path.includes('/service-types')) {
    const id = path.match(/by-deposit\/(\d+)/)?.[1];
    return id ? d.serviceTypes.filter(s => s.depositId === Number(id)) : d.serviceTypes;
  }
  if (path.includes('/adhoc-works')) return d.vendors.slice(0, 3).map((v, i) => ({ userId: v.userId, fullName: v.fullName, servicePartnerId: v.servicePartnerId, servicePartnerName: v.servicePartnerName, operation: { operationId: 9501 + i, date: d.date, routeId: null, routeName: null, depot: v.depositName }, adhocService: d.adhocServices[0], adhocCategory: { adhocCategoryId: 1, name: 'Collections', description: 'Demo collection service' } }));
  if (path.includes('/adhoc-categories')) return [{ adhocCategoryId: 1, name: 'Collections', description: 'Demo collections' }];
  if (path.includes('/adhoc-services')) return d.adhocServices;
  if (path.includes('/service-partner-deductions') || path.includes('/other-deductions')) return list(d.deductions);
  if (/\/deductions\//.test(path)) {
    const userId = Number(path.match(/deductions\/(\d+)/)?.[1]);
    return d.deductions.filter(r => r.userId === userId).map(r => ({ ...r, amount: String(r.amount), totalAmount: String(r.totalAmount), deductionType: 'OTHER', date: d.date, invoiceId: null }));
  }
  const deductionTypes = [
    ['fix-damage', 'fixDamageId', 'Vehicle repair'],
    ['traffic-penalty', 'trafficPenaltyId', 'Parking penalty'],
    ['pre-payment', 'prePaymentId', 'Advance payment'],
    ['liquidation-damage', 'liquidationDamageId', 'Delivery adjustment'],
  ];
  for (const [segment, idKey, description] of deductionTypes) {
    if (path.includes(`/${segment}-deductions`)) return list(d.deductions.map((r, i) => ({ ...r, [idKey]: r.deductionId, description, vehicleId: 301 + i, routeId: 401 + i, repairCost: r.amount, totalRepairCost: r.amount, amountChargedVendor: r.amount, pcnRef: r.referenceNumber, pcnDate: d.date, liquidationDate: d.date, feeValue: 0, initialPaymentDate: d.date, code: 'DEMO', paidBy: 'Company' })));
  }
  if (path.includes('deductions') || path.includes('installments')) return [];
  if (path.includes('pre-payment-requests') || path.includes('prepayment-requests')) return list(d.requests.filter(r => r.requestType === 'PrePayment').map(r => ({ ...r, id: r.vendorRequestId, amount: Number(r.prePaymentValue) })));
  if (path.includes('messages') || path.includes('notifications') || path.includes('/chat/')) return [];
  return undefined;
}
