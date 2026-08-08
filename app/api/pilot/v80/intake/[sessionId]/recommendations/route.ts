import { NextResponse } from "next/server";

import {
  acceptKnowledgeRecommendation,
  dismissKnowledgeRecommendation,
  ensureKnowledgeRecommendations,
  generateKnowledgeRecommendations,
  getKnowledgeRecommendationPack,
  getRecommendationEffectiveness,
  getIntakeSession,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

/** GET — recommendation pack (generate if missing) */
export async function GET(req: Request, { params }: RouteCtx) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }
    const { sessionId } = await params;
    const session = getIntakeSession(sessionId);
    if (!session || session.organizationId !== ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    const url = new URL(req.url);
    const refresh = url.searchParams.get("refresh") === "1";

    try {
      const pack = refresh
        ? generateKnowledgeRecommendations({
            organizationId: ctx.organizationId,
            sessionId,
            actorId: ctx.id,
          })
        : ensureKnowledgeRecommendations({
            organizationId: ctx.organizationId,
            sessionId,
            actorId: ctx.id,
          });

      return NextResponse.json({
        ok: true,
        pack,
        effectiveness: getRecommendationEffectiveness(ctx.organizationId),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "RECOMMEND_FAILED";
      return NextResponse.json({ ok: false, code: message }, { status: 400 });
    }
  });
}

/** POST — generate / accept / dismiss */
export async function POST(req: Request, { params }: RouteCtx) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }
    const { sessionId } = await params;
    const session = getIntakeSession(sessionId);
    if (!session || session.organizationId !== ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      recommendationId?: string;
      reason?: string;
      apply?: boolean;
      alternativeIndex?: number;
      requirements?: unknown;
      limit?: number;
    };

    const action = body.action ?? "generate";

    try {
      if (action === "generate" || action === "refresh") {
        const pack = generateKnowledgeRecommendations({
          organizationId: ctx.organizationId,
          sessionId,
          actorId: ctx.id,
          requirements: body.requirements as never,
          limit: body.limit,
        });
        return NextResponse.json({
          ok: true,
          pack,
          effectiveness: getRecommendationEffectiveness(ctx.organizationId),
        });
      }

      if (action === "accept") {
        if (!body.recommendationId) {
          return NextResponse.json(
            { ok: false, code: "RECOMMENDATION_ID_REQUIRED" },
            { status: 400 },
          );
        }
        const result = acceptKnowledgeRecommendation({
          organizationId: ctx.organizationId,
          sessionId,
          recommendationId: body.recommendationId,
          actorId: ctx.id,
          apply: body.apply,
          alternativeIndex: body.alternativeIndex,
        });
        return NextResponse.json({
          ok: true,
          pack: result.pack,
          applied: result.applied,
          requirements: result.requirements,
          effectiveness: getRecommendationEffectiveness(ctx.organizationId),
        });
      }

      if (action === "dismiss") {
        if (!body.recommendationId) {
          return NextResponse.json(
            { ok: false, code: "RECOMMENDATION_ID_REQUIRED" },
            { status: 400 },
          );
        }
        const pack = dismissKnowledgeRecommendation({
          organizationId: ctx.organizationId,
          sessionId,
          recommendationId: body.recommendationId,
          actorId: ctx.id,
          reason: body.reason,
        });
        return NextResponse.json({
          ok: true,
          pack,
          effectiveness: getRecommendationEffectiveness(ctx.organizationId),
        });
      }

      if (action === "snapshot") {
        return NextResponse.json({
          ok: true,
          pack: getKnowledgeRecommendationPack(sessionId),
          effectiveness: getRecommendationEffectiveness(ctx.organizationId),
        });
      }

      return NextResponse.json({ ok: false, code: "UNKNOWN_ACTION" }, { status: 400 });
    } catch (e) {
      const message = e instanceof Error ? e.message : "RECOMMEND_FAILED";
      const status = message.includes("NOT_FOUND") ? 404 : 400;
      return NextResponse.json({ ok: false, code: message }, { status });
    }
  });
}
