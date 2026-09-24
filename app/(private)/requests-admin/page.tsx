"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContent, PageHeader, PageSection, StandardPageLayout } from "../components";
import { getUserTypeFromToken, hasAuthSession } from "@/lib/auth"
import { BUSINESS_RULES } from "@/src/constants/businessRules";
import {
  fetchVendorRequests,
  approveVendorRequestWithInsert,
  rejectVendorRequest,
  type VendorRequest,
} from "@/lib/vendor-requests-api";
import { fetchVendors, type Vendor } from "@/lib/vendors-api";
import { useServicePartners } from "@/hooks/useServicePartners";
import { CheckCircle2, XCircle } from "lucide-react";

export default function RequestsAdminPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"requests" | "history">("requests");
  const [status, setStatus] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  const [allRequests, setAllRequests] = useState<VendorRequest[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [selectedServicePartnerId, setSelectedServicePartnerId] = useState('');
  const { servicePartners } = useServicePartners();

  // Modal state for schedule_terms
  const [showScheduleTermsModal, setShowScheduleTermsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VendorRequest | null>(null);
  const [scheduleTerms, setScheduleTerms] = useState<string>("");

  // Protection: allow only `BUSINESS_RULES.USER_TYPE.ADMIN`.
  useEffect(() => {
    if (!hasAuthSession()) {
      router.replace("/home");
      return;
    }
    const userTypeId = getUserTypeFromToken();
    if (userTypeId === null || userTypeId !== BUSINESS_RULES.USER_TYPE.ADMIN) {
      router.replace("/home");
    }
  }, [router]);

  const reloadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const spId = selectedServicePartnerId !== '' ? Number(selectedServicePartnerId) : undefined;
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const [data, vendorsList] = await Promise.all([
        fetchVendorRequests({ servicePartnerId: spId, month, year }),
        fetchVendors().catch(() => []),
      ]);
      setAllRequests(data.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))));
      setVendors(Array.isArray(vendorsList) ? vendorsList : []);
    } catch (err) {
      console.warn("Failed to load vendor requests:", err);
      setAllRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, [selectedServicePartnerId]);

  // Map userId -> vendor full name (for display in tables). Vendor.id is userId from backend.
  const vendorNameByUserId = useMemo(() => {
    const map: Record<number, string> = {};
    for (const v of vendors) {
      const userId = Number(v.id ?? v.userId);
      if (userId && !Number.isNaN(userId)) {
        const first = v.firstName || "";
        const last = v.lastName || "";
        const name = [first, last].filter(Boolean).join(" ").trim();
        if (name) map[userId] = name;
      }
    }
    return map;
  }, [vendors]);

  const getVendorName = useCallback(
    (userId: number) => vendorNameByUserId[userId] ?? `Vendor${userId}`,
    [vendorNameByUserId]
  );

  // Generate reference number for PrePayment deductions: PRP-INITIALS-DDMMYY-SEQ
  const generatePrePaymentReferenceNumber = useCallback((vendorName: string, vendorRequestId: number): string => {
    const prefix = "PRP";

    // Clean up vendor name - remove non-alphabetic prefixes like "#" or "Vendor"
    let cleanName = vendorName.trim();
    if (cleanName.startsWith("#")) {
      cleanName = cleanName.substring(1).trim();
    }
    if (cleanName.toLowerCase().startsWith("vendor")) {
      cleanName = cleanName.substring(6).trim();
    }

    // Extract initials: first letter of first name + full last name(s)
    const nameParts = cleanName.split(/\s+/).filter(part => part.length > 0 && /[a-zA-Z]/.test(part));
    let initials = "";
    if (nameParts.length > 0) {
      const firstName = nameParts[0];
      const lastNames = nameParts.length > 1 ? nameParts.slice(1).join("") : "";
      initials = (firstName.charAt(0).toUpperCase() + lastNames.toUpperCase()).replace(/[^A-Z]/g, "");
    }

    // Fallback to VND + vendorRequestId if no valid initials
    if (!initials || initials.length === 0) {
      initials = `VND${vendorRequestId}`;
    }

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2);
    const dateStr = `${day}${month}${year}`;
    const seq = String(vendorRequestId).padStart(3, "0");
    return `${prefix}-${initials}-${dateStr}-${seq}`;
  }, []);

  useEffect(() => {
    void reloadRequests();
  }, [reloadRequests]);

  const pendingRequests = allRequests.filter((r) => r.status.toLowerCase() === "pending");
  const historyRequests = allRequests.filter((r) => r.status.toLowerCase() !== "pending");

  const handleApproveClick = (request: VendorRequest) => {
    if (request.requestType === "PrePayment") {
      setSelectedRequest(request);
      setScheduleTerms("");
      setShowScheduleTermsModal(true);
    } else {
      handleApprove(request);
    }
  };

  const handleApprove = async (request?: VendorRequest, scheduleTermsValue?: string) => {
    const requestToApprove = request || selectedRequest;
    if (!requestToApprove) return;

    setProcessingRequestId(requestToApprove.vendorRequestId);
    setStatus(null);
    try {
      // Generate reference_number for PrePayment requests
      let referenceNumber: string | undefined;
      if (requestToApprove.requestType === "PrePayment") {
        const vendorName = getVendorName(requestToApprove.userId);
        referenceNumber = generatePrePaymentReferenceNumber(vendorName, requestToApprove.vendorRequestId);
      }

      await approveVendorRequestWithInsert(requestToApprove, scheduleTermsValue, undefined, referenceNumber);
      setStatus({
        type: "success",
        title: "Request approved",
        message: "The request has been approved successfully.",
      });
      setShowScheduleTermsModal(false);
      setSelectedRequest(null);
      setScheduleTerms("");
      await reloadRequests();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve request.";
      setStatus({ type: "error", title: "Error", message });
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (request: VendorRequest) => {
    setProcessingRequestId(request.vendorRequestId);
    setStatus(null);
    try {
      await rejectVendorRequest(request.vendorRequestId);
      setStatus({
        type: "success",
        title: "Request rejected",
        message: "The request has been rejected.",
      });
      await reloadRequests();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reject request.";
      setStatus({ type: "error", title: "Error", message });
    } finally {
      setProcessingRequestId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "approved") {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (normalizedStatus === "rejected" || normalizedStatus === "reproved") {
      return "bg-red-100 text-red-800 border-red-200";
    }
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  return (
    <StandardPageLayout bottomPadding="pb-[86px]" width="wide">
      <PageHeader alignHeader="between">
        <div className="flex flex-col gap-1">
          <div className="text-[18px] sm:text-[20px] font-semibold text-slate-900">Requests Management</div>
          <div className="text-[12px] text-slate-600">Review and manage vendor requests.</div>
        </div>
      </PageHeader>

      <PageContent className="space-y-4">
        {status && (
          <Alert variant={status.type === "success" ? "success" : "destructive"}>
            <AlertTitle>{status.title}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "requests" | "history")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests">
              Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4">
            <PageSection className="space-y-3">
              <div className="rounded-xl border bg-white/70 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Pending Requests</div>
                    <div className="text-xs text-slate-600">
                      Review and approve or reject pending requests.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {servicePartners.length > 0 && (
                      <select
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-44"
                        value={selectedServicePartnerId}
                        onChange={(e) => setSelectedServicePartnerId(e.target.value)}
                      >
                        <option value="">All Service Partners</option>
                        {servicePartners.map((sp) => (
                          <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                            {sp.partnerName}
                          </option>
                        ))}
                      </select>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void reloadRequests()}
                      disabled={loadingRequests}
                    >
                      {loadingRequests ? "Refreshing..." : "Refresh"}
                    </Button>
                  </div>
                </div>

                {loadingRequests ? (
                  <div className="text-sm text-slate-600 text-center py-8">Loading...</div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-sm text-slate-600 text-center py-8">No pending requests found.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request Type</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Date(s)</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((r) => {
                        const isProcessing = processingRequestId === r.vendorRequestId;
                        return (
                          <TableRow key={r.vendorRequestId}>
                            <TableCell className="font-medium">
                              {r.requestType === "DayOff"
                                ? "Day Off"
                                : r.requestType === "HolyDay"
                                  ? "Holiday"
                                  : r.requestType === "PrePayment"
                                    ? "Pre-Payment"
                                    : r.requestType}
                            </TableCell>
                            <TableCell>{vendorNameByUserId[r.userId] ?? `#${r.userId}`}</TableCell>
                            <TableCell>
                              {r.requestType === "DayOff" && r.startDate ? (
                                formatDate(r.startDate)
                              ) : r.requestType === "HolyDay" && r.startDate && r.endDate ? (
                                `${formatDate(r.startDate)} - ${formatDate(r.endDate)}`
                              ) : r.requestType === "PrePayment" ? (
                                "-"
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {r.requestType === "PrePayment" && r.prePaymentValue
                                ? `£${Number(r.prePaymentValue).toFixed(2)}`
                                : "-"}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={r.reason || ""}>
                              {r.reason || "-"}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={r.notes || ""}>
                              {r.notes || "-"}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">
                              {formatDateTime(r.createdAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApproveClick(r)}
                                  disabled={isProcessing}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(r)}
                                  disabled={isProcessing}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </PageSection>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <PageSection className="space-y-3">
              <div className="rounded-xl border bg-white/70 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Request History</div>
                    <div className="text-xs text-slate-600">
                      View all processed requests.
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void reloadRequests()}
                    disabled={loadingRequests}
                  >
                    {loadingRequests ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>

                {loadingRequests ? (
                  <div className="text-sm text-slate-600 text-center py-8">Loading...</div>
                ) : historyRequests.length === 0 ? (
                  <div className="text-sm text-slate-600 text-center py-8">No requests found.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request Type</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Date(s)</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Updated At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyRequests.map((r) => (
                        <TableRow key={r.vendorRequestId}>
                          <TableCell className="font-medium">
                            {r.requestType === "DayOff"
                              ? "Day Off"
                              : r.requestType === "HolyDay"
                                ? "Holiday"
                                : r.requestType === "PrePayment"
                                  ? "Pre-Payment"
                                  : r.requestType}
                          </TableCell>
                          <TableCell>{vendorNameByUserId[r.userId] ?? `#${r.userId}`}</TableCell>
                          <TableCell>
                            {r.requestType === "DayOff" && r.startDate ? (
                              formatDate(r.startDate)
                            ) : r.requestType === "HolyDay" && r.startDate && r.endDate ? (
                              `${formatDate(r.startDate)} - ${formatDate(r.endDate)}`
                            ) : r.requestType === "PrePayment" ? (
                              "-"
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {r.requestType === "PrePayment" && r.prePaymentValue
                              ? `£${Number(r.prePaymentValue).toFixed(2)}`
                              : "-"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={r.reason || ""}>
                            {r.reason || "-"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={r.notes || ""}>
                            {r.notes || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                r.status
                              )}`}
                            >
                              {r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase()}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {formatDateTime(r.createdAt)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {r.updatedAt ? formatDateTime(r.updatedAt) : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </PageSection>
          </TabsContent>
        </Tabs>
      </PageContent>

      {/* Modal for schedule_terms */}
      <Dialog open={showScheduleTermsModal} onOpenChange={setShowScheduleTermsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pre-Payment Schedule Terms</DialogTitle>
            <DialogDescription>
              Enter the schedule terms for this pre-payment request. This will determine how the payment is deducted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="scheduleTerms">Schedule Terms</Label>
              <Textarea
                id="scheduleTerms"
                placeholder="e.g., 4 installments of £50 each"
                value={scheduleTerms}
                onChange={(e) => setScheduleTerms(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-slate-500">
                Leave empty for automatic deduction schedule based on £200 per installment.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowScheduleTermsModal(false);
                setSelectedRequest(null);
                setScheduleTerms("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleApprove(undefined, scheduleTerms || undefined)}
              disabled={processingRequestId !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingRequestId !== null ? "Processing..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
}





