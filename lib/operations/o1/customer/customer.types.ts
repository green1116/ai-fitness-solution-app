/**
 * Operations O1 — Customer types
 */

import type { CUSTOMER_STATUSES } from "../success/success.constants";

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];
export type CustomerMetadata = Record<string, unknown>;

export type SuccessCustomer = {
  id: string;
  name: string;
  accountRef: string;
  owner: string;
  status: CustomerStatus;
  detail: string;
  metadata: CustomerMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterCustomerInput = {
  id?: string;
  name: string;
  accountRef: string;
  owner: string;
  status?: CustomerStatus;
  metadata?: CustomerMetadata;
};
