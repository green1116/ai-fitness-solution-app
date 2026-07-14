/**
 * E04-P4 — Business Decision Runtime types
 * Decision layer above E04 Process Orchestration
 */

import {
  E04_DECISION_BASE,
  E04_DECISION_FREEZE_VERSION,
  E04_DECISION_RUNTIME_ID,
  E04_DECISION_VERSION,
  DECISION_OUTCOMES,
  DECISION_POLICY_OPS,
  DECISION_TRACE_EVENT_KINDS,
} from "./decision.constants";

export type DecisionOutcome = (typeof DECISION_OUTCOMES)[number];
export type DecisionPolicyOp = (typeof DECISION_POLICY_OPS)[number];
export type DecisionTraceEventKind =
  (typeof DECISION_TRACE_EVENT_KINDS)[number];

export type DecisionFacts = Readonly<Record<string, unknown>>;

export type DecisionPolicyCondition = {
  field: string;
  op: DecisionPolicyOp;
  value?: unknown;
  readOnly: true;
};

export type DecisionPolicyRule = {
  id: string;
  name: string;
  description: string;
  /** If all conditions match, emit this outcome weight */
  conditions: DecisionPolicyCondition[];
  onMatch: DecisionOutcome;
  priority: number;
  readOnly: true;
};

export type DecisionDefinition = {
  id: string;
  name: string;
  description: string;
  /** Bound E04 process id executed when outcome requires process run */
  processId: string;
  /** Outcomes that trigger process execution */
  runProcessOn: DecisionOutcome[];
  defaultOutcome: DecisionOutcome;
  policyIds: string[];
  optional: boolean;
  readOnly: true;
};

export type DecisionPolicyEvaluation = {
  policyId: string;
  matched: boolean;
  outcome?: DecisionOutcome;
  failedFields: string[];
  readOnly: true;
};

export type DecisionEvaluationResult = {
  decisionId: string;
  outcome: DecisionOutcome;
  matchedPolicyId?: string;
  evaluations: DecisionPolicyEvaluation[];
  facts: DecisionFacts;
  readOnly: true;
};

export type DecisionRegistryManifest = {
  runtimeId: typeof E04_DECISION_RUNTIME_ID;
  version: typeof E04_DECISION_VERSION;
  freezeVersion: typeof E04_DECISION_FREEZE_VERSION;
  base: typeof E04_DECISION_BASE;
  decisionCount: number;
  policyCount: number;
  decisions: DecisionDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type DecisionExecutionResult = {
  success: boolean;
  decisionId: string;
  executionId: string;
  taskId: string;
  traceId: string;
  outcome: DecisionOutcome;
  evaluation: DecisionEvaluationResult;
  processInstanceId?: string;
  processOutput?: Readonly<Record<string, unknown>>;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};
