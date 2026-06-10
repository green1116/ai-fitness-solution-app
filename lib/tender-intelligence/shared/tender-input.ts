/**
 * Descriptive tender project snapshot for intelligence layer.
 * Does not import or modify lib/tender/ production runtime.
 */

export interface TenderProjectSnapshot {
  snapshotId: string;
  projectId: string;
  projectName: string;
  tenderCompany: string;
  projectCode: string;
  estimatedAreaSqm: number;
  estimatedBudgetCny: number;
  requirementCount: number;
  mode: "readiness-stub";
}

export function buildTenderProjectSnapshot(input?: {
  deploymentId?: string;
}): TenderProjectSnapshot {
  const deploymentId = input?.deploymentId ?? "tender-intel-default";
  return {
    snapshotId: `tender-project-${deploymentId}`,
    projectId: `project-${deploymentId}`,
    projectName: "智慧健身中心设备采购与运营项目",
    tenderCompany: "某市体育局",
    projectCode: `TENDER-${deploymentId.toUpperCase()}`,
    estimatedAreaSqm: 1200,
    estimatedBudgetCny: 2_800_000,
    requirementCount: 24,
    mode: "readiness-stub",
  };
}
