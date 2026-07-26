/**
 * Product API — Lifecycle types
 */

import type { API_LIFECYCLE_STATES } from "../management/management.constants";

export type ApiLifecycleState = (typeof API_LIFECYCLE_STATES)[number];
export type LifecycleMetadata = Record<string, unknown>;

export type ApiLifecycle = {
  id: string;
  apiId: string;
  versionId: string;
  state: ApiLifecycleState;
  detail: string;
  metadata: LifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type OpenApiLifecycleInput = {
  id?: string;
  apiId: string;
  versionId: string;
  metadata?: LifecycleMetadata;
};

export type TransitionApiLifecycleInput = {
  lifecycleId: string;
  state: ApiLifecycleState;
};
