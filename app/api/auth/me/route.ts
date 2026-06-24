import { NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V57 P2 — Extended /api/auth/me with organization + membership context
 */
export async function GET() {
  const ctx = await getPortalUserContext();

  if (!ctx) {
    return NextResponse.json({
      ok: true,
      authenticated: false,
      user: null,
      organizationId: null,
      membership: null,
      projectId: null,
    });
  }

  return NextResponse.json({
    ok: true,
    authenticated: true,
    user: {
      id: ctx.id,
      email: ctx.email,
      name: ctx.name,
    },
    organizationId: ctx.organizationId,
    membership: ctx.membership,
    projectId: ctx.projectId,
  });
}
