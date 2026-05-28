import type { OperationalIntelligenceRuntime } from "../intelligence";
import { evaluateGovernanceRules } from "./evaluator";
import { loadGovernancePolicyPacks } from "./policy-pack.loader";
import type { GovernanceRulebookEvaluation } from "./rulebook.types";
import type {
  GovernancePolicyPack,
  GovernancePolicyPackEvaluation,
  GovernancePolicyPackMatch,
  GovernancePolicyPackOverride,
  GovernancePolicyPackSelectionContext,
  GovernancePolicyPackTrace,
} from "./policy-pack.types";
import type {
  GovernanceActionCandidate,
  GovernanceConfidenceLevel,
  GovernanceRuleEvaluation,
} from "./types";

const PRIORITY_RANK: Record<GovernanceActionCandidate["priority"], number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function inferEnvironment(deploymentId: string): GovernancePolicyPack["environment"] {
  const id = deploymentId.toLowerCase();
  if (id.includes("prod") || id.includes("production")) return "production";
  if (id.includes("staging") || id.includes("stage")) return "staging";
  if (id.includes("internal") || id.includes("dev") || id.includes("local")) return "internal";
  return "any";
}

function inferRiskLevel(intelligence?: OperationalIntelligenceRuntime): GovernancePolicyPack["riskLevel"] {
  if (!intelligence) return "any";
  const summary = intelligence.summary;
  if (
    summary.healthStatus === "critical" ||
    summary.decisionStatus === "escalate" ||
    summary.healthStatus === "degraded"
  ) {
    return "high";
  }
  if (summary.healthStatus === "healthy" && summary.decisionStatus === "proceed") {
    return "low";
  }
  return "any";
}

function isEmergencyContext(deploymentId: string, intelligence?: OperationalIntelligenceRuntime): boolean {
  const id = deploymentId.toLowerCase();
  if (id.includes("emergency") || id.includes("incident")) return true;
  return intelligence?.summary.decisionStatus === "escalate";
}

function scorePackMatch(
  pack: GovernancePolicyPack,
  environment: GovernancePolicyPack["environment"],
  riskLevel: GovernancePolicyPack["riskLevel"],
): GovernancePolicyPackMatch {
  let score = 0;
  if (pack.environment === "any" || pack.environment === environment) score += 40;
  else score -= 20;
  if (pack.riskLevel === "any" || pack.riskLevel === riskLevel) score += 30;
  else score -= 10;
  if (pack.enabled) score += 10;
  const matched = score >= 50;
  return {
    packId: pack.packId,
    matched,
    reason: matched
      ? `Pack fits environment=${environment} risk=${riskLevel} mode=${pack.mode}.`
      : `Pack does not fit environment=${environment} risk=${riskLevel}.`,
    score,
  };
}

function resolvePack(
  packs: GovernancePolicyPack[],
  predicate: (pack: GovernancePolicyPack) => boolean,
): GovernancePolicyPack {
  const found = packs.find(predicate);
  if (found) return found;
  const standard = packs.find((p) => p.packId === "pack-standard");
  if (standard) return standard;
  return packs[0];
}

export function selectGovernancePolicyPack(input: {
  deploymentId: string;
  intelligence?: OperationalIntelligenceRuntime;
  packs?: GovernancePolicyPack[];
}): GovernancePolicyPack {
  const packs = loadGovernancePolicyPacks({ packs: input.packs });
  const environment = inferEnvironment(input.deploymentId);
  const riskLevel = inferRiskLevel(input.intelligence);

  if (isEmergencyContext(input.deploymentId, input.intelligence)) {
    return resolvePack(packs, (p) => p.mode === "emergency");
  }
  if (input.deploymentId.toLowerCase().includes("audit")) {
    return resolvePack(packs, (p) => p.mode === "audit");
  }
  if (environment === "internal" && riskLevel === "low") {
    return resolvePack(packs, (p) => p.packId === "pack-relaxed-internal");
  }
  if (environment === "staging") {
    return resolvePack(packs, (p) => p.packId === "pack-standard-staging");
  }
  if (environment === "production" && riskLevel === "high") {
    return resolvePack(packs, (p) => p.packId === "pack-strict-production");
  }
  return resolvePack(packs, (p) => p.packId === "pack-standard");
}

function adjustConfidence(
  base: GovernanceConfidenceLevel,
  avgConfidence: number,
  floor: number,
): GovernanceConfidenceLevel {
  if (avgConfidence < floor) return "low";
  if (base === "low" && avgConfidence >= floor + 10) return "medium";
  return base;
}

