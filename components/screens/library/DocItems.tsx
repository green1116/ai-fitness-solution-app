import type { DocumentCategoryId } from "@/lib/frontend/navigation";

type DocItemData = Readonly<{
  id: string;
  label: string;
  category: DocumentCategoryId;
}>;

/**
 * Presentation placeholders only — no document inventory API ownership.
 */
export const PRESENTATION_DOC_ITEMS: readonly DocItemData[] = [
  {
    id: "doc-solution-01",
    label: "Planning solution overview",
    category: "solution",
  },
  {
    id: "doc-budget-01",
    label: "Investment estimate summary",
    category: "budget",
  },
  {
    id: "doc-tender-01",
    label: "Tender response package",
    category: "tender",
  },
  {
    id: "doc-delivery-01",
    label: "Delivery checklist",
    category: "delivery",
  },
] as const;

type DocItemsProps = Readonly<{
  category?: DocumentCategoryId | "";
}>;

/**
 * CMP-DOC-ITEM set — SCR-08 items zone.
 */
export function DocItems({ category = "" }: DocItemsProps) {
  const items = category
    ? PRESENTATION_DOC_ITEMS.filter((item) => item.category === category)
    : PRESENTATION_DOC_ITEMS;

  return (
    <div data-cmp="CMP-DOC-ITEM-SET">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Documents
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            data-cmp="CMP-DOC-ITEM"
            data-int-id="INT-LIB-SELECT"
            data-document-id={item.id}
            data-doc-category={item.category}
            className="border-b border-slate-200 pb-3 text-sm"
          >
            <p className="font-semibold text-slate-950">{item.label}</p>
            <p className="mt-1 text-slate-500">Category: {item.category}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
