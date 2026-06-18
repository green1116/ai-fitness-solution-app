import { CP_ACCESS_CANONICAL_ID, CP_ACCESS_VERSION } from "../shared/constants";
import type { SalesPortalView } from "../shared/types";
import { buildSalesPortalRegistry, getSalesPortalApiPaths } from "./portal-registry";

let cachedView: SalesPortalView | undefined;

export function buildSalesPortalView(): SalesPortalView {
  if (cachedView) return cachedView;

  const registry = buildSalesPortalRegistry();
  const apiPaths = getSalesPortalApiPaths();

  cachedView = {
    portalId: "cp-sales-portal-v47-p2-s2",
    version: CP_ACCESS_VERSION,
    products: registry.records,
    quoteApiPath: apiPaths.quoteApiPath,
    downloadApiPath: apiPaths.downloadApiPath,
    mode: CP_ACCESS_CANONICAL_ID,
  };

  return cachedView;
}
