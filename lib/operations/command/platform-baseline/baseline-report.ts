import type {
  CommandBaselineReport,
  CommandCapabilityClassification,
  CommandCapabilityDependencyGraph,
  CommandCapabilityInventoryEntry,
  CommandComplexityReport,
  CommandPlatformBaselineRuntimeInput,
} from "./baseline-types";
import { COMMAND_PLATFORM_BASELINE_VERSION } from "./baseline-types";

export function buildCommandBaselineReport(input: {
  runtimeInput: CommandPlatformBaselineRuntimeInput;
  inventory: CommandCapabilityInventoryEntry[];
  classifications: CommandCapabilityClassification[];
  dependencyGraph: CommandCapabilityDependencyGraph;
  complexityReport: CommandComplexityReport;
}): CommandBaselineReport {
  const frozenCapabilityCount = input.inventory.filter((entry) => entry.frozen).length;
  const summary = `baseline=${COMMAND_PLATFORM_BASELINE_VERSION} capabilities=${input.inventory.length} frozen=${frozenCapabilityCount} classes=${input.classifications.length} edges=${input.dependencyGraph.edges.length} complexity=${input.complexityReport.verdict} gate=${input.complexityReport.gateAdmitted}/${input.complexityReport.gateBlocked}`;

  return {
    reportId: `command-baseline-report-${input.runtimeInput.deploymentId}`,
    platformVersion: input.runtimeInput.platformVersion,
    baselineVersion: COMMAND_PLATFORM_BASELINE_VERSION,
    capabilityCount: input.inventory.length,
    frozenCapabilityCount,
    classificationCount: input.classifications.length,
    dependencyEdgeCount: input.dependencyGraph.edges.length,
    complexityVerdict: input.complexityReport.verdict,
    summary,
  };
}
