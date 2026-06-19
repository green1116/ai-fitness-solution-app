import { NextRequest } from "next/server";
import { runtime, dynamic } from "@/lib/runtime/api-route-policy";
import { withApiContext } from "@/lib/saas-product-api/auth/with-api-context";
import { handleGetQuote, handleUpdateQuote } from "@/lib/saas-product-api/handlers/quote-handlers";

export { runtime, dynamic };

type RouteContext = { params: Promise<{ quoteId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { quoteId } = await context.params;
  return withApiContext(req, (ctx) => handleGetQuote(ctx, quoteId), { requireTenant: true });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { quoteId } = await context.params;
  return withApiContext(req, async (ctx) => handleUpdateQuote(ctx, quoteId, await req.json()), { requireTenant: true });
}
