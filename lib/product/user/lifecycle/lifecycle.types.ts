/**
 * Product User — Lifecycle types
 */

import type { USER_LIFECYCLE_STATES } from "../administration/administration.constants";

export type UserLifecycleState = (typeof USER_LIFECYCLE_STATES)[number];
export type LifecycleMetadata = Record<string, unknown>;

export type UserLifecycle = {
  id: string;
  accountId: string;
  state: UserLifecycleState;
  detail: string;
  metadata: LifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserLifecycleInput = {
  id?: string;
  accountId: string;
  metadata?: LifecycleMetadata;
};

export type TransitionUserLifecycleInput = {
  lifecycleId: string;
  state: UserLifecycleState;
};
