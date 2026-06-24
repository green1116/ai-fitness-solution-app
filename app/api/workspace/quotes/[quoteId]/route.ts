import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { recordProductAnalytics } from "@/lib/portal/v57/experience/product-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ quoteId: string }> },
) {
  const auth = await getPortalUserContext();
  if (!auth?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { quoteId } = await ctx.params;
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, organizationId: auth.organizationId },
    select: {
      id: true,
      projectId: true,
      status: true,
      orchestrationId: true,
      createdAt: true,
      project: { select: { name: true } },
    },
  });

  if (!quote) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  recordProductAnalytics({
    event: "quote_viewed",
    userId: auth.id,
    organizationId: auth.organizationId,
    quoteId: quote.id,
    projectId: quote.projectId,
  });

  return NextResponse.json({
    ok: true,
    quote: {
      ...quote,
      createdAt: quote.createdAt.toISOString(),
    },
  });
}
