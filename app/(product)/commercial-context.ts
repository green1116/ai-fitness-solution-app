export const PRODUCT_CONTEXT_STORAGE_KEY = "product-commercial-context";
export const QUOTE_BY_PROJECT_STORAGE_KEY = "product-quote-by-project";
export const PRODUCT_CONTEXT_HANDOFF_PARAM = "handoff";
export const PRODUCT_CONTEXT_HANDOFF_CRM = "crm";

export type ProductCommercialContext = {
  organizationId?: string;
  projectId?: string;
  quoteId?: string;
  budgetId?: string;
};

export type ProductContextWriteMode = "merge" | "replace";

export type ProductHrefOptions = {
  handoff?: typeof PRODUCT_CONTEXT_HANDOFF_CRM;
};

const CONTEXT_KEYS = ["organizationId", "projectId", "quoteId", "budgetId"] as const;

function trimId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readSearchParams(search: string | URLSearchParams): URLSearchParams {
  return typeof search === "string" ? new URLSearchParams(search) : search;
}

export function isProductContextCrmHandoff(search: string | URLSearchParams): boolean {
  return trimId(readSearchParams(search).get(PRODUCT_CONTEXT_HANDOFF_PARAM)) === PRODUCT_CONTEXT_HANDOFF_CRM;
}

export function parseProductContextSearch(
  search: string | URLSearchParams,
): ProductCommercialContext {
  const params = readSearchParams(search);
  const ctx: ProductCommercialContext = {};
  for (const key of CONTEXT_KEYS) {
    const value = trimId(params.get(key));
    if (value) ctx[key] = value;
  }
  return ctx;
}

export function buildProductContextSearch(
  ctx: ProductCommercialContext,
  options?: ProductHrefOptions,
): string {
  const params = new URLSearchParams();
  for (const key of CONTEXT_KEYS) {
    const value = trimId(ctx[key]);
    if (value) params.set(key, value);
  }
  if (options?.handoff === PRODUCT_CONTEXT_HANDOFF_CRM) {
    params.set(PRODUCT_CONTEXT_HANDOFF_PARAM, PRODUCT_CONTEXT_HANDOFF_CRM);
  }
  return params.toString();
}

export function productHref(
  path: "/quote" | "/budget" | "/tender",
  ctx: ProductCommercialContext,
  options?: ProductHrefOptions,
): string {
  const query = buildProductContextSearch(ctx, options);
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

export function writeStoredProductContext(
  ctx: ProductCommercialContext,
  options?: { mode?: ProductContextWriteMode },
): void {
  if (typeof window === "undefined") return;
  const mode = options?.mode ?? "merge";
  const normalized = parseProductContextSearch(buildProductContextSearch(ctx));
  if (mode === "replace") {
    window.sessionStorage.setItem(PRODUCT_CONTEXT_STORAGE_KEY, JSON.stringify(normalized));
    return;
  }
  const merged = mergeProductContext(readStoredProductContext(), normalized);
  window.sessionStorage.setItem(
    PRODUCT_CONTEXT_STORAGE_KEY,
    JSON.stringify(parseProductContextSearch(buildProductContextSearch(merged))),
  );
}

export function resolveClientProductContext(
  search: string | URLSearchParams,
): ProductCommercialContext {
  const urlCtx = parseProductContextSearch(search);
  if (isProductContextCrmHandoff(search)) {
    writeStoredProductContext(urlCtx, { mode: "replace" });
    return urlCtx;
  }
  const merged = mergeProductContext(readStoredProductContext(), urlCtx);
  writeStoredProductContext(merged);
  return merged;
}
