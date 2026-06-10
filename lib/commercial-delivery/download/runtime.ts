import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  CommercialDeliveryRuntimeResult,
  CommercialDeliveryStageResult,
} from "../shared/types";
import { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";
import {
  buildDeliveryPackageRef,
  buildDownloadRecords,
  resolveLatestDownload,
} from "./builders";
import type { DownloadRuntimePayload } from "./types";
import { DOWNLOAD_RUNTIME_VERSION } from "./types";

export function validateDownloadRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const downloads = buildDownloadRecords(input);
  const latest = resolveLatestDownload(downloads);
  const pkg = buildDeliveryPackageRef(input);
  return {
    valid: downloads.length >= 3 && latest !== null && pkg.ready && pkg.artifacts.length === 4,
  };
}

export function runDownloadRuntime(input?: {
  deploymentId?: string;
}): CommercialDeliveryRuntimeResult<DownloadRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "download-default";
  const stages: CommercialDeliveryStageResult[] = [];

  const downloads = runStage(
    "download-records",
    "Download Records",
    () => buildDownloadRecords({ deploymentId }),
    stages,
  );
  const latestDownload = runStage(
    "latest-download",
    "Latest Download",
    () => resolveLatestDownload(downloads),
    stages,
  );
  const deliveryPackage = runStage(
    "delivery-package-ref",
    "Delivery Package",
    () => buildDeliveryPackageRef({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "download-validate",
    "Download Validation",
    () => validateDownloadRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Download runtime validation failed");

  const payload: DownloadRuntimePayload = {
    version: DOWNLOAD_RUNTIME_VERSION,
    deliveryVersion: COMMERCIAL_DELIVERY_VERSION,
    downloads,
    latestDownload,
    deliveryPackage,
    summary: `download-runtime downloads=${downloads.length} latest=${latestDownload?.packageType ?? "none"} package=${deliveryPackage.packageId}`,
  };

  return finalizeRuntime({
    domain: "download-runtime",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
