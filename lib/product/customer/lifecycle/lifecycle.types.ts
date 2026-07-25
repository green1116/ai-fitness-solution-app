/**
 * Product Customer — Lifecycle types
 */

import type { CustomerStatus } from "../profile/profile.types";

export type LifecycleMetadata = Record<string, unknown>;

export type CustomerLifecycleEvent = {
  id: string;
  customerId: string;
  fromStatus: CustomerStatus;
  toStatus: CustomerStatus;
  detail: string;
  metadata: LifecycleMetadata;
  transitionedAt: string;
};

export type TransitionLifecycleInput = {
  id?: string;
  customerId: string;
  toStatus: CustomerStatus;
  metadata?: LifecycleMetadata;
};
