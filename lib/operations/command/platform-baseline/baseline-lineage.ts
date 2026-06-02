import type {
  CommandBaselineReport,
  CommandCapabilityClassification,
  CommandCapabilityDependencyGraph,
  CommandCapabilityInventoryEntry,
  CommandComplexityReport,
  CommandPlatformBaselineLineageGraph,
  CommandReleaseBaseline,
} from "./baseline-types";

export function buildCommandPlatformBaselineLineageGraph(input: {
  deploymentId: string;
  inventory: CommandCapabilityInventoryEntry[];
  classifications: CommandCapabilityClassification[];
  dependencyGraph: CommandCapabilityDependencyGraph;
  complexityReport: CommandComplexityReport;
  baselineReport: CommandBaselineReport;
  releaseBaseline: CommandReleaseBaseline;
}): CommandPlatformBaselineLineageGraph {
  const now = new Date().toISOString();
  return {
    graphId: `command-platform-baseline-lineage-${input.deploymentId}`,
    entries: [
      {
        entryId: `lineage-inventory-${input.deploymentId}`,
        event: "inventory",
        detail: `capabilities=${input.inventory.length} frozen=${input.inventory.filter((e) => e.frozen).length}`,
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
        detail: `digest=${input.releaseBaseline.manifestDigest} layers=${input.releaseBaseline.frozenLayers.length}`,
        timestamp: now,
      },
    ],
  };
}
