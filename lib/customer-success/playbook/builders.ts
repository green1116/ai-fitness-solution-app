import type { PlaybookType, SuccessPlaybook } from "./types";
import { PLAYBOOK_TYPES } from "./types";

const PLAYBOOK_META: Record<PlaybookType, { title: string; steps: string[]; segment: string; days: number }> = {
  onboarding: {
    title: "Onboarding Playbook 客户上手",
    steps: ["账号开通", "首次项目创建", "方案生成引导", "交付包下载培训"],
    segment: "trial / new customer",
    days: 14,
  },
  adoption: {
    title: "Adoption Playbook 功能采纳",
    steps: ["使用率诊断", "功能推荐", "最佳实践分享", "采纳里程碑确认"],
    segment: "professional",
    days: 30,
  },
  renewal: {
    title: "Renewal Playbook 续费运营",
    steps: ["续费窗口预警", "价值回顾报告", "续费方案沟通", "合同续签"],
    segment: "enterprise / professional",
    days: 60,
  },
  expansion: {
    title: "Expansion Playbook 扩展销售",
    steps: ["升级机会识别", "ROI 分析", "扩展方案演示", "商务谈判"],
    segment: "expanding / enterprise",
    days: 45,
  },
};

export function buildSuccessPlaybooks(input?: { deploymentId?: string }): SuccessPlaybook[] {
  const deploymentId = input?.deploymentId ?? "playbook-default";
  return PLAYBOOK_TYPES.map((type) => {
    const meta = PLAYBOOK_META[type];
    return {
      playbookId: `playbook-${type}-${deploymentId}`,
      type,
      title: meta.title,
      steps: meta.steps,
      targetSegment: meta.segment,
      estimatedDays: meta.days,
    };
  });
}

