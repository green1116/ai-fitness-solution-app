import {
  GOVERNANCE_PLATFORM_BASELINE_VERSION,
  type GovernanceBaselineFreezeStatus,
  type GovernancePlatformBaselineRuntimeInput,
  type GovernancePlatformBaselineRuntimeResult,
} from "./baseline-types";
import { buildGovernanceCapabilityInventory } from "./baseline-inventory";
import { classifyGovernanceCapabilities } from "./baseline-classification";
import { buildGovernanceCapabilityDependencyGraph } from "./baseline-dependency";
import { buildGovernanceComplexityReport } from "./baseline-complexity";
import { buildGovernanceBaselineReport } from "./baseline-report";
import { buildGovernanceReleaseBaseline } from "./baseline-release";
import { buildGovernancePlatformBaselineLineageGraph } from "./baseline-lineage";
import { buildGovernancePlatformBaselineAuditRecords } from "./baseline-audit";
import { runGovernancePlatformBaselineHooks } from "./baseline-hooks";

export function buildGovernancePlatformBaselineRuntime(
  input: GovernancePlatformBaselineRuntimeInput,
): GovernancePlatformBaselineRuntimeResult {
  const inventory = buildGovernanceCapabilityInventory(input);
  const classifications = classifyGovernanceCapabilities({
    deploymentId: input.deploymentId,
    inventory,
  });
  const dependencyGraph = buildGovernanceCapabilityDependencyGraph({
    deploymentId: input.deploymentId,
  });
  const complexityReport = buildGovernanceComplexityReport({
    deploymentId: input.deploymentId,
    inventory,
    classifications,
    dependencyGraph,
    metaGovernance: input.metaGovernance,
    selfOptimization: input.selfOptimization,
  });
  const baselineReport = buildGovernanceBaselineReport({
    runtimeInput: input,
    inventory,
    classifications,
    dependencyGraph,
    complexityReport,
  });
  const releaseBaseline = buildGovernanceReleaseBaseline({
    runtimeInput: input,
    inventory,
  });

  const lineage = buildGovernancePlatformBaselineLineageGraph({
    deploymentId: input.deploymentId,
    inventory,
    classifications,
    dependencyGraph,
    complexityReport,
    baselineReport,
    releaseBaseline,
  });

  const baselineId = releaseBaseline.baselineId;
  const frozenCount = inventory.filter((entry) => entry.frozen).length;
  const audit = buildGovernancePlatformBaselineAuditRecords({
    baselineId,
    deploymentId: input.deploymentId,
    capabilityCount: inventory.length,
    frozen: releaseBaseline.frozen,
    manifestDigest: releaseBaseline.manifestDigest,
  });
  const hooks = runGovernancePlatformBaselineHooks({
    inventoryCount: inventory.length,
    frozenCount,
  });

  let status: GovernanceBaselineFreezeStatus = "frozen";
  if (inventory.some((entry) => !entry.present)) status = "draft";

  const traceId = `governance-platform-baseline-trace-${input.deploymentId}`;
  return {
    version: GOVERNANCE_PLATFORM_BASELINE_VERSION,
    registry: { baselineId, freezeCycle: releaseBaseline.frozen ? 1 : 0 },
    inventory,
    classifications,
    dependencyGraph,
    complexityReport,
    baselineReport,
    releaseBaseline,
    lineage,
    audit,
    hooks,
    summary: {
      summaryId: `platform-baseline-summary-${Date.now()}`,
      text: `baseline=${baselineId} release=${releaseBaseline.releaseTag} capabilities=${inventory.length} frozen=${frozenCount} digest=${releaseBaseline.manifestDigest} complexity=${complexityReport.verdict} status=${status}`,
      traceId,
    },
    status,
  };
}

export { GOVERNANCE_PLATFORM_BASELINE_VERSION };
