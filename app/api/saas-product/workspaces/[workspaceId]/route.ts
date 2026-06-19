import { NextRequest } from "next/server";
import { runtime, dynamic } from "@/lib/runtime/api-route-policy";
import { withApiContext } from "@/lib/saas-product-api/auth/with-api-context";
import { handleGetWorkspace, handleUpdateWorkspaceStatus } from "@/lib/saas-product-api/handlers/workspace-handlers";

export { runtime, dynamic };

type RouteContext = { params: Promise<{ workspaceId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
  return withApiContext(req, (ctx) => handleGetWorkspace(ctx, workspaceId), { requireTenant: true });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
  return withApiContext(req, async (ctx) => handleUpdateWorkspaceStatus(ctx, workspaceId, await req.json()), { requireTenant: true });
}
