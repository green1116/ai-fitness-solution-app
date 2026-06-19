import { NextRequest } from "next/server";
import { runtime, dynamic } from "@/lib/runtime/api-route-policy";
import { withApiContext } from "@/lib/saas-product-api/auth/with-api-context";
import { handleCreateQuote, handleListQuotes } from "@/lib/saas-product-api/handlers/quote-handlers";

export { runtime, dynamic };

type RouteContext = { params: Promise<{ workspaceId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
  return withApiContext(req, (ctx) => handleListQuotes(ctx, workspaceId), { requireTenant: true });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
  return withApiContext(req, async (ctx) => handleCreateQuote(ctx, workspaceId, await req.json()), { requireTenant: true });
}
