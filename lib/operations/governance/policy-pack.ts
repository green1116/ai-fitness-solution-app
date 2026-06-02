import {
  GOVERNANCE_POLICY_PACK_VERSION,
  type GovernancePolicyPack,
  type GovernancePolicyPackProfile,
} from "./policy-pack.types";

const STRICT_PROFILE: GovernancePolicyPackProfile = {
  approvalThreshold: 85,
  escalationThreshold: 70,
  exceptionTolerance: "low",
  auditDepth: "deep",
  confidenceFloor: 80,
  controlStrictness: "high",
};

const STANDARD_PROFILE: GovernancePolicyPackProfile = {
  approvalThreshold: 75,
  escalationThreshold: 60,
  exceptionTolerance: "medium",
  auditDepth: "standard",
  confidenceFloor: 70,
  controlStrictness: "medium",
};

const RELAXED_PROFILE: GovernancePolicyPackProfile = {
  approvalThreshold: 60,
  escalationThreshold: 45,
  exceptionTolerance: "high",
  auditDepth: "minimal",
  confidenceFloor: 55,
  controlStrictness: "low",
};

const AUDIT_PROFILE: GovernancePolicyPackProfile = {
  approvalThreshold: 70,
  escalationThreshold: 55,
  exceptionTolerance: "low",
  auditDepth: "deep",
  confidenceFloor: 65,
  controlStrictness: "medium",
};

const EMERGENCY_PROFILE: GovernancePolicyPackProfile = {
  approvalThreshold: 50,
  escalationThreshold: 40,
  exceptionTolerance: "medium",
  auditDepth: "standard",
  confidenceFloor: 50,
  controlStrictness: "high",
};

export function buildDefaultGovernancePolicyPacks(): GovernancePolicyPack[] {
  return [
    {
      packId: "pack-strict-production",
      version: GOVERNANCE_POLICY_PACK_VERSION,
      mode: "strict",
      environment: "production",
      riskLevel: "high",
      enabled: true,
      description: "Strict governance for production high-risk posture.",
      rationale: "Maximize approval coverage and escalation sensitivity.",
      profile: STRICT_PROFILE,
      enabledRuleIds: "all",
      rulePriorityAdjustments: {
        "rule-high-risk-approval": 10,
        "rule-severe-anomaly-escalation": 10,
      },
      thresholdOverrides: [
        { field: "confidence", adjustment: "raise", delta: 10 },
      ],
    },
    {
      packId: "pack-standard",
      version: GOVERNANCE_POLICY_PACK_VERSION,
      mode: "standard",
      environment: "any",
      riskLevel: "any",
      enabled: true,
      description: "Default balanced governance posture.",
      rationale: "Baseline operational governance for most deployments.",
      profile: STANDARD_PROFILE,
      enabledRuleIds: "all",
      rulePriorityAdjustments: {},
      thresholdOverrides: [],
    },
    {
      packId: "pack-relaxed-internal",
      version: GOVERNANCE_POLICY_PACK_VERSION,
      mode: "relaxed",
      environment: "internal",
      riskLevel: "low",
      enabled: true,
      description: "Relaxed governance for internal low-risk environments.",
      rationale: "Allow deferral of low-risk recommendations.",
      profile: RELAXED_PROFILE,
      enabledRuleIds: "all",
      rulePriorityAdjustments: {
        "rule-high-risk-approval": -15,
      },
      thresholdOverrides: [
        { field: "confidence", adjustment: "lower", delta: 10 },
      ],
    },
    {
      packId: "pack-audit",
      version: GOVERNANCE_POLICY_PACK_VERSION,
      mode: "audit",
      environment: "any",
      riskLevel: "any",
      enabled: true,
      description: "Audit-focused governance with deep trace requirements.",
      rationale: "Enhance audit trail and record all rulebook matches.",
      profile: AUDIT_PROFILE,
      enabledRuleIds: "all",
      rulePriorityAdjustments: {
        "rule-priority-conflict-arbitration": 5,
        "rule-summary-rule-conclusion": 5,
      },
      thresholdOverrides: [],
    },
    {
      packId: "pack-emergency",
      version: GOVERNANCE_POLICY_PACK_VERSION,
      mode: "emergency",
      environment: "any",
      riskLevel: "high",
      enabled: true,
      description: "Emergency posture with heightened escalation sensitivity.",
      rationale: "Rapid escalation during incident or emergency deployments.",
      profile: EMERGENCY_PROFILE,
      enabledRuleIds: "all",
      rulePriorityAdjustments: {
        "rule-severe-anomaly-escalation": 15,
        "rule-large-impact-escalation": 10,
      },
      thresholdOverrides: [
        { field: "evidenceCount", adjustment: "lower", delta: 1 },
      ],
    },
    {
      packId: "pack-standard-staging",
      version: GOVERNANCE_POLICY_PACK_VERSION,
      mode: "standard",
      environment: "staging",
      riskLevel: "any",
      enabled: true,
      description: "Standard governance for staging environments.",
      rationale: "Mirror production-like checks without full strictness.",
      profile: STANDARD_PROFILE,
      enabledRuleIds: "all",
      rulePriorityAdjustments: {},
      thresholdOverrides: [],
    },
  ];
}
