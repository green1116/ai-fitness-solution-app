import type {
  AutonomousOperationsCenterRuntimeResult,
} from "../center/types";
import type {
  CommandCenter,
  CommandCenterSnapshot,
  CommandCenterSummary,
  CommandDomain,
  CommandIntent,
  CommandSeverity,
  CommandSource,
} from "./types";
import { DEFAULT_COMMAND_POLICIES } from "./policy";
import { buildDefaultAuthorities } from "./authority";
import type {
  CommandAuthorityEvaluation,
  CommandCoordination,
  CommandDelegation,
  CommandPolicyEvaluation,
  CommandRoute,
} from "./types";
import { evaluateCommandPolicies } from "./policy";
import { resolveCommandRoutes } from "./routing";
import { evaluateCommandAuthorities } from "./authority";
import { delegateCommands } from "./delegation";
import { coordinateCrossDomainCommands } from "./coordination";
import { auditCommands } from "./audit";
import { buildCommandIntelligence } from "./intelligence";

function mapCommandToDomain(target: string): CommandDomain {
  if (target === "execution" || target === "change" || target === "incident" || target === "recovery") {
    return target;
  }
  if (target === "platform") return "platform";
  return "governance";
}

function severityFromPriority(priority: string, riskLevel: string): CommandSeverity {
  if (priority === "critical" || riskLevel === "critical") return "critical";
  if (priority === "high") return "high";
  if (priority === "medium") return "medium";
  return "low";
}

export function buildCommandIntentsFromOperations(input: {
  deploymentId: string;
  operations: AutonomousOperationsCenterRuntimeResult;
}): CommandIntent[] {
  const now = new Date().toISOString();
  const intents: CommandIntent[] = [];

  for (const command of input.operations.commands) {
    const domain = mapCommandToDomain(command.target);
    intents.push({
      intentId: `command-intent-${command.commandId}`,
      name: command.name,
      domain,
      target: domain,
      severity: "medium",
      priority: "medium",
      source: "operations-center",
      riskScore: 40,
      payload: `command=${command.name}`,
      status: "draft",
      createdAt: now,
    });
  }

  for (const rec of input.operations.recommendations) {
    const domain =
      rec.action.includes("incident")
        ? "incident"
        : rec.action.includes("recover")
          ? "recovery"
          : rec.action.includes("change")
            ? "change"
            : rec.action.includes("execution")
              ? "execution"
              : "platform";
    intents.push({
      intentId: `command-intent-rec-${rec.recommendationId}`,
      name: rec.action,
      domain,
      target: domain,
      severity: severityFromPriority(rec.priority, input.operations.risk.level),
      priority: rec.priority === "critical" ? "critical" : rec.priority === "high" ? "high" : "medium",
      source: "operations-center",
      riskScore: input.operations.risk.score,
      payload: rec.rationale,
      status: "draft",
      createdAt: now,
    });
  }

  for (const correlation of input.operations.correlation.correlations) {
    intents.push({
      intentId: `command-intent-corr-${correlation.correlationId}`,
      name: correlation.relationship,
      domain: "cross-domain",
      target: "platform",
      severity: correlation.confidence >= 90 ? "high" : "medium",
      priority: correlation.confidence >= 90 ? "high" : "medium",
      source: "operations-center",
      riskScore: correlation.confidence,
      payload: correlation.reason,
      status: "draft",
      createdAt: now,
    });
  }

  if (input.operations.risk.level === "critical") {
    intents.push({
      intentId: `command-intent-risk-${input.deploymentId}`,
      name: "escalate-platform-risk",
      domain: "platform",
      target: "recovery",
      severity: "critical",
      priority: "critical",
      source: "intelligence",
      riskScore: input.operations.risk.score,
      payload: `risk=${input.operations.risk.level}`,
      status: "draft",
      createdAt: now,
    });
  }

  return intents.slice(0, 12);
}

