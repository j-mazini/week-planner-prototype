"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavbarWrapper from "@/components/navbar-wrapper";
import { DgpPageFrame } from "@/app/(private)/components";
import { GradientDotsBackground } from "@/components/gradient-dots-background";
import { ModernPageHeader } from "@/components/modern-page-header";
import { ClipboardList, Clock3 } from "lucide-react";
import { hasAuthSession } from "@/lib/auth"
import {
  createVendorRequest,
  fetchVendorRequests,
  type VendorRequest,
} from "@/lib/vendor-requests-api";
import { toISODate, getTomorrowISODate, canRequestDayOffForDate } from "./utils";
import { DayOffRequestForm } from "./components/DayOffRequestForm";
import { HolidayRequestForm } from "./components/HolidayRequestForm";
import { PrePaymentRequestForm } from "./components/PrePaymentRequestForm";
import { RequestsHistory } from "./components/RequestsHistory";

export default function RequestsPage() {
  const router = useRouter();

  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [activeTab, setActiveTab] = useState<"dayoff" | "holiday" | "prepayment" | "requests">("dayoff");

  const [status, setStatus] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // DayOff form (default to tomorrow: Vendor can only request day off for the next day)
  const today = useMemo(() => new Date(), []);
  const [dayOffStartDate, setDayOffStartDate] = useState<string>(() => getTomorrowISODate());
  const [dayOffReason, setDayOffReason] = useState<string>("");
  const [dayOffNotes, setDayOffNotes] = useState<string>("");

  // Holiday form
  const [holidayStartDate, setHolidayStartDate] = useState<string>(toISODate(today));
  const [holidayEndDate, setHolidayEndDate] = useState<string>("");
  const [holidayReason, setHolidayReason] = useState<string>("");
  const [holidayNotes, setHolidayNotes] = useState<string>("");

  // PrePayment form
  const [prePaymentValue, setPrePaymentValue] = useState<string>("");
  const [prePaymentReason, setPrePaymentReason] = useState<string>("");
  const [prePaymentNotes, setPrePaymentNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<VendorRequest[]>([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);

  // Month selector for request history (YYYY-MM)
  const currentMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  // Filter requests by selected month (by createdAt)
  const requestsFilteredByMonth = useMemo(() => {
    if (!selectedMonth) return myRequests;
    const [y, m] = selectedMonth.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);
    return myRequests.filter((r) => {
      const created = new Date(r.createdAt);
      return created >= start && created <= end;
    });
  }, [myRequests, selectedMonth]);

  // Split by request type for separate blocks
  const dayOffRequests = useMemo(
    () => requestsFilteredByMonth.filter((r) => r.requestType === "DayOff"),
    [requestsFilteredByMonth]
  );
  const holyDayRequests = useMemo(
    () => requestsFilteredByMonth.filter((r) => r.requestType === "HolyDay"),
    [requestsFilteredByMonth]
  );
  const prePaymentRequests = useMemo(
    () => requestsFilteredByMonth.filter((r) => r.requestType === "PrePayment"),
    [requestsFilteredByMonth]
  );
  const pendingRequestsCount = useMemo(
    () => requestsFilteredByMonth.filter((request) => String(request.status).toLowerCase() === "pending").length,
    [requestsFilteredByMonth]
  );

  // Redirect only when not authenticated (Admin 1 and Supervisor 3 are allowed to access this page)
  useEffect(() => {
    if (!hasAuthSession()) {
      router.replace("/home");
    }
  }, [router]);

  const reloadMyRequests = useCallback(async () => {
    if (!userId) return;
    setLoadingMyRequests(true);
    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      const data = await fetchVendorRequests({ userId: userId, month, year });
      setMyRequests(data.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))));
    } catch (err) {
      console.warn("Failed to load vendor requests for vendor:", err);
      setMyRequests([]);
    } finally {
      setLoadingMyRequests(false);
    }
  }, [userId, selectedMonth]);

  useEffect(() => {
    void reloadMyRequests();
  }, [reloadMyRequests]);

  // Clear status message when tab changes
  useEffect(() => {
    setStatus(null);
  }, [activeTab]);

  const handleSubmitDayOff = useCallback(async () => {
    setStatus(null);
    if (!userId) {
      setStatus({
        type: "error",
        title: "Unable to identify vendor",
        message: "Please log in again and try again.",
      });
      return;
    }
    if (!dayOffStartDate) {
      setStatus({ type: "error", title: "Invalid date", message: "Please select a date." });
      return;
    }

    const dayOffRule = canRequestDayOffForDate(dayOffStartDate);
    if (!dayOffRule.allowed) {
      setStatus({
        type: "error",
        title: "Day off request not allowed",
        message: dayOffRule.message ?? "You cannot submit this day off request.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createVendorRequest({
        userId: userId,
        requestType: "DayOff",
        startDate: dayOffStartDate,
        reason: dayOffReason || undefined,
        notes: dayOffNotes || undefined,
        status: "pending",
      });

      setStatus({
        type: "success",
        title: "Request submitted",
        message: "Your day off request has been registered.",
      });
      setDayOffReason("");
      setDayOffNotes("");
      setDayOffStartDate(toISODate(new Date()));
      await reloadMyRequests();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to register day off.";
      setStatus({ type: "error", title: "Error", message });
    } finally {
      setSubmitting(false);
    }
  }, [dayOffNotes, dayOffReason, dayOffStartDate, userId, reloadMyRequests]);

  const handleSubmitHoliday = useCallback(async () => {
    setStatus(null);
    if (!userId) {
      setStatus({
        type: "error",
        title: "Unable to identify vendor",
        message: "Please log in again and try again.",
      });
      return;
    }
    if (!holidayStartDate) {
      setStatus({ type: "error", title: "Invalid date", message: "Please select a start date." });
      return;
    }
    if (!holidayEndDate) {
      setStatus({ type: "error", title: "Invalid date", message: "Please select an end date." });
      return;
    }

    const start = new Date(holidayStartDate);
    const end = new Date(holidayEndDate);
    if (end < start) {
      setStatus({ type: "error", title: "Invalid date", message: "The end date must be after the start date." });
      return;
    }

    setSubmitting(true);
    try {
      await createVendorRequest({
        userId: userId,
        requestType: "HolyDay",
        startDate: holidayStartDate,
        endDate: holidayEndDate,
        reason: holidayReason || undefined,
        notes: holidayNotes || undefined,
        status: "pending",
      });

      setStatus({
        type: "success",
        title: "Request submitted",
        message: "Your holiday request has been registered.",
      });
      setHolidayReason("");
      setHolidayNotes("");
      setHolidayEndDate("");
      setHolidayStartDate(toISODate(new Date()));
      await reloadMyRequests();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to register holiday.";
      setStatus({ type: "error", title: "Error", message });
    } finally {
      setSubmitting(false);
    }
  }, [holidayNotes, holidayReason, holidayStartDate, holidayEndDate, userId, reloadMyRequests]);

  const handleSubmitPrePayment = useCallback(async () => {
    setStatus(null);
    if (!userId) {
      setStatus({
        type: "error",
        title: "Unable to identify vendor",
        message: "Please log in again and try again.",
      });
      return;
    }

    const parsed = Number(String(prePaymentValue).replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setStatus({
        type: "error",
        title: "Invalid amount",
        message: "Please enter an amount greater than 0.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createVendorRequest({
        userId: userId,
        requestType: "PrePayment",
        prePaymentValue: String(parsed),
        reason: prePaymentReason || undefined,
        notes: prePaymentNotes || undefined,
        status: "pending",
      });

      setStatus({
        type: "success",
        title: "Request submitted",
        message: "Your prepayment request has been registered.",
      });
      setPrePaymentValue("");
      setPrePaymentReason("");
      setPrePaymentNotes("");
      await reloadMyRequests();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit prepayment request.";
      setStatus({ type: "error", title: "Error", message });
    } finally {
      setSubmitting(false);
    }
  }, [prePaymentValue, prePaymentNotes, prePaymentReason, userId, reloadMyRequests]);


  return (
    <GradientDotsBackground className="relative min-h-screen z-[1] pointer-events-auto overflow-x-hidden w-full ">
      <style dangerouslySetInnerHTML={{
        __html: `
        .gradient-dots-background .liquid-glass-page-bg {
          display: none !important;
        }
        .gradient-dots-background [data-slot="sidebar-wrapper"],
        .gradient-dots-background [data-slot="sidebar-inset"],
        .gradient-dots-background [data-slot="sidebar-inset"] > main {
          background: transparent !important;
        }
      `}} />
      <NavbarWrapper>
        <div className="w-full min-w-0">
          <DgpPageFrame
            width="ultra"
            containerClassName="mx-auto w-full px-[3%] md:px-6 lg:px-8 py-4 md:py-8 space-y-5 md:space-y-7"
            className="font-sans text-slate-800 text-sm"
          >
            <div id="main-content" className="flex-grow flex flex-col min-w-0 relative">
              <main className="mx-auto w-full max-w-[86rem] space-y-5 md:space-y-7">
                <div className="mb-1">
                  <ModernPageHeader
                    title="Requests"
                    subtitle="Manage time off, holidays, pre-payments and request history."
                    gradientFrom="slate-900"
                    gradientTo="teal-600"
                    metrics={[
                      { label: "Requests this month", value: requestsFilteredByMonth.length, icon: <ClipboardList size={14} /> },
                      { label: "Awaiting review", value: pendingRequestsCount, icon: <Clock3 size={14} /> },
                    ]}
                    metricsLayout="grid2x2"
                  />
                </div>

                {/* Status Alert */}
                {status && (
                  <Alert
                    variant={status.type === "success" ? "success" : "destructive"}
                    className="rounded-xl shadow-sm"
                  >
                    <AlertTitle>{status.title}</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "dayoff" | "holiday" | "prepayment" | "requests")}>
                  <TabsList className="flex h-auto w-full rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-sm backdrop-blur-md gap-1.5">
                    <TabsTrigger
                      value="dayoff"
                      className="min-h-10 flex-1 min-w-0 rounded-lg px-1.5 py-2 text-center text-[0.65rem] whitespace-nowrap transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm sm:px-3 sm:text-sm"
                    >
                      Day Off
                    </TabsTrigger>
                    <TabsTrigger
                      value="holiday"
                      className="min-h-10 flex-1 min-w-0 rounded-lg px-1.5 py-2 text-center text-[0.65rem] whitespace-nowrap transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm sm:px-3 sm:text-sm"
                    >
                      Holiday
                    </TabsTrigger>
                    <TabsTrigger
                      value="prepayment"
                      className="min-h-10 flex-1 min-w-0 rounded-lg px-1.5 py-2 text-center text-[0.65rem] whitespace-nowrap transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm sm:px-3 sm:text-sm"
                    >
                      Pre-Payment
                    </TabsTrigger>
                    <TabsTrigger
                      value="requests"
                      className="min-h-10 flex-1 min-w-0 rounded-lg px-1.5 py-2 text-center text-[0.65rem] font-semibold whitespace-nowrap transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm sm:px-3 sm:text-sm"
                    >
                      History
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Day Off */}
                  <TabsContent value="dayoff" className="mt-[3%] md:mt-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm p-4 md:p-6">
                    <DayOffRequestForm
                      date={dayOffStartDate}
                      reason={dayOffReason}
                      notes={dayOffNotes}
                      submitting={submitting}
                      onChangeDate={setDayOffStartDate}
                      onChangeReason={setDayOffReason}
                      onChangeNotes={setDayOffNotes}
                      onSubmit={handleSubmitDayOff}
                    />
                  </TabsContent>

                  {/* Tab Holiday */}
                  <TabsContent value="holiday" className="mt-[3%] md:mt-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm p-4 md:p-6">
                    <HolidayRequestForm
                      startDate={holidayStartDate}
                      endDate={holidayEndDate}
                      reason={holidayReason}
                      notes={holidayNotes}
                      submitting={submitting}
                      onChangeStartDate={setHolidayStartDate}
                      onChangeEndDate={setHolidayEndDate}
                      onChangeReason={setHolidayReason}
                      onChangeNotes={setHolidayNotes}
                      onSubmit={handleSubmitHoliday}
                    />
                  </TabsContent>

                  {/* Tab Pre-Payment */}
                  <TabsContent value="prepayment" className="mt-[3%] md:mt-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm p-4 md:p-6">
                    <PrePaymentRequestForm
                      value={prePaymentValue}
                      reason={prePaymentReason}
                      notes={prePaymentNotes}
                      submitting={submitting}
                      onChangeValue={setPrePaymentValue}
                      onChangeReason={setPrePaymentReason}
                      onChangeNotes={setPrePaymentNotes}
                      onSubmit={handleSubmitPrePayment}
                    />
                  </TabsContent>

                  {/* Tab History */}
                  <TabsContent value="requests" className="mt-[3%] md:mt-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm p-4 md:p-6">
                    <RequestsHistory
                      selectedMonth={selectedMonth}
                      onSelectedMonthChange={setSelectedMonth}
                      loading={loadingMyRequests}
                      onReload={() => void reloadMyRequests()}
                      dayOffRequests={dayOffRequests}
                      holyDayRequests={holyDayRequests}
                      prePaymentRequests={prePaymentRequests}
                      dayOffCount={dayOffRequests.length}
                      holidayCount={holyDayRequests.length}
                      prePaymentCount={prePaymentRequests.length}
                    />
                  </TabsContent>
                </Tabs>
              </main>
            </div>
          </DgpPageFrame>
        </div>
      </NavbarWrapper>
    </GradientDotsBackground>
  );
}


