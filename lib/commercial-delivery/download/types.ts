import type { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";

export const DOWNLOAD_RUNTIME_VERSION = "v14.0-download-runtime-1" as const;

export interface DownloadRecord {
  downloadId: string;
  projectId: string;
  packageType: string;
  filename: string;
  downloadedAt: string;
  downloadedBy: string;
}

export interface DeliveryPackageRef {
  packageId: string;
  projectId: string;
  versionLabel: string;
  artifacts: string[];
  ready: boolean;
}

export interface DownloadRuntimePayload {
  version: typeof DOWNLOAD_RUNTIME_VERSION;
  deliveryVersion: typeof COMMERCIAL_DELIVERY_VERSION;
  downloads: DownloadRecord[];
  latestDownload: DownloadRecord | null;
  deliveryPackage: DeliveryPackageRef;
  summary: string;
}
