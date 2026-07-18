/**
 * E07-P3 — Role Agent Marketplace constants
 * BASE: enterprise-e07-p2-ai-employee-runtime-v1
 */

export const E07_MARKETPLACE_ID =
  "enterprise-e07-role-agent-marketplace-v1" as const;

export const E07_MARKETPLACE_VERSION = "e07-marketplace-1" as const;
export const E07_MARKETPLACE_FREEZE_VERSION =
  "e07-marketplace-freeze-1" as const;

export const E07_MARKETPLACE_BASE =
  "enterprise-e07-p2-ai-employee-runtime-v1" as const;

export const ROLE_CATEGORIES = [
  "commercial",
  "risk",
  "delivery",
] as const;

export const ROLE_LISTING_STATUSES = [
  "listed",
  "deployable",
  "retired",
] as const;

/** Deploy lifecycle: SELECTED -> DEPLOYING -> ACTIVE -> RESULT */
export const ROLE_DEPLOY_PHASES = [
  "SELECTED",
  "DEPLOYING",
  "ACTIVE",
  "RESULT",
] as const;

export const ROLE_DEPLOY_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["SELECTED", "DEPLOYING"],
  ["DEPLOYING", "ACTIVE"],
  ["ACTIVE", "RESULT"],
] as const;

export const ROLE_TRACE_EVENT_KINDS = [
  "ready",
  "select",
  "deploy",
  "activate",
  "result",
  "error",
] as const;
