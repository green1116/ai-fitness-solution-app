import { buildDeliveryProject } from "../workspace/builders";
import type { DeliveryVersion } from "./types";

export function buildVersionHistory(input?: { deploymentId?: string }): DeliveryVersion[] {
  const deploymentId = input?.deploymentId ?? "version-default";
  const project = buildDeliveryProject({ deploymentId });
  const base = Date.now();

  const versions: Array<{ label: string; changelog: string; isCurrent: boolean }> = [
    { label: "v1.0.0", changelog: "初始交付版本", isCurrent: false },
    { label: "v1.1.0", changelog: "合规响应更新", isCurrent: false },
    { label: "v1.2.0", changelog: "方案优化与预算调整", isCurrent: true },
  ];

  return versions.map((v, index) => ({
    versionId: `version-${v.label}-${deploymentId}`,
    versionLabel: v.label,
    projectId: project.projectId,
    isCurrent: v.isCurrent,
    createdAt: new Date(base - (versions.length - index) * 86400_000).toISOString(),
    changelog: v.changelog,
  }));
}

export function buildVersionState(input?: { deploymentId?: string }) {
  const history = buildVersionHistory(input);
  const currentVersion = history.find((v) => v.isCurrent) ?? history[history.length - 1];
  const previousVersion = history.filter((v) => !v.isCurrent).at(-1) ?? null;
  return { currentVersion, previousVersion, versionHistory: history };
}
