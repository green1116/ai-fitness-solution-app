/**
 * Launch L1 — Customer types
 */

import type { CUSTOMER_SEGMENTS } from "../demo/demo.constants";

export type CustomerSegment = (typeof CUSTOMER_SEGMENTS)[number];
export type CustomerMetadata = Record<string, unknown>;

export type CustomerProfile = {
  id: string;
  tenantId: string;
  displayName: string;
  segment: CustomerSegment;
  contactEmail: string;
  detail: string;
  metadata: CustomerMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerProfileInput = {
  id?: string;
  tenantId: string;
  displayName: string;
  segment: CustomerSegment;
  contactEmail: string;
  metadata?: CustomerMetadata;
};
