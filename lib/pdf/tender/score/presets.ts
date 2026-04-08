import type { ScoreCriterion } from "@/lib/pdf/tender/types";

export const DEFAULT_GYM_SCORE_CRITERIA: ScoreCriterion[] = [
  {
    id: "SC-001",
    scoreItem: "技术方案完整性",
    criteria: "方案应完整覆盖空间规划、功能分区及整体配置内容。",
    keywords: ["空间规划", "功能分区", "整体方案", "项目概述"],
    category: "technical",
  },
  {
    id: "SC-002",
    scoreItem: "设备配置合理性",
    criteria: "设备配置应与项目需求相匹配，并具有明确配置说明。",
    keywords: ["设备配置", "配置明细", "预算配置表", "设备清单"],
    category: "technical",
  },
  {
    id: "SC-003",
    scoreItem: "实施与交付安排",
    criteria: "应提供实施安排、交付计划及项目落地建议。",
    keywords: ["实施安排", "交付计划", "落地建议", "实施周期"],
    category: "implementation",
  },
  {
    id: "SC-004",
    scoreItem: "售后与保障能力",
    criteria: "应提供售后服务、运维支持及后续保障方案。",
    keywords: ["售后服务", "运维支持", "保障方案", "后续保障"],
    category: "service",
  },
  {
    id: "SC-005",
    scoreItem: "商务响应程度",
    criteria: "应对报价、付款、交付及售后等商务条款作出完整响应。",
    keywords: ["报价", "付款方式", "交付安排", "售后服务"],
    category: "business",
  },
];

