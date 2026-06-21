import { buildQuoteProductSurface, loadQuoteProductSurface } from "./quote-product.surface";

export { loadQuoteProductSurface, buildQuoteProductSurface };

export interface QuoteSurfaceLoaderOptions {
  workspaceId: string;
}

export function createQuoteSurfaceLoader(options: QuoteSurfaceLoaderOptions) {
  return {
    workspaceId: options.workspaceId.trim(),
    load: () => loadQuoteProductSurface(options.workspaceId),
    build: () => buildQuoteProductSurface(options.workspaceId),
  };
}

export function describeQuoteSurfaceLoader(workspaceId: string): string {
  const loader = createQuoteSurfaceLoader({ workspaceId });
  return `quoteSurfaceLoader.workspaceId=${loader.workspaceId}`;
}
