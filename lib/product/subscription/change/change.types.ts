/**
 * Product Subscription — Change types
 */

import type { CHANGE_KINDS } from "../lifecycle/lifecycle.constants";

export type ChangeKind = (typeof CHANGE_KINDS)[number];
export type ChangeMetadata = Record<string, unknown>;

export type SubscriptionChange = {
  id: string;
  subscriptionId: string;
  kind: ChangeKind;
  fromPlanId: string;
  toPlanId: string;
  fromSeats: number;
  toSeats: number;
  detail: string;
  metadata: ChangeMetadata;
  changedAt: string;
};

export type ChangeSubscriptionInput = {
  id?: string;
  subscriptionId: string;
  kind: ChangeKind;
  toPlanId?: string;
  toSeats?: number;
  metadata?: ChangeMetadata;
};
