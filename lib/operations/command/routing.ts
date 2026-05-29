import type { CommandDomain, CommandIntent, CommandPolicyEvaluation, CommandRoute } from "./types";

function primaryDomainForIntent(intent: CommandIntent): CommandDomain {
  if (intent.domain === "cross-domain") return intent.target;
  return intent.domain;
}

function fallbackDomain(domain: CommandDomain): CommandDomain | undefined {
  if (domain === "recovery") return "incident";
  if (domain === "incident") return "execution";
  if (domain === "execution") return "change";
  if (domain === "change") return "platform";
  return undefined;
}

export function resolveCommandRoute(input: {
  deploymentId: string;
  intent: CommandIntent;
  policyEvaluation: CommandPolicyEvaluation;
}): CommandRoute {
  const targetDomain = primaryDomainForIntent(input.intent);
  const escalate =
    input.policyEvaluation.effect === "require-coordination" ||
    input.intent.severity === "critical";

  let priority = input.intent.priority;
  if (escalate && priority !== "critical") priority = "high";

  return {
    routeId: `route-${input.intent.intentId}`,
    intentId: input.intent.intentId,
    targetDomain,
    priority,
    fallbackDomain: fallbackDomain(targetDomain),
    escalate,
  };
}

export function resolveCommandRoutes(input: {
  deploymentId: string;
  intents: CommandIntent[];
  policyEvaluations: CommandPolicyEvaluation[];
}): CommandRoute[] {
  return input.intents.map((intent) => {
    const policyEvaluation =
      input.policyEvaluations.find((e) => e.intentId === intent.intentId) ??
      ({
        evaluationId: `policy-eval-${intent.intentId}`,
        intentId: intent.intentId,
        policyId: "policy-default",
        effect: "deny",
        allowed: false,
        reason: "missing-policy",
      } as CommandPolicyEvaluation);

    return resolveCommandRoute({
      deploymentId: input.deploymentId,
      intent,
      policyEvaluation,
    });
  });
}
