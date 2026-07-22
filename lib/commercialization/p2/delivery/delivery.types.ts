/**
 * Commercialization P2 — Delivery types (scope + model)
 */

import type {
  DELIVERY_MODELS,
  DELIVERY_SCOPES,
} from "../tier/tier.constants";

export type DeliveryScopeKind = (typeof DELIVERY_SCOPES)[number];
export type DeliveryModelKind = (typeof DELIVERY_MODELS)[number];

export type DeliveryScopeProfile = {
  id: string;
  name: string;
  scope: DeliveryScopeKind;
  packageId: string;
  supportHours: number;
  onboardingIncluded: boolean;
  detail: string;
  createdAt: string;
};

export type DefineDeliveryScopeInput = {
  id?: string;
  name: string;
  scope: DeliveryScopeKind;
  packageId: string;
  supportHours?: number;
  onboardingIncluded?: boolean;
};

export type DeliveryModelProfile = {
  id: string;
  name: string;
  model: DeliveryModelKind;
  packageId: string;
  scopeId: string;
  regions: string[];
  slaTarget: number;
  detail: string;
  createdAt: string;
};

export type DefineDeliveryModelInput = {
  id?: string;
  name: string;
  model: DeliveryModelKind;
  packageId: string;
  scopeId: string;
  regions?: string[];
  slaTarget?: number;
};
