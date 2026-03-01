// lib/gym-budget.ts
import type {
  BudgetTier,
  CompanySize,
  Range,
  BudgetLine,
  BudgetSummary,
} from "@/lib/types/gym-budget";

console.log("[GYM_BUDGET_FP] LOADED: 20260227_BAND_TABLE_V1");

const r = (min: number, max: number): Range => ({ min, max });

type RawRow = {
  unitPriceText?: string;
  qtyText: string;
  subtotal: Range;
  fit: string;
  note: string;
};

type FitBand = "small" | "medium" | "large" | "xlarge";

/**
 * 把 companySize 映射为配置档位（用于 summary.lines 这种“概览行”）
 * 你可以按业务调整阈值，但建议与 buildDetailedItems() 的 scale 区间保持一致。
 */
function pickFitBand(companySize: CompanySize): FitBand {
  const n = typeof companySize === "number" ? companySize : Number(companySize || 0) || 0;

  if (n > 0 && n <= 60) return "small";     // ~60人以内
  if (n <= 120) return "medium";           // 61-120
  if (n <= 250) return "large";            // 121-250
  return "xlarge";                         // 250+
}

/** 概览行的 subtotal 缩放（温和处理，避免极端） */
function scaleRange(base: Range, scale: number): Range {
  // 兜底
  const s = Number.isFinite(scale) && scale > 0 ? scale : 1;

  // 温和：不让缩放把范围缩得过狠/放得过夸张
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const eff = clamp(s, 0.7, 1.8);

  return {
    min: Math.round(base.min * eff),
    max: Math.round(base.max * eff),
  };
}

/**
 * ✅ 强兜底：防止 tier 传入 "medium"/"standard"/空字符串 等导致 TABLE.xxx[tier] 为 undefined
 */
function normalizeTier(tier: any): BudgetTier {
  const s = String(tier ?? "").trim().toLowerCase();

  if (s === "low" || s === "l" || s === "basic" || s === "starter") return "low";
  if (s === "mid" || s === "m" || s === "medium" || s === "middle" || s === "standard") return "mid";
  if (s === "high" || s === "h" || s === "premium" || s === "pro") return "high";

  return "mid";
}

/**
 * 原 TABLE：只按 tier 固定一套（等价于 medium 档）
 * 现在升级为：tier + FitBand
 *
 * 说明：
 * - 你原来的 low/mid/high 文案，作为 medium 档（即 61-120）默认；
 * - small/large/xlarge 我给了合理的“数量/适配人数/小计”差异（保持与 scale 区间一致）。
 * - unitPriceText 不需要跟人数变，主要变 qtyText/fit/subtotal/note（note 可保持）。
 */
const TABLE: Record<
  "cardio" | "strength_machine" | "free_weights" | "accessories",
  Record<BudgetTier, Record<FitBand, RawRow>>
