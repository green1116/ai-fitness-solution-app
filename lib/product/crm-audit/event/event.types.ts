/**
 * Product CRM Audit — Event types
 */

import type {
  CRM_AUDIT_CATEGORIES,
  CRM_AUDIT_SEVERITIES,
} from "../traceability/traceability.constants";

export type CrmAuditCategory = (typeof CRM_AUDIT_CATEGORIES)[number];
export type CrmAuditSeverity = (typeof CRM_AUDIT_SEVERITIES)[number];
export type EventMetadata = Record<string, unknown>;

export type CrmAuditEvent = {
  id: string;
  category: CrmAuditCategory;
  severity: CrmAuditSeverity;
  customerId: string;
  action: string;
  resource: string;
  detail: string;
  metadata: EventMetadata;
  recordedAt: string;
};

export type RecordCrmAuditEventInput = {
  id?: string;
  category: CrmAuditCategory;
  severity?: CrmAuditSeverity;
  customerId: string;
  action: string;
  resource: string;
  metadata?: EventMetadata;
};
