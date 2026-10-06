import type { BudgetItem } from "@/lib/domain/tender";

export type BudgetPriceBasisKind = "VERIFIED" | "ORGANIZATION_ESTIMATE" | "PLATFORM_ESTIMATE";

export type BudgetItemPriceBasis =
  | { kind: "VERIFIED" }
  | { kind: "ORGANIZATION_ESTIMATE"; revision: number; sourceNote: string }
  | { kind: "PLATFORM_ESTIMATE" };

export const BUDGET_PRICE_BASIS_LABEL: Record<BudgetPriceBasisKind, string> = {
  VERIFIED: "核实单价",
  ORGANIZATION_ESTIMATE: "组织价目估算",
  PLATFORM_ESTIMATE: "平台通用估算",
};

/** Classifies a persisted Budget row from its own snapshot; never consults the current price reference. */
export function budgetItemPriceBasis(item: BudgetItem): BudgetItemPriceBasis {
  if (item.priceBasis === "VERIFIED") return { kind: "VERIFIED" };
  const basis: unknown = item.estimateBasis;
  if (item.priceBasis === "ESTIMATE" && basis && typeof basis === "object" && !Array.isArray(basis)) {
    const { source, revision, sourceNote } = basis as Record<string, unknown>;
    if (
      source === "organization-price-reference" &&
      typeof revision === "number" &&
      Number.isInteger(revision) &&
      revision >= 1
    ) {
      return {
        kind: "ORGANIZATION_ESTIMATE",
        revision,
        sourceNote: typeof sourceNote === "string" ? sourceNote.trim() : "",
      };
    }
  }
  return { kind: "PLATFORM_ESTIMATE" };
}

export function countBudgetPriceBasis(items: readonly BudgetItem[]): Record<BudgetPriceBasisKind, number> {
  const counts: Record<BudgetPriceBasisKind, number> = {
    VERIFIED: 0,
    ORGANIZATION_ESTIMATE: 0,
    PLATFORM_ESTIMATE: 0,
  };
  for (const item of items) counts[budgetItemPriceBasis(item).kind] += 1;
  return counts;
}

export function budgetItemPriceBasisText(basis: BudgetItemPriceBasis): string {
  if (basis.kind === "VERIFIED") return "核实单价";
  if (basis.kind === "ORGANIZATION_ESTIMATE") return `估算 · 组织价目表第 ${basis.revision} 版`;
  return "估算 · 平台通用区间";
}

/** C.1 option label only; the option's own priceBasis decides VERIFIED exactly as before. */
export function reductionOptionPriceBasisLabel(
  optionPriceBasis: BudgetItem["priceBasis"],
  item: BudgetItem | undefined,
): string {
  if (optionPriceBasis === "VERIFIED") return "（已核实单价）";
  return item && budgetItemPriceBasis(item).kind === "ORGANIZATION_ESTIMATE"
    ? "（组织价目估算单价）"
    : "（平台通用估算单价）";
}

export function BudgetPriceBasisPanel({ items }: { items: readonly BudgetItem[] }) {
  const counts = countBudgetPriceBasis(items);
  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-black p-4 text-sm text-zinc-300">
      <p className="font-medium text-zinc-100">价格依据（本预算保存时的快照）</p>
      <p className="flex flex-wrap gap-x-4 gap-y-1">
        <span>{`${BUDGET_PRICE_BASIS_LABEL.VERIFIED}：${counts.VERIFIED} 项`}</span>
        <span>{`${BUDGET_PRICE_BASIS_LABEL.ORGANIZATION_ESTIMATE}：${counts.ORGANIZATION_ESTIMATE} 项`}</span>
        <span>{`${BUDGET_PRICE_BASIS_LABEL.PLATFORM_ESTIMATE}：${counts.PLATFORM_ESTIMATE} 项`}</span>
      </p>
      <ul className="space-y-2">
        {items.map((item, index) => {
          const basis = budgetItemPriceBasis(item);
          return (
            <li key={index} className="rounded-lg border border-zinc-800 px-3 py-2">
              <p className="text-zinc-100">
                {item.name || item.category}
                <span className="text-zinc-500">（{item.category}）</span>
              </p>
              <p className="text-xs text-zinc-400">
                {`${budgetItemPriceBasisText(basis)} · 单价 ${item.unitPriceMin} - ${item.unitPriceMax}`}
              </p>
              {basis.kind === "ORGANIZATION_ESTIMATE" && basis.sourceNote ? (
                <p className="break-words text-xs text-zinc-500">{`来源说明：${basis.sourceNote}`}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-zinc-500">
        组织价目估算仍属估算，不是供应商报价或已核实采购价。以上依据取自本预算保存时的快照；之后修改组织估算价目表不会改变本预算，重新计算才会生成新的预算。
      </p>
    </section>
  );
}
