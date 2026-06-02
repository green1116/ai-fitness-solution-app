import type { PLATFORM_FREEZE_BASELINE_VERSION } from "../inventory";
import type { PlatformBaseline } from "../runtime/platform-baseline";
import type { FreezeInventory } from "../inventory";

export interface PlatformFreezeReport {
  version: typeof PLATFORM_FREEZE_BASELINE_VERSION;
  reportId: string;
  deploymentId: string;
  inventory: FreezeInventory;
  baseline: PlatformBaseline;
  totalDomains: number;
  frozenDomains: number;
  verificationCoverage: number;
  runtimeSummary: string;
}
