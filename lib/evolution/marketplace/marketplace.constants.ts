/**
 * Evolution P6 — Marketplace Ecosystem constants
 * BASE: enterprise-evolution-p5-global-deployment-network-v1
 */

export const EVOLUTION_MARKETPLACE_ECOSYSTEM_ID =
  "enterprise-evolution-p6-marketplace-ecosystem-v1" as const;

export const EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION =
  "evolution-p6-1" as const;
export const EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION =
  "evolution-marketplace-ecosystem-freeze-1" as const;

export const EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE =
  "enterprise-evolution-p5-global-deployment-network-v1" as const;

export const EVOLUTION_P6_MARKETPLACE_FREEZE_VERSION =
  "evolution-p6-marketplace-ecosystem-freeze-1" as const;

export const MARKETPLACE_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const PARTNER_TIERS = [
  "STANDARD",
  "PREFERRED",
  "STRATEGIC",
  "FOUNDING",
] as const;

export const PARTNER_STATUSES = [
  "INVITED",
  "ACTIVE",
  "SUSPENDED",
  "EXITED",
] as const;

export const EXTENSION_KINDS = [
  "CONNECTOR",
  "APP",
  "WORKFLOW",
  "ANALYTICS",
] as const;

export const EXTENSION_STATUSES = [
  "REGISTERED",
  "PUBLISHED",
  "DEPRECATED",
] as const;

export const INTEGRATION_CATEGORIES = [
  "API",
  "DATA",
  "IDENTITY",
  "COMMERCE",
  "OPS",
] as const;

export const MARKETPLACE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const MARKETPLACE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
