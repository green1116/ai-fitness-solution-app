import {
  COMMAND_PLATFORM_BASELINE_VERSION,
  type CommandBaselineFreezeStatus,
  type CommandPlatformBaselineRuntimeInput,
  type CommandPlatformBaselineRuntimeResult,
} from "./baseline-types";
import { buildCommandCapabilityInventory } from "./baseline-inventory";
import { classifyCommandCapabilities } from "./baseline-classification";
import { buildCommandCapabilityDependencyGraph } from "./baseline-dependency";
import { buildCommandComplexityReport } from "./baseline-complexity";
import { buildCommandBaselineReport } from "./baseline-report";
import { buildCommandReleaseBaseline } from "./baseline-release";
import { buildCommandPlatformBaselineLineageGraph } from "./baseline-lineage";
import { buildCommandPlatformBaselineAuditRecords } from "./baseline-audit";
import { runCommandPlatformBaselineHooks } from "./baseline-hooks";

export function buildCommandPlatformBaselineRuntime(
  input: CommandPlatformBaselineRuntimeInput,
): CommandPlatformBaselineRuntimeResult {
  const inventory = buildCommandCapabilityInventory(input);
  const classifications = classifyCommandCapabilities({
    deploymentId: input.deploymentId,
    inventory,
  });
  const dependencyGraph = buildCommandCapabilityDependencyGraph({
    deploymentId: input.deploymentId,
  });
  const complexityReport = buildCommandComplexityReport({
    deploymentId: input.deploymentId,
    inventory,
    classifications,
    dependencyGraph,
    coordination: input.coordination,
    orchestrator: input.orchestrator,
  });
  const baselineReport = buildCommandBaselineReport({
    runtimeInput: input,
    inventory,
    classifications,
    dependencyGraph,
    complexityReport,
  });
  const releaseBaseline = buildCommandReleaseBaseline({
    runtimeInput: input,
    inventory,
  });

  const lineage = buildCommandPlatformBaselineLineageGraph({
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
  const audit = buildCommandPlatformBaselineAuditRecords({
    baselineId,
    deploymentId: input.deploymentId,
    capabilityCount: inventory.length,
    frozen: releaseBaseline.frozen,
    manifestDigest: releaseBaseline.manifestDigest,
  });
  const hooks = runCommandPlatformBaselineHooks({
    inventoryCount: inventory.length,
    frozenCount,
  });

  let status: CommandBaselineFreezeStatus = "frozen";
  if (inventory.some((entry) => !entry.present)) status = "draft";

  const traceId = `command-platform-baseline-trace-${input.deploymentId}`;
  return {
    version: COMMAND_PLATFORM_BASELINE_VERSION,
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
      summaryId: `command-platform-baseline-summary-${Date.now()}`,
      text: `baseline=${baselineId} release=${releaseBaseline.releaseTag} capabilities=${inventory.length} frozen=${frozenCount} digest=${releaseBaseline.manifestDigest} complexity=${complexityReport.verdict} status=${status}`,
      traceId,
    },
    status,
  };
}

export { COMMAND_PLATFORM_BASELINE_VERSION };
