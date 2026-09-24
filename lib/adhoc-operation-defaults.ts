/**
 * Defaults for creating AD-HOC operations across Daily Operations Management,
 * Week Planner, and Daily Game Plan (and any shared BFF payloads).
 *
 * Keep in sync with product rules: AD-HOC rows use fixed cost model DR (id 2),
 * no route sort billing (is Sort = false), and zero rate until configured elsewhere.
 */
export interface AdhocOperationCreateDefaultsDTO {
  costModelId: number;
  isSort: boolean;
  rate: number;
}

export const ADHOC_OPERATION_CREATE_DEFAULTS: AdhocOperationCreateDefaultsDTO = {
  costModelId: 2,
  isSort: false,
  rate: 0,
};

/** Fields commonly merged into create / update bodies for AD-HOC rows. */
export type AdhocOperationPayloadPatch = Pick<
  AdhocOperationCreateDefaultsDTO,
  "costModelId" | "isSort" | "rate"
>;

export function getAdhocOperationCreatePayloadDefaults(): AdhocOperationPayloadPatch {
  return { ...ADHOC_OPERATION_CREATE_DEFAULTS };
}
