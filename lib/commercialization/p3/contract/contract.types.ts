/**
 * Commercialization P3 — Contract types
 */

import type { CONTRACT_STATUSES } from "../pricing/pricing.constants";

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];
export type ContractMetadata = Record<string, unknown>;

export type CommercialContract = {
  id: string;
  name: string;
  quoteId: string;
  customerRef: string;
  commercialModelId: string;
  termsIds: string[];
  status: ContractStatus;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  detail: string;
  metadata: ContractMetadata;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
};

export type RegisterContractInput = {
  id?: string;
  name: string;
  quoteId: string;
  commercialModelId: string;
  termsIds?: string[];
  termMonths?: number;
  metadata?: ContractMetadata;
};

export type ContractLifecycleRecord = {
  id: string;
  contractId: string;
  status: ContractStatus;
  previousStatus?: ContractStatus;
  reason: string;
  transitionedAt: string;
};

export type TransitionContractInput = {
  id?: string;
  contractId: string;
  status: ContractStatus;
  reason?: string;
};
