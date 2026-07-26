/**
 * Product Connector — Framework constants
 * MODULE: Connector Framework (M08-P2)
 * BASE: enterprise-product-marketplace-foundation-v1
 * Isolated namespace: lib/product/connector
 */

export const PRODUCT_CONNECTOR_FRAMEWORK_ID =
  "enterprise-product-connector-framework-v1" as const;

export const PRODUCT_CONNECTOR_FRAMEWORK_VERSION =
  "product-connector-1" as const;

export const PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION =
  "product-connector-framework-freeze-1" as const;

export const PRODUCT_CONNECTOR_FRAMEWORK_BASE =
  "enterprise-product-marketplace-foundation-v1" as const;

export const PRODUCT_CONNECTOR_FREEZE_TAG =
  "product-connector-framework-freeze-1" as const;

export const CONNECTOR_KINDS = [
  "HTTP",
  "WEBHOOK",
  "EVENT",
  "INTERNAL",
] as const;

export const CONNECTOR_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const CONNECTOR_CONTRACT_KINDS = [
  "REQUEST",
  "RESPONSE",
  "EVENT_PAYLOAD",
] as const;

export const CONNECTOR_BINDING_STATUSES = [
  "DRAFT",
  "BOUND",
  "UNBOUND",
] as const;

export const CONNECTOR_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const CONNECTOR_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
