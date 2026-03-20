// lib/pdf/budget/strict.ts
export type MoneyRange = { min: number; max: number };

export type StrictItem = {
  category: string;
  categoryName?: string;
  name: string;

  qtyMin: number;
  qtyMax: number;

  priceMin: number;
  priceMax: number;

  subtotalMin: number;
  subtotalMax: number;

  note?: string;
};

export type StrictSummary = {
  docNo: string;
  planId: string;
  companyName: string;
  companySize: number;
  tier: "low" | "mid" | "high";

  items: StrictItem[];

  total: MoneyRange; // 必须闭环（由 items 合计得出）
};

// --- 解析工具：把 “5-10台” “¥6,000-15,000 / 台” 解析为数字 ---
// 你现在的文本格式比较固定：先用“稳但不复杂”的解析即可。
function pickRangeFromText(text: string): MoneyRange | null {
  const s = (text || "").replace(/[,，]/g, "");
  const m = s.match(/(\d+)\s*-\s*(\d+)/);
  if (!m) return null;
  return { min: Number(m[1]), max: Number(m[2]) };
}

function pickMoneyRangeFromText(text: string): MoneyRange | null {
  const s = (text || "")
    .replace(/[¥￥,，]/g, "")
    .replace(/\s+/g, " ");
  const m = s.match(/(\d+)\s*-\s*(\d+)/);
  if (!m) return null;
  return { min: Number(m[1]), max: Number(m[2]) };
}

// qtyText 可能是 “跑步机5-10台；椭圆机4-6台；…”
// 这里给两种策略：
// A) government 模式要“每行单设备” -> 解析时就拆分成多条 item（推荐）
// B) 拆不了就先给一个兜底（qtyMin/Max = 0，后续在政府模式里不展示这条）
function splitQtyText(qtyText: string): Array<{ name: string; qty: MoneyRange }> {
  const parts = (qtyText || "")
    .split(/[;；]/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const out: Array<{ name: string; qty: MoneyRange }> = [];
  for (const p of parts) {
    // 例：跑步机5-10台 / 哑铃4套
    const r = pickRangeFromText(p);
    if (!r) continue;
    // 名称 = 去掉数字段
    const name = p.replace(/(\d+)\s*-\s*(\d+).*/g, "").replace(/[（(].*?[)）]/g, "").trim();
    out.push({ name: name || "设备", qty: r });
  }
  return out;
}

export function toStrictSummary(input: {
  planId: string;
  companyName: string;
  companySize: number;
  tier: "low" | "mid" | "high";
  // 你现有 summary：lines/items 任意一种都行
  lines?: Array<{
    category: string;
    categoryName?: string;
    unitPriceText?: string;
    qtyText?: string;
    note?: string;
    // 如果你已经有 subtotal 数字范围，可直接用
    subtotal?: MoneyRange;
    // 如果你有更细 items，也可扩展
  }>;
  // 可选：你若已有 items 明细也可接入
} , docNo: string): StrictSummary {
  const lines = input.lines || [];
  const items: StrictItem[] = [];

  for (const ln of lines) {
    const price = pickMoneyRangeFromText(ln.unitPriceText || "");
    const splits = splitQtyText(ln.qtyText || "");

    // 无法拆分就跳过（政府版不要这种“混合行”）
    if (!price || splits.length === 0) continue;

    for (const sp of splits) {
      const subtotalMin = sp.qty.min * price.min;
      const subtotalMax = sp.qty.max * price.max;

      items.push({
        category: ln.category,
        categoryName: ln.categoryName,
        name: sp.name,
        qtyMin: sp.qty.min,
        qtyMax: sp.qty.max,
        priceMin: price.min,
        priceMax: price.max,
        subtotalMin,
        subtotalMax,
        note: ln.note,
      });
    }
  }

  const total = items.reduce(
    (acc, it) => ({ min: acc.min + it.subtotalMin, max: acc.max + it.subtotalMax }),
    { min: 0, max: 0 }
  );

  return {
    docNo,
    planId: input.planId,
    companyName: input.companyName,
    companySize: input.companySize,
    tier: input.tier,
    items,
    total,
  };
}

/**
 * 强制闭环校验（政府版必须）
 * 确保 items 合计 = total
 * @throws Error 如果校验失败
 */
export function assertStrict(summary: StrictSummary): void {
  // 1. 检查是否有严格项
  if (summary.items.length === 0) {
    throw new Error(
      "GOV_BUDGET_NO_STRICT_ITEMS: qty/unitPrice parse failed. " +
      "Please check that qtyText and unitPriceText are in correct format."
    );
  }

  // 2. 计算 items 合计
  const sum = summary.items.reduce(
    (acc, it) => ({
      min: acc.min + it.subtotalMin,
      max: acc.max + it.subtotalMax,
    }),
    { min: 0, max: 0 }
  );

  // 3. 校验合计是否匹配
  if (sum.min !== summary.total.min || sum.max !== summary.total.max) {
    throw new Error(
      `GOV_BUDGET_TOTAL_MISMATCH: ` +
      `itemsSum=${sum.min}-${sum.max} ` +
      `total=${summary.total.min}-${summary.total.max}. ` +
      `Items must sum exactly to total for government-level budget.`
    );
  }

  // 4. 校验每个 item 的 subtotal 计算是否正确
  for (let i = 0; i < summary.items.length; i++) {
    const it = summary.items[i];
    const expectedMin = it.qtyMin * it.priceMin;
    const expectedMax = it.qtyMax * it.priceMax;

    if (Math.abs(it.subtotalMin - expectedMin) > 0.01) {
      throw new Error(
        `GOV_BUDGET_ITEM_SUBTOTAL_MISMATCH: ` +
        `Item ${i} (${it.name}): subtotalMin=${it.subtotalMin}, ` +
        `expected=${expectedMin} (qtyMin=${it.qtyMin} * priceMin=${it.priceMin})`
      );
    }

    if (Math.abs(it.subtotalMax - expectedMax) > 0.01) {
      throw new Error(
        `GOV_BUDGET_ITEM_SUBTOTAL_MISMATCH: ` +
        `Item ${i} (${it.name}): subtotalMax=${it.subtotalMax}, ` +
        `expected=${expectedMax} (qtyMax=${it.qtyMax} * priceMax=${it.priceMax})`
      );
    }
  }

  console.log(
    "[STRICT_VALIDATE] ✅ Passed: " +
    `${summary.items.length} items, ` +
    `total=${summary.total.min}-${summary.total.max}`
  );
}