/**
 * Product Billing — Account types
 */

import type { BILLING_ACCOUNT_STATUSES } from "../foundation/foundation.constants";

export type BillingAccountStatus = (typeof BILLING_ACCOUNT_STATUSES)[number];
export type AccountMetadata = Record<string, unknown>;

export type BillingAccount = {
  id: string;
  principalId: string;
  name: string;
  currency: string;
  status: BillingAccountStatus;
  detail: string;
  metadata: AccountMetadata;
  openedAt: string;
  updatedAt: string;
};

export type OpenBillingAccountInput = {
  id?: string;
  principalId: string;
  name: string;
  currency?: string;
  metadata?: AccountMetadata;
};

export type UpdateBillingAccountStatusInput = {
  accountId: string;
  status: BillingAccountStatus;
};
