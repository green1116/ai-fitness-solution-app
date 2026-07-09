/** V80 CODE P2 — wired route (target: app/api/enterprise-saas/tenant/run) */
import { handleTenantRun } from "../api/handlers";
import { withHandler } from "../api/handler.util";

export async function POST(req: Request) {
  return withHandler("/api/v80/tenant/run", handleTenantRun, req);
}
