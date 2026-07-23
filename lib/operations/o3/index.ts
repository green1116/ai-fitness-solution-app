/**
 * Operations O3 — Support Operations public exports
 * Isolated namespace: lib/operations/o3
 */

export {
  KNOWLEDGE_CATEGORIES,
  O3_MANAGER_STATUSES,
  O3_READINESS_VERDICTS,
  OPERATIONS_O3_SUPPORT_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_BASE,
  OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_ID,
  OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION,
  RESOLUTION_OUTCOMES,
  SLA_TARGETS,
  SUPPORT_WORKFLOW_STAGES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "./ticket/ticket.constants";

export type {
  RegisterTicketInput,
  SupportTicket,
  TicketMetadata,
  TicketPriority,
  TicketStatus,
  UpdateTicketStatusInput,
} from "./ticket/ticket.types";

export {
  clearTickets,
  getTicket,
  listTickets,
  registerTicket,
} from "./ticket/ticket.registry";

export {
  clearTicketStatuses,
  getTicketStatus,
  listTicketStatuses,
  updateTicketStatus,
} from "./ticket/ticket.status";

export type {
  AdvanceSupportWorkflowInput,
  AssignSupportInput,
  SupportAssignment,
  SupportMetadata,
  SupportWorkflow,
  SupportWorkflowStage,
} from "./support/support.types";

export {
  advanceSupportWorkflow,
  clearSupportWorkflows,
  getSupportWorkflow,
  listSupportWorkflows,
} from "./support/support.workflow";

export {
  assignSupport,
  clearSupportAssignments,
  getSupportAssignment,
  listSupportAssignments,
} from "./support/support.assignment";

export type {
  IndexKnowledgeArticleInput,
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeIndexEntry,
  KnowledgeMetadata,
  PublishKnowledgeArticleInput,
} from "./knowledge/knowledge.types";

export {
  clearKnowledgeArticles,
  getKnowledgeArticle,
  listKnowledgeArticles,
  publishKnowledgeArticle,
} from "./knowledge/knowledge.article";

export {
  clearKnowledgeIndex,
  getKnowledgeIndexEntry,
  indexKnowledgeArticle,
  listKnowledgeIndex,
} from "./knowledge/knowledge.index";

export type {
  MeasureSlaMetricsInput,
  RegisterSlaPolicyInput,
  SlaMetadata,
  SlaMetrics,
  SlaPolicy,
  SlaPriority,
  SlaTarget,
} from "./sla/sla.types";

export {
  clearSlaPolicies,
  getSlaPolicy,
  listSlaPolicies,
  registerSlaPolicy,
} from "./sla/sla.policy";

export {
  clearSlaMetrics,
  getSlaMetrics,
  listSlaMetrics,
  measureSlaMetrics,
} from "./sla/sla.metrics";

export type {
  GenerateResolutionReportInput,
  O3ManagerStatus,
  O3ReadinessCheck,
  O3ReadinessResult,
  O3ReadinessVerdict,
  O3RegistryManifest,
  ResolutionMetadata,
  ResolutionOutcome,
  ResolutionTracking,
  SupportResolutionReport,
  TrackResolutionInput,
} from "./resolution/resolution.types";

export {
  clearResolutions,
  getResolution,
  listResolutions,
  trackResolution,
} from "./resolution/resolution.tracking";

export {
  clearResolutionReports,
  generateResolutionReport,
  getResolutionReport,
  listResolutionReports,
} from "./resolution/resolution.report";

export {
  assertO3SupportOperationsReadinessReady,
  evaluateO3SupportOperationsReadiness,
} from "./resolution/resolution.readiness";

export {
  clearO3SupportOperationsLayer,
  createO3SupportOperationsManager,
  getO3RegistryManifest,
  type O3SupportOperationsManager,
  type O3SupportOperationsManagerSnapshot,
} from "./support.manager";

export {
  assertOperationsO3ReleaseGatePass,
  checkOperationsO3ReleaseGate,
  OPERATIONS_O3_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/operations.release.gate";
