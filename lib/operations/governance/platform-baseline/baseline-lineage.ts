import type {
  GovernanceBaselineReport,
  GovernanceCapabilityClassification,
  GovernanceCapabilityDependencyGraph,
  GovernanceCapabilityInventoryEntry,
  GovernanceComplexityReport,
  GovernancePlatformBaselineLineageGraph,
  GovernanceReleaseBaseline,
} from "./baseline-types";

export function buildGovernancePlatformBaselineLineageGraph(input: {
  deploymentId: string;
  inventory: GovernanceCapabilityInventoryEntry[];
  classifications: GovernanceCapabilityClassification[];
  dependencyGraph: GovernanceCapabilityDependencyGraph;
  complexityReport: GovernanceComplexityReport;
  baselineReport: GovernanceBaselineReport;
  releaseBaseline: GovernanceReleaseBaseline;
}): GovernancePlatformBaselineLineageGraph {
  const now = new Date().toISOString();
  return {
    graphId: `platform-baseline-lineage-${input.deploymentId}`,
    entries: [
      {
        entryId: `lineage-inventory-${input.deploymentId}`,
        event: "inventory",
        detail: `capabilities=${input.inventory.length} frozen=${input.inventory.filter((entry) => entry.frozen).length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-classification-${input.deploymentId}`,
        event: "classification",
        detail: `classes=${input.classifications.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-dependency-${input.dependencyGraph.graphId}`,
        event: "dependency",
        detail: `edges=${input.dependencyGraph.edges.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-complexity-${input.complexityReport.reportId}`,
        event: "complexity",
        detail: `verdict=${input.complexityReport.verdict}`,
        timestamp: now,
      },
      {
        entryId: `lineage-baseline-${input.baselineReport.reportId}`,
        event: "baseline",
        detail: input.baselineReport.summary,
        timestamp: now,
      },
      {
        entryId: `lineage-release-${input.releaseBaseline.baselineId}`,
        event: "release",
        detail: `digest=${input.releaseBaseline.manifestDigest}`,
        timestamp: now,
      },
    ],
  };
}
