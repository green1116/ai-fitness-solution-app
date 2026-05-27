import { validateCommercializationFreeze } from "./guard";
import {
  buildCommercializationSummary,
  COMMERCIALIZATION_FREEZE_ID,
  COMMERCIALIZATION_PHASE,
  COMMERCIALIZATION_VERSION,
} from "./manifest";
import { DEFAULT_COMMERCIALIZATION_FREEZE_POLICY } from "./policy";

export type CommercializationFreezeInput = {
  deploymentId?: string;
  proposedExpansionLayer?: string;
  ecologyNodeHint?: number;
};

export type CommercializationFreezeResult = {
  version: typeof COMMERCIALIZATION_VERSION;
  phase: typeof COMMERCIALIZATION_PHASE;
  freezeId: typeof COMMERCIALIZATION_FREEZE_ID;
  compliant: boolean;
  blockedExpansions: number;
  summary: string;
};

/**
 * 商业化冻结 overlay：聚合 manifest / policy / guard，不侵入既有 runtime。
 */
export function runCommercializationFreezeLayer(
  input: CommercializationFreezeInput = {},
): CommercializationFreezeResult {
  const guard = validateCommercializationFreeze(input.proposedExpansionLayer);

  void DEFAULT_COMMERCIALIZATION_FREEZE_POLICY;
  void buildCommercializationSummary();
  void input.deploymentId;
  void input.ecologyNodeHint;

  return {
    version: COMMERCIALIZATION_VERSION,
    phase: COMMERCIALIZATION_PHASE,
    freezeId: COMMERCIALIZATION_FREEZE_ID,
    compliant: guard.compliant,
    blockedExpansions: guard.blockedExpansions,
    summary: guard.message,
  };
}

/** @deprecated 使用 runCommercializationFreezeLayer */
export const runRuntimeFreezeLayer = runCommercializationFreezeLayer;

export function formatCommercializationFreezeHook(
  result: CommercializationFreezeResult,
): string {
  return result.freezeId;
}

/** @deprecated */
export const formatRuntimeFreezeSummary = formatCommercializationFreezeHook;
