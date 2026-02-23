// lib/gym-budget.ts
import type {
  BudgetTier,
  CompanySize,
  Range,
  BudgetLine,
  BudgetSummary,
} from "@/lib/types/gym-budget";

const r = (min: number, max: number): Range => ({ min, max });

type RawRow = {
  unitPriceText?: string;
  qtyText: string;
  subtotal: Range;
  fit: string;
  note: string;
};

const TABLE: Record<
  "cardio" | "strength_machine" | "free_weights" | "accessories",
  Record<BudgetTier, RawRow>
> = {
  cardio: {
    low: {
      unitPriceText: "¥2,000-5,000 / 台",
      qtyText: "跑步机2-3台；椭圆机1-2台；动感单车3-5台",
      subtotal: r(15000, 35000),
      fit: "50人内",
      note: "基础款，家用升级型，无智能联网，基础减震",
    },
    mid: {
      unitPriceText: "¥6,000-15,000 / 台",
      qtyText: "跑步机3-4台；椭圆机2-3台；动感单车5-8台",
      subtotal: r(60000, 150000),
      fit: "50-100人",
      note: "商用入门款，带基础智能面板、专业减震，适配高频使用",
    },
    high: {
      unitPriceText: "¥16,000-40,000 / 台",
      qtyText: "跑步机4-6台；椭圆机3-5台；动感单车8-12台",
      subtotal: r(200000, 500000),
      fit: "100-200人",
      note: "商用高端款，智能联网、心率监测、多功能调节，健身房专用",
    },
  },

  strength_machine: {
    low: {
      unitPriceText: "¥3,000-8,000 / 台",
      qtyText: "4-6台（核心部位覆盖）",
      subtotal: r(15000, 40000),
      fit: "50人内",
      note: "简易固定款，钢材厚度适中，基础配重（50-80kg）",
    },
    mid: {
      unitPriceText: "¥9,000-20,000 / 台",
      qtyText: "6-10台（全部位覆盖）",
      subtotal: r(80000, 180000),
      fit: "50-100人",
      note: "商用标准款，加厚钢材，配重可调（80-150kg），人体工学设计",
    },
    high: {
      unitPriceText: "¥22,000-50,000 / 台",
      qtyText: "10-15台（全部位+专项）",
      subtotal: r(250000, 600000),
      fit: "100-200人",
      note: "商用高端款，进口配件，大配重（150-300kg），可联动智能数据",
    },
  },

  free_weights: {
    low: {
      unitPriceText: "哑铃(套)¥1,000-3,000；卧推架¥2,000-4,000（等）",
      qtyText: "哑铃1套；卧推架1台；深蹲架1台；杠铃2根",
      subtotal: r(6000, 12000),
      fit: "50人内",
      note: "水泥芯哑铃，简易架体，基础杠铃片（总重100kg内）",
    },
    mid: {
      unitPriceText: "哑铃(套)¥4,000-8,000；卧推架¥5,000-10,000（等）",
      qtyText: "哑铃2套；卧推架2台；深蹲架2台；杠铃3根",
      subtotal: r(30000, 60000),
      fit: "50-100人",
      note: "纯钢哑铃，商用架体，杠铃片总重300-500kg，带安全护具",
    },
    high: {
      unitPriceText: "哑铃(套)¥9,000-15,000；卧推架¥12,000-25,000（等）",
      qtyText: "哑铃3套；卧推架3台；深蹲架3台；杠铃5根",
      subtotal: r(80000, 180000),
      fit: "100-200人",
      note: "电镀纯钢哑铃，专业竞技架体，杠铃片总重800-1500kg，全套护具",
    },
  },

  accessories: {
    low: {
      unitPriceText: "¥50-500 / 件",
      qtyText: "瑜伽垫20-30张；健身球5-10个；弹力带10套；腹肌板1-2台",
      subtotal: r(2000, 8000),
      fit: "50人内",
      note: "基础款瑜伽垫/弹力带，简易腹肌板，无按摩椅",
    },
    mid: {
      unitPriceText: "¥100-1,000 / 件",
      qtyText: "瑜伽垫50-80张；健身球10-20个；弹力带20套；腹肌板3-5台；按摩椅1-2台",
      subtotal: r(10000, 30000),
      fit: "50-100人",
      note: "专业款瑜伽垫/弹力带，商用腹肌板，入门款按摩椅",
    },
    high: {
      unitPriceText: "¥300-2,000 / 件",
      qtyText: "瑜伽垫100-150张；健身球20-30个；弹力带30套；腹肌板5-8台；按摩椅3-5台",
      subtotal: r(30000, 80000),
      fit: "100-200人",
      note: "进口瑜伽垫/弹力带，高端竞技腹肌板，商用按摩椅（带热敷/拉伸）",
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

function normalizeTier(tier: any): BudgetTier {
  const s = String(tier ?? "").trim().toLowerCase();

  if (s === "low" || s === "l" || s === "basic" || s === "starter") return "low";
  if (s === "mid" || s === "m" || s === "medium" || s === "middle" || s === "standard") return "mid";
  if (s === "high" || s === "h" || s === "premium" || s === "pro") return "high";

  return "mid";
}

export function buildBudgetSummary(tier: BudgetTier, companySize: CompanySize): BudgetSummary {
  const t = normalizeTier(tier);

  const lines: BudgetLine[] = [
    {
      category: "cardio",
      categoryName: "有氧设备",
      tier: t,
      unitPriceText: TABLE.cardio[t].unitPriceText ?? "",
      qtyText: TABLE.cardio[t].qtyText,
      subtotal: TABLE.cardio[t].subtotal,
      fit: TABLE.cardio[t].fit,
      note: TABLE.cardio[t].note,
    },
    {
      category: "strength_machine",
      categoryName: "力量设备（固定器械）",
      tier: t,
      unitPriceText: TABLE.strength_machine[t].unitPriceText ?? "",
      qtyText: TABLE.strength_machine[t].qtyText,
      subtotal: TABLE.strength_machine[t].subtotal,
      fit: TABLE.strength_machine[t].fit,
      note: TABLE.strength_machine[t].note,
    },
    {
      category: "free_weights",
      categoryName: "自由力量设备",
      tier: t,
      unitPriceText: TABLE.free_weights[t].unitPriceText ?? "",
      qtyText: TABLE.free_weights[t].qtyText,
      subtotal: TABLE.free_weights[t].subtotal,
      fit: TABLE.free_weights[t].fit,
      note: TABLE.free_weights[t].note,
    },
    {
      category: "accessories",
      categoryName: "辅助设备",
      tier: t,
      unitPriceText: TABLE.accessories[t].unitPriceText ?? "",
      qtyText: TABLE.accessories[t].qtyText,
      subtotal: TABLE.accessories[t].subtotal,
      fit: TABLE.accessories[t].fit,
      note: TABLE.accessories[t].note,
    },
  ];

  const estimatedBySubtotals = lines.reduce(
    (acc, line) => sumRange(acc, line.subtotal),
    r(0, 0)
  );

  return {
    tier: t,
    companySize,
    overallTotal: OVERALL[t],
    estimatedBySubtotals,
    lines,
    notes: NOTES,
  };
}