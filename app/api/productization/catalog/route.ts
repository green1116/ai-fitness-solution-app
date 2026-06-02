import { NextResponse } from "next/server";
import { buildProductCatalogResponse } from "@/lib/productization/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V8.1 Product Catalog API — readonly GET surface.
 * Returns catalog, plans, features, and commercial summary.
 */
export async function GET() {
  const response = buildProductCatalogResponse({ deploymentId: "product-catalog-api" });
  return NextResponse.json({
    catalog: response.catalog,
    plans: response.plans,
    features: response.features,
    commercialSummary: response.commercialSummary,
  });
}
