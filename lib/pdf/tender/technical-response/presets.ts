import type { TenderRequirement } from "@/lib/pdf/tender/types";

export const DEFAULT_GYM_TECHNICAL_REQUIREMENTS: TenderRequirement[] = [
  {
    id: "TR-001",
    category: "space",
    requirementType: "space",
    priority: "must",
    text: "应提供完整的健身空间规划方案，包含有氧区、力量区及自由训练区。",
    keywords: ["空间规划", "有氧区", "力量区", "自由训练区"],
  },
  {
    id: "TR-002",
    category: "equipment",
    requirementType: "equipment",
    priority: "must",
    text: "应根据项目需求配置相应健身设备，并提供设备配置明细。",
    keywords: ["健身设备", "设备配置", "配置明细", "设备清单"],
  },
  {
    id: "TR-003",
    category: "capacity",
    requirementType: "capacity",
    priority: "preferred",
    text: "应结合企业员工使用场景进行容量与使用需求配置，满足日常健身使用需求。",
    keywords: ["使用需求", "容量", "员工场景", "日常使用"],
  },
  {
    id: "TR-004",
    category: "implementation",
    requirementType: "implementation",
    priority: "must",
    text: "应提供项目实施安排、交付计划及落地建议。",
    keywords: ["实施安排", "交付计划", "落地建议"],
  },
  {
    id: "TR-005",
    category: "service",
    requirementType: "service",
    priority: "must",
    text: "应提供售后服务、运维支持及后续保障方案。",
    keywords: ["售后服务", "运维支持", "保障方案", "后续保障"],
  },
  {
    id: "TR-006",
    category: "safety",
    requirementType: "safety",
    priority: "preferred",
    text: "应考虑设备安全、场地使用安全及后续运营中的安全保障要求。",
    keywords: ["设备安全", "场地安全", "安全保障", "运营安全"],
  },
];

