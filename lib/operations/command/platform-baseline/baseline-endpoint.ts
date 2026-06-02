import {
  COMMAND_PLATFORM_BASELINE_VERSION,
  V4A5_COMMAND_PLATFORM_VERSION,
  type CommandPlatformBaselineRuntimeResult,
} from "./baseline-types";
import {
  COMMAND_PLATFORM_BASELINE_VERIFY_GROUPS,
  COMMAND_PLATFORM_CAPABILITY_CATALOG,
  COMMAND_PLATFORM_FROZEN_LAYERS,
  computeCommandManifestDigest,
} from "./baseline-registry";
import { collectCommandCapabilityVersionsFromRuntimes } from "./baseline-inventory";
import { buildCommandCapabilityDependencyGraph } from "./baseline-dependency";

export const COMMAND_PLATFORM_BASELINE_ENDPOINT_VERSION =
  "v4-a5-final-api-command-platform-baseline-endpoint-1" as const;

export type FrozenCapabilityEntry = {
  capabilityId: string;
  releaseTag: string;
  label: string;
  version: string;
  tier: string;
  frozen: boolean;
};

export type CommandPlatformBaselineManifest = {
  manifestId: string;
  platformVersion: typeof V4A5_COMMAND_PLATFORM_VERSION;
  baselineVersion: typeof COMMAND_PLATFORM_BASELINE_VERSION;
  releaseTag: "V4-A5-FINAL";
  frozenCapabilities: FrozenCapabilityEntry[];
  frozenLayers: readonly string[];
  capabilityCount: number;
};

export type CommandPlatformBaselineDigest = {
  digestId: string;
  manifestDigest: string;
  algorithm: "stable-hash-v1";
};

export type CommandCapabilityLineageEntry = {
  entryId: string;
  event: string;
  detail: string;
  timestamp: string;
};

export type VerifySummaryBlock = {
  summaryId: string;
  verifyGroups: string[];
  verifyCount: number;
  frozenLayerCount: number;
  status: "pass" | "pending";
  note: string;
};

export type CommandPlatformBaselineSummary = {
  summaryId: string;
  text: string;
  freezeStatus: "frozen" | "draft";
  complexityVerdict?: string;
  dependencyEdgeCount: number;
  lineageEntryCount: number;
};

export type CommandPlatformBaselineEndpoint = {
  endpointVersion: typeof COMMAND_PLATFORM_BASELINE_ENDPOINT_VERSION;
  version: typeof COMMAND_PLATFORM_BASELINE_VERSION;
  releaseTag: "V4-A5-FINAL";
  status: "frozen" | "draft";
  deploymentId: string;
  generatedAt: string;
  manifest: CommandPlatformBaselineManifest;
  digest: CommandPlatformBaselineDigest;
  capabilityLineage: CommandCapabilityLineageEntry[];
  dependencyGraph: {
    graphId: string;
    nodes: string[];
    edges: Array<{
      edgeId: string;
      from: string;
      to: string;
      relation: string;
    }>;
  };
  verifySummary: VerifySummaryBlock;
  summary: CommandPlatformBaselineSummary;
  readonly: true;
};

function defaultDeploymentId(deploymentId?: string): string {
  return deploymentId?.trim() || "command-platform-baseline-api";
}

export function buildCommandPlatformBaselineManifest(input: {
  deploymentId: string;
}): CommandPlatformBaselineManifest {
  const capabilities = collectCommandCapabilityVersionsFromRuntimes();
  const versionById = new Map(capabilities.map((c) => [c.capabilityId, c.version]));

  const frozenCapabilities: FrozenCapabilityEntry[] = COMMAND_PLATFORM_CAPABILITY_CATALOG.map(
    (catalog) => {
      const version = versionById.get(catalog.capabilityId) ?? "missing";
      return {
        capabilityId: catalog.capabilityId,
        releaseTag: catalog.releaseTag,
        label: catalog.label,
        version,
        tier: catalog.tier,
        frozen: version !== "missing",
      };
    },
  );

  return {
    manifestId: `command-platform-baseline-manifest-${input.deploymentId}`,
    platformVersion: V4A5_COMMAND_PLATFORM_VERSION,
    baselineVersion: COMMAND_PLATFORM_BASELINE_VERSION,
    releaseTag: "V4-A5-FINAL",
    frozenCapabilities,
    frozenLayers: COMMAND_PLATFORM_FROZEN_LAYERS,
    capabilityCount: frozenCapabilities.length,
  };
}

