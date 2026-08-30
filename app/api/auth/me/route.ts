// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import {
  ensureOrganizationForUser,
  listOrganizationsForUser,
} from "@/lib/organization/organization.service";

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

  const existing = await listOrganizationsForUser(user.id);
  const organization =
    existing[0]?.organization ??
    (await ensureOrganizationForUser({
      userId: user.id,
      name: user.name ?? undefined,
    }));

  return NextResponse.json({
    ok: true,
    user,
    authenticated: true,
    organizationId: organization.id,
    isPlatformAdmin: isPlatformAdminEmail(user.email),
  });
}
