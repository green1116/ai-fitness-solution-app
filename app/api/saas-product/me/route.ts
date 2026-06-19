import { NextRequest } from "next/server";
import { runtime, dynamic } from "@/lib/runtime/api-route-policy";
import { withApiContext } from "@/lib/saas-product-api/auth/with-api-context";
import { handleMe } from "@/lib/saas-product-api/handlers/me-handlers";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  return withApiContext(req, (ctx) => handleMe(ctx), { requireTenant: true });
}
