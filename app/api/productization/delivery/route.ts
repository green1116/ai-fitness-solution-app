import { NextResponse } from "next/server";
import { buildCustomerDeliveryResponse } from "@/lib/productization/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V8.5 Customer Delivery API — readonly GET surface.
 * Returns project, milestones, deliverables, success metrics, and summary.
 */
export async function GET() {
  const response = buildCustomerDeliveryResponse({ deploymentId: "customer-delivery-api" });
  return NextResponse.json({
    project: response.project,
    milestones: response.milestones,
    deliverables: response.deliverables,
    successMetrics: response.successMetrics,
    summary: response.summary,
  });
}
