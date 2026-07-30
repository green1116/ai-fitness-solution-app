import Link from "next/link";

import {
  buildDocumentsHref,
  DOCUMENT_CATEGORY_IDS,
  type DocumentCategoryId,
} from "@/lib/frontend/navigation";

const CATEGORY_LABELS: Record<DocumentCategoryId, string> = {
  solution: "Solution",
  budget: "Budget",
  tender: "Tender",
  delivery: "Delivery",
};

type DocCategoriesProps = Readonly<{
  projectId?: string;
  activeCategory?: DocumentCategoryId | "";
}>;

/**
 * CMP-DOC-CATEGORIES — fixed MVP four categories (CR-07).
 */
export function DocCategories({
  projectId = "",
  activeCategory = "",
}: DocCategoriesProps) {
  return (
    <div data-cmp="CMP-DOC-CATEGORIES" data-int-id="INT-LIB-CATEGORY" data-action-id="ACT-08-01">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Categories
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        My documents
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Browse Solution, Budget, Tender, and Delivery materials.
      </p>
      <ul className="mt-6 flex flex-wrap gap-4 text-sm">
        {DOCUMENT_CATEGORY_IDS.map((category) => {
          const active = activeCategory === category;
          return (
            <li key={category}>
              <Link
                href={buildDocumentsHref({ projectId, category })}
                data-doc-category={category}
                data-active={active ? "true" : "false"}
                className={
                  active
                    ? "font-semibold text-slate-950 underline underline-offset-4"
                    : "font-semibold text-slate-600 underline underline-offset-4 hover:text-slate-950"
                }
              >
                {CATEGORY_LABELS[category]}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
