import type {
  CommandAuditRecord,
  CommandAuditTrail,
  CommandAuthorityEvaluation,
  CommandCoordination,
  CommandDelegation,
  CommandIntent,
  CommandPolicyEvaluation,
  CommandRoute,
} from "./types";

export function auditCommand(input: {
  deploymentId: string;
  intent: CommandIntent;
  policyEvaluation: CommandPolicyEvaluation;
  route: CommandRoute;
  authorityEvaluation: CommandAuthorityEvaluation;
  delegation: CommandDelegation | null;
  coordination: CommandCoordination;
}): CommandAuditRecord[] {
  const now = new Date().toISOString();
  return [
    {
      recordId: `audit-policy-${input.intent.intentId}`,
      intentId: input.intent.intentId,
      phase: "policy",
      detail: `${input.policyEvaluation.effect} allowed=${input.policyEvaluation.allowed}`,
      outcome: input.policyEvaluation.allowed ? "pass" : "fail",
      timestamp: now,
    },
    {
      recordId: `audit-route-${input.intent.intentId}`,
      intentId: input.intent.intentId,
      phase: "route",
      detail: `target=${input.route.targetDomain} escalate=${input.route.escalate}`,
      outcome: "pass",
      timestamp: now,
    },
    {
      recordId: `audit-authority-${input.intent.intentId}`,
      intentId: input.intent.intentId,
      phase: "authority",
      detail: `authorized=${input.authorityEvaluation.authorized} level=${input.authorityEvaluation.level}`,
      outcome: input.authorityEvaluation.authorized ? "pass" : "fail",
      timestamp: now,
    },
    {
      recordId: `audit-delegation-${input.intent.intentId}`,
      intentId: input.intent.intentId,
      phase: "delegation",
      detail: input.delegation
        ? `agent=${input.delegation.toAgent} depth=${input.delegation.chainDepth}`
        : "not-delegated",
      outcome: input.delegation ? "pass" : "skip",
      timestamp: now,
    },
    {
      recordId: `audit-coordination-${input.intent.intentId}`,
      intentId: input.intent.intentId,
      phase: "coordination",
      detail: `domains=${input.coordination.domains.join(",")} status=${input.coordination.status}`,
      outcome: input.coordination.status === "blocked" ? "fail" : "pass",
      timestamp: now,
    },
    {
      recordId: `audit-execution-${input.intent.intentId}`,
      intentId: input.intent.intentId,
      phase: "execution",
      detail: `payload=${input.intent.payload}`,
      outcome:
        input.authorityEvaluation.authorized && input.policyEvaluation.effect !== "deny" ? "pass" : "fail",
      timestamp: now,
    },
  ];
}

export function auditCommands(input: {
  deploymentId: string;
  intents: CommandIntent[];
  policyEvaluations: CommandPolicyEvaluation[];
  routes: CommandRoute[];
  authorityEvaluations: CommandAuthorityEvaluation[];
  delegations: CommandDelegation[];
  coordinations: CommandCoordination[];
}): CommandAuditTrail {
  const records: CommandAuditRecord[] = [];

  for (const intent of input.intents) {
    const policyEvaluation = input.policyEvaluations.find((e) => e.intentId === intent.intentId)!;
    const route = input.routes.find((r) => r.intentId === intent.intentId)!;
    const authorityEvaluation = input.authorityEvaluations.find((e) => e.intentId === intent.intentId)!;
    const delegation = input.delegations.find((d) => d.intentId === intent.intentId) ?? null;
    const coordination = input.coordinations.find((c) => c.intentId === intent.intentId)!;

    records.push(
      ...auditCommand({
        deploymentId: input.deploymentId,
        intent,
        policyEvaluation,
        route,
        authorityEvaluation,
        delegation,
        coordination,
      }),
    );
  }

  const passCount = records.filter((r) => r.outcome === "pass").length;
  const failCount = records.filter((r) => r.outcome === "fail").length;

  return {
    trailId: `command-audit-trail-${input.deploymentId}`,
    records,
    summary: `records=${records.length} pass=${passCount} fail=${failCount}`,
  };
}
