/**
 * Commercialization P3 — Commercial terms & model types
 */

import type {
  COMMERCIAL_MODELS,
  TERM_KINDS,
} from "../pricing/pricing.constants";

export type TermKind = (typeof TERM_KINDS)[number];
export type CommercialModelKind = (typeof COMMERCIAL_MODELS)[number];

export type CommercialTerm = {
  id: string;
  name: string;
  kind: TermKind;
  body: string;
  mandatory: boolean;
  detail: string;
  createdAt: string;
};

export type DefineCommercialTermInput = {
  id?: string;
  name: string;
  kind: TermKind;
  body: string;
  mandatory?: boolean;
};

export type CommercialModelProfile = {
  id: string;
  name: string;
  model: CommercialModelKind;
  billingCycleDefault: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  autoRenew: boolean;
  minimumTermMonths: number;
  detail: string;
  createdAt: string;
};

export type DefineCommercialModelInput = {
  id?: string;
  name: string;
  model: CommercialModelKind;
  billingCycleDefault?: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  autoRenew?: boolean;
  minimumTermMonths?: number;
};
