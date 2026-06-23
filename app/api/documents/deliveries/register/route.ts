import { NextRequest, NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { registerQuoteDelivery } from "@/lib/portal/v58/delivery/delivery.orchestrator";
import { recordDeliveryAnalytics } from "@/lib/portal/v58/analytics/delivery-analytics";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V58 — Portal wiring: register delivery after quote (does not touch Quote Engine)
 */
export async function POST(req: NextRequest) {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const quoteId = String(body?.quoteId ?? "").trim();
  if (!quoteId) {
    return NextResponse.json({ ok: false, code: "QUOTE_REQUIRED" }, { status: 400 });
  }

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, organizationId: ctx.organizationId },
    include: { project: { select: { name: true } } },
  });
  if (!quote) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  const delivery = registerQuoteDelivery({
    id: quote.id,
    organizationId: ctx.organizationId,
    projectId: quote.projectId,
    projectName: quote.project.name,
    status: quote.status,
    createdAt: quote.createdAt,
  });

  recordDeliveryAnalytics({
    event: "delivery_created",
    userId: ctx.id,
    organizationId: ctx.organizationId,
    quoteId,
    projectId: quote.projectId,
    deliveryId: delivery.id,
  });

  return NextResponse.json({ ok: true, delivery });
}
