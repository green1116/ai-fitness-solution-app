export const PRODUCT_CONTEXT_STORAGE_KEY = "product-commercial-context";
export const QUOTE_BY_PROJECT_STORAGE_KEY = "product-quote-by-project";

export type ProductCommercialContext = {
  organizationId?: string;
  projectId?: string;
  quoteId?: string;
  budgetId?: string;
};

const CONTEXT_KEYS = ["organizationId", "projectId", "quoteId", "budgetId"] as const;

function trimId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseProductContextSearch(
  search: string | URLSearchParams,
): ProductCommercialContext {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const ctx: ProductCommercialContext = {};
  for (const key of CONTEXT_KEYS) {
    const value = trimId(params.get(key));
    if (value) ctx[key] = value;
  }
  return ctx;
}

export function buildProductContextSearch(ctx: ProductCommercialContext): string {
  const params = new URLSearchParams();
  for (const key of CONTEXT_KEYS) {
    const value = trimId(ctx[key]);
    if (value) params.set(key, value);
  }
  return params.toString();
}

export function productHref(
  path: "/quote" | "/budget" | "/tender",
  ctx: ProductCommercialContext,
): string {
  const query = buildProductContextSearch(ctx);
  return query ? `${path}?${query}` : path;
}

export function mergeProductContext(
  base: ProductCommercialContext,
  overlay: ProductCommercialContext,
): ProductCommercialContext {
  const merged: ProductCommercialContext = { ...base };
  for (const key of CONTEXT_KEYS) {
    const value = trimId(overlay[key]);
    if (value) merged[key] = value;
  }
  return merged;
}

export function pickOwnedProjectId(
  requested: string | undefined,
  ownedIds: readonly string[],
): string {
  const id = trimId(requested);
  return id && ownedIds.includes(id) ? id : "";
}

export function companyNameFromProject(project?: {
  name?: string | null;
  clientName?: string | null;
}): string {
  return trimId(project?.clientName) || trimId(project?.name);
}

export function readStoredProductContext(): ProductCommercialContext {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(PRODUCT_CONTEXT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProductCommercialContext;
    return parseProductContextSearch(buildProductContextSearch(parsed));
  } catch {
    return {};
  }
}

export function readStoredQuoteIdForProject(projectId: string): string {
  if (typeof window === "undefined") return "";
  const id = trimId(projectId);
  if (!id) return "";
  try {
    const raw = window.sessionStorage.getItem(QUOTE_BY_PROJECT_STORAGE_KEY);
    if (!raw) return "";
    const map = JSON.parse(raw) as Record<string, string>;
    return trimId(map[id]);
  } catch {
    return "";
  }
}

export function writeStoredProductContext(ctx: ProductCommercialContext): void {
  if (typeof window === "undefined") return;
  const merged = mergeProductContext(readStoredProductContext(), ctx);
  window.sessionStorage.setItem(
    PRODUCT_CONTEXT_STORAGE_KEY,
    JSON.stringify(parseProductContextSearch(buildProductContextSearch(merged))),
  );
}

export function resolveClientProductContext(
  search: string | URLSearchParams,
): ProductCommercialContext {
  const merged = mergeProductContext(
    readStoredProductContext(),
    parseProductContextSearch(search),
  );
  writeStoredProductContext(merged);
  return merged;
}
