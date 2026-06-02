import type { AutonomousOperationsCenterRuntimeResult } from "../center/types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../incident/types";
import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../recovery/types";

export const AUTONOMOUS_COMMAND_PLATFORM_VERSION = "v4-a5-autonomous-command-platform-1" as const;
export type AutonomousCommandPlatformVersion = typeof AUTONOMOUS_COMMAND_PLATFORM_VERSION;

export type CommandDomain = "execution" | "change" | "incident" | "recovery" | "governance" | "platform" | "cross-domain";
export type CommandSeverity = "low" | "medium" | "high" | "critical";
export type CommandSource = "operations-center" | "governance" | "intelligence" | "human" | "autonomous-agent";
export type CommandTarget = CommandDomain;
export type CommandStatus = "draft" | "policy-evaluated" | "routed" | "authorized" | "delegated" | "coordinated" | "executing" | "completed" | "denied" | "failed";
export type PolicyEffect = "deny" | "allow" | "require-approval" | "require-coordination";
export type AuthorityKind = "autonomous" | "delegated" | "human";
export type CommandPriority = "low" | "medium" | "high" | "critical";

export type CommandIntent = {
  intentId: string;
  name: string;
  domain: CommandDomain;
  target: CommandTarget;
  severity: CommandSeverity;
  priority: CommandPriority;
  source: CommandSource;
  riskScore: number;
  payload: string;
  status: CommandStatus;
  createdAt: string;
};

export type CommandPolicy = {
  policyId: string;
  name: string;
  domain: CommandDomain | "*";
  minSeverity: CommandSeverity;
  effect: PolicyEffect;
  requiresCoordination: boolean;
  enabled: boolean;
};

export type CommandPolicyEvaluation = {
  evaluationId: string;
  intentId: string;
  policyId: string;
  effect: PolicyEffect;
  allowed: boolean;
  reason: string;
};

export type CommandRoute = {
  routeId: string;
  intentId: string;
  targetDomain: CommandDomain;
  priority: CommandPriority;
  fallbackDomain?: CommandDomain;
  escalate: boolean;
};

export type CommandAuthority = {
  authorityId: string;
  kind: AuthorityKind;
  level: number;
  scope: CommandDomain[];
  issuer: string;
  validFrom: string;
  validUntil: string;
  revoked: boolean;
};

export type CommandAuthorityEvaluation = {
  evaluationId: string;
  intentId: string;
  authorityId: string;
  authorized: boolean;
  level: number;
  reason: string;
};

export type CommandDelegation = {
  delegationId: string;
  intentId: string;
  fromAuthorityId: string;
  toAgent: string;
  targetDomain: CommandDomain;
  scope: string;
  chainDepth: number;
  timestamp: string;
};

export type CommandCoordinationBarrier = {
  barrierId: string;
  waitingFor: CommandDomain[];
  satisfied: boolean;
};

export type CommandCoordination = {
  coordinationId: string;
  intentId: string;
  domains: CommandDomain[];
  barriers: CommandCoordinationBarrier[];
  dependencies: string[];
  handoffTo?: CommandDomain;
  synchronized: boolean;
  status: "pending" | "in-progress" | "complete" | "blocked";
};

export type CommandAuditRecord = {
  recordId: string;
  intentId: string;
  phase: "policy" | "route" | "authority" | "delegation" | "coordination" | "execution";
  detail: string;
  outcome: "pass" | "fail" | "skip";
  timestamp: string;
};

export type CommandAuditTrail = {
  trailId: string;
  records: CommandAuditRecord[];
  summary: string;
};

export type CommandIntelligenceProfile = {
  profileId: string;
  totalIntents: number;
  highFrequencyCommands: string[];
  conflictCommands: string[];
  duplicateCommands: number;
  unauthorizedAttempts: number;
  inefficientCommands: number;
  trend: "stable" | "increasing" | "decreasing";
  summary: string;
};

export type CommandCenterSnapshot = {
  snapshotId: string;
  capturedAt: string;
  intentCount: number;
  allowedCount: number;
  deniedCount: number;
  coordinatedCount: number;
};

export type CommandCenterSummary = {
  summaryId: string;
  text: string;
};

export type CommandCenter = {
  centerId: string;
  deploymentId: string;
  platformVersion: "V4-A5";
  intents: CommandIntent[];
  policies: CommandPolicy[];
  routes: CommandRoute[];
  authorities: CommandAuthority[];
  delegations: CommandDelegation[];
  coordinations: CommandCoordination[];
  auditTrail: CommandAuditTrail;
  intelligence: CommandIntelligenceProfile;
  snapshot: CommandCenterSnapshot;
  summary: CommandCenterSummary;
};

export type AutonomousCommandRuntimeInput = {
  deploymentId: string;
  operations: AutonomousOperationsCenterRuntimeResult;
  execution: OperationalAutonomousExecutionRuntimeResult;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
};

export type AutonomousCommandRuntimeResult = {
  version: AutonomousCommandPlatformVersion;
  center: CommandCenter;
  intents: CommandIntent[];
  policyEvaluations: CommandPolicyEvaluation[];
  routes: CommandRoute[];
  authorityEvaluations: CommandAuthorityEvaluation[];
  delegations: CommandDelegation[];
  coordinations: CommandCoordination[];
  audit: CommandAuditTrail;
  intelligence: CommandIntelligenceProfile;
  loop: {
    phases: string[];
    currentPhase: string;
    closed: boolean;
  };
  flags: {
    commandCenter: boolean;
    policy: boolean;
    routing: boolean;
    authority: boolean;
    delegation: boolean;
    coordination: boolean;
    audit: boolean;
    intelligence: boolean;
  };
  summary: { summaryId: string; text: string; traceId: string };
  status: CommandStatus;
};
