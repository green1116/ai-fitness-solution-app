import type { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";

export const VERSION_RUNTIME_VERSION = "v14.0-version-runtime-1" as const;

export interface DeliveryVersion {
  versionId: string;
  versionLabel: string;
  projectId: string;
  isCurrent: boolean;
  createdAt: string;
  changelog: string;
}

export interface VersionRuntimePayload {
  version: typeof VERSION_RUNTIME_VERSION;
  deliveryVersion: typeof COMMERCIAL_DELIVERY_VERSION;
  currentVersion: DeliveryVersion;
  previousVersion: DeliveryVersion | null;
  versionHistory: DeliveryVersion[];
  summary: string;
}
