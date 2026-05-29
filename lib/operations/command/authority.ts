import type {
  CommandAuthority,
  CommandAuthorityEvaluation,
  CommandIntent,
  CommandPolicyEvaluation,
  CommandRoute,
} from "./types";

export function buildDefaultAuthorities(deploymentId: string): CommandAuthority[] {
  const now = new Date().toISOString();
  const later = new Date(Date.now() + 86400_000).toISOString();
  return [
    {
      authorityId: `authority-autonomous-${deploymentId}`,
      kind: "autonomous",
      level: 2,
      scope: ["execution", "change", "incident", "recovery", "platform"],
      issuer: "autonomous-agent",
      validFrom: now,
      validUntil: later,
      revoked: false,
    },
    {
      authorityId: `authority-delegated-${deploymentId}`,
      kind: "delegated",
      level: 3,
      scope: ["execution", "change", "incident", "recovery", "cross-domain"],
      issuer: "operations-center",
      validFrom: now,
      validUntil: later,
      revoked: false,
    },
    {
      authorityId: `authority-human-${deploymentId}`,
      kind: "human",
      level: 5,
      scope: ["execution", "change", "incident", "recovery", "governance", "platform", "cross-domain"],
      issuer: "operator",
      validFrom: now,
      validUntil: later,
      revoked: false,
    },
  ];
}

export function evaluateCommandAuthority(input: {
  deploymentId: string;
  intent: CommandIntent;
  route: CommandRoute;
  policyEvaluation: CommandPolicyEvaluation;
  authorities: CommandAuthority[];
}): CommandAuthorityEvaluation {
  const active = input.authorities.filter((a) => !a.revoked);
  const scoped = active.filter(
    (a) => a.scope.includes(input.route.targetDomain) || a.scope.includes("cross-domain"),
  );

  let authority = scoped.find((a) => a.kind === "human");
  if (!authority && input.policyEvaluation.effect === "require-approval") {
    authority = scoped.find((a) => a.kind === "human") ?? scoped.find((a) => a.kind === "delegated");
  }
  if (!authority) authority = scoped.find((a) => a.kind === "autonomous");
  if (!authority) authority = active[0];

  if (!authority || input.policyEvaluation.effect === "deny") {
    return {
      evaluationId: `authority-eval-${input.intent.intentId}`,
      intentId: input.intent.intentId,
      authorityId: authority?.authorityId ?? "none",
      authorized: false,
      level: 0,
      reason: "denied-by-policy-or-missing-authority",
    };
  }

  const requiredLevel =
    input.intent.severity === "critical" ? 5 : input.intent.severity === "high" ? 3 : 2;
  const authorized = authority.level >= requiredLevel || authority.kind === "human";

  return {
    evaluationId: `authority-eval-${input.intent.intentId}`,
    intentId: input.intent.intentId,
    authorityId: authority.authorityId,
    authorized: authorized && input.policyEvaluation.allowed !== false,
    level: authority.level,
    reason: authorized ? `authorized:${authority.kind}` : `insufficient-level:${authority.level}`,
  };
}

export function evaluateCommandAuthorities(input: {
  deploymentId: string;
  intents: CommandIntent[];
  routes: CommandRoute[];
  policyEvaluations: CommandPolicyEvaluation[];
  authorities: CommandAuthority[];
}): CommandAuthorityEvaluation[] {
  return input.intents.map((intent) => {
    const route = input.routes.find((r) => r.intentId === intent.intentId)!;
    const policyEvaluation = input.policyEvaluations.find((e) => e.intentId === intent.intentId)!;
    return evaluateCommandAuthority({
      deploymentId: input.deploymentId,
      intent,
      route,
      policyEvaluation,
      authorities: input.authorities,
    });
  });
}
