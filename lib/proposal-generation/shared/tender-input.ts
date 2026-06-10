/**
 * Descriptive Tender Parse snapshot for proposal generation.
 * Does not import or modify lib/tender/ runtime.
 */

export interface TenderRequirementSnapshot {
  id: string;
  category: "technical" | "commercial" | "qualification" | "scoring" | "attachment";
  title: string;
  importance: "mandatory" | "preferred" | "scored";
}

export interface TenderParseSnapshot {
  snapshotId: string;
  projectId: string;
  projectName: string;
  tenderCompany: string;
  projectCode: string;
  deadline: string;
  sections: Array<{ id: string; title: string }>;
  requirements: TenderRequirementSnapshot[];
  mode: "readiness-stub";
}

export function buildTenderParseSnapshot(input?: {
  deploymentId?: string;
}): TenderParseSnapshot {
  const deploymentId = input?.deploymentId ?? "proposal-default";
  return {
    snapshotId: `tender-snapshot-${deploymentId}`,
    projectId: `project-${deploymentId}`,
    projectName: "智慧健身中心设备采购与运营项目",
    tenderCompany: "某市体育局",
    projectCode: `TENDER-${deploymentId.toUpperCase()}`,
    deadline: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    sections: [
      { id: "sec-1", title: "项目概况" },
      { id: "sec-2", title: "技术要求" },
      { id: "sec-3", title: "商务条款" },
      { id: "sec-4", title: "评分标准" },
    ],
    requirements: [
      { id: "req-1", category: "technical", title: "有氧设备配置", importance: "mandatory" },
      { id: "req-2", category: "technical", title: "力量训练区方案", importance: "mandatory" },
      { id: "req-3", category: "commercial", title: "质保期不少于3年", importance: "mandatory" },
      { id: "req-4", category: "qualification", title: "同类项目业绩", importance: "scored" },
      { id: "req-5", category: "scoring", title: "智能化管理系统", importance: "scored" },
      { id: "req-6", category: "attachment", title: "设备清单及报价", importance: "mandatory" },
    ],
    mode: "readiness-stub",
  };
}
