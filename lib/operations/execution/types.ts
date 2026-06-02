import type { GovernanceAutonomousRuntimeResult } from "../governance/autonomous/autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../governance/intelligence/intelligence-types";

export const OPERATIONAL_AUTONOMOUS_EXECUTION_RUNTIME_VERSION =
  "v4-a4-a1-operational-autonomous-execution-runtime-1" as const;
export type OperationalAutonomousExecutionRuntimeVersion =
  typeof OPERATIONAL_AUTONOMOUS_EXECUTION_RUNTIME_VERSION;

export type ExecutionRunMode = "simulation" | "dry-run" | "live-run";
export type ExecutionIntent = "observe" | "remediate" | "optimize" | "recover" | "change";
export type ExecutionPriority = "low" | "medium" | "high" | "critical";
export type ExecutionScope = "local" | "domain" | "federation" | "platform";
export type ExecutionOwner = "system" | "operator" | "autonomous-agent";
export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "blocked" | "rolled_back";

export type ExecutionWindow = {
  windowId: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
};

export type ExecutionAction = {
  actionId: string;
  name: string;
  category: "change" | "recovery" | "optimization" | "remediation";
  reversible: boolean;
};

export type ExecutionCandidate = {
  candidateId: string;
  action: ExecutionAction;
  intent: ExecutionIntent;
  priority: ExecutionPriority;
  scope: ExecutionScope;
  owner: ExecutionOwner;
  window: ExecutionWindow;
  sourceProposalId?: string;
  approved: boolean;
};

export type ExecutionDependency = {
  dependencyId: string;
  fromStepId: string;
  toStepId: string;
  relation: "requires" | "blocks";
};

export type ExecutionStep = {
  stepId: string;
  sequence: number;
  candidateId: string;
  action: ExecutionAction;
  dependencies: string[];
  status: ExecutionStatus;
};

export type ExecutionPlan = {
  planId: string;
  deploymentId: string;
  mode: ExecutionRunMode;
  steps: ExecutionStep[];
  dependencies: ExecutionDependency[];
  sequence: number[];
  staged: boolean;
};

export type SafetyCheck = { checkId: string; name: string; passed: boolean; detail: string };
export type PolicyCheck = { checkId: string; policyId: string; passed: boolean; detail: string };
export type RiskCheck = { checkId: string; riskLevel: "low" | "medium" | "high" | "critical"; passed: boolean; detail: string };
export type RollbackCheck = { checkId: string; rollbackReady: boolean; detail: string };

export type ExecutionApproval = {
  approvalId: string;
  approved: boolean;
  mode: ExecutionRunMode;
  checksPassed: number;
  timestamp: string;
};

export type ExecutionBlockReason = {
  reasonId: string;
  code: "policy" | "risk" | "approval" | "rollback" | "safety";
  message: string;
};

export type ExecutionSafetyGateResult = {
  gateId: string;
  safetyChecks: SafetyCheck[];
  policyChecks: PolicyCheck[];
  riskChecks: RiskCheck[];
  rollbackChecks: RollbackCheck[];
  approval: ExecutionApproval;
  blockReasons: ExecutionBlockReason[];
  allowed: boolean;
};

export type ExecutionStepOutcome = {
  stepId: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt: string;
  message: string;
};

export type ExecutionEngineResult = {
  engineId: string;
  mode: ExecutionRunMode;
  planId: string;
  outcomes: ExecutionStepOutcome[];
  executed: boolean;
  simulated: boolean;
};

export type RollbackStep = {
  stepId: string;
  order: number;
  action: string;
  status: ExecutionStatus;
};

export type RollbackPlan = {
  planId: string;
  triggerStepId: string;
  mode: "automatic" | "manual" | "partial";
  steps: RollbackStep[];
};

export type RollbackResult = {
  resultId: string;
  planId: string;
  success: boolean;
  partial: boolean;
  stepsCompleted: number;
  message: string;
};

export type ExecutionRecord = {
  recordId: string;
  planId: string;
  mode: ExecutionRunMode;
  status: ExecutionStatus;
  timestamp: string;
};

export type ExecutionTrace = {
  traceId: string;
  events: { event: string; detail: string; timestamp: string }[];
};

export type ExecutionOutcome = {
  outcomeId: string;
  planId: string;
  success: boolean;
  stepsSucceeded: number;
  stepsFailed: number;
};

export type ExecutionEvidence = {
  evidenceId: string;
  planId: string;
  artifacts: string[];
};

export type ExecutionAuditBundle = {
  records: ExecutionRecord[];
  trace: ExecutionTrace;
  outcome: ExecutionOutcome;
  evidence: ExecutionEvidence;
};

export type ExecutionMetrics = {
  metricsId: string;
  executions: number;
  successes: number;
  failures: number;
  rollbacks: number;
  blocked: number;
  successRate: number;
};

export type ExecutionSummary = {
  summaryId: string;
  text: string;
};

export type ExecutionHealth = {
  healthId: string;
  score: number;
  status: "healthy" | "degraded" | "critical";
};

export type ExecutionEfficiency = {
  efficiencyId: string;
  throughput: number;
  avgStepDurationMs: number;
};

export type ExecutionReport = {
  reportId: string;
  summary: ExecutionSummary;
  health: ExecutionHealth;
  efficiency: ExecutionEfficiency;
};

export type OperationalAutonomousLoopPhase =
  | "observe"
  | "analyze"
  | "predict"
  | "recommend"
  | "plan"
  | "approve"
  | "execute";

export type OperationalAutonomousLoopState = {
  loopId: string;
  phases: OperationalAutonomousLoopPhase[];
  currentPhase: OperationalAutonomousLoopPhase;
  closed: boolean;
};

export type OperationalAutonomousExecutionRuntimeInput = {
  deploymentId: string;
  mode?: ExecutionRunMode;
  autonomous: GovernanceAutonomousRuntimeResult;
  intelligence?: GovernanceIntelligenceRuntimeResult;
};

export type OperationalAutonomousExecutionRuntimeResult = {
  version: OperationalAutonomousExecutionRuntimeVersion;
  registry: { executionRuntimeId: string; candidateCount: number };
  loop: OperationalAutonomousLoopState;
  candidates: ExecutionCandidate[];
  plan: ExecutionPlan;
  safetyGate: ExecutionSafetyGateResult;
  engine: ExecutionEngineResult;
  rollback: { plan: RollbackPlan; result: RollbackResult | null };
  audit: ExecutionAuditBundle;
  metrics: ExecutionMetrics;
  report: ExecutionReport;
  flags: {
    execution: boolean;
    safety: boolean;
    rollback: boolean;
    audit: boolean;
    metrics: boolean;
    reporting: boolean;
  };
  summary: { summaryId: string; text: string; traceId: string };
  status: ExecutionStatus;
};
