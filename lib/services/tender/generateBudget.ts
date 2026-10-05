import {
  PRICE_FACT_SOURCE_LABEL,
  type BudgetItem,
  type BudgetRecord,
  type PriceBand,
  type ProductPlaceholder,
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
    普拉提设备: {
      low: [8000, 15000],
      mid: [15000, 30000],
      high: [30000, 60000],
    },
    瑜伽垫上设备: {
      low: [150, 400],
      mid: [400, 900],
      high: [900, 2000],
    },
    功能训练设备: {
      low: [3000, 8000],
      mid: [8000, 20000],
      high: [20000, 45000],
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

function buildBudgetItem(
  placeholder: ProductPlaceholder,
  priceBand: PriceBand,
): BudgetItem {
  const baseName =
    placeholder.subCategory?.trim() ||
    placeholder.category.trim() ||
    "设备分项";
  const candidateLabel =
    placeholder.brand?.trim() && placeholder.model?.trim()
      ? `${placeholder.brand.trim()} ${placeholder.model.trim()}`
      : "";
  const sourceLabel =
    placeholder.productSource === "customer-specified"
      ? "客户指定"
      : placeholder.productSource === "procurement-product"
        ? "采购库产品"
        : "参考候选";
  const priceFact = candidateLabel ? placeholder.priceFact : undefined;

  if (priceFact) {
    const unitPrice = priceFact.unitPrice;
    const subtotal = unitPrice * placeholder.quantity;
    return {
      category: placeholder.category,
      name: `${baseName}（${candidateLabel}）`,
      specLevel: placeholder.specTags.join(" / "),
      quantity: placeholder.quantity,
      unitPriceMin: unitPrice,
      unitPriceMax: unitPrice,
      subtotalMin: subtotal,
      subtotalMax: subtotal,
      remark: `${placeholder.recommendationReason}；当前配置：${candidateLabel}（${sourceLabel}；参数未核实）；核实单价：${PRICE_FACT_SOURCE_LABEL[priceFact.sourceType]} ${priceFact.sourceReference}（${priceFact.quotedAt}），不随预算档位变化`,
      sourceType: "placeholder",
      priceBasis: "VERIFIED",
      priceFact,
    };
  }

  const [unitPriceMin, unitPriceMax] = getUnitPriceRange(
    placeholder.category,
    priceBand,
  );
  // Estimates price category × tier, not the configured model: the model stays out of
  // `name` and must remain the remark's last segment (Budget PDF footnotes read it there).
  const candidateNote = candidateLabel
    ? `；当前配置：${candidateLabel}（${sourceLabel}；单价未核实）`
    : "";

  return {
    category: placeholder.category,
    name: baseName,
    specLevel: placeholder.specTags.join(" / "),
    quantity: placeholder.quantity,
    unitPriceMin,
    unitPriceMax,
    subtotalMin: unitPriceMin * placeholder.quantity,
    subtotalMax: unitPriceMax * placeholder.quantity,
    remark: `${placeholder.recommendationReason}${candidateNote}`,
    sourceType: "placeholder",
    priceBasis: "ESTIMATE",
  };
}

export type GenerateBudgetOptions = {
  /** When set, overrides each placeholder priceBand for unit price lookup. */
  priceBand?: PriceBand;
};

export function generateBudget(
  projectId: string,
  placeholders: ProductPlaceholder[],
  options?: GenerateBudgetOptions,
): BudgetRecord {
  const now = new Date().toISOString();
  const items = placeholders.map((placeholder) =>
    buildBudgetItem(
      placeholder,
      options?.priceBand ?? placeholder.priceBand,
    ),
  );

  const totalEstimateMin = items.reduce((sum, item) => sum + item.subtotalMin, 0);
  const totalEstimateMax = items.reduce((sum, item) => sum + item.subtotalMax, 0);
  const verifiedCount = items.filter((item) => item.priceBasis === "VERIFIED").length;

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
      ...(options?.priceBand
        ? [`设备单价按预算档位 ${options.priceBand.toUpperCase()} 取值。`]
        : []),
      ...(verifiedCount > 0
        ? [
            `${verifiedCount} 项设备按已核实单价计价（来源见明细，不随预算档位变化）；其余设备按品类 × 预算档位估算。`,
          ]
        : []),
    ],
    createdAt: now,
    updatedAt: now,
  };
}
