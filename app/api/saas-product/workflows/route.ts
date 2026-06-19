import { NextRequest } from "next/server";
import { runtime, dynamic } from "@/lib/runtime/api-route-policy";
import { withApiContext } from "@/lib/saas-product-api/auth/with-api-context";
import { handleListWorkflows } from "@/lib/saas-product-api/handlers/workflow-handlers";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get("workspaceId") ?? "";
  return withApiContext(req, (ctx) => handleListWorkflows(ctx, workspaceId), { requireTenant: true });
}
