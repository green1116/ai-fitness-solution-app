import { buildVersionState } from "../version/builders";
import { buildDeliverables, buildDeliveryProject } from "../workspace/builders";
import type { DeliveryPackageRef, DownloadRecord } from "./types";

export function buildDownloadRecords(input?: { deploymentId?: string }): DownloadRecord[] {
  const deploymentId = input?.deploymentId ?? "download-default";
  const project = buildDeliveryProject({ deploymentId });
  const deliverables = buildDeliverables({
    deploymentId,
    projectId: project.projectId,
    status: "approved",
  });
  const base = Date.now();

  return deliverables.slice(0, 3).map((d, index) => ({
    downloadId: `download-${d.type}-${deploymentId}`,
    projectId: project.projectId,
    packageType: d.type,
    filename: `${d.type.replace("-pdf", "")}.pdf`,
    downloadedAt: new Date(base - index * 7200_000).toISOString(),
    downloadedBy: "customer-portal-user",
  }));
}

export function buildDeliveryPackageRef(input?: {
  deploymentId?: string;
}): DeliveryPackageRef {
  const deploymentId = input?.deploymentId ?? "download-default";
  const project = buildDeliveryProject({ deploymentId });
  const version = buildVersionState({ deploymentId });
  const deliverables = buildDeliverables({
    deploymentId,
    projectId: project.projectId,
  });

  return {
    packageId: `delivery-package-${deploymentId}`,
    projectId: project.projectId,
    versionLabel: version.currentVersion.versionLabel,
    artifacts: deliverables.map((d) => d.label),
    ready: true,
  };
}

export function resolveLatestDownload(downloads: DownloadRecord[]): DownloadRecord | null {
  if (downloads.length === 0) return null;
  return [...downloads].sort(
    (a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime(),
  )[0];
}