> = {
  cardio: {
    low: {
      small: {
        unitPriceText: "¥2,000-5,000 / 台",
        qtyText: "跑步机1-2台；椭圆机1台；动感单车2-3台",
        subtotal: r(12000, 28000),
        fit: "10-30人",
        note: "基础款，家用升级型，无智能联网，基础减震",
      },
      medium: {
        unitPriceText: "¥2,000-5,000 / 台",
        qtyText: "跑步机2-3台；椭圆机1-2台；动感单车3-5台",
        subtotal: r(15000, 35000),
        fit: "50人内",
        note: "基础款，家用升级型，无智能联网，基础减震",
      },
      large: {
        unitPriceText: "¥2,000-5,000 / 台",
        qtyText: "跑步机3-4台；椭圆机2台；动感单车5-7台",
        subtotal: r(22000, 52000),
        fit: "80-150人",
        note: "基础款，家用升级型，无智能联网，基础减震",
      },
      xlarge: {
        unitPriceText: "¥2,000-5,000 / 台",
        qtyText: "跑步机4-6台；椭圆机3台；动感单车7-10台",
        subtotal: r(30000, 70000),
        fit: "150-300人",
        note: "基础款，家用升级型，无智能联网，基础减震",
      },
    },
    mid: {
      small: {
        unitPriceText: "¥6,000-15,000 / 台",
        qtyText: "跑步机2-3台；椭圆机1-2台；动感单车3-5台",
        subtotal: r(45000, 110000),
        fit: "30-60人",
        note: "商用入门款，带基础智能面板、专业减震，适配高频使用",
      },
      medium: {
        unitPriceText: "¥6,000-15,000 / 台",
        qtyText: "跑步机3-4台；椭圆机2-3台；动感单车5-8台",
        subtotal: r(60000, 150000),
        fit: "50-100人",
        note: "商用入门款，带基础智能面板、专业减震，适配高频使用",
      },
      large: {
        unitPriceText: "¥6,000-15,000 / 台",
        qtyText: "跑步机4-6台；椭圆机3-4台；动感单车8-12台",
        subtotal: r(80000, 200000),
        fit: "100-250人",
        note: "商用入门款，带基础智能面板、专业减震，适配高频使用",
      },
      xlarge: {
        unitPriceText: "¥6,000-15,000 / 台",
        qtyText: "跑步机6-8台；椭圆机4-6台；动感单车12-18台",
        subtotal: r(100000, 260000),
        fit: "250-500人",
        note: "商用入门款，带基础智能面板、专业减震，适配高频使用",
      },
    },
    high: {
      small: {
        unitPriceText: "¥16,000-40,000 / 台",
        qtyText: "跑步机3-4台；椭圆机2-3台；动感单车5-8台",
        subtotal: r(160000, 380000),
        fit: "30-60人",
        note: "商用高端款，智能联网、心率监测、多功能调节，健身房专用",
      },
      medium: {
        unitPriceText: "¥16,000-40,000 / 台",
        qtyText: "跑步机4-6台；椭圆机3-5台；动感单车8-12台",
        subtotal: r(200000, 500000),
        fit: "100-200人",
        note: "商用高端款，智能联网、心率监测、多功能调节，健身房专用",
      },
      large: {
        unitPriceText: "¥16,000-40,000 / 台",
        qtyText: "跑步机6-9台；椭圆机5-7台；动感单车12-18台",
        subtotal: r(260000, 650000),
        fit: "200-400人",
        note: "商用高端款，智能联网、心率监测、多功能调节，健身房专用",
      },
      xlarge: {
        unitPriceText: "¥16,000-40,000 / 台",
        qtyText: "跑步机9-12台；椭圆机7-10台；动感单车18-26台",
        subtotal: r(320000, 820000),
        fit: "400-800人",
        note: "商用高端款，智能联网、心率监测、多功能调节，健身房专用",
      },
    },
  },

  strength_machine: {
    low: {
      small: {
        unitPriceText: "¥3,000-8,000 / 台",
        qtyText: "3-4台（核心部位覆盖）",
        subtotal: r(12000, 32000),
        fit: "10-30人",
        note: "简易固定款，钢材厚度适中，基础配重（50-80kg）",
      },
      medium: {
        unitPriceText: "¥3,000-8,000 / 台",
        qtyText: "4-6台（核心部位覆盖）",
        subtotal: r(15000, 40000),
        fit: "50人内",
        note: "简易固定款，钢材厚度适中，基础配重（50-80kg）",
      },
      large: {
        unitPriceText: "¥3,000-8,000 / 台",
        qtyText: "6-8台（核心+常用部位）",
        subtotal: r(22000, 56000),
        fit: "80-150人",
        note: "简易固定款，钢材厚度适中，基础配重（50-80kg）",
      },
      xlarge: {
        unitPriceText: "¥3,000-8,000 / 台",
        qtyText: "8-12台（基础全身覆盖）",
        subtotal: r(30000, 80000),
        fit: "150-300人",
        note: "简易固定款，钢材厚度适中，基础配重（50-80kg）",
      },
    },
    mid: {
      small: {
        unitPriceText: "¥9,000-20,000 / 台",
        qtyText: "5-7台（全部位覆盖）",
        subtotal: r(65000, 140000),
        fit: "30-60人",
        note: "商用标准款，加厚钢材，配重可调（80-150kg），人体工学设计",
      },
      medium: {
        unitPriceText: "¥9,000-20,000 / 台",
        qtyText: "6-10台（全部位覆盖）",
        subtotal: r(80000, 180000),
        fit: "50-100人",
        note: "商用标准款，加厚钢材，配重可调（80-150kg），人体工学设计",
      },
      large: {
        unitPriceText: "¥9,000-20,000 / 台",
        qtyText: "10-14台（全部位+专项）",
        subtotal: r(110000, 240000),
        fit: "100-250人",
        note: "商用标准款，加厚钢材，配重可调（80-150kg），人体工学设计",
      },
      xlarge: {
        unitPriceText: "¥9,000-20,000 / 台",
        qtyText: "14-20台（全身+专项训练区）",
        subtotal: r(140000, 320000),
        fit: "250-500人",
        note: "商用标准款，加厚钢材，配重可调（80-150kg），人体工学设计",
      },
    },
    high: {
      small: {
        unitPriceText: "¥22,000-50,000 / 台",
        qtyText: "8-10台（全部位+专项）",
        subtotal: r(200000, 480000),
        fit: "30-60人",
        note: "商用高端款，进口配件，大配重（150-300kg），可联动智能数据",
      },
      medium: {
        unitPriceText: "¥22,000-50,000 / 台",
        qtyText: "10-15台（全部位+专项）",
        subtotal: r(250000, 600000),
        fit: "100-200人",
        note: "商用高端款，进口配件，大配重（150-300kg），可联动智能数据",
      },
      large: {
        unitPriceText: "¥22,000-50,000 / 台",
        qtyText: "15-22台（全身+专项训练区）",
        subtotal: r(320000, 760000),
        fit: "200-400人",
        note: "商用高端款，进口配件，大配重（150-300kg），可联动智能数据",
      },
      xlarge: {
        unitPriceText: "¥22,000-50,000 / 台",
        qtyText: "22-30台（全功能分区配置）",
        subtotal: r(400000, 980000),
        fit: "400-800人",
        note: "商用高端款，进口配件，大配重（150-300kg），可联动智能数据",
      },
    },
  },

  free_weights: {
    low: {
      small: {
        unitPriceText: "哑铃(套)¥1,000-3,000；卧推架¥2,000-4,000（等）",
        qtyText: "哑铃1套；卧推架1台；深蹲架1台；杠铃1-2根",
        subtotal: r(5000, 10000),
        fit: "10-30人",
        note: "水泥芯哑铃，简易架体，基础杠铃片（总重100kg内）",
      },
      medium: {
        unitPriceText: "哑铃(套)¥1,000-3,000；卧推架¥2,000-4,000（等）",
        qtyText: "哑铃1套；卧推架1台；深蹲架1台；杠铃2根",
        subtotal: r(6000, 12000),
        fit: "50人内",
        note: "水泥芯哑铃，简易架体，基础杠铃片（总重100kg内）",
      },
      large: {
        unitPriceText: "哑铃(套)¥1,000-3,000；卧推架¥2,000-4,000（等）",
        qtyText: "哑铃2套；卧推架2台；深蹲架2台；杠铃3根",
        subtotal: r(9000, 18000),
        fit: "80-150人",
        note: "水泥芯哑铃，简易架体，基础杠铃片（总重100kg内）",
      },
      xlarge: {
        unitPriceText: "哑铃(套)¥1,000-3,000；卧推架¥2,000-4,000（等）",
        qtyText: "哑铃2-3套；卧推架3台；深蹲架3台；杠铃4根",
        subtotal: r(12000, 24000),
        fit: "150-300人",
        note: "水泥芯哑铃，简易架体，基础杠铃片（总重100kg内）",
      },
    },
    mid: {
      small: {
        unitPriceText: "哑铃(套)¥4,000-8,000；卧推架¥5,000-10,000（等）",
        qtyText: "哑铃1-2套；卧推架1-2台；深蹲架1-2台；杠铃2根",
        subtotal: r(24000, 48000),
        fit: "30-60人",
        note: "纯钢哑铃，商用架体，杠铃片总重300-500kg，带安全护具",
      },
      medium: {
        unitPriceText: "哑铃(套)¥4,000-8,000；卧推架¥5,000-10,000（等）",
        qtyText: "哑铃2套；卧推架2台；深蹲架2台；杠铃3根",
        subtotal: r(30000, 60000),
        fit: "50-100人",
        note: "纯钢哑铃，商用架体，杠铃片总重300-500kg，带安全护具",
      },
      large: {
        unitPriceText: "哑铃(套)¥4,000-8,000；卧推架¥5,000-10,000（等）",
        qtyText: "哑铃3套；卧推架3台；深蹲架3台；杠铃4-5根",
        subtotal: r(38000, 82000),
        fit: "100-250人",
        note: "纯钢哑铃，商用架体，杠铃片总重300-500kg，带安全护具",
      },
      xlarge: {
        unitPriceText: "哑铃(套)¥4,000-8,000；卧推架¥5,000-10,000（等）",
        qtyText: "哑铃4套；卧推架4台；深蹲架4台；杠铃6根",
        subtotal: r(48000, 110000),
        fit: "250-500人",
        note: "纯钢哑铃，商用架体，杠铃片总重300-500kg，带安全护具",
      },
    },
    high: {
      small: {
        unitPriceText: "哑铃(套)¥9,000-15,000；卧推架¥12,000-25,000（等）",
        qtyText: "哑铃2套；卧推架2台；深蹲架2台；杠铃3根",
        subtotal: r(65000, 140000),
        fit: "30-60人",
        note: "电镀纯钢哑铃，专业竞技架体，杠铃片总重800-1500kg，全套护具",
      },
      medium: {
        unitPriceText: "哑铃(套)¥9,000-15,000；卧推架¥12,000-25,000（等）",
        qtyText: "哑铃3套；卧推架3台；深蹲架3台；杠铃5根",
        subtotal: r(80000, 180000),
        fit: "100-200人",
        note: "电镀纯钢哑铃，专业竞技架体，杠铃片总重800-1500kg，全套护具",
      },
      large: {
        unitPriceText: "哑铃(套)¥9,000-15,000；卧推架¥12,000-25,000（等）",
        qtyText: "哑铃4套；卧推架4台；深蹲架4台；杠铃6-7根",
        subtotal: r(100000, 240000),
        fit: "200-400人",
        note: "电镀纯钢哑铃，专业竞技架体，杠铃片总重800-1500kg，全套护具",
      },
      xlarge: {
        unitPriceText: "哑铃(套)¥9,000-15,000；卧推架¥12,000-25,000（等）",
        qtyText: "哑铃5-6套；卧推架6台；深蹲架6台；杠铃10根",
        subtotal: r(130000, 320000),
        fit: "400-800人",
        note: "电镀纯钢哑铃，专业竞技架体，杠铃片总重800-1500kg，全套护具",
      },
    },
  },

  accessories: {
    low: {
      small: {
        unitPriceText: "¥50-500 / 件",
        qtyText: "瑜伽垫10-20张；健身球3-6个；弹力带6套；腹肌板1台",
        subtotal: r(1500, 6000),
        fit: "10-30人",
        note: "基础款瑜伽垫/弹力带，简易腹肌板，无按摩椅",
      },
      medium: {
        unitPriceText: "¥50-500 / 件",
        qtyText: "瑜伽垫20-30张；健身球5-10个；弹力带10套；腹肌板1-2台",
        subtotal: r(2000, 8000),
        fit: "50人内",
        note: "基础款瑜伽垫/弹力带，简易腹肌板，无按摩椅",
      },
      large: {
        unitPriceText: "¥50-500 / 件",
        qtyText: "瑜伽垫40-60张；健身球10-15个；弹力带15套；腹肌板2-3台",
        subtotal: r(3500, 12000),
        fit: "80-150人",
        note: "基础款瑜伽垫/弹力带，简易腹肌板，无按摩椅",
      },
      xlarge: {
        unitPriceText: "¥50-500 / 件",
        qtyText: "瑜伽垫60-90张；健身球15-25个；弹力带25套；腹肌板3-4台",
        subtotal: r(5000, 20000),
        fit: "150-300人",
        note: "基础款瑜伽垫/弹力带，简易腹肌板，无按摩椅",
      },
    },
    mid: {
      small: {
        unitPriceText: "¥100-1,000 / 件",
        qtyText: "瑜伽垫30-50张；健身球8-15个；弹力带15套；腹肌板2-3台；按摩椅1台",
        subtotal: r(8000, 22000),
        fit: "30-60人",
        note: "专业款瑜伽垫/弹力带，商用腹肌板，入门款按摩椅",
      },
      medium: {
        unitPriceText: "¥100-1,000 / 件",
        qtyText: "瑜伽垫50-80张；健身球10-20个；弹力带20套；腹肌板3-5台；按摩椅1-2台",
        subtotal: r(10000, 30000),
        fit: "50-100人",
        note: "专业款瑜伽垫/弹力带，商用腹肌板，入门款按摩椅",
      },
      large: {
        unitPriceText: "¥100-1,000 / 件",
        qtyText: "瑜伽垫80-120张；健身球20-30个；弹力带30套；腹肌板5-7台；按摩椅2-3台",
        subtotal: r(14000, 42000),
        fit: "100-250人",
        note: "专业款瑜伽垫/弹力带，商用腹肌板，入门款按摩椅",
      },
      xlarge: {
        unitPriceText: "¥100-1,000 / 件",
        qtyText: "瑜伽垫120-180张；健身球30-50个；弹力带50套；腹肌板7-10台；按摩椅3-5台",
        subtotal: r(18000, 60000),
        fit: "250-500人",
        note: "专业款瑜伽垫/弹力带，商用腹肌板，入门款按摩椅",
      },
    },
    high: {
      small: {
        unitPriceText: "¥300-2,000 / 件",
        qtyText: "瑜伽垫60-100张；健身球15-25个；弹力带20套；腹肌板3-5台；按摩椅1-2台",
        subtotal: r(22000, 60000),
        fit: "30-60人",
        note: "进口瑜伽垫/弹力带，高端竞技腹肌板，商用按摩椅（带热敷/拉伸）",
      },
      medium: {
        unitPriceText: "¥300-2,000 / 件",
        qtyText: "瑜伽垫100-150张；健身球20-30个；弹力带30套；腹肌板5-8台；按摩椅3-5台",
        subtotal: r(30000, 80000),
        fit: "100-200人",
        note: "进口瑜伽垫/弹力带，高端竞技腹肌板，商用按摩椅（带热敷/拉伸）",
      },
      large: {
        unitPriceText: "¥300-2,000 / 件",
        qtyText: "瑜伽垫150-220张；健身球30-50个；弹力带45套；腹肌板8-12台；按摩椅5-7台",
        subtotal: r(42000, 110000),
        fit: "200-400人",
        note: "进口瑜伽垫/弹力带，高端竞技腹肌板，商用按摩椅（带热敷/拉伸）",
      },
      xlarge: {
        unitPriceText: "¥300-2,000 / 件",
        qtyText: "瑜伽垫220-320张；健身球50-80个；弹力带70套；腹肌板12-18台；按摩椅7-10台",
        subtotal: r(55000, 150000),
        fit: "400-800人",
        note: "进口瑜伽垫/弹力带，高端竞技腹肌板，商用按摩椅（带热敷/拉伸）",
      },
    },
  },
};

