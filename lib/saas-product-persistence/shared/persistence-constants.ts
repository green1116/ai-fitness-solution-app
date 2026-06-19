export const SAAS_PRODUCT_PERSISTENCE_P1_TAG = "v50-production-persistence-p1" as const;

export const PERSISTENCE_WORKFLOW_TYPES = ["QUOTE"] as const;

export const PERSISTENCE_WORKSPACE_STATUSES = ["ACTIVE", "ARCHIVED"] as const;

export const PERSISTENCE_QUOTE_STATUSES = ["DRAFT", "APPROVED", "REJECTED"] as const;

export const PERSISTENCE_EVENT_TYPES = ["WORKFLOW_CREATED", "STATE_CHANGED", "WORKFLOW_RELEASED"] as const;

export const PERSISTENCE_TABLES = [
  "saas_product_workspace",
  "saas_product_quote",
  "saas_product_workflow_instance",
  "saas_product_workflow_history",
  "saas_product_workflow_event",
] as const;
