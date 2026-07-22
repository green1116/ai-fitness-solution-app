/**
 * Commercialization P1 — Customer types
 */

import type { CUSTOMER_LIFECYCLE_STAGES } from "../sales/sales.constants";

export type CustomerLifecycleStage =
  (typeof CUSTOMER_LIFECYCLE_STAGES)[number];

export type CustomerMetadata = Record<string, unknown>;

export type SalesCustomer = {
  id: string;
  name: string;
  segment: string;
  region: string;
  lifecycleStage: CustomerLifecycleStage;
  healthScore: number;
  detail: string;
  metadata: CustomerMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterCustomerInput = {
  id?: string;
  name: string;
  segment?: string;
  region?: string;
  lifecycleStage?: CustomerLifecycleStage;
  metadata?: CustomerMetadata;
};

export type CustomerLifecycleRecord = {
  id: string;
  customerId: string;
  stage: CustomerLifecycleStage;
  previousStage?: CustomerLifecycleStage;
  reason: string;
  transitionedAt: string;
};

export type TransitionCustomerLifecycleInput = {
  id?: string;
  customerId: string;
  stage: CustomerLifecycleStage;
  reason?: string;
};