const OVERALL: Record<BudgetTier, Range> = {
  low: r(50000, 100000),
  mid: r(200000, 450000),
  high: r(600000, 1500000),
};

const NOTES = [
  "常规配置数量按企业员工健身参与率30%-50%核算，可根据实际参与人数增减",
  "高预算等级可额外增加智能健身镜、体测仪、健身房管理系统等增值设备，费用另计",
  "小型健身角（10-20人）低预算总计可压缩至¥20,000-¥40,000（保留1-2台有氧+简易力量设备）",
  "不同品牌（国产/进口）、材质、功能会导致单价上下浮动10%-30%",
];

function sumRange(a: Range, b: Range): Range {
  return { min: a.min + b.min, max: a.max + b.max };
}

function scaleFromCompanySize(companySize: CompanySize): number {
  const sizeNum = typeof companySize === "number" ? companySize : Number(companySize || 0) || 0;

  let scale = 1.0;
  if (sizeNum > 0 && sizeNum <= 60) scale = 0.8;
  else if (sizeNum <= 120) scale = 1.0;
  else if (sizeNum <= 250) scale = 1.25;
  else scale = 1.5;

  return scale;
}

export function buildBudgetSummary(
  tier: BudgetTier,
  companySize: CompanySize
): BudgetSummary {
  const t = normalizeTier(tier);
  const band = pickFitBand(companySize);

  // 用与明细一致的 scale，保证概览 subtotal 与 items 逻辑同向变化（避免 summary “看起来不变”）
  const scale = scaleFromCompanySize(companySize);

  const sizeNum =
    typeof companySize === "number" ? companySize : Number(companySize || 0) || 0;

  const fitText =
    sizeNum > 0 && sizeNum <= 60
      ? "30-60人"
      : sizeNum <= 120
      ? "50-100人"
      : sizeNum <= 250
      ? "100-250人"
      : "250-500人";

  const scaleQtyText = (s: string) => {
    if (!s) return s;

    const toInt = (v: number) => {
      const n = Math.round(v * scale);
      return n < 1 ? 1 : n;
    };

    s = s.replace(/(\d+)\s*[-–~～]\s*(\d+)/g, (_, a, b) => {
      const a0 = toInt(Number(a));
      const b0 = toInt(Number(b));
      const lo = Math.min(a0, b0);
      const hi = Math.max(a0, b0);
      return `${lo}-${hi}`;
    });

    // 把 "2-2" 这种等值范围压成 "2"
    s = s.replace(/\b(\d+)\s*[-–~～]\s*\1\b/g, "$1");

    s = s.replace(/(\d+)(?=\s*(台|套|张|个|根|件|人|；|，|。|\)|（|$))/g, (_, a) => {
      return String(toInt(Number(a)));
    });

    return s;
  };

  const scaleRangeLocal = (x: Range): Range => ({
    min: Math.round(x.min * scale),
    max: Math.round(x.max * scale),
  });

  const mkLine = (
    key: "cardio" | "strength_machine" | "free_weights" | "accessories",
    name: string
  ): BudgetLine => {
    const row = TABLE[key][t][band];
    return {
      category: key,
      categoryName: name,
      tier: t,
      unitPriceText: row.unitPriceText ?? "",
      qtyText: scaleQtyText(row.qtyText),
      subtotal: scaleRangeLocal(row.subtotal),
      fit: fitText,
      note: row.note,
    };
  };

  const lines: BudgetLine[] = [
    mkLine("cardio", "有氧设备"),
    mkLine("strength_machine", "力量设备（固定器械）"),
    mkLine("free_weights", "自由力量设备"),
    mkLine("accessories", "辅助设备"),
  ];

  const estimatedBySubtotals = lines.reduce(
    (acc, line) => sumRange(acc, line.subtotal),
    r(0, 0)
  );

  const items = buildDetailedItems(t, companySize);

  return {
    tier: t,
    companySize,
    overallTotal: { min: Math.round(OVERALL[t].min * scale), max: Math.round(OVERALL[t].max * scale) },
    estimatedBySubtotals,
    lines,
    notes: NOTES,
    items,
  };
}

