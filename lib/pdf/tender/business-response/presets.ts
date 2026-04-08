import type { BusinessRequirement } from "@/lib/pdf/tender/types";

export const DEFAULT_GYM_BUSINESS_REQUIREMENTS: BusinessRequirement[] = [
  {
    id: "BR-001",
    requirementType: "pricing",
    priority: "must",
    text: "应提供明确的报价说明及配置报价依据。",
    keywords: ["报价", "报价说明", "报价依据", "预算"],
  },
  {
    id: "BR-002",
    requirementType: "payment",
    priority: "must",
    text: "应响应项目付款方式及结算安排要求。",
    keywords: ["付款方式", "结算", "付款", "支付"],
  },
  {
    id: "BR-003",
    requirementType: "delivery",
    priority: "must",
    text: "应响应项目交付周期、实施周期及交付安排要求。",
    keywords: ["交付周期", "实施周期", "交付安排", "交期"],
  },
  {
    id: "BR-004",
    requirementType: "service",
    priority: "must",
    text: "应响应售后服务、维保支持及后续保障要求。",
    keywords: ["售后服务", "维保", "保障", "支持"],
  },
  {
    id: "BR-005",
    requirementType: "other",
    priority: "preferred",
    text: "应对招标文件中的商务条款作出整体接受与响应。",
    keywords: ["商务条款", "接受", "响应", "承诺"],
  },
];

