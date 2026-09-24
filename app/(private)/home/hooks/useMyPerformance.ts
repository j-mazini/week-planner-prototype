/**
 * BAE-490 / BAE-645 — dados reais do widget "My Performance" do /home.
 *
 * Consome `GET /bff/day-overview/:userId/:date?metrics=performance`, que já devolve
 * spr/sporh/afd/twPercentage pré-calculados pelo PerformanceCalculationService no
 * backend — o cliente não recalcula nada, garantindo que o widget bata com
 * /performance, /current-performance e /vendor-performance (BAE-616).
 *
 * O usuário pode não ter operação no dia anterior (folga, fim de semana), então
 * procuramos o dia mais recente com dado, andando para trás a partir de ontem.
 */

import { useEffect, useState } from "react";
import { subDays, format } from "date-fns";
import { getUserIdFromToken } from "@/lib/auth";
import { fetchDayOverview } from "../last-day-api";
import type { DailyPerformanceData } from "@/app/(private)/daily-performance-insight/types";

export interface MyPerformanceSummary {
  /** Dia efetivamente usado (o mais recente com operação), em YYYY-MM-DD. */
  date: string;
  /** Stops per route: soma dos stops pagos e não pagos. */
  spr: number;
  /** Stops per on-road hour. `null` quando não há depart/arrive para o dia. */
  sporh: number | null;
  /** Attempted failed deliveries, em %. */
  afd: number;
  /** Time window on-time, em %. `null` quando não há registro de time window. */
  tw: number | null;
  /** Rotas do dia, para dar contexto ao número. */
  routes: string[];
}

interface UseMyPerformanceResult {
  data: MyPerformanceSummary | null;
  isLoading: boolean;
  /** true quando a busca terminou sem encontrar nenhuma operação na janela. */
  isEmpty: boolean;
  error: string | null;
}

/** Soma um campo numérico opcional das operações, ignorando nulos. */
function sumBy(ops: DailyPerformanceData[], pick: (op: DailyPerformanceData) => number | undefined | null): number {
  return ops.reduce((acc, op) => {
    const value = pick(op);
    return acc + (typeof value === "number" && !Number.isNaN(value) ? value : 0);
  }, 0);
}

/** Média de um campo, considerando só as operações que têm valor > 0 (mesma regra do backend). */
function averagePositive(
  ops: DailyPerformanceData[],
  pick: (op: DailyPerformanceData) => number | undefined | null
): number | null {
  const values = ops
    .map(pick)
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v) && v > 0);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function summarize(ops: DailyPerformanceData[], date: string): MyPerformanceSummary {
  const routes = Array.from(
    new Set(ops.map((op) => op.route?.routeName?.trim()).filter((name): name is string => !!name))
  );

  // AFD é percentual: média simples entre as operações do dia (>= 0 conta).
  const afdValues = ops
    .map((op) => op.afd)
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v) && v >= 0);

  return {
    date,
    spr: sumBy(ops, (op) => op.spr),
    sporh: averagePositive(ops, (op) => op.sporh),
    afd: afdValues.length > 0 ? afdValues.reduce((a, b) => a + b, 0) / afdValues.length : 0,
    tw: averagePositive(ops, (op) => op.twPercentage),
    routes,
  };
}

export function useMyPerformance(daysToCheck = 14): UseMyPerformanceResult {
  const [data, setData] = useState<MyPerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      setIsEmpty(false);

      const userId = getUserIdFromToken();
      if (userId == null) {
        if (!cancelled) {
          setIsEmpty(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        // Começa em ontem (i=1): o dia corrente costuma estar incompleto.
        for (let i = 1; i <= daysToCheck; i++) {
          if (cancelled) return;
          const dateStr = format(subDays(new Date(), i), "yyyy-MM-dd");
          const ops = await fetchDayOverview(userId, dateStr);
          if (ops.length > 0) {
            if (!cancelled) setData(summarize(ops, dateStr));
            return;
          }
        }
        if (!cancelled) setIsEmpty(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load performance");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [daysToCheck]);

  return { data, isLoading, isEmpty, error };
}
