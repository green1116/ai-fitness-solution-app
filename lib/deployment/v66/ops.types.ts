/**
 * V66 P7 — Deployment automation & ops runbook types (read-only)
 */

export const V66_DEPLOYMENT_OPS_VERSION = "v66-deployment-ops-1" as const;

export type AutomationKind = "verify" | "build" | "prisma" | "env-audit" | "declarative";

export type RunbookPhase = "pre-deploy" | "deploy" | "post-deploy" | "incident" | "rollback";

export type RunbookStatus = "pass" | "fail" | "warn" | "na";

export type OperatorRole = "deployer" | "operator" | "oncall" | "security" | "platform";

export type EscalationLevel = "L1" | "L2" | "L3" | "L4";

export type DeploymentOpsSignals = {
  drReady?: boolean;
  automationCatalogComplete?: boolean;
  runbookChecklistPass?: boolean;
  operatorActionsComplete?: boolean;
  escalationMapComplete?: boolean;
};

export type AutomationCatalogEntry = {
  id: string;
  label: string;
  kind: AutomationKind;
  command: string;
  required: boolean;
  phase: RunbookPhase;
  description: string;
};

export type AutomationCatalogManifest = {
  version: typeof V66_DEPLOYMENT_OPS_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  entries: AutomationCatalogEntry[];
  summary: string;
};

export type RunbookChecklistItem = {
  id: string;
  label: string;
  phase: RunbookPhase;
  status: RunbookStatus;
  required: boolean;
  notes?: string;
};

export type RunbookChecklistManifest = {
  version: typeof V66_DEPLOYMENT_OPS_VERSION;
  itemCount: number;
  passCount: number;
  checklistPass: boolean;
  items: RunbookChecklistItem[];
  summary: string;
};

export type OperatorActionEntry = {
  id: string;
  action: string;
  role: OperatorRole;
  phase: RunbookPhase;
  commandRef: string;
  automated: boolean;
  required: boolean;
};

export type OperatorActionsManifest = {
  version: typeof V66_DEPLOYMENT_OPS_VERSION;
  actionCount: number;
  roleCount: number;
  matrixComplete: boolean;
  actions: OperatorActionEntry[];
  summary: string;
};

export type EscalationEntry = {
  id: string;
  level: EscalationLevel;
  trigger: string;
  role: OperatorRole;
  action: string;
  required: boolean;
};

export type EscalationMapManifest = {
  version: typeof V66_DEPLOYMENT_OPS_VERSION;
  entryCount: number;
  levelCount: number;
  mapComplete: boolean;
  entries: EscalationEntry[];
  summary: string;
};

export type DeploymentOpsReport = {
  version: typeof V66_DEPLOYMENT_OPS_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  drVersion: string;
  drReady: boolean;
  automationCatalog: AutomationCatalogManifest;
  runbookChecklist: RunbookChecklistManifest;
  operatorActions: OperatorActionsManifest;
  escalationMap: EscalationMapManifest;
  opsReady: boolean;
  readinessScore: number;
  summary: string;
};
