import type { PortalType } from "@/lib/saas-portal/shared/portal-types";
import type { ProductCode } from "../shared/product-types";

export interface PortalWorkspaceProductCatalogEntry {
  portalType: PortalType;
  defaultProductCodes: ProductCode[];
}

export const PORTAL_WORKSPACE_PRODUCT_CATALOG: PortalWorkspaceProductCatalogEntry[] = [
  {
    portalType: "enterprise",
    defaultProductCodes: ["kickstart-package", "tender-ready-package", "delivery-intelligence-package"],
  },
  {
    portalType: "contractor",
    defaultProductCodes: ["tender-ready-package", "delivery-intelligence-package"],
  },
  {
    portalType: "supplier",
    defaultProductCodes: [],
  },
  {
    portalType: "manufacturer",
    defaultProductCodes: [],
  },
];

export function listWorkspaceProductsForPortal(portalType: PortalType): ProductCode[] {
  const entry = PORTAL_WORKSPACE_PRODUCT_CATALOG.find((item) => item.portalType === portalType);
  return entry ? [...entry.defaultProductCodes] : [];
}

export function hasWorkspaceProductsForPortal(portalType: PortalType): boolean {
  return listWorkspaceProductsForPortal(portalType).length > 0;
}
