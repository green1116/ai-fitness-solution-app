import { buildFreezeInventory } from "../inventory";
import { buildPlatformBaseline, countFrozenDomains } from "../runtime/platform-baseline";
import type { PlatformFreezeReport } from "./types";
import { PLATFORM_FREEZE_BASELINE_VERSION } from "../inventory";

export function buildPlatformFreezeReport(input?: {
  deploymentId?: string;
}): PlatformFreezeReport {
  const deploymentId = input?.deploymentId ?? "platform-freeze-default";
  const inventory = buildFreezeInventory({ deploymentId });
  const baseline = buildPlatformBaseline({ deploymentId, inventory });
  const totalDomains = inventory.totalPhases;
  const frozenDomains = countFrozenDomains(baseline);
  const verificationCoverage = Math.round((frozenDomains / totalDomains) * 100);

  return {
    version: PLATFORM_FREEZE_BASELINE_VERSION,
    reportId: `platform-freeze-${deploymentId}`,
    deploymentId,
    inventory,
    baseline,
    totalDomains,
    frozenDomains,
    verificationCoverage,
    runtimeSummary: [
      `platform-freeze id=${deploymentId}`,
      `totalDomains=${totalDomains}`,
      `frozenDomains=${frozenDomains}`,
      `verificationCoverage=${verificationCoverage}`,
      `phases=${inventory.totalPhases}`,
    ].join(" "),
  };
}
