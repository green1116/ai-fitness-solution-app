import type {
  CommandCoordination,
  CommandDomain,
  CommandIntent,
  CommandPolicyEvaluation,
  CommandRoute,
} from "./types";

function domainsForIntent(intent: CommandIntent, route: CommandRoute): CommandDomain[] {
  if (intent.domain === "cross-domain" || route.escalate) {
    const set = new Set<CommandDomain>([route.targetDomain]);
    if (route.fallbackDomain) set.add(route.fallbackDomain);
    if (intent.target !== route.targetDomain) set.add(intent.target);
    set.add("platform");
    return [...set];
  }
  return [route.targetDomain];
}

export function coordinateCrossDomainCommand(input: {
  deploymentId: string;
  intent: CommandIntent;
  route: CommandRoute;
  policyEvaluation: CommandPolicyEvaluation;
}): CommandCoordination {
  const domains = domainsForIntent(input.intent, input.route);
  const needsCoordination =
    input.policyEvaluation.effect === "require-coordination" ||
    domains.length > 1 ||
    input.route.escalate;

  const barriers = domains.slice(0, -1).map((domain, index) => ({
    barrierId: `barrier-${input.intent.intentId}-${index}`,
    waitingFor: [domain],
    satisfied: !needsCoordination || index === 0,
  }));

  const dependencies =
    domains.length > 1
      ? domains.slice(0, -1).map((d, i) => `${d}->${domains[i + 1]}`)
      : [];

  let status: CommandCoordination["status"] = "pending";
  if (!needsCoordination) status = "complete";
  else if (input.policyEvaluation.allowed) status = "in-progress";
  else status = "blocked";

  return {
    coordinationId: `coordination-${input.intent.intentId}`,
    intentId: input.intent.intentId,
    domains,
    barriers,
    dependencies,
    handoffTo: domains[domains.length - 1],
    synchronized: status === "complete" || status === "in-progress",
    status,
  };
}

export function coordinateCrossDomainCommands(input: {
  deploymentId: string;
  intents: CommandIntent[];
  routes: CommandRoute[];
  policyEvaluations: CommandPolicyEvaluation[];
}): CommandCoordination[] {
  return input.intents.map((intent) => {
    const route = input.routes.find((r) => r.intentId === intent.intentId)!;
    const policyEvaluation = input.policyEvaluations.find((e) => e.intentId === intent.intentId)!;
    return coordinateCrossDomainCommand({
      deploymentId: input.deploymentId,
      intent,
      route,
      policyEvaluation,
    });
  });
}
