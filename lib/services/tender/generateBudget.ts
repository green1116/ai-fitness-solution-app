import type {
  BudgetItem,
  BudgetRecord,
  PriceBand,
  ProductPlaceholder,
} from "@/lib/domain/tender";

function getUnitPriceRange(
  category: string,
  priceBand: PriceBand,
): [number, number] {
  const table: Record<string, Record<PriceBand, [number, number]>> = {
    有氧设备: {
      low: [3000, 6000],
      mid: [6000, 12000],
      high: [12000, 25000],
    },
    力量设备: {
      low: [2000, 5000],
      mid: [5000, 10000],
      high: [10000, 20000],
    },
    智能系统: {
      low: [5000, 12000],
      mid: [12000, 30000],
      high: [30000, 80000],
    },
    配套家具: {
      low: [500, 2000],
      mid: [2000, 5000],
      high: [5000, 15000],
    },
    配套设施: {
      low: [1000, 3000],
      mid: [3000, 8000],
      high: [8000, 20000],
    },
  };

  return table[category]?.[priceBand] ?? [1000, 3000];
}

function buildBudgetItem(placeholder: ProductPlaceholder): BudgetItem {
  const [unitPriceMin, unitPriceMax] = getUnitPriceRange(
    placeholder.category,
    placeholder.priceBand,
  );

  return {
    category: placeholder.category,
    specLevel: placeholder.specTags.join(" / "),
    quantity: placeholder.quantity,
    unitPriceMin,
    unitPriceMax,
    subtotalMin: unitPriceMin * placeholder.quantity,
    subtotalMax: unitPriceMax * placeholder.quantity,
    remark: placeholder.recommendationReason,
    sourceType: "placeholder",
  };
}

export function generateBudget(
  projectId: string,
  placeholders: ProductPlaceholder[],
): BudgetRecord {
  const now = new Date().toISOString();
  const items = placeholders.map(buildBudgetItem);

  const totalEstimateMin = items.reduce((sum, item) => sum + item.subtotalMin, 0);
  const totalEstimateMax = items.reduce((sum, item) => sum + item.subtotalMax, 0);

  return {
    id: `${projectId}-budget`,
    projectId,
    currency: "CNY",
    totalEstimateMin,
    totalEstimateMax,
    items,
    assumptions: [
      "当前预算为投标阶段建议区间，不代表最终成交价。",
      "未接入真实 SKU 时，采用品类 + 规格等级 + 数量的方式估算。",
      "后续接入商品系统后，可将占位预算自动替换为明细报价。",
    ],
    createdAt: now,
    updatedAt: now,
  };
}
