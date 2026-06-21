import { loadQuoteProductSurface } from "../surface/quote-product.surface";
import type { QuoteProductSurfaceData } from "../surface/quote-product.surface";
import { createQuoteSurfaceLoader } from "../surface/quote-product.loader";
import { bindQuotePortalRoute } from "./quote-product-route";
import { QuoteProductPage } from "./quote-product-page";

export function hydrateQuoteProductSurface(workspaceId: string): QuoteProductSurfaceData {
  const bound = bindQuotePortalRoute(workspaceId);
  const surface = loadQuoteProductSurface(bound.workspaceId);
  return {
    ...surface,
    workspaceId: bound.workspaceId,
    portalRoute: bound.portalRoute,
    state: surface.state,
    viewModel: surface.viewModel,
  };
}

export function QuoteProductSurfaceLoader(workspaceId: string): QuoteProductSurfaceData {
  return hydrateQuoteProductSurface(workspaceId);
}

export function renderQuoteProductPage(workspaceId: string) {
  return QuoteProductSurfaceLoader(workspaceId);
}

export function QuoteProductPageLoader({ workspaceId }: { workspaceId: string }) {
  const surface = QuoteProductSurfaceLoader(workspaceId);
  return <QuoteProductPage surface={surface} />;
}

export { createQuoteSurfaceLoader };
