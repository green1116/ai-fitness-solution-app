import type {
  GovernanceBaselineReport,
  GovernanceCapabilityClassification,
  GovernanceCapabilityDependencyGraph,
  GovernanceCapabilityInventoryEntry,
  GovernanceComplexityReport,
  GovernancePlatformBaselineRuntimeInput,
} from "./baseline-types";
import { GOVERNANCE_PLATFORM_BASELINE_VERSION } from "./baseline-types";

export function buildGovernanceBaselineReport(input: {
  runtimeInput: GovernancePlatformBaselineRuntimeInput;
  inventory: GovernanceCapabilityInventoryEntry[];
  classifications: GovernanceCapabilityClassification[];
  dependencyGraph: GovernanceCapabilityDependencyGraph;
  complexityReport: GovernanceComplexityReport;
}): GovernanceBaselineReport {
  const frozenCapabilityCount = input.inventory.filter((entry) => entry.frozen).length;
  const summary = `baseline=${GOVERNANCE_PLATFORM_BASELINE_VERSION} capabilities=${input.inventory.length} frozen=${frozenCapabilityCount} classes=${input.classifications.length} edges=${input.dependencyGraph.edges.length} complexity=${input.complexityReport.verdict}`;

  return {
    reportId: `baseline-report-${input.runtimeInput.deploymentId}`,
    platformVersion: input.runtimeInput.platformVersion,
    baselineVersion: GOVERNANCE_PLATFORM_BASELINE_VERSION,
    capabilityCount: input.inventory.length,
    frozenCapabilityCount,
    classificationCount: input.classifications.length,
    dependencyEdgeCount: input.dependencyGraph.edges.length,
    complexityVerdict: input.complexityReport.verdict,
    summary,
  };
}
