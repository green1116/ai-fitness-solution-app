import type { Milestone, Phase, Responsibility, TimelineEntry } from "./types";

function weekDate(weeksFromNow: number): string {
  return new Date(Date.now() + weeksFromNow * 7 * 86_400_000).toISOString();
}

export function buildMilestones(input?: { deploymentId?: string }): Milestone[] {
  const deploymentId = input?.deploymentId ?? "impl-default";
  return [
    { milestoneId: `ms-1-${deploymentId}`, name: "合同签订", targetDate: weekDate(0), deliverable: "项目启动会纪要" },
    { milestoneId: `ms-2-${deploymentId}`, name: "设备到货", targetDate: weekDate(4), deliverable: "到货验收单" },
    { milestoneId: `ms-3-${deploymentId}`, name: "安装完成", targetDate: weekDate(8), deliverable: "安装调试报告" },
    { milestoneId: `ms-4-${deploymentId}`, name: "系统上线", targetDate: weekDate(10), deliverable: "系统联调报告" },
    { milestoneId: `ms-5-${deploymentId}`, name: "验收交付", targetDate: weekDate(12), deliverable: "验收证书" },
  ];
}

export function buildPhases(input?: { deploymentId?: string }): Phase[] {
  const deploymentId = input?.deploymentId ?? "impl-default";
  return [
    { phaseId: `phase-1-${deploymentId}`, name: "启动与准备", durationWeeks: 2, objectives: ["团队组建", "现场勘测", "方案确认"] },
    { phaseId: `phase-2-${deploymentId}`, name: "采购与物流", durationWeeks: 4, objectives: ["设备采购", "物流跟踪", "到货检验"] },
    { phaseId: `phase-3-${deploymentId}`, name: "安装与调试", durationWeeks: 4, objectives: ["分区安装", "设备调试", "安全检测"] },
    { phaseId: `phase-4-${deploymentId}`, name: "验收与移交", durationWeeks: 2, objectives: ["联合验收", "人员培训", "文档移交"] },
  ];
}

export function buildTimeline(input?: { deploymentId?: string }): TimelineEntry[] {
  const deploymentId = input?.deploymentId ?? "impl-default";
  return [
    { entryId: `tl-1-${deploymentId}`, week: 1, activity: "项目启动会", owner: "项目经理" },
    { entryId: `tl-2-${deploymentId}`, week: 3, activity: "设备采购下单", owner: "采购经理" },
    { entryId: `tl-3-${deploymentId}`, week: 5, activity: "设备进场安装", owner: "安装主管" },
    { entryId: `tl-4-${deploymentId}`, week: 9, activity: "系统联调测试", owner: "技术工程师" },
    { entryId: `tl-5-${deploymentId}`, week: 12, activity: "最终验收", owner: "项目经理" },
  ];
}

export function buildResponsibilities(input?: { deploymentId?: string }): Responsibility[] {
  const deploymentId = input?.deploymentId ?? "impl-default";
  return [
    { respId: `resp-1-${deploymentId}`, role: "项目经理", scope: "整体进度与协调", contact: "pm@example.com" },
    { respId: `resp-2-${deploymentId}`, role: "技术负责人", scope: "技术方案与联调", contact: "tech@example.com" },
    { respId: `resp-3-${deploymentId}`, role: "安装主管", scope: "现场安装与安全", contact: "install@example.com" },
    { respId: `resp-4-${deploymentId}`, role: "质保工程师", scope: "验收与售后响应", contact: "support@example.com" },
  ];
}
