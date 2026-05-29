import type {
  CommandAuthority,
  CommandAuthorityEvaluation,
  CommandDelegation,
  CommandIntent,
  CommandRoute,
} from "./types";

export function delegateCommand(input: {
  deploymentId: string;
  intent: CommandIntent;
  route: CommandRoute;
  authorityEvaluation: CommandAuthorityEvaluation;
  authorities: CommandAuthority[];
  chainDepth?: number;
}): CommandDelegation | null {
  if (!input.authorityEvaluation.authorized) return null;

  const fromAuthority = input.authorities.find((a) => a.authorityId === input.authorityEvaluation.authorityId);
  const toAgent =
    input.route.targetDomain === "recovery"
      ? "recovery-orchestrator"
      : input.route.targetDomain === "incident"
        ? "incident-responder"
        : input.route.targetDomain === "change"
          ? "change-manager"
          : input.route.targetDomain === "execution"
            ? "execution-engine"
            : "platform-coordinator";

  return {
    delegationId: `delegation-${input.intent.intentId}`,
    intentId: input.intent.intentId,
    fromAuthorityId: input.authorityEvaluation.authorityId,
    toAgent,
    targetDomain: input.route.targetDomain,
    scope: fromAuthority?.scope.join(",") ?? input.route.targetDomain,
    chainDepth: input.chainDepth ?? 1,
    timestamp: new Date().toISOString(),
  };
}

export function delegateCommands(input: {
  deploymentId: string;
  intents: CommandIntent[];
  routes: CommandRoute[];
  authorityEvaluations: CommandAuthorityEvaluation[];
  authorities: CommandAuthority[];
}): CommandDelegation[] {
  const delegations: CommandDelegation[] = [];
  for (const intent of input.intents) {
    const route = input.routes.find((r) => r.intentId === intent.intentId);
    const authorityEvaluation = input.authorityEvaluations.find((e) => e.intentId === intent.intentId);
    if (!route || !authorityEvaluation) continue;
    const delegation = delegateCommand({
      deploymentId: input.deploymentId,
      intent,
      route,
      authorityEvaluation,
      authorities: input.authorities,
    });
    if (delegation) delegations.push(delegation);
  }
  return delegations;
}
