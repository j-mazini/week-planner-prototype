"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ShieldCheck, Box, AlertOctagon, Hand, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { getVendorsForCompliance } from "../compliance-api";
import type { Vendor } from "@/lib/vendors";

const COMPLIANCE_CARDS = [
  { id: "cargo", title: "Cargo", icon: Box, dateKey: "cargoTrainingDate" as const },
  { id: "dangerous", title: "Dangerous Goods", icon: AlertOctagon, dateKey: "dangerousGoodsTrainingDate" as const },
  { id: "manual", title: "Manual Handling", icon: Hand, dateKey: "manualHandlingTrainingDate" as const },
];

function parseDate(s: string | undefined): Date | null {
  if (!s || !s.trim()) return null;
  const d = new Date(s.trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

function getExpiringAndExpired(vendors: Vendor[], dateKey: "cargoTrainingDate" | "dangerousGoodsTrainingDate" | "manualHandlingTrainingDate") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inDays = new Date(today);
  inDays.setDate(inDays.getDate() + 30);
  const expiring: { id: number; name: string }[] = [];
  const expired: { id: number; name: string }[] = [];
  vendors.forEach((v) => {
    const raw = v[dateKey];
    const d = parseDate(typeof raw === "string" ? raw : undefined);
    if (!d) return;
    const name = v.fullName?.trim() || `Vendor #${v.userId}`;
    const item = { id: v.userId, name };
    d.setHours(0, 0, 0, 0);
    if (d < today) expired.push(item);
    else if (d <= inDays) expiring.push(item);
  });
  return { expiring, expired };
}

export function SpComplianceBlock({ compact = false }: { compact?: boolean }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVendorsForCompliance()
      .then((data) => setVendors(Array.isArray(data) ? data : []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, []);

  const complianceByCard = useMemo(() => {
    return COMPLIANCE_CARDS.map(({ id, dateKey }) => {
      const { expiring, expired } = getExpiringAndExpired(vendors, dateKey);
      return { id, expiring, expired };
    });
  }, [vendors]);

  /** Compact when Operations has no data; otherwise more padding. */
  const isCompact = compact;

  return (
    <section
      className={`flex flex-col min-h-0 rounded-[1.25rem] border border-blue-200/30 bg-white shadow-sm overflow-hidden ${isCompact ? "h-auto self-start" : "h-full"}`}
      aria-label="Compliance"
    >
      <div className={`flex items-center gap-3 px-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0 ${isCompact ? "py-2" : "py-3"}`}>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800 m-0">Compliance</h2>
          <p className="text-slate-500 text-sm m-0 mt-0.5">Expiring and expired training</p>
        </div>
      </div>
      <div className={`flex flex-col bg-slate-50/40 overflow-auto ${isCompact ? "p-2" : "flex-1 min-h-0 p-5"}`}>
        {loading ? (
          <div className={`flex items-center justify-center text-slate-500 ${isCompact ? "py-4" : "flex-1 py-8"}`}>
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 content-start">
            {COMPLIANCE_CARDS.map(({ id, title, icon: Icon }) => {
              const { expiring, expired } = complianceByCard.find((c) => c.id === id) ?? { expiring: [] as { id: number; name: string }[], expired: [] as { id: number; name: string }[] };
              return (
                <div key={id} className="rounded-xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="px-3 py-2.5 flex items-center gap-2 border-b border-slate-200 bg-slate-50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${id === "cargo" ? "bg-blue-100 text-blue-600" : id === "dangerous" ? "bg-amber-100 text-amber-600" : "bg-sky-100 text-sky-600"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 m-0">{title}</h3>
                  </div>
                  <div className="p-3 bg-white">
                    <div className="mb-3 rounded-lg bg-amber-50/80 border border-amber-200/50 p-2.5">
                      <h4 className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Expiring
                      </h4>
                      <ul className="list-none p-0 m-0 text-sm text-slate-600">
                        {expiring.length ? expiring.map((item) => <li key={item.id} className="py-0.5">{item.name}</li>) : <li className="text-slate-400">—</li>}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-red-50/80 border border-red-200/50 p-2.5">
                      <h4 className="text-xs font-semibold text-red-700 mb-1.5 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Expired
                      </h4>
                      <ul className="list-none p-0 m-0 text-sm text-slate-600">
                        {expired.length ? expired.map((item) => <li key={item.id} className="py-0.5">{item.name}</li>) : <li className="text-slate-400">—</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
