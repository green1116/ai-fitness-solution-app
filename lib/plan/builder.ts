import { PlanBundle, PlanInput, PlanResult, PlanTier } from "./types";
import { TIER_LABEL, TIER_USAGE } from "./tiers";
import { buildSalesCopy } from "./sales-copy";

export function buildPlan(input: PlanInput, tier: PlanTier): PlanResult {
  const usage = {
    ...TIER_USAGE[tier],
    mainUsers: "企业员工为主，兼顾零基础与轻运动人群",
  };

  const positioning = `面向 ${input.companySize} 人规模${input.industry}企业的办公健身空间建设方案`;

  // 执行摘要（结论先行）
  const executiveSummary = [
    `适用于约 ${input.companySize} 人规模企业的办公健身与员工健康支持场景`,
    `在约 ${input.areaSize}㎡ 空间内，可支持 ${usage.concurrentUsers} 人同时使用`,
    "覆盖员工日常健康维护、基础体能支持与工作压力释放三类核心需求",
    `预算建议控制在 ${input.budgetRange}，优先保障安全性、耐用性与商用品质`,
    "本方案为标准化建议配置，可根据实际使用强度、管理要求与预算条件进行扩展或精简",
  ];

  // 器材（示例：后续可替换为真实清单生成逻辑）
  const treadmillQty = tier === "lite" ? 1 : tier === "standard" ? 2 : 3;
  const smithQty = tier === "lite" ? 0 : 1;
  const dumbbellQty = tier === "pro" ? 2 : 1;

  const equipments: PlanResult["equipments"] = {
    有氧: [
      {
        name: "商用跑步机",
        qty: treadmillQty,
        rationale: "满足基础心肺训练需求，适合大多数零基础与轻运动人群日常使用。",
      },
    ],
    力量: [
      ...(smithQty
        ? [
            {
              name: "史密斯机",
              qty: smithQty,
              rationale: "兼顾复合训练能力与企业场景下的安全性要求，有助于降低自由重量训练风险。",
            },
          ]
        : []),
    ],
    自由力量: [
      {
        name: "可调哑铃组",
        qty: dumbbellQty,
        rationale: "覆盖多关节训练需求，兼顾训练灵活性、空间利用率与配置完整性。",
      },
    ],
    拉伸: [
      {
        name: "拉伸垫 / 泡沫轴 / 弹力带",
        qty: 1,
        rationale: "适用于久坐办公人群的肩颈、腰背与下肢放松需求，形成更完整的使用闭环。",
      },
    ],
  };

  const implementation = [
    {
      name: "阶段 1",
      duration: "1–2 周",
      desc: "完成需求复核、场地条件确认、设备清单校准与预算区间锁定",
    },
    {
      name: "阶段 2",
      duration: "2–4 周",
      desc: "完成设备采购、物流组织、现场安装调试与基础使用培训",
    },
    {
      name: "阶段 3",
      duration: "持续",
      desc: "开展使用反馈收集、配置优化建议与后续扩展升级规划",
    },
  ];

  const addOnModules = [
    {
      name: "布局设计",
      enabled: true,
      value: "优化空间利用效率，降低动线冲突与安全隐患，提升整体使用体验",
    },
    {
      name: "康复模块",
      enabled: tier !== "lite",
      value: "补充久坐办公人群的肩颈、腰背放松与恢复性训练需求",
    },
    {
      name: "三维渲染",
      enabled: tier !== "lite",
      value: "便于内部汇报、审批展示、跨部门沟通与项目决策说明",
    },
  ];

  const recommendation =
    tier === "standard"
      ? "标准版：在预算控制、使用体验与后续扩展之间取得较优平衡，适合大多数企业直接落地。"
      : tier === "lite"
      ? "精简版：适用于试点部署与预算敏感场景，便于优先验证使用率、空间适配性与员工反馈。"
      : "强化版：强调使用体验、配置完整性与并发承载能力，适用于福利导向明确或高频使用场景。";

  const risks = {
    prerequisites: [
      "适用于身体健康、无重大运动禁忌的一般员工人群",
      "建议同步建立基础使用规范、安全提示与日常巡检要求",
    ],
    notSuitable: [
      "员工以康复治疗或医疗训练为主要需求的场景（建议定制康复方案）",
      "场地层高、承重、通风或电力条件无法满足设备与安全要求",
      "无法安排任何形式的使用管理、安全提示或基础维护机制",
    ],
    mitigations: [
      "配套基础使用说明、安全标识与高风险动作限制提示",
      "建立设备状态检查与维护记录机制，降低使用风险",
      "在高峰时段引导分流，必要时可配合预约或限流机制",
    ],
    disclaimer:
      "本方案为标准化配置建议，具体器材型号、数量与辅助模块可根据实际场地条件、管理要求与预算情况进行调整。",
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
          fit: "试点部署 / 预算敏感场景",
          feature: "配置精简，优先满足基础可用与安全要求",
        },
        {
          tier: "standard",
          label: TIER_LABEL.standard,
          concurrentUsers: standard.usage.concurrentUsers,
          participationRate: standard.usage.participationRate,
          coverage: "有氧 / 力量 / 拉伸",
          fit: "大多数企业办公健身场景",
          feature: "综合平衡较优，兼顾体验、预算与扩展性",
        },
        {
          tier: "pro",
          label: TIER_LABEL.pro,
          concurrentUsers: pro.usage.concurrentUsers,
          participationRate: pro.usage.participationRate,
          coverage: "有氧 / 力量 / 拉伸 / 康复",
          fit: "高频使用 / 福利导向场景",
          feature: "配置完整，并发承载能力与体验表现更优",
        },
      ],
      conclusion:
        "当前推荐方案为标准版配置，在预算控制、使用体验与长期扩展性之间取得较优平衡，更适合多数企业直接推进。",
    },
    plans: { lite, standard, pro },
  };
}