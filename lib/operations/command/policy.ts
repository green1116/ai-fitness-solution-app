import type {
  CommandDomain,
  CommandIntent,
  CommandPolicy,
  CommandPolicyEvaluation,
  CommandSeverity,
  PolicyEffect,
} from "./types";

const SEVERITY_ORDER: CommandSeverity[] = ["low", "medium", "high", "critical"];

function severityAtOrAbove(severity: CommandSeverity, threshold: CommandSeverity): boolean {
  return SEVERITY_ORDER.indexOf(severity) >= SEVERITY_ORDER.indexOf(threshold);
}

export const DEFAULT_COMMAND_POLICIES: CommandPolicy[] = [
  {
    policyId: "policy-allow-low-autonomous",
    name: "allow-low-autonomous",
    domain: "*",
    minSeverity: "low",
    effect: "allow",
    requiresCoordination: false,
    enabled: true,
  },
  {
    policyId: "policy-require-approval-high",
    name: "require-approval-high",
    domain: "*",
    minSeverity: "high",
    effect: "require-approval",
    requiresCoordination: false,
    enabled: true,
  },
  {
    policyId: "policy-require-coordination-cross",
    name: "require-coordination-cross",
    domain: "cross-domain",
    minSeverity: "medium",
    effect: "require-coordination",
    requiresCoordination: true,
    enabled: true,
  },
  {
    policyId: "policy-deny-critical-unauthorized",
    name: "deny-critical-unauthorized",
    domain: "*",
    minSeverity: "critical",
    effect: "deny",
    requiresCoordination: true,
    enabled: true,
  },
];

export function evaluateCommandPolicy(input: {
  deploymentId: string;
  intent: CommandIntent;
  policies?: CommandPolicy[];
  unauthorized?: boolean;
}): CommandPolicyEvaluation {
  const policies = input.policies ?? DEFAULT_COMMAND_POLICIES;
  const applicable = policies
    .filter((p) => p.enabled)
    .filter((p) => p.domain === "*" || p.domain === input.intent.domain)
    .filter((p) => severityAtOrAbove(input.intent.severity, p.minSeverity))
    .sort((a, b) => SEVERITY_ORDER.indexOf(b.minSeverity) - SEVERITY_ORDER.indexOf(a.minSeverity));

  let effect: PolicyEffect = "allow";
  let policyId = "policy-default-allow";

  if (input.unauthorized) {
    effect = "deny";
    policyId = "policy-unauthorized";
  } else if (input.intent.domain === "cross-domain") {
    const cross = applicable.find((p) => p.domain === "cross-domain");
    if (cross) {
      effect = cross.effect;
      policyId = cross.policyId;
    }
  } else if (applicable.some((p) => p.effect === "deny")) {
    const deny = applicable.find((p) => p.effect === "deny")!;
    effect = deny.effect;
    policyId = deny.policyId;
  } else if (input.intent.severity === "critical") {
    effect = "require-coordination";
    policyId = "policy-critical-coordination";
  } else if (input.intent.severity === "high") {
    effect = "require-approval";
    policyId = applicable.find((p) => p.effect === "require-approval")?.policyId ?? "policy-high-approval";
  }

  const allowed = effect === "allow" || effect === "require-approval";

  return {
    evaluationId: `policy-eval-${input.intent.intentId}`,
    intentId: input.intent.intentId,
    policyId,
    effect,
    allowed,
    reason: `${effect} domain=${input.intent.domain} severity=${input.intent.severity}`,
  };
}

export function evaluateCommandPolicies(input: {
  deploymentId: string;
  intents: CommandIntent[];
  policies?: CommandPolicy[];
}): CommandPolicyEvaluation[] {
  return input.intents.map((intent) =>
    evaluateCommandPolicy({
      deploymentId: input.deploymentId,
      intent,
      policies: input.policies,
      unauthorized: intent.riskScore > 85 && intent.source !== "human",
    }),
  );
}
