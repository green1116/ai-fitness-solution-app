import { NextRequest } from "next/server";
import { runtime, dynamic } from "@/lib/runtime/api-route-policy";
import { withApiContext } from "@/lib/saas-product-api/auth/with-api-context";
import { handleListWorkflowEvents } from "@/lib/saas-product-api/handlers/audit-handlers";

export { runtime, dynamic };

type RouteContext = { params: Promise<{ workflowId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { workflowId } = await context.params;
  return withApiContext(req, (ctx) => handleListWorkflowEvents(ctx, workflowId), { requireTenant: true });
}