export function buildCommandPlatformBaselineDigest(input: {
  deploymentId: string;
  manifest: CommandPlatformBaselineManifest;
}): CommandPlatformBaselineDigest {
  const versions = input.manifest.frozenCapabilities
    .filter((c) => c.frozen)
    .map((c) => `${c.capabilityId}@${c.version}`);

  return {
    digestId: `command-platform-baseline-digest-${input.deploymentId}`,
    manifestDigest: computeCommandManifestDigest(versions),
    algorithm: "stable-hash-v1",
  };
}

export function buildCommandPlatformBaselineSummaryBlock(input: {
  deploymentId: string;
  manifest: CommandPlatformBaselineManifest;
  dependencyEdgeCount: number;
  lineageEntryCount: number;
  freezeStatus: "frozen" | "draft";
  complexityVerdict?: string;
}): CommandPlatformBaselineSummary {
  const frozenCount = input.manifest.frozenCapabilities.filter((c) => c.frozen).length;
  return {
    summaryId: `command-platform-baseline-summary-${input.deploymentId}`,
    text: `release=${input.manifest.releaseTag} capabilities=${input.manifest.capabilityCount} frozen=${frozenCount} edges=${input.dependencyEdgeCount} lineage=${input.lineageEntryCount} status=${input.freezeStatus}`,
    freezeStatus: input.freezeStatus,
    complexityVerdict: input.complexityVerdict,
    dependencyEdgeCount: input.dependencyEdgeCount,
    lineageEntryCount: input.lineageEntryCount,
  };
}

export function buildVerifySummaryBlock(input?: {
  freezeStatus?: "frozen" | "draft";
}): VerifySummaryBlock {
  return {
    summaryId: "command-platform-baseline-verify-summary",
    verifyGroups: [...COMMAND_PLATFORM_BASELINE_VERIFY_GROUPS],
    verifyCount: COMMAND_PLATFORM_BASELINE_VERIFY_GROUPS.length,
    frozenLayerCount: COMMAND_PLATFORM_FROZEN_LAYERS.length,
    status: input?.freezeStatus === "frozen" ? "pass" : "pending",
    note: "readonly-baseline-endpoint; execution disabled",
  };
}

function buildStaticCapabilityLineage(deploymentId: string, generatedAt: string): CommandCapabilityLineageEntry[] {
  return [
    {
      entryId: `lineage-foundation-${deploymentId}`,
      event: "inventory",
      detail: "V4-A5-COMMAND-FOUNDATION frozen",
      timestamp: generatedAt,
    },
    {
      entryId: `lineage-bridge-${deploymentId}`,
      event: "inventory",
      detail: "V4-A5-A1-COMMAND-BRIDGE frozen",
      timestamp: generatedAt,
    },
    {
      entryId: `lineage-hitl-${deploymentId}`,
      event: "inventory",
      detail: "V4-A5-A2-HITL-CONTROL frozen",
      timestamp: generatedAt,
    },
    {
      entryId: `lineage-coordination-${deploymentId}`,
      event: "dependency",
      detail: "V4-A5-A3-HITL-BRIDGE frozen",
      timestamp: generatedAt,
    },
    {
      entryId: `lineage-api-${deploymentId}`,
      event: "dependency",
      detail: "V4-A5-A4-COMMAND-API frozen",
      timestamp: generatedAt,
    },
    {
      entryId: `lineage-orchestrator-${deploymentId}`,
      event: "release",
      detail: "V4-A5-A5-GATED-ORCHESTRATOR frozen",
      timestamp: generatedAt,
    },
    {
      entryId: `lineage-final-${deploymentId}`,
      event: "baseline",
      detail: "V4-A5-FINAL command platform baseline",
      timestamp: generatedAt,
    },
  ];
}

