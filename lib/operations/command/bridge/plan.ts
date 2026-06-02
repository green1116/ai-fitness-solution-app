import type {
  AutonomousCommandRuntimeResult,
  CommandCoordination,
  CommandDelegation,
  CommandIntent,
  CommandPolicyEvaluation,
  CommandRoute,
} from "../types";
import type { CommandExecutionMode, CommandExecutionPlan, CommandExecutionTarget } from "./types";

function resolveMode(input: {
  intent: CommandIntent;
  route: CommandRoute;
  coordination: CommandCoordination | undefined;
  policyEvaluation: CommandPolicyEvaluation;
}): CommandExecutionMode {
  if (input.policyEvaluation.effect === "deny") return "single-domain";
  if (input.coordination && input.coordination.domains.length > 1) {
    if (input.coordination.status === "blocked") return "coordinated";
    if (input.route.escalate) return "staged";
    return "multi-domain";
  }
  if (input.route.escalate || input.intent.severity === "critical") return "rollback-capable";
  if (input.coordination?.domains.length && input.coordination.domains.length > 1) return "coordinated";
  return "single-domain";
}

function domainTargetsForIntent(input: {
  intent: CommandIntent;
  route: CommandRoute;
  coordination: CommandCoordination | undefined;
  executionRuntimeId: string;
  changeRuntimeId: string;
  incidentRuntimeId: string;
  recoveryRuntimeId: string;
}): CommandExecutionTarget[] {
  const domains =
    input.coordination && input.coordination.domains.length > 1
      ? input.coordination.domains.filter(
          (d): d is CommandExecutionTarget["domain"] =>
            d === "execution" || d === "change" || d === "incident" || d === "recovery",
        )
      : [input.route.targetDomain].filter(
          (d): d is CommandExecutionTarget["domain"] =>
            d === "execution" || d === "change" || d === "incident" || d === "recovery",
        );

  const runtimeRefByDomain: Record<CommandExecutionTarget["domain"], string> = {
    execution: input.executionRuntimeId,
    change: input.changeRuntimeId,
    incident: input.incidentRuntimeId,
    recovery: input.recoveryRuntimeId,
  };

  return domains.map((domain, stage) => ({
    targetId: `target-${input.intent.intentId}-${domain}`,
    intentId: input.intent.intentId,
    domain,
    runtimeRef: runtimeRefByDomain[domain],
    entityRef: `entity-${domain}-${input.intent.intentId}`,
    priority: input.intent.priority,
    stage,
  }));
}

export function buildCommandExecutionPlan(input: {
  deploymentId: string;
  intent: CommandIntent;
  route: CommandRoute;
  policyEvaluation: CommandPolicyEvaluation;
  authorityAuthorized: boolean;
  delegation: CommandDelegation | null;
  coordination: CommandCoordination | undefined;
  executionRuntimeId: string;
  changeRuntimeId: string;
  incidentRuntimeId: string;
  recoveryRuntimeId: string;
}): CommandExecutionPlan | null {
  if (!input.authorityAuthorized || input.policyEvaluation.effect === "deny") {
    return null;
  }
  if (!input.delegation && input.policyEvaluation.effect === "require-approval") {
    return null;
  }

  const mode = resolveMode({
    intent: input.intent,
    route: input.route,
    coordination: input.coordination,
    policyEvaluation: input.policyEvaluation,
  });

  const targets = domainTargetsForIntent({
    intent: input.intent,
    route: input.route,
    coordination: input.coordination,
    executionRuntimeId: input.executionRuntimeId,
    changeRuntimeId: input.changeRuntimeId,
    incidentRuntimeId: input.incidentRuntimeId,
    recoveryRuntimeId: input.recoveryRuntimeId,
  });

  if (targets.length === 0) return null;

  const coordinated = mode === "coordinated" || mode === "multi-domain";
  const staged = mode === "staged" || targets.length > 1;
  const rollbackCapable = mode === "rollback-capable" || input.intent.severity === "critical";

  return {
    planId: `exec-plan-${input.intent.intentId}`,
    intentId: input.intent.intentId,
    mode,
    targets,
    coordinated,
    staged,
    rollbackCapable,
    status: "planned",
  };
}

export function buildCommandExecutionPlans(input: {
  deploymentId: string;
  command: AutonomousCommandRuntimeResult;
  executionRuntimeId: string;
  changeRuntimeId: string;
  incidentRuntimeId: string;
  recoveryRuntimeId: string;
}): CommandExecutionPlan[] {
  const plans: CommandExecutionPlan[] = [];

  for (const intent of input.command.intents) {
    const route = input.command.routes.find((r) => r.intentId === intent.intentId);
    const policyEvaluation = input.command.policyEvaluations.find((e) => e.intentId === intent.intentId);
    const authorityEvaluation = input.command.authorityEvaluations.find((e) => e.intentId === intent.intentId);
    const delegation = input.command.delegations.find((d) => d.intentId === intent.intentId) ?? null;
    const coordination = input.command.coordinations.find((c) => c.intentId === intent.intentId);

    if (!route || !policyEvaluation || !authorityEvaluation) continue;

    const plan = buildCommandExecutionPlan({
      deploymentId: input.deploymentId,
      intent,
      route,
      policyEvaluation,
      authorityAuthorized: authorityEvaluation.authorized,
      delegation,
      coordination,
      executionRuntimeId: input.executionRuntimeId,
      changeRuntimeId: input.changeRuntimeId,
      incidentRuntimeId: input.incidentRuntimeId,
      recoveryRuntimeId: input.recoveryRuntimeId,
    });

    if (plan) plans.push(plan);
  }

  return plans;
}
