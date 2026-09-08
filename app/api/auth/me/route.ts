// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { resolveExactSingleOrganizationForUser } from "@/lib/organization/single-org-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({
      ok: true,
      user: null,
      authenticated: false,
      organizationId: null,
      isPlatformAdmin: false,
    });
  }

  const resolved = await resolveExactSingleOrganizationForUser(user.id);
  if (!resolved.ok) {
    return NextResponse.json({
      ok: true,
      user,
      authenticated: true,
      organizationId: null,
      reason: resolved.reason,
      isPlatformAdmin: isPlatformAdminEmail(user.email),
    });
  }

  return NextResponse.json({
    ok: true,
    user,
    authenticated: true,
    organizationId: resolved.organizationId,
    isPlatformAdmin: isPlatformAdminEmail(user.email),
  });
}
