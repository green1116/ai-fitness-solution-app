/**
 * Product Customer — Profile types
 */

import type {
  CUSTOMER_KINDS,
  CUSTOMER_STATUSES,
} from "../foundation/foundation.constants";

export type CustomerKind = (typeof CUSTOMER_KINDS)[number];
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];
export type ProfileMetadata = Record<string, unknown>;

export type CustomerProfile = {
  id: string;
  kind: CustomerKind;
  name: string;
  email: string;
  status: CustomerStatus;
  detail: string;
  metadata: ProfileMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterCustomerInput = {
  id?: string;
  kind: CustomerKind;
  name: string;
  email: string;
  metadata?: ProfileMetadata;
};

export type UpdateCustomerStatusInput = {
  customerId: string;
  status: CustomerStatus;
};
