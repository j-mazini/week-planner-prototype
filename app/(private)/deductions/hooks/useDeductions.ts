import { useAuth } from "@/hooks/useAuth";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useEffect, useCallback, useMemo } from "react";
import { hasAuthSession, getBearerAuthHeader } from "@/lib/auth"
import { DeductionItem } from "../types";
import { processDeductions, calculateTotalDeductions } from "../utils";

export const useDeductions = (selectedDate: Date, servicePartnerId?: number) => {
  const [deductions, setDeductions] = useState<DeductionItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [isLoading, setIsLoading] = useState(false);


  // Função de busca de dados
  const fetchDeductions = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    // Não limpa os dados anteriores - mantém visível durante o carregamento
    try {
      if (!hasAuthSession()) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const year = String(selectedDate.getFullYear());
      const spQuery = servicePartnerId !== undefined && servicePartnerId !== 0 ? `?servicePartnerId=${servicePartnerId}` : '';

      const response = await fetch(
        `${getApiBaseUrl()}/bff/deductions/${userId}/${month}/${year}${spQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getBearerAuthHeader(),
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        } else if (response.status === 404) {
          // No deductions found for this month - not an error
          setDeductions([]);
          setError(null);
          return;
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to fetch deductions (${response.status})`
          );
        }
      }

      const data = await response.json();
      const processedDeductions = processDeductions(data, year, month);
      setDeductions(processedDeductions);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching deductions:", err);
      // Clear deductions on error
      setDeductions([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedDate, servicePartnerId]);

  useEffect(() => {
    if (userId) {
      fetchDeductions();
    }
  }, [userId, fetchDeductions]);

  // Cálculo do total memoizado
  const totalDeductions = useMemo(
    () => calculateTotalDeductions(deductions),
    [deductions]
  );

  // Itens de progresso memoizados
  const installmentProgressItems = useMemo(() => {
    return deductions.filter((d) => (d.totalInstallments || 1) > 1);
  }, [deductions]);

  return {
    deductions,
    error,
    isLoading,
    totalDeductions,
    installmentProgressItems,
    refetch: fetchDeductions,
  };
};

