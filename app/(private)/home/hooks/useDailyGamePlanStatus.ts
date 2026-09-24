"use client";

import { useState, useEffect } from 'react';
import { fetchDailyGamePlansByDate } from '@/app/(private)/daily-game-plan/api';
import { fetchDeposits } from '@/lib/api/deposits';
import type { DailyGamePlanWithSupportDTO } from '@/app/(private)/daily-game-plan/api';
import { filterAllowedDeposits } from '@/lib/allowedDeposits';

export type DailyGamePlanStatus = 'started' | 'finished' | 'waiting';

export interface DepositStatus {
  depositId: number;
  depositName: string;
  status: DailyGamePlanStatus;
  dailyGamePlanId?: number;
}

/**
 * Hook para buscar o status do Daily Game Plan do dia atual
 * @param date - Data no formato YYYY-MM-DD (opcional, padrão: hoje)
 * @returns Array de depósitos com seus status
 */
export function useDailyGamePlanStatus(date?: string): {
  depositsStatus: DepositStatus[];
  isLoading: boolean;
  error: string | null;
} {
  const [depositsStatus, setDepositsStatus] = useState<DepositStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Formatar data (hoje se não fornecida)
        const targetDate = date || (() => {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })();

        // Buscar depósitos sempre.
        // Para daily game plan: se a API responder "não existe" (ex.: 404),
        // tratamos como lista vazia para permitir fallback via week planners na UI.
        const deposits = await fetchDeposits();

        let dailyGamePlans: DailyGamePlanWithSupportDTO[] = [];
        try {
          dailyGamePlans = await fetchDailyGamePlansByDate(targetDate);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const looksLikeNotFound =
            /(\b404\b)/i.test(msg) ||
            /not found/i.test(msg) ||
            /no daily game plan/i.test(msg) ||
            /no daily game plans/i.test(msg) ||
            /does not exist/i.test(msg);

          if (looksLikeNotFound) {
            dailyGamePlans = [];
          } else {
            // Erros que não são "não encontrado" continuam causando erro na UI.
            throw err;
          }
        }

        // Criar mapa de daily game plans por depositId.
        // A API devolve ordenado por dailyGamePlanId DESC (mais recente primeiro).
        // Manter apenas o primeiro plano por depósito para não sobrescrever um plano com status "start"
        // por outro mais antigo (ex.: BAOP com vários daily_team_support).
        const plansMap = new Map<number, DailyGamePlanWithSupportDTO>();
        dailyGamePlans.forEach((plan) => {
          if (plan.depositId && !plansMap.has(plan.depositId)) {
            plansMap.set(plan.depositId, plan);
          }
        });

        // Criar array de status por depósito
        const statusList: DepositStatus[] = filterAllowedDeposits(deposits).map((deposit) => {
          const plan = plansMap.get(deposit.depositId);

          let status: DailyGamePlanStatus = 'waiting';
          if (plan && plan.status) {
            const s = String(plan.status).toLowerCase();
            if (s === 'finished' || s === 'finish') {
              status = 'finished';
            } else if (s === 'start' || s === 'started') {
              status = 'started';
            }
          }

          return {
            depositId: deposit.depositId,
            depositName: deposit.depositName || `Deposit ${deposit.depositId}`,
            status,
            dailyGamePlanId: plan?.dailyGamePlanId,
          };
        });

        // Ordenar por nome do depósito
        statusList.sort((a, b) =>
          a.depositName.localeCompare(b.depositName)
        );

        if (!cancelled) {
          setDepositsStatus(statusList);
        }
      } catch (err) {
        console.error('Erro ao buscar status do Daily Game Plan:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao buscar status do Daily Game Plan');
          setDepositsStatus([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [date]);

  return { depositsStatus, isLoading, error };
}


