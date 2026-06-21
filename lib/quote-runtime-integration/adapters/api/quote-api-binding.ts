import {
  SAAS_PRODUCT_API_FINAL_TAG,
  SAAS_PRODUCT_API_QUOTES_PATH,
  SAAS_PRODUCT_API_ROUTE_PREFIX,
  SAAS_PRODUCT_API_VERSION,
  SAAS_PRODUCT_API_WORKSPACES_PATH,
} from "@/lib/saas-product-api/shared/api-constants";
import { V51_API_ROUTE_MAP } from "@/lib/saas-product-api/freeze/v51-final-meta";

export interface QuoteApiExposureService {
  exposureTag: typeof SAAS_PRODUCT_API_FINAL_TAG;
  version: typeof SAAS_PRODUCT_API_VERSION;
  routePrefix: typeof SAAS_PRODUCT_API_ROUTE_PREFIX;
  resolveWorkspaceQuotesRoute(workspaceId: string): string;
  resolveQuoteItemRoute(quoteId: string): string;
  resolveWorkspaceQuotesMethods(): readonly string[];
  resolveExposurePhase(): string;
}

export interface QuoteApiBinding {
  service: QuoteApiExposureService;
  tenantId?: string;
}

export function createQuoteApiExposureServiceFromV51(): QuoteApiExposureService {
  const workspaceQuotesRoute = V51_API_ROUTE_MAP.find(
    (entry) => entry.path === "/api/saas-product/workspaces/:workspaceId/quotes",
  );

  return {
    exposureTag: SAAS_PRODUCT_API_FINAL_TAG,
    version: SAAS_PRODUCT_API_VERSION,
    routePrefix: SAAS_PRODUCT_API_ROUTE_PREFIX,
    resolveWorkspaceQuotesRoute(workspaceId: string): string {
      return `${SAAS_PRODUCT_API_WORKSPACES_PATH}/${workspaceId.trim()}/quotes`;
    },
    resolveQuoteItemRoute(quoteId: string): string {
      return `${SAAS_PRODUCT_API_QUOTES_PATH}/${quoteId.trim()}`;
    },
    resolveWorkspaceQuotesMethods(): readonly string[] {
      return workspaceQuotesRoute?.methods ?? ["GET", "POST"];
    },
    resolveExposurePhase(): string {
      return workspaceQuotesRoute?.phase ?? "P4";
    },
  };
}

export function createQuoteApiBinding(input?: { tenantId?: string }): QuoteApiBinding {
  return {
    service: createQuoteApiExposureServiceFromV51(),
    tenantId: input?.tenantId,
  };
}

export function createQuoteApiBindingFromV51(input?: { tenantId?: string }): QuoteApiBinding {
  return createQuoteApiBinding(input);
}

export function describeQuoteApiBinding(binding: QuoteApiBinding): string {
  return [
    `exposureTag=${binding.service.exposureTag}`,
    `version=${binding.service.version}`,
    `phase=${binding.service.resolveExposurePhase()}`,
    `tenantId=${binding.tenantId ?? "none"}`,
  ].join(" ");
}
