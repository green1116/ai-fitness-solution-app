// lib/plan/builder.ts
import { PlanBundle, PlanInput, PlanResult, PlanTier } from "./types";
import { TIER_LABEL, TIER_USAGE } from "./tiers";
import { buildSalesCopy } from "./sales-copy";

export function buildPlan(input: PlanInput, tier: PlanTier): PlanResult {
  const usage = {
    ...TIER_USAGE[tier],
    mainUsers: "普通员工 / 无系统健身基础",
  };

  const positioning = `为 ${input.companySize} 人规模${input.industry}企业打造的办公健康支持解决方案`;

  // 执行摘要（结论先行）
  const executiveSummary = [
    `适用于约 ${input.companySize} 人规模企业的办公健身/健康支持场景`,
    `在约 ${input.areaSize}㎡ 空间内，可支持 ${usage.concurrentUsers} 同时使用`,
    "覆盖员工日常健康维护、体能支持与压力释放三类核心需求",
    `预算控制在 ${input.budgetRange}，优先保障安全性与商用品质`,
    "本方案为标准配置，可根据使用强度与预算进行扩展或精简",
  ];

  // 器材（示例：你后续可以替换成你真实清单生成逻辑）
  const treadmillQty = tier === "lite" ? 1 : tier === "standard" ? 2 : 3;
  const smithQty = tier === "lite" ? 0 : 1;
  const dumbbellQty = tier === "pro" ? 2 : 1;

  const equipments: PlanResult["equipments"] = {
    有氧: [
      {
        name: "商用跑步机",
        qty: treadmillQty,
        rationale: "覆盖基础心肺训练需求，适合多数非健身基础员工。",
      },
    ],
    力量: [
      ...(smithQty
        ? [
            {
              name: "史密斯机",
              qty: smithQty,
              rationale: "兼顾复合训练能力与企业环境安全性，降低自由重量风险。",
            },
          ]
        : []),
    ],
    自由力量: [
      {
        name: "可调哑铃组",
        qty: dumbbellQty,
        rationale: "覆盖多关节训练，提升训练灵活性并节省空间。",
      },
    ],
    拉伸: [
      {
        name: "拉伸垫/泡沫轴/弹力带",
        qty: 1,
        rationale: "缓解久坐带来的肩颈、腰背不适，提升使用闭环。",
      },
    ],
  };

  const implementation = [
    { name: "阶段 1", duration: "1–2 周", desc: "需求复核、场地条件确认、设备清单与预算锁定" },
    { name: "阶段 2", duration: "2–4 周", desc: "设备采购、物流、安装调试与基础使用培训" },
    { name: "阶段 3", duration: "持续", desc: "反馈收集、配置优化建议、扩展升级规划" },
  ];

  const addOnModules = [
    { name: "布局设计", enabled: true, value: "优化空间利用率，减少安全隐患，提高整体使用体验" },
    { name: "康复模块", enabled: tier !== "lite", value: "覆盖久坐人群肩颈/腰背放松需求" },
    { name: "三维渲染", enabled: tier !== "lite", value: "用于内部汇报、审批展示与决策沟通" },
  ];

  const recommendation =
    tier === "standard"
      ? "标准版：在预算、体验与扩展性之间取得最佳平衡，适合大多数企业直接落地。"
      : tier === "lite"
      ? "精简版：低成本试点配置，适合先验证使用率与高峰需求，再决定升级。"
      : "强化版：体验优先与高并发能力，适合福利导向与高人效团队。";

  const risks = {
    prerequisites: [
      "适用于身体健康、无重大运动禁忌的员工人群",
      "建议制定基础使用规范与安全提示（企业环境必备）",
    ],
    notSuitable: [
      "员工以康复/医疗训练为主要需求（建议定制化康复方案）",
      "场地层高/承重/通风条件无法满足设备与安全要求",
      "无法安排任何形式的使用管理或安全提示机制",
    ],
    mitigations: [
      "配套基础使用说明与安全标识（高风险动作明确限制）",
      "定期检查器材状态与维护记录",
      "高峰时段引导分流与预约机制（可选）",
    ],
    disclaimer:
      "本方案为通用配置建议，具体器材型号与数量可根据实际场地条件与预算进行微调。",
  };

  return {
    tier,
    title: TIER_LABEL[tier],
    positioning,
    executiveSummary,
    usage,
    equipments,
    implementation,
    addOnModules,
    recommendation,
    salesCopy: buildSalesCopy(input, tier),
    risks,
  };
}

export function buildPlanBundle(args: {
  planId: string;
  industry: string;
  companySize: number;
  areaSize: number;
  budgetRange: string;
  includeCompare: boolean;
}): PlanBundle {
  const input: PlanInput = {
    planId: args.planId,
    industry: args.industry,
    companySize: args.companySize,
    areaSize: args.areaSize,
    budgetRange: args.budgetRange,
  };

  const lite = buildPlan(input, "lite");
  const standard = buildPlan(input, "standard");
  const pro = buildPlan(input, "pro");

  return {
    input,
    recommended: "standard",
    compare: {
      enabled: Boolean(args.includeCompare),
      items: [
        {
          tier: "lite",
          label: TIER_LABEL.lite,
          concurrentUsers: lite.usage.concurrentUsers,
          participationRate: lite.usage.participationRate,
          coverage: "基础有氧 + 基础力量",
          fit: "试点部署 / 预算敏感",
          feature: "最低成本可用，安全优先",
        },
        {
          tier: "standard",
          label: TIER_LABEL.standard,
          concurrentUsers: standard.usage.concurrentUsers,
          participationRate: standard.usage.participationRate,
          coverage: "有氧 / 力量 / 拉伸",
          fit: "大多数企业办公健身需求",
          feature: "性价比最优，支持扩展",
        },
        {
          tier: "pro",
          label: TIER_LABEL.pro,
          concurrentUsers: pro.usage.concurrentUsers,
          participationRate: pro.usage.participationRate,
          coverage: "有氧 / 力量 / 拉伸 / 康复",
          fit: "高人效团队 / 福利导向",
          feature: "体验优先，并发更高",
        },
      ],
      conclusion: "当前推荐方案为 标准版配置，在预算、使用体验与长期扩展性之间取得最佳平衡。",
    },
    plans: { lite, standard, pro },
  };
}