function applyPackToRuleEvaluation(
  base: GovernanceRuleEvaluation,
  pack: GovernancePolicyPack,
  candidates: GovernanceActionCandidate[],
  rulebookEvaluation: GovernanceRulebookEvaluation,
): { evaluation: GovernanceRuleEvaluation; overrides: GovernancePolicyPackOverride[] } {
  const overrides: GovernancePolicyPackOverride[] = [];
  const triggeredApprovals = [...new Set(base.triggeredApprovals)];
  const triggeredEscalations = [...new Set(base.triggeredEscalations)];
  const triggeredExceptions = [...new Set(base.triggeredExceptions)];
  const triggeredControls = [...new Set(base.triggeredControls)];

  const avgConfidence =
    candidates.length === 0
      ? 100
      : Math.round(candidates.reduce((sum, c) => sum + c.confidence, 0) / candidates.length);

  if (pack.mode === "strict") {
    for (const candidate of candidates) {
      if (
        candidate.kind === "recommendation" &&
        PRIORITY_RANK[candidate.priority] >= PRIORITY_RANK.medium &&
        candidate.confidence < pack.profile.approvalThreshold
      ) {
        const key = "policy-pack-strict-approval";
        if (!triggeredApprovals.includes(key)) {
          triggeredApprovals.push(key);
          overrides.push({
            overrideId: `ovr-${key}`,
            target: "approval",
            action: "require",
            reason: `Strict mode: recommendation confidence ${candidate.confidence} below ${pack.profile.approvalThreshold}.`,
            ruleId: candidate.refId,
          });
        }
      }
    }
    if (avgConfidence < pack.profile.confidenceFloor) {
      overrides.push({
        overrideId: "ovr-strict-confidence-floor",
        target: "confidence",
        action: "reduce",
        reason: `Strict mode: average confidence ${avgConfidence} below floor ${pack.profile.confidenceFloor}.`,
      });
    }
  }

  if (pack.mode === "relaxed") {
    const relaxedApprovals = triggeredApprovals.filter((id) => {
      if (id !== "rule-high-risk-approval" && id !== "policy-pack-strict-approval") return true;
      const rec = candidates.find((c) => c.kind === "recommendation" && c.priority === "low");
      return !(rec && id === "rule-high-risk-approval");
    });
    if (relaxedApprovals.length < triggeredApprovals.length) {
      overrides.push({
        overrideId: "ovr-relaxed-defer-approval",
        target: "approval",
        action: "defer",
        reason: "Relaxed mode: low-priority recommendation approvals deferred.",
      });
    }
    triggeredApprovals.length = 0;
    triggeredApprovals.push(...relaxedApprovals);
  }

  if (pack.mode === "emergency") {
    for (const candidate of candidates) {
      if (
        (candidate.kind === "anomaly" || candidate.kind === "bottleneck") &&
        PRIORITY_RANK[candidate.priority] >= PRIORITY_RANK.high
      ) {
        const key = "policy-pack-emergency-escalation";
        if (!triggeredEscalations.includes(key)) {
          triggeredEscalations.push(key);
          overrides.push({
            overrideId: `ovr-${key}-${candidate.refId}`,
            target: "escalation",
            action: "boost",
            reason: "Emergency mode: heightened escalation sensitivity.",
            ruleId: candidate.refId,
          });
        }
      }
    }
    for (const match of rulebookEvaluation.matches.filter((m) => m.matched)) {
      if (match.actions.some((a) => a.to === "escalation") && !triggeredEscalations.includes(match.ruleId)) {
        triggeredEscalations.push(match.ruleId);
      }
    }
  }

  if (pack.mode === "audit") {
    for (const match of rulebookEvaluation.matches.filter((m) => m.matched)) {
      overrides.push({
        overrideId: `ovr-audit-${match.ruleId}`,
        target: "audit",
        action: "record",
        reason: "Audit mode: record rulebook match in extended audit trail.",
        ruleId: match.ruleId,
      });
    }
  }

  let governanceScore = base.governanceScore;
  if (pack.mode === "strict") governanceScore = Math.min(100, governanceScore + 10);
  if (pack.mode === "relaxed") governanceScore = Math.max(0, governanceScore - 5);
  if (pack.mode === "emergency") governanceScore = Math.min(100, governanceScore + 5);
  if (pack.mode === "audit") governanceScore = Math.min(100, governanceScore + 3);

  const governanceConfidence = adjustConfidence(
    base.governanceConfidence,
    avgConfidence,
    pack.profile.confidenceFloor,
  );

  return {
    evaluation: {
      ...base,
      triggeredApprovals,
      triggeredEscalations,
      triggeredExceptions,
      triggeredControls,
      governanceScore,
      governanceConfidence,
    },
    overrides,
  };
}

export function evaluateGovernancePolicyPack(
  context: GovernancePolicyPackSelectionContext & { packs?: GovernancePolicyPack[] },
): GovernancePolicyPackEvaluation {
  const packs = loadGovernancePolicyPacks({ packs: context.packs });
  const environment = inferEnvironment(context.deploymentId);
  const riskLevel = inferRiskLevel(context.intelligence);
  const selected = selectGovernancePolicyPack({
    deploymentId: context.deploymentId,
    intelligence: context.intelligence,
    packs,
  });

  const matches: GovernancePolicyPackMatch[] = packs
    .filter((p) => p.enabled)
    .map((pack) => scorePackMatch(pack, environment, riskLevel));

  const baseRuleEvaluation = evaluateGovernanceRules(context.candidates);
  const { evaluation: adjustedRuleEvaluation, overrides } = applyPackToRuleEvaluation(
    baseRuleEvaluation,
    selected,
    context.candidates,
    context.rulebookEvaluation,
  );

  const traces: GovernancePolicyPackTrace[] = packs
    .filter((p) => p.enabled)
    .map((pack) => {
      const match = matches.find((m) => m.packId === pack.packId);
      return {
        traceId: `trace-pack-${pack.packId}`,
        packId: pack.packId,
        mode: pack.mode,
        matched: match?.matched ?? false,
        reason: match?.reason ?? "Pack not evaluated.",
      };
    });

  return {
    version: selected.version,
    selectedPackId: selected.packId,
    mode: selected.mode,
    matches,
    overrides,
    traces,
    adjustedRuleEvaluation,
    governanceScore: adjustedRuleEvaluation.governanceScore,
    governanceConfidence: adjustedRuleEvaluation.governanceConfidence,
  };
}
