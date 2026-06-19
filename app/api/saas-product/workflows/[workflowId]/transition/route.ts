import { NextRequest } from "next/server";
import { runtime, dynamic } from "@/lib/runtime/api-route-policy";
import { withApiContext } from "@/lib/saas-product-api/auth/with-api-context";
import { handleTransitionWorkflow } from "@/lib/saas-product-api/handlers/workflow-handlers";

export { runtime, dynamic };

type RouteContext = { params: Promise<{ workflowId: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const { workflowId } = await context.params;
  return withApiContext(req, async (ctx) => handleTransitionWorkflow(ctx, workflowId, await req.json()), { requireTenant: true });
}
