import { NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import type { PortalUserContext } from "@/lib/portal/v57/auth-context";
import {
  isAuthRequiredError,
  isPortalAccessError,
  requirePortalAuth,
  requirePortalSurface,
} from "@/lib/portal/v61/rbac/portal-access.guard";
import type { PortalSurface } from "@/lib/portal/v61/rbac/portal-rbac";

export async function withPortalRoute(
  surface: PortalSurface | "authenticated",
  handler: (ctx: PortalUserContext) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const raw = await getPortalUserContext();
    const ctx = requirePortalAuth(raw);
    if (surface !== "authenticated") {
      requirePortalSurface(ctx, surface);
    }
    return await handler(ctx);
  } catch (err) {
    if (isAuthRequiredError(err)) {
      return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
    }
    if (isPortalAccessError(err)) {
      return NextResponse.json({ ok: false, code: err.code, message: err.message }, { status: 403 });
    }
    throw err;
  }
}