export function buildCommandPlatformBaselineEndpointFromRuntime(
  runtime: CommandPlatformBaselineRuntimeResult,
  deploymentId?: string,
): CommandPlatformBaselineEndpoint {
  const id = defaultDeploymentId(deploymentId ?? runtime.releaseBaseline.baselineId);
  const generatedAt = runtime.releaseBaseline.frozenAt;

  const manifest: CommandPlatformBaselineManifest = {
    manifestId: `command-platform-baseline-manifest-${id}`,
    platformVersion: V4A5_COMMAND_PLATFORM_VERSION,
    baselineVersion: runtime.version,
    releaseTag: runtime.releaseBaseline.releaseTag,
    frozenCapabilities: runtime.inventory.map((entry) => ({
      capabilityId: entry.capabilityId,
      releaseTag: entry.releaseTag,
      label: entry.label,
      version: entry.version,
      tier: entry.tier,
      frozen: entry.frozen,
    })),
    frozenLayers: runtime.releaseBaseline.frozenLayers,
    capabilityCount: runtime.inventory.length,
  };

  return {
    endpointVersion: COMMAND_PLATFORM_BASELINE_ENDPOINT_VERSION,
    version: runtime.version,
    releaseTag: runtime.releaseBaseline.releaseTag,
    status: runtime.status,
    deploymentId: id,
    generatedAt,
    manifest,
    digest: {
      digestId: `command-platform-baseline-digest-${id}`,
      manifestDigest: runtime.releaseBaseline.manifestDigest,
      algorithm: "stable-hash-v1",
    },
    capabilityLineage: runtime.lineage.entries.map((e) => ({
      entryId: e.entryId,
      event: e.event,
      detail: e.detail,
      timestamp: e.timestamp,
    })),
    dependencyGraph: {
      graphId: runtime.dependencyGraph.graphId,
      nodes: runtime.dependencyGraph.nodes,
      edges: runtime.dependencyGraph.edges.map((edge) => ({
        edgeId: edge.edgeId,
        from: edge.fromCapabilityId,
        to: edge.toCapabilityId,
        relation: edge.relation,
      })),
    },
    verifySummary: buildVerifySummaryBlock({ freezeStatus: runtime.status }),
    summary: {
      summaryId: runtime.summary.summaryId,
      text: runtime.summary.text,
      freezeStatus: runtime.status,
      complexityVerdict: runtime.complexityReport.verdict,
      dependencyEdgeCount: runtime.dependencyGraph.edges.length,
      lineageEntryCount: runtime.lineage.entries.length,
    },
    readonly: true,
  };
}

export function buildCommandPlatformBaselineEndpoint(input?: {
  deploymentId?: string;
  runtime?: CommandPlatformBaselineRuntimeResult;
}): CommandPlatformBaselineEndpoint {
  if (input?.runtime) {
    return buildCommandPlatformBaselineEndpointFromRuntime(input.runtime, input.deploymentId);
  }

  const deploymentId = defaultDeploymentId(input?.deploymentId);
  const generatedAt = new Date().toISOString();
  const manifest = buildCommandPlatformBaselineManifest({ deploymentId });
  const digest = buildCommandPlatformBaselineDigest({ deploymentId, manifest });
  const dependencyGraph = buildCommandCapabilityDependencyGraph({ deploymentId });
  const capabilityLineage = buildStaticCapabilityLineage(deploymentId, generatedAt);
  const allFrozen = manifest.frozenCapabilities.every((c) => c.frozen);
  const freezeStatus = allFrozen ? "frozen" : "draft";

  return {
    endpointVersion: COMMAND_PLATFORM_BASELINE_ENDPOINT_VERSION,
    version: COMMAND_PLATFORM_BASELINE_VERSION,
    releaseTag: "V4-A5-FINAL",
    status: freezeStatus,
    deploymentId,
    generatedAt,
    manifest,
    digest,
    capabilityLineage,
    dependencyGraph: {
      graphId: dependencyGraph.graphId,
      nodes: dependencyGraph.nodes,
      edges: dependencyGraph.edges.map((edge) => ({
        edgeId: edge.edgeId,
        from: edge.fromCapabilityId,
        to: edge.toCapabilityId,
        relation: edge.relation,
      })),
    },
    verifySummary: buildVerifySummaryBlock({ freezeStatus }),
    summary: buildCommandPlatformBaselineSummaryBlock({
      deploymentId,
      manifest,
      dependencyEdgeCount: dependencyGraph.edges.length,
      lineageEntryCount: capabilityLineage.length,
      freezeStatus,
      complexityVerdict: "baseline-acceptable",
    }),
    readonly: true,
  };
}
