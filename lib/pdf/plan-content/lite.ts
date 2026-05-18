import type { PlanContent } from "./types";

export const liteContent: PlanContent = {
  tier: "lite",
  recommended: false,
  modules: [
    {
      id: "lite_01_scope",
      toc: { l1: "精简版（Lite）", l2: "使用场景与覆盖能力" },
      title: "精简版（Lite）｜使用场景与覆盖能力",
      blocks: [
        {
          type: "paragraph",
          text: "本方案适用于员工规模约 80–150 人企业，基于参与率 {participationRatePct}% 测算，峰值同时使用人数约 {peakUsersEstimated} 人。该版本以“基础覆盖、快速落地、成本可控”为目标。"
        },
        {
          type: "bullet_list",
          title: "功能覆盖范围（基础）",
          items: [
            "有氧训练：满足日常减脂与心肺提升",
            "基础力量：覆盖主要肌群的入门训练",
            "拉伸恢复：基础拉伸与放松"
          ]
        },
        {
          type: "callout",
          style: "note",
          title: "适用边界",
          lines: [
            "不面向高强度团课与大规模同时使用场景",
            "若参与率长期高于 35% 或峰值>60 人，建议升级至 Standard"
          ]
        }
      ]
    },
    {
      id: "lite_02_equipment_logic",
      toc: { l1: "精简版（Lite）", l2: "器材配置逻辑与依据" },
      title: "精简版（Lite）｜器材配置逻辑与依据",
      blocks: [
        {
          type: "paragraph",
          text: "Lite 以“覆盖关键需求 + 控制品类复杂度”为原则，器材以高利用率项目为主，减少维护与管理成本。"
        },
        {
          type: "table",
          title: "建议配置（Lite）",
          columns: ["类别", "建议配置", "说明"],
          rows: [
            ["有氧", "跑步机 2–3；椭圆机 1–2；动感单车 4–6", "以轮换效率与占地控制为优先"],
            ["固定力量", "6–8 台（胸/背/腿/肩/核心覆盖）", "满足基础全身训练"],
            ["自由力量", "哑铃 1 套；卧推架 1；深蹲架 1；杠铃 2", "满足入门与轻中量训练"],
            ["辅助", "瑜伽垫/弹力带/泡沫轴/壶铃少量", "提升可用性与恢复体验"]
          ]
        }
      ]
    },
    {
      id: "lite_03_schedule_acceptance",
      toc: { l1: "精简版（Lite）", l2: "实施计划与周期" },
      title: "精简版（Lite）｜实施计划与周期",
      blocks: [
        {
          type: "paragraph",
          text: "建议总周期 4–6 周，适合在施工窗口较短的办公场景快速落地。"
        },
        {
          type: "table",
          title: "里程碑计划（Lite）",
          columns: ["阶段", "周期", "要点"],
          rows: [
            ["方案确认", "第 1 周", "布局与点位确认"],
            ["基础准备", "第 2–3 周", "地面/电力/通风条件就绪"],
            ["安装调试", "第 4–5 周", "器材到场安装与调试"],
            ["验收培训", "第 6 周", "验收记录与基础培训"]
          ]
        }
      ]
    },
    {
      id: "lite_04_upgrade_options",
      toc: { l1: "精简版（Lite）", l2: "增购模块与扩展建议" },
      title: "精简版（Lite）｜增购模块与扩展建议",
      blocks: [
        {
          type: "bullet_list",
          title: "建议可选项（按优先级）",
          items: [
            "基础预约：降低拥挤、提升体验",
            "基础团课活动：提升使用率与粘性",
            "巡检维护：降低故障停机"
          ]
        }
      ]
    },
    {
      id: "lite_05_risk_boundary",
      toc: { l1: "精简版（Lite）", l2: "风险控制与边界说明" },
      title: "精简版（Lite）｜风险控制与边界说明",
      blocks: [
        {
          type: "bullet_list",
          title: "风险控制要点",
          items: [
            "运营初期建议安排新手引导与安全告知",
            "建立巡检频率与磨损件更换机制",
            "预算以区间为准，最终以清单确认与合同报价为准"
          ]
        }
      ]
    }
  ]
};