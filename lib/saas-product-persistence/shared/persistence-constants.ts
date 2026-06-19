export const SAAS_PRODUCT_PERSISTENCE_P1_TAG = "v50-production-persistence-p1" as const;
export const SAAS_PRODUCT_PERSISTENCE_P2_TAG = "v50-production-persistence-p2" as const;
export const SAAS_PRODUCT_PERSISTENCE_P3_TAG = "v50-production-persistence-p3" as const;
export const SAAS_PRODUCT_PERSISTENCE_P4_TAG = "v50-production-persistence-p4" as const;
export const SAAS_PRODUCT_PERSISTENCE_P5_TAG = "v50-production-persistence-p5" as const;
export const SAAS_PRODUCT_PERSISTENCE_P6_TAG = "v50-production-persistence-p6" as const;
export const SAAS_PRODUCT_PERSISTENCE_P7_TAG = "v50-production-persistence-p7" as const;
export const SAAS_PRODUCT_PERSISTENCE_P8_TAG = "v50-production-persistence-p8" as const;
export const SAAS_PRODUCT_PERSISTENCE_FINAL_TAG = "v50-production-persistence-final" as const;

export const PERSISTENCE_BACKEND_ENV_KEY = "SAAS_PRODUCT_PERSISTENCE_BACKEND" as const;

export const PERSISTENCE_BACKENDS = ["memory", "prisma"] as const;

export const PERSISTENCE_WORKFLOW_TYPES = ["QUOTE"] as const;

export const PERSISTENCE_WORKSPACE_STATUSES = ["ACTIVE", "ARCHIVED"] as const;

export const PERSISTENCE_QUOTE_STATUSES = ["DRAFT", "APPROVED", "REJECTED", "ARCHIVED"] as const;

export const PERSISTENCE_WORKFLOW_STATES = ["CREATED", "APPROVED", "REJECTED"] as const;

export const PERSISTENCE_EVENT_TYPES = ["WORKFLOW_CREATED", "STATE_CHANGED", "WORKFLOW_RELEASED"] as const;

export const PERSISTENCE_TABLES = [
  "saas_product_workspace",
  "saas_product_quote",
  "saas_product_workflow_instance",
  "saas_product_workflow_history",
  "saas_product_workflow_event",
] as const;

export const QUOTE_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["APPROVED", "REJECTED", "ARCHIVED"],
  APPROVED: ["ARCHIVED"],
  REJECTED: ["ARCHIVED"],
  ARCHIVED: [],
};

export const WORKFLOW_STATE_TRANSITIONS: Record<string, string[]> = {
  CREATED: ["APPROVED", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
};

export const PERSISTENCE_REPOSITORY_NAMES = [
  "WorkspaceRepository",
  "QuoteRepository",
  "WorkflowRepository",
  "WorkflowHistoryRepository",
  "WorkflowEventRepository",
] as const;

export const PERSISTENCE_WORKSPACE_RUNTIME_OPERATIONS = [
  "createWorkspacePersisted",
  "resolveWorkspacePersisted",
  "listWorkspacesPersisted",
  "updateWorkspaceStatusPersisted",
  "archiveWorkspacePersisted",
] as const;

export const PERSISTENCE_QUOTE_WORKFLOW_RUNTIME_OPERATIONS = [
  "createQuoteWorkflow",
  "transitionQuoteWorkflow",
  "listQuoteWorkflows",
] as const;

export const PERSISTENCE_ADAPTER_OPERATIONS = [
  "createPersistenceRuntime",
  "resolvePersistenceBackend",
] as const;

export const PERSISTENCE_PARITY_OPERATIONS = [
  "runMemoryPrismaParity",
  "detectParityMismatches",
  "buildParityDiffReport",
] as const;

export const PERSISTENCE_AUDIT_CHECKS = [
  "tenant-isolation",
  "repository-boundary",
  "runtime-boundary",
  "v49-frozen-boundary",
  "v48-frozen-boundary",
  "persistence-closed-loop",
  "commercial-readiness",
] as const;