function buildDetailedItems(tier: BudgetTier, companySize: CompanySize) {
  // ---- scale: 按人数档位调整数量 ----
  const sizeNum =
    typeof companySize === "number" ? companySize : Number(companySize || 0) || 0;

  let scale = 1.0;
  if (sizeNum > 0 && sizeNum <= 60) scale = 0.8;
  else if (sizeNum <= 120) scale = 1.0;
  else if (sizeNum <= 250) scale = 1.25;
  else scale = 1.5;

  const roundQty = (q: number) => {
    const n = Math.round(q * scale);
    return n < 1 ? 1 : n;
  };

  const applyScale = (items: any[]) =>
    items.map((it) => {
      const qty = roundQty(Number(it.qty || 0) || 1);
      const unitMin = Number(it.unitMin || 0) || 0;
      const unitMax = Number(it.unitMax || 0) || 0;

      return {
        ...it,
        qty,
        subtotalMin: unitMin ? unitMin * qty : it.subtotalMin ?? undefined,
        subtotalMax: unitMax ? unitMax * qty : it.subtotalMax ?? undefined,
      };
    });

  if (tier === "low") {
    const base = [
      { category: "有氧", name: "跑步机（家用升级型）", qty: 2, unitMin: 2000, unitMax: 5000, subtotalMin: 4000, subtotalMax: 10000, remark: "基础减震，无智能联网" },
      { category: "有氧", name: "椭圆机（家用升级型）", qty: 1, unitMin: 2000, unitMax: 5000, subtotalMin: 2000, subtotalMax: 5000, remark: "基础款" },
      { category: "有氧", name: "动感单车（家用升级型）", qty: 4, unitMin: 2000, unitMax: 5000, subtotalMin: 8000, subtotalMax: 20000, remark: "基础款" },
      { category: "力量", name: "固定器械（核心部位）", qty: 5, unitMin: 3000, unitMax: 8000, subtotalMin: 15000, subtotalMax: 40000, remark: "简易固定款，钢材厚度适中" },
      { category: "力量", name: "哑铃套装", qty: 1, unitMin: 1000, unitMax: 3000, subtotalMin: 1000, subtotalMax: 3000, remark: "水泥芯哑铃" },
      { category: "力量", name: "卧推架", qty: 1, unitMin: 2000, unitMax: 4000, subtotalMin: 2000, subtotalMax: 4000, remark: "简易架体" },
      { category: "力量", name: "深蹲架", qty: 1, unitMin: 2000, unitMax: 4000, subtotalMin: 2000, subtotalMax: 4000, remark: "简易架体" },
      { category: "辅助", name: "瑜伽垫", qty: 25, unitMin: 50, unitMax: 200, subtotalMin: 1250, subtotalMax: 5000, remark: "基础款" },
      { category: "辅助", name: "健身球", qty: 8, unitMin: 50, unitMax: 200, subtotalMin: 400, subtotalMax: 1600, remark: "基础款" },
      { category: "辅助", name: "弹力带套装", qty: 10, unitMin: 50, unitMax: 200, subtotalMin: 500, subtotalMax: 2000, remark: "基础款" },
    ];
    return applyScale(base);
  }

  if (tier === "mid") {
    const base = [
      { category: "有氧", name: "跑步机（商用入门）", qty: 3, unitMin: 6000, unitMax: 15000, subtotalMin: 18000, subtotalMax: 45000, remark: "带基础智能面板、专业减震" },
      { category: "有氧", name: "椭圆机（商用入门）", qty: 2, unitMin: 6000, unitMax: 15000, subtotalMin: 12000, subtotalMax: 30000, remark: "商用标准款" },
      { category: "有氧", name: "动感单车（商用入门）", qty: 6, unitMin: 6000, unitMax: 15000, subtotalMin: 36000, subtotalMax: 90000, remark: "适配高频使用" },
      { category: "力量", name: "固定器械（全部位覆盖）", qty: 8, unitMin: 9000, unitMax: 20000, subtotalMin: 72000, subtotalMax: 160000, remark: "商用标准款，加厚钢材，配重可调" },
      { category: "力量", name: "哑铃套装", qty: 2, unitMin: 4000, unitMax: 8000, subtotalMin: 8000, subtotalMax: 16000, remark: "纯钢哑铃" },
      { category: "力量", name: "卧推架", qty: 2, unitMin: 5000, unitMax: 10000, subtotalMin: 10000, subtotalMax: 20000, remark: "商用架体，带安全护具" },
      { category: "力量", name: "深蹲架", qty: 2, unitMin: 5000, unitMax: 10000, subtotalMin: 10000, subtotalMax: 20000, remark: "商用架体，带安全护具" },
      { category: "辅助", name: "瑜伽垫", qty: 65, unitMin: 100, unitMax: 500, subtotalMin: 6500, subtotalMax: 32500, remark: "专业款" },
      { category: "辅助", name: "健身球", qty: 15, unitMin: 100, unitMax: 500, subtotalMin: 1500, subtotalMax: 7500, remark: "专业款" },
      { category: "辅助", name: "弹力带套装", qty: 20, unitMin: 100, unitMax: 500, subtotalMin: 2000, subtotalMax: 10000, remark: "专业款" },
      { category: "辅助", name: "腹肌板", qty: 4, unitMin: 1000, unitMax: 3000, subtotalMin: 4000, subtotalMax: 12000, remark: "商用款" },
      { category: "辅助", name: "按摩椅", qty: 1, unitMin: 8000, unitMax: 20000, subtotalMin: 8000, subtotalMax: 20000, remark: "入门款" },
    ];
    return applyScale(base);
  }

  // high
  const base = [
    { category: "有氧", name: "跑步机（商用高端）", qty: 5, unitMin: 16000, unitMax: 40000, subtotalMin: 80000, subtotalMax: 200000, remark: "智能联网、心率监测、多功能调节" },
    { category: "有氧", name: "椭圆机（商用高端）", qty: 4, unitMin: 16000, unitMax: 40000, subtotalMin: 64000, subtotalMax: 160000, remark: "健身房专用" },
    { category: "有氧", name: "动感单车（商用高端）", qty: 10, unitMin: 16000, unitMax: 40000, subtotalMin: 160000, subtotalMax: 400000, remark: "智能联网" },
    { category: "力量", name: "固定器械（全部位+专项）", qty: 12, unitMin: 22000, unitMax: 50000, subtotalMin: 264000, subtotalMax: 600000, remark: "进口配件，大配重，可联动智能数据" },
    { category: "力量", name: "哑铃套装", qty: 3, unitMin: 9000, unitMax: 15000, subtotalMin: 27000, subtotalMax: 45000, remark: "电镀纯钢哑铃" },
    { category: "力量", name: "卧推架", qty: 3, unitMin: 12000, unitMax: 25000, subtotalMin: 36000, subtotalMax: 75000, remark: "专业竞技架体，全套护具" },
    { category: "力量", name: "深蹲架", qty: 3, unitMin: 12000, unitMax: 25000, subtotalMin: 36000, subtotalMax: 75000, remark: "专业竞技架体，全套护具" },
    { category: "辅助", name: "瑜伽垫", qty: 125, unitMin: 300, unitMax: 1000, subtotalMin: 37500, subtotalMax: 125000, remark: "进口专业款" },
    { category: "辅助", name: "健身球", qty: 25, unitMin: 300, unitMax: 1000, subtotalMin: 7500, subtotalMax: 25000, remark: "进口专业款" },
    { category: "辅助", name: "弹力带套装", qty: 30, unitMin: 300, unitMax: 1000, subtotalMin: 9000, subtotalMax: 30000, remark: "进口专业款" },
    { category: "辅助", name: "腹肌板", qty: 6, unitMin: 2000, unitMax: 5000, subtotalMin: 12000, subtotalMax: 30000, remark: "高端竞技款" },
    { category: "辅助", name: "按摩椅", qty: 4, unitMin: 15000, unitMax: 40000, subtotalMin: 60000, subtotalMax: 160000, remark: "商用款（带热敷/拉伸）" },
  ];
  return applyScale(base);
}