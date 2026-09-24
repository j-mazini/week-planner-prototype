import { api } from "@/lib/api-client";

export interface CostModel {
  costModelId: number;
  name?: string;
  description?: string;
  isAdhocCategory?: boolean;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  customerId?: number;
  paymentMethod?: string;
  fixedPrice?: number | null;
  pricePerStop?: number | null;
}

export interface CostModelsResponse {
  costModels?: CostModel[];
}

/**
 * Busca todos os cost models da tabela cost_model_id
 * SELECT * FROM cost_model_id
 * @returns Promise com array de cost models
 */
export const fetchCostModels = async (): Promise<CostModel[]> => {
  try {
    const data = await api.get<Record<string, unknown> | CostModel[]>("/bff/cost-models");

    if (data && typeof data === "object" && !Array.isArray(data)) {
      if ("costModels" in data && Array.isArray(data.costModels)) {
        return data.costModels as CostModel[];
      }
      if ("cost_models" in data && Array.isArray(data.cost_models)) {
        // This case should be handled by interceptor but we keep it safe
        return data.cost_models as CostModel[];
      }
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching cost models:", error);
    throw error;
  }
};

