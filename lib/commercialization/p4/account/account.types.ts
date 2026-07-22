/**
 * Commercialization P4 — Account types
 */

import type { ACCOUNT_STATUSES } from "../onboarding/onboarding.constants";

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
export type AccountMetadata = Record<string, unknown>;

export type CustomerAccount = {
  id: string;
  name: string;
  customerRef: string;
  contractRef: string;
  status: AccountStatus;
  owner: string;
  detail: string;
  metadata: AccountMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAccountInput = {
  id?: string;
  name: string;
  customerRef: string;
  contractRef: string;
  status?: AccountStatus;
  owner?: string;
  metadata?: AccountMetadata;
};

export type AccountLifecycleRecord = {
  id: string;
  accountId: string;
  status: AccountStatus;
  previousStatus?: AccountStatus;
  reason: string;
  transitionedAt: string;
};

export type TransitionAccountInput = {
  id?: string;
  accountId: string;
  status: AccountStatus;
  reason?: string;
};
