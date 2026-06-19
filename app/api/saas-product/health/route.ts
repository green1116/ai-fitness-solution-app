import { NextRequest } from "next/server";
import { runtime, dynamic } from "@/lib/runtime/api-route-policy";
import { withApiContext } from "@/lib/saas-product-api/auth/with-api-context";
import { handleHealth } from "@/lib/saas-product-api/handlers/health-handlers";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  return withApiContext(req, (ctx) => handleHealth(ctx), { requireTenant: false });
}
