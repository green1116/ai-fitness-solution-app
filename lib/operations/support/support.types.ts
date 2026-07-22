/**
 * Post-Launch P6 — Enterprise Support Operations types
 */

import type {
  ENTERPRISE_SUPPORT_MANAGER_STATUSES,
  ENTERPRISE_SUPPORT_READINESS_VERDICTS,
  ESCALATION_ROUTES,
  KNOWLEDGE_ARTICLE_STATUSES,
  OPERATIONS_ENTERPRISE_SUPPORT_BASE,
  OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION,
  OPERATIONS_ENTERPRISE_SUPPORT_ID,
  OPERATIONS_ENTERPRISE_SUPPORT_VERSION,
  SUPPORT_CASE_PRIORITIES,
  SUPPORT_CASE_STATUSES,
  SUPPORT_STEP_STATUSES,
  SUPPORT_WORKFLOW_STEPS,
} from "./support.constants";

export type SupportCasePriority = (typeof SUPPORT_CASE_PRIORITIES)[number];
export type SupportCaseStatus = (typeof SUPPORT_CASE_STATUSES)[number];
export type SupportWorkflowStep = (typeof SUPPORT_WORKFLOW_STEPS)[number];
export type SupportStepStatus = (typeof SUPPORT_STEP_STATUSES)[number];
export type EscalationRoute = (typeof ESCALATION_ROUTES)[number];
export type KnowledgeArticleStatus =
  (typeof KNOWLEDGE_ARTICLE_STATUSES)[number];
export type EnterpriseSupportReadinessVerdict =
  (typeof ENTERPRISE_SUPPORT_READINESS_VERDICTS)[number];
export type EnterpriseSupportManagerStatus =
  (typeof ENTERPRISE_SUPPORT_MANAGER_STATUSES)[number];

export type SupportOpsMetadata = Record<string, unknown>;

/** Support case model. */
export type EnterpriseSupportCase = {
  id: string;
  title: string;
  productId: string;
  supportSlaProfileId: string;
  customerHealthProfileId?: string;
  operationsIncidentId?: string;
  knowledgeArticleId?: string;
  priority: SupportCasePriority;
  status: SupportCaseStatus;
  assignee?: string;
  route?: EscalationRoute;
  detail: string;
  metadata: SupportOpsMetadata;
  openedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
};

export type OpenSupportCaseInput = {
  id?: string;
  title: string;
  productId: string;
  supportSlaProfileId: string;
  customerHealthProfileId?: string;
  operationsIncidentId?: string;
  priority?: SupportCasePriority;
  assignee?: string;
  detail?: string;
  metadata?: SupportOpsMetadata;
};

/** Customer support workflow. */
export type SupportStepRecord = {
  step: SupportWorkflowStep;
  status: SupportStepStatus;
  detail: string;
  completedAt?: string;
};

export type CustomerSupportWorkflow = {
  id: string;
  supportCaseId: string;
  steps: SupportStepRecord[];
  currentStep?: SupportWorkflowStep;
  complete: boolean;
  failed: boolean;
  updatedAt: string;
};

export type StartCustomerSupportWorkflowInput = {
  id?: string;
  supportCaseId: string;
};

/** Escalation routing. */
export type EscalationRoutingDecision = {
  id: string;
  supportCaseId: string;
  fromRoute: EscalationRoute;
  toRoute: EscalationRoute;
  reason: string;
  linkedIncidentId?: string;
  auditEntryId?: string;
  routedAt: string;
};

export type RouteSupportEscalationInput = {
  id?: string;
  supportCaseId: string;
  toRoute: EscalationRoute;
  reason?: string;
  linkIncident?: boolean;
};

/** Knowledge base model. */
export type KnowledgeArticle = {
  id: string;
  title: string;
  productId: string;
  category: string;
  body: string;
  status: KnowledgeArticleStatus;
  tags: string[];
  metadata: SupportOpsMetadata;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export type CreateKnowledgeArticleInput = {
  id?: string;
  title: string;
  productId: string;
  category: string;
  body: string;
  tags?: string[];
  status?: KnowledgeArticleStatus;
  metadata?: SupportOpsMetadata;
};

/** Support metrics. */
export type EnterpriseSupportMetrics = {
  supportSlaProfileId?: string;
  productId?: string;
  caseCount: number;
  openCount: number;
  escalatedCount: number;
  resolvedCount: number;
  closedCount: number;
  workflowCompleteCount: number;
  knowledgePublishedCount: number;
  avgResolutionMinutes?: number;
  routingCount: number;
  supportHealthScore: number;
  computedAt: string;
};

/** Readiness. */
export type EnterpriseSupportReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type EnterpriseSupportReadinessResult = {
  supportCaseId: string;
  verdict: EnterpriseSupportReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: EnterpriseSupportReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type EnterpriseSupportRegistryManifest = {
  enterpriseSupportId: typeof OPERATIONS_ENTERPRISE_SUPPORT_ID;
  version: typeof OPERATIONS_ENTERPRISE_SUPPORT_VERSION;
  freezeVersion: typeof OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION;
  base: typeof OPERATIONS_ENTERPRISE_SUPPORT_BASE;
  caseCount: number;
  workflowCount: number;
  routingCount: number;
  knowledgeCount: number;
};
