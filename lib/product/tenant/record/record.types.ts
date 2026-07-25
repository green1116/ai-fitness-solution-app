/**
 * Product Tenant — Record types
 */

import type {
  TENANT_RECORD_STATUSES,
  TENANT_TIERS,
} from "../administration/administration.constants";

export type TenantTier = (typeof TENANT_TIERS)[number];
export type TenantRecordStatus = (typeof TENANT_RECORD_STATUSES)[number];
export type RecordMetadata = Record<string, unknown>;

export type TenantRecord = {
  id: string;
  code: string;
  name: string;
  tier: TenantTier;
  adminTenantId: string;
  status: TenantRecordStatus;
  detail: string;
  metadata: RecordMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterTenantRecordInput = {
  id?: string;
  code: string;
  name: string;
  tier: TenantTier;
  adminTenantId: string;
  metadata?: RecordMetadata;
};

export type UpdateTenantRecordStatusInput = {
  recordId: string;
  status: TenantRecordStatus;
};
