/**
 * V67 P2 — Incident lifecycle domain types (read-only)
 */

export const V67_INCIDENT_LIFECYCLE_VERSION = "v67-incident-lifecycle-1" as const;

export type IncidentLifecycleState =
  | "triggered"
  | "open"
  | "acknowledged"
  | "escalated"
  | "mitigating"
  | "resolved"
  | "postmortem"
  | "closed";

export type AlertLifecycleState =
  | "firing"
  | "acknowledged"
  | "silenced"
  | "resolved";

export type LifecycleAction =
  | "trigger"
  | "acknowledge"
  | "escalate"
  | "mitigate"
  | "resolve"
  | "postmortem"
  | "close"
  | "silence";

export type IncidentType =
  | "availability"
  | "latency"
  | "error-rate"
  | "security"
  | "deployment"
  | "slo-breach"
  | "manual";

export type EscalationStage = "none" | "l1" | "l2" | "l3" | "executive";

export type PostmortemStatus = "pending" | "draft" | "published" | "na";

export type IncidentLifecycleSignals = {
  foundationReady?: boolean;
  stateMachineComplete?: boolean;
  transitionRulesComplete?: boolean;
};

export type IncidentStateDefinition = {
  id: string;
  state: IncidentLifecycleState;
  terminal: boolean;
  required: boolean;
  description: string;
};

export type IncidentStateManifest = {
  version: typeof V67_INCIDENT_LIFECYCLE_VERSION;
  stateCount: number;
  terminalCount: number;
  machineComplete: boolean;
  states: IncidentStateDefinition[];
  summary: string;
};

export type TransitionRule = {
  id: string;
  from: IncidentLifecycleState;
  to: IncidentLifecycleState;
  action: LifecycleAction;
  required: boolean;
  allowedRoles: string[];
  notes?: string;
};

export type TransitionRuleManifest = {
  version: typeof V67_INCIDENT_LIFECYCLE_VERSION;
  ruleCount: number;
  actionCount: number;
  rulesComplete: boolean;
  rules: TransitionRule[];
  summary: string;
};

export type IncidentLifecycleSnapshot = {
  incidentId: string;
  type: IncidentType;
  state: IncidentLifecycleState;
  escalation: EscalationStage;
  alertState: AlertLifecycleState;
  postmortem: PostmortemStatus;
  acknowledged: boolean;
  resolved: boolean;
};

export type IncidentLifecycleReport = {
  version: typeof V67_INCIDENT_LIFECYCLE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  foundationVersion: string;
  foundationReady: boolean;
  stateMachine: IncidentStateManifest;
  transitionRules: TransitionRuleManifest;
  sampleLifecycle: IncidentLifecycleSnapshot[];
  lifecycleReady: boolean;
  readinessScore: number;
  summary: string;
};