export function buildCommandCenter(input: {
  deploymentId: string;
  operations: AutonomousOperationsCenterRuntimeResult;
  intents: CommandIntent[];
  policyEvaluations: CommandPolicyEvaluation[];
  routes: CommandRoute[];
  authorityEvaluations: CommandAuthorityEvaluation[];
  delegations: CommandDelegation[];
  coordinations: CommandCoordination[];
  audit: ReturnType<typeof auditCommands>;
  intelligence: ReturnType<typeof buildCommandIntelligence>;
}): CommandCenter {
  const allowedCount = input.policyEvaluations.filter((e) => e.allowed).length;
  const deniedCount = input.policyEvaluations.filter((e) => !e.allowed || e.effect === "deny").length;
  const coordinatedCount = input.coordinations.filter((c) => c.domains.length > 1).length;

  const snapshot: CommandCenterSnapshot = {
    snapshotId: `command-snapshot-${input.deploymentId}`,
    capturedAt: new Date().toISOString(),
    intentCount: input.intents.length,
    allowedCount,
    deniedCount,
    coordinatedCount,
  };

  const summary: CommandCenterSummary = {
    summaryId: `command-center-summary-${input.deploymentId}`,
    text: `intents=${snapshot.intentCount} allowed=${allowedCount} denied=${deniedCount} coordinated=${coordinatedCount} audit=${input.audit.records.length}`,
  };

  return {
    centerId: `autonomous-command-center-${input.deploymentId}`,
    deploymentId: input.deploymentId,
    platformVersion: "V4-A5",
    intents: input.intents,
    policies: DEFAULT_COMMAND_POLICIES,
    routes: input.routes,
    authorities: buildDefaultAuthorities(input.deploymentId),
    delegations: input.delegations,
    coordinations: input.coordinations,
    auditTrail: input.audit,
    intelligence: input.intelligence,
    snapshot,
    summary,
  };
}

export function assembleCommandPipeline(input: {
  deploymentId: string;
  operations: AutonomousOperationsCenterRuntimeResult;
}): {
  intents: CommandIntent[];
  policyEvaluations: CommandPolicyEvaluation[];
  routes: CommandRoute[];
  authorityEvaluations: CommandAuthorityEvaluation[];
  delegations: CommandDelegation[];
  coordinations: CommandCoordination[];
  audit: ReturnType<typeof auditCommands>;
  intelligence: ReturnType<typeof buildCommandIntelligence>;
} {
  const intents = buildCommandIntentsFromOperations({
    deploymentId: input.deploymentId,
    operations: input.operations,
  });
  const policies = DEFAULT_COMMAND_POLICIES;
  const authorities = buildDefaultAuthorities(input.deploymentId);

  const policyEvaluations = evaluateCommandPolicies({
    deploymentId: input.deploymentId,
    intents,
    policies,
  });
  const routes = resolveCommandRoutes({
    deploymentId: input.deploymentId,
    intents,
    policyEvaluations,
  });
  const authorityEvaluations = evaluateCommandAuthorities({
    deploymentId: input.deploymentId,
    intents,
    routes,
    policyEvaluations,
    authorities,
  });
  const delegations = delegateCommands({
    deploymentId: input.deploymentId,
    intents,
    routes,
    authorityEvaluations,
    authorities,
  });
  const coordinations = coordinateCrossDomainCommands({
    deploymentId: input.deploymentId,
    intents,
    routes,
    policyEvaluations,
  });
  const audit = auditCommands({
    deploymentId: input.deploymentId,
    intents,
    policyEvaluations,
    routes,
    authorityEvaluations,
    delegations,
    coordinations,
  });
  const intelligence = buildCommandIntelligence({
    deploymentId: input.deploymentId,
    intents,
    policyEvaluations,
    authorityEvaluations,
    audit,
  });

  return {
    intents,
    policyEvaluations,
    routes,
    authorityEvaluations,
    delegations,
    coordinations,
    audit,
    intelligence,
  };
}
