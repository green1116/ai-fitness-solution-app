import { NextRequest } from "next/server";
import { runtime, dynamic } from "@/lib/runtime/api-route-policy";
import { withApiContext } from "@/lib/saas-product-api/auth/with-api-context";
import { handleCreateWorkspace, handleListWorkspaces } from "@/lib/saas-product-api/handlers/workspace-handlers";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  return withApiContext(req, (ctx) => handleListWorkspaces(ctx), { requireTenant: true });
}

export async function POST(req: NextRequest) {
  return withApiContext(req, async (ctx) => handleCreateWorkspace(ctx, await req.json()), { requireTenant: true });
}
