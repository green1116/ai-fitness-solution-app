import { GOVERNANCE_POLICY_PACK_VERSION } from "./policy-pack.types";
import { loadGovernancePolicyPacks } from "./policy-pack.loader";
import type {
  GovernancePolicyPack,
  GovernancePolicyPackEvaluation,
  GovernancePolicyPackMode,
  GovernancePolicyPackSnapshot,
} from "./policy-pack.types";

export function buildGovernancePolicyPackSnapshot(input?: {
  pack?: GovernancePolicyPack;
  packs?: GovernancePolicyPack[];
}): GovernancePolicyPackSnapshot {
  const packs = loadGovernancePolicyPacks({ packs: input?.packs });
  const pack = input?.pack ?? packs.find((p) => p.packId === "pack-standard") ?? packs[0];
  const modes: GovernancePolicyPackMode[] = [
    "strict",
    "standard",
    "relaxed",
    "audit",
    "emergency",
  ];
  const modeCounts = Object.fromEntries(
    modes.map((mode) => [mode, packs.filter((p) => p.enabled && p.mode === mode).length]),
  ) as Record<GovernancePolicyPackMode, number>;

  return {
    packId: pack.packId,
    version: pack.version,
    mode: pack.mode,
    environment: pack.environment,
    enabledPackCount: packs.filter((p) => p.enabled).length,
    modeCounts,
  };
}

export function summarizeGovernancePolicyPackEvaluation(input: {
  evaluation: GovernancePolicyPackEvaluation;
  snapshot: GovernancePolicyPackSnapshot;
}): string {
  const matchedPacks = input.evaluation.matches.filter((m) => m.matched).length;
  return [
    `policyPackVersion=${input.snapshot.version}`,
    `mode=${input.evaluation.mode}`,
    `pack=${input.evaluation.selectedPackId}`,
    `environment=${input.snapshot.environment}`,
    `matchedPacks=${matchedPacks}`,
    `overrides=${input.evaluation.overrides.length}`,
    `score=${input.evaluation.governanceScore}`,
    `confidence=${input.evaluation.governanceConfidence}`,
    `auditDepth=${input.snapshot.mode === "audit" ? "deep" : "standard"}`,
  ].join(" ");
}

export const DEFAULT_POLICY_PACK_VERSION = GOVERNANCE_POLICY_PACK_VERSION;
