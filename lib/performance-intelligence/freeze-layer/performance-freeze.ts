import { PI_CANONICAL_ID, PI_FREEZE_TAG } from "../shared/constants";
import { buildPerformanceSummary, type PerformanceSummary } from "./performance-summary";
import {
  buildPerformanceFoundationContext as buildFoundationContext,
  type PerformanceFoundationContext,
} from "./performance-foundation-context";
import {
  validatePerformanceFreeze,
  type PerformanceFreezeValidation,
} from "./performance-freeze-validation";

export interface PerformanceFreeze {
  freezeId: string;
  foundation: PerformanceFoundationContext;
  summary: PerformanceSummary;
  validation: PerformanceFreezeValidation;
  freezeTag: typeof PI_FREEZE_TAG;
  mode: typeof PI_CANONICAL_ID;
}

let cachedFreeze: PerformanceFreeze | undefined;

export function buildPerformanceFreeze(): PerformanceFreeze {
  if (cachedFreeze) return cachedFreeze;

  const foundation = buildFoundationContext();
  const summary = buildPerformanceSummary();
  const validation = validatePerformanceFreeze();

  cachedFreeze = {
    freezeId: "pi-performance-freeze-v46-p4",
    foundation,
    summary,
    validation,
    freezeTag: PI_FREEZE_TAG,
    mode: PI_CANONICAL_ID,
  };

  return cachedFreeze;
}
