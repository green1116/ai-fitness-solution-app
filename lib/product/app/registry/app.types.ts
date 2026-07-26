/**
 * Product App — registry types
 */

import type { APP_KINDS, APP_STATUSES } from "../management/management.constants";

export type AppKind = (typeof APP_KINDS)[number];
export type AppStatus = (typeof APP_STATUSES)[number];
export type AppMetadata = Record<string, unknown>;

export type ProductApp = {
  id: string;
  appKey: string;
  name: string;
  kind: AppKind;
  status: AppStatus;
  detail: string;
  metadata: AppMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAppInput = {
  id?: string;
  appKey: string;
  name: string;
  kind: AppKind;
  metadata?: AppMetadata;
};

export type UpdateAppStatusInput = {
  appId: string;
  status: AppStatus;
};
