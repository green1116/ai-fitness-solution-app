/**
 * Product P8 — Tender Delivery constants
 * BASE: enterprise-product-p7-collaboration-approval-v1
 * Isolated namespace: lib/product/p8
 */

export const PRODUCT_P8_TENDER_DELIVERY_ID =
  "enterprise-product-p8-tender-delivery-v1" as const;

export const PRODUCT_P8_TENDER_DELIVERY_VERSION = "product-p8-1" as const;

export const PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION =
  "product-p8-tender-delivery-freeze-1" as const;

export const PRODUCT_P8_TENDER_DELIVERY_BASE =
  "enterprise-product-p7-collaboration-approval-v1" as const;

export const PRODUCT_P8_TENDER_FREEZE_VERSION =
  "product-p8-tender-delivery-freeze-1" as const;

export const TENDER_STATUSES = [
  "DRAFT",
  "PACKAGING",
  "READY",
  "SUBMITTED",
  "HANDED_OVER",
  "ARCHIVED",
] as const;

export const DELIVERY_CHANNELS = [
  "PORTAL",
  "EMAIL",
  "COURIER",
  "API",
  "HAND_DELIVER",
] as const;

export const DOCUMENT_KINDS = [
  "PROPOSAL",
  "BUDGET",
  "APPROVAL",
  "ATTACHMENT",
  "COVER_LETTER",
  "APPENDIX",
] as const;

export const EXPORT_FORMATS = [
  "PDF",
  "DOCX",
  "XLSX",
  "ZIP",
  "JSON",
] as const;

export const PACKAGE_STATUSES = [
  "OPEN",
  "ASSEMBLING",
  "SEALED",
  "DELIVERED",
] as const;

export const SUBMISSION_STATUSES = [
  "PENDING",
  "SENT",
  "ACKNOWLEDGED",
  "FAILED",
] as const;

export const TRACKING_EVENTS = [
  "CREATED",
  "EXPORTED",
  "PACKAGED",
  "SUBMITTED",
  "ACKNOWLEDGED",
  "HANDED_OVER",
] as const;

export const HANDOVER_STATUSES = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETE",
  "REJECTED",
] as const;

export const P8_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P8_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
