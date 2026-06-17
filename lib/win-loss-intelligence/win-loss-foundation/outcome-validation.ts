import {
  WLI_MIN_LOSS_COUNT,
  WLI_MIN_OUTCOME_COUNT,
  WLI_MIN_PENDING_COUNT,
  WLI_MIN_WIN_COUNT,
} from "../shared/constants";
import { buildOutcomeRegistry } from "./outcome-registry";
import type { WinLossFoundationValidation } from "./outcome-types";

let cachedValidation: WinLossFoundationValidation | undefined;

export function validateWinLossFoundation(): WinLossFoundationValidation {
  if (cachedValidation) return cachedValidation;

  const registry = buildOutcomeRegistry();

  const outcomeRegistryReady =
    registry.count > 0 &&
    registry.records.every(
      (record) =>
        record.tenderId.length > 0 &&
        record.decisionId.length > 0 &&
        record.reasonCodes.length > 0 &&
        record.confidence >= 0 &&
        record.confidence <= 100,
    );

  const winCount = registry.records.filter((record) => record.outcome === "win").length;
  const lossCount = registry.records.filter((record) => record.outcome === "loss").length;
  const pendingCount = registry.records.filter((record) => record.outcome === "pending").length;
  const outcomeCount = registry.count;

  const valid =
    outcomeRegistryReady &&
    outcomeCount >= WLI_MIN_OUTCOME_COUNT &&
    winCount >= WLI_MIN_WIN_COUNT &&
    lossCount >= WLI_MIN_LOSS_COUNT &&
    pendingCount >= WLI_MIN_PENDING_COUNT;

  cachedValidation = {
    valid,
    outcomeRegistryReady,
    winCount,
    lossCount,
    pendingCount,
    outcomeCount,
    summary: `win-loss-foundation outcomes=${outcomeCount} win=${winCount} loss=${lossCount} pending=${pendingCount} valid=${valid}`,
  };

  return cachedValidation;
}
