import type {
  GovernanceMechanismInventoryEntry,
  GovernanceMetaGovernanceRuntimeInput,
} from "./meta-governance-types";

function layerForModule(
  module: string,
): GovernanceMechanismInventoryEntry["layer"] {
  if (module === "intelligence") return "intelligence";
  if (module === "autonomous") return "autonomous";
  if (module === "self-optimization") return "optimization";
  if (module === "meta-governance") return "meta";
  return "federation";
}

export function buildGovernanceMechanismInventory(
  input: GovernanceMetaGovernanceRuntimeInput,
): GovernanceMechanismInventoryEntry[] {
  const now = new Date().toISOString();
  const fromOptimization = input.selfOptimization.mechanisms.map((m) => ({
    entryId: `inventory-${m.module}-${input.deploymentId}`,
    mechanismId: m.mechanismId,
    module: m.module,
    layer: layerForModule(m.module),
    effectivenessScore: m.score,
    complexityIndex: m.effectiveness === "ineffective" ? 90 : m.effectiveness === "low" ? 70 : 40,
    observedAt: now,
  }));

  const selfOptScore = input.selfOptimization.optimizationScore.compositeScore;
  const metaEntry: GovernanceMechanismInventoryEntry = {
    entryId: `inventory-self-optimization-${input.deploymentId}`,
    mechanismId: `mechanism-self-optimization-${input.deploymentId}`,
    module: "self-optimization",
    layer: "optimization",
    effectivenessScore: selfOptScore,
    complexityIndex: input.selfOptimization.modules.filter((x) => x.shouldOptimize).length * 12,
    observedAt: now,
  };

  const metaLayer: GovernanceMechanismInventoryEntry = {
    entryId: `inventory-meta-governance-${input.deploymentId}`,
    mechanismId: `mechanism-meta-governance-${input.deploymentId}`,
    module: "meta-governance",
    layer: "meta",
    effectivenessScore: Math.round(
      (input.observability.governanceScore.compositeScore + selfOptScore) / 2,
    ),
    complexityIndex: 30,
    observedAt: now,
  };

  return [...fromOptimization, metaEntry, metaLayer];
}
