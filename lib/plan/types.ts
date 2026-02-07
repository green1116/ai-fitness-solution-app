// lib/plan/types.ts
export type PlanTier = "lite" | "standard" | "pro";

export type PlanInput = {
  planId: string;
  industry: string;
  companySize: number;
  areaSize: number; // ㎡
  budgetRange: string; // "10-20万" 等
};

export type UsageModel = {
  concurrentUsers: string; // "20–30 人"
  participationRate: string; // "15%–25%"
  peakHours: string; // "18:00–20:00"
  mainUsers: string; // "普通员工/无系统健身基础"
};

export type EquipmentItem = {
  name: string;
  qty: number;
  rationale: string;
};

export type PlanResult = {
  tier: PlanTier;
  title: string;
  positioning: string; // 一句话定位
  executiveSummary: string[]; // 执行摘要 bullets
  usage: UsageModel;
  equipments: Record<string, EquipmentItem[]>; // 分区：有氧/力量/拉伸...
  implementation: { name: string; duration: string; desc: string }[];
  addOnModules: { name: string; enabled: boolean; value: string }[];
  recommendation: string; // 为什么推荐/适合谁
  salesCopy: {
    oneLine: string;
    hrPitch: string;
    objectionHandling: string[]; // 反对意见应对
  };
  risks: {
    prerequisites: string[];
    notSuitable: string[];
    mitigations: string[];
    disclaimer: string;
  };
};

export type PlanBundle = {
  input: PlanInput;
  recommended: PlanTier; // 默认 standard
  compare: {
    enabled: boolean;
    items: Array<{
      tier: PlanTier;
      label: string;
      concurrentUsers: string;
      participationRate: string;
      coverage: string;
      fit: string;
      feature: string;
    }>;
    conclusion: string;
  };
  plans: Record<PlanTier, PlanResult>;
};
