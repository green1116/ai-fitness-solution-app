import { buildTenderParseSnapshot } from "../shared/tender-input";
import type {
  BusinessObjective,
  ExpectedBenefit,
  ProjectOverview,
  SuccessMetric,
} from "./types";

export function buildProjectOverview(input?: { deploymentId?: string }): ProjectOverview {
  const deploymentId = input?.deploymentId ?? "executive-default";
  const tender = buildTenderParseSnapshot({ deploymentId });
  return {
    overviewId: `overview-${deploymentId}`,
    projectName: tender.projectName,
    clientName: tender.tenderCompany,
    projectScope: "健身设备采购、安装调试、人员培训及三年运维保障",
    deliveryWindow: "合同签订后 90 天内完成交付验收",
  };
}

export function buildBusinessObjectives(input?: {
  deploymentId?: string;
}): BusinessObjective[] {
  const deploymentId = input?.deploymentId ?? "executive-default";
  return [
    {
      objectiveId: `obj-1-${deploymentId}`,
      title: "打造区域标杆健身中心",
      description: "满足招标方对设备品质与服务响应的核心诉求",
      priority: "high",
    },
    {
      objectiveId: `obj-2-${deploymentId}`,
      title: "实现智能化运营管理",
      description: "通过 IoT 与会员管理系统提升运营效率",
      priority: "high",
    },
    {
      objectiveId: `obj-3-${deploymentId}`,
      title: "控制全生命周期成本",
      description: "以可预测运维成本保障长期运营可持续性",
      priority: "medium",
    },
  ];
}

export function buildExpectedBenefits(input?: {
  deploymentId?: string;
}): ExpectedBenefit[] {
  const deploymentId = input?.deploymentId ?? "executive-default";
  return [
    {
      benefitId: `benefit-1-${deploymentId}`,
      category: "运营效率",
      description: "智能化设备管理降低 30% 人工巡检成本",
      impact: "年度运营成本下降",
    },
    {
      benefitId: `benefit-2-${deploymentId}`,
      category: "用户体验",
      description: "专业分区与器械配置提升会员满意度",
      impact: "会员留存率提升",
    },
    {
      benefitId: `benefit-3-${deploymentId}`,
      category: "合规保障",
      description: "全面响应招标技术要求与质保条款",
      impact: "验收通过率 100%",
    },
  ];
}

export function buildSuccessMetrics(input?: {
  deploymentId?: string;
}): SuccessMetric[] {
  const deploymentId = input?.deploymentId ?? "executive-default";
  return [
    {
      metricId: `metric-1-${deploymentId}`,
      name: "交付准时率",
      target: "≥ 98%",
      measurement: "合同约定交付节点对比",
    },
    {
      metricId: `metric-2-${deploymentId}`,
      name: "验收一次通过率",
      target: "100%",
      measurement: "首次验收结果",
    },
    {
      metricId: `metric-3-${deploymentId}`,
      name: "质保响应时效",
      target: "≤ 4 小时",
      measurement: "工单响应 SLA",
    },
  ];
}
