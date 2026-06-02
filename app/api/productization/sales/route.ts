import { NextResponse } from "next/server";
import { buildSalesEnablementResponse } from "@/lib/productization/sales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V8.3 Sales Enablement API — readonly GET surface.
 * Returns sales assets, ROI calculator, case studies, proposal templates, and sales deck.
 */
export async function GET() {
  const response = buildSalesEnablementResponse({ deploymentId: "sales-enablement-api" });
  return NextResponse.json({
    salesAssets: response.salesAssets,
    roiCalculator: response.roiCalculator,
    caseStudies: response.caseStudies,
    proposalTemplates: response.proposalTemplates,
    salesDeck: response.salesDeck,
  });
}
