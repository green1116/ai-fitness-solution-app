import { NextRequest } from "next/server";
import { runtime, dynamic } from "@/lib/runtime/api-route-policy";
import { withApiContext } from "@/lib/saas-product-api/auth/with-api-context";
import { handleGetWorkflow } from "@/lib/saas-product-api/handlers/workflow-handlers";

export { runtime, dynamic };

type RouteContext = { params: Promise<{ quoteId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { quoteId } = await context.params;
  return withApiContext(req, (ctx) => handleGetWorkflow(ctx, quoteId), { requireTenant: true });
}
