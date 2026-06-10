import type { AcceptancePlanItem, DeliveryPlanItem, SupportPlanItem } from "./types";

function weekDate(weeks: number): string {
  return new Date(Date.now() + weeks * 7 * 86_400_000).toISOString();
}

export function buildDeliveryPlan(input?: { deploymentId?: string }): DeliveryPlanItem[] {
  const deploymentId = input?.deploymentId ?? "delivery-default";
  return [
    { itemId: `del-1-${deploymentId}`, deliverable: "设备到货验收", scheduledDate: weekDate(4), status: "planned" },
    { itemId: `del-2-${deploymentId}`, deliverable: "安装调试完成", scheduledDate: weekDate(8), status: "planned" },
    { itemId: `del-3-${deploymentId}`, deliverable: "系统上线运行", scheduledDate: weekDate(10), status: "planned" },
    { itemId: `del-4-${deploymentId}`, deliverable: "培训与文档移交", scheduledDate: weekDate(11), status: "planned" },
    { itemId: `del-5-${deploymentId}`, deliverable: "最终验收证书", scheduledDate: weekDate(12), status: "planned" },
  ];
}

export function buildAcceptancePlan(input?: { deploymentId?: string }): AcceptancePlanItem[] {
  const deploymentId = input?.deploymentId ?? "delivery-default";
  return [
    { acceptId: `acc-1-${deploymentId}`, criterion: "设备数量与型号符合清单", method: "现场清点核对", responsible: "双方代表" },
    { acceptId: `acc-2-${deploymentId}`, criterion: "安装质量与安全标准", method: "第三方检测报告", responsible: "技术负责人" },
    { acceptId: `acc-3-${deploymentId}`, criterion: "系统功能完整性", method: "功能测试用例", responsible: "技术工程师" },
    { acceptId: `acc-4-${deploymentId}`, criterion: "培训完成度", method: "培训签到与考核", responsible: "培训专员" },
  ];
}

export function buildSupportPlan(input?: { deploymentId?: string }): SupportPlanItem[] {
  const deploymentId = input?.deploymentId ?? "delivery-default";
  return [
    { supportId: `sup-1-${deploymentId}`, service: "质保期内免费维修", sla: "4 小时响应", duration: "3 年" },
    { supportId: `sup-2-${deploymentId}`, service: "备件更换", sla: "48 小时内到场", duration: "3 年" },
    { supportId: `sup-3-${deploymentId}`, service: "远程技术支持", sla: "2 小时响应", duration: "3 年" },
    { supportId: `sup-4-${deploymentId}`, service: "年度巡检", sla: "每季度 1 次", duration: "3 年" },
  ];
}
