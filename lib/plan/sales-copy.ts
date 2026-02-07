// lib/plan/sales-copy.ts
import { PlanInput, PlanTier } from "./types";
import { TIER_LABEL } from "./tiers";

export function buildSalesCopy(input: PlanInput, tier: PlanTier) {
  const label = TIER_LABEL[tier];

  if (tier === "standard") {
    return {
      oneLine: `推荐 ${label}：预算、体验与扩展性之间的最优平衡。`,
      hrPitch:
        "这套配置不需要复杂管理，就能长期支持员工健康使用；既满足多数人的基础训练，也保留后续升级空间。",
      objectionHandling: [
        "如果担心使用率：可以先按标准版落地，再用 2–4 周数据决定是否加配。",
        "如果担心安全：标准版默认选择更适合企业环境的训练形式与器材类型，并建议配套安全提示。",
      ],
    };
  }

  if (tier === "lite") {
    return {
      oneLine: `选择 ${label}：低成本、可快速落地的试点方案。`,
      hrPitch:
        "适合先验证员工使用意愿与高峰时段，再决定是否升级到标准版或强化版，投入更可控。",
      objectionHandling: [
        "如果担心配置不够：精简版就是为试点准备，后续升级路径清晰。",
        "如果担心体验：建议把体验提升放到第二阶段，用数据驱动增配。",
      ],
    };
  }

  return {
    oneLine: `选择 ${label}：以员工体验与福利感知为优先。`,
    hrPitch:
      "更适合高人效团队或把健康福利作为雇主品牌的一部分；它提升可用性与体验密度，员工感知更强。",
    objectionHandling: [
      "如果担心成本：强化版的价值在于更高并发与体验感知，适合把福利当成留才策略的企业。",
      "如果担心空间：强化版会更依赖布局优化与动线设计，建议配合布局设计模块。",
    ],
  };
}
