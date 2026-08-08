import { NextResponse } from "next/server";

import {
  archiveOrgKnowledgePattern,
  demoteOrgKnowledgePattern,
  deprecateOrgKnowledgePattern,
  getOrgKnowledgeGovernanceSnapshot,
  getOrgKnowledgeSnapshot,
  listGovernedPatterns,
  overrideOrgKnowledgeSuggestion,
  promoteOrgKnowledgePattern,
  restoreOrgKnowledgePattern,
  syncOrgKnowledgeGovernance,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — governance snapshot + governed pattern list */
export async function GET(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const library = getOrgKnowledgeSnapshot(ctx.organizationId);
    let governance = getOrgKnowledgeGovernanceSnapshot(ctx.organizationId);
    if (library && !governance) {
      governance = syncOrgKnowledgeGovernance({
        library,
        actorId: ctx.id,
      });
    }

    return NextResponse.json({
      ok: true,
      governance,
      patterns: library ? listGovernedPatterns(library) : [],
      library,
    });
  });
}

/** POST — promote / demote / deprecate / archive / restore / override */
export async function POST(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      patternId?: string;
      sessionId?: string;
      reason?: string;
      note?: string;
      notes?: string;
      suggestion?: string;
      canonical?: boolean;
    };

    const action = body.action;
    const patternId = body.patternId?.trim();
    if (!action || !patternId) {
      return NextResponse.json(
        { ok: false, code: "PATTERN_ID_AND_ACTION_REQUIRED" },
        { status: 400 },
      );
    }

    const base = {
      organizationId: ctx.organizationId,
      patternId,
      actorId: ctx.id,
      sessionId: body.sessionId,
    };

    try {
      let governance;
      switch (action) {
        case "promote":
          governance = promoteOrgKnowledgePattern({
            ...base,
            note: body.note,
            canonical: body.canonical === true,
          });
          break;
        case "demote":
          governance = demoteOrgKnowledgePattern({ ...base, note: body.note });
          break;
        case "deprecate":
          if (!body.reason?.trim()) {
            return NextResponse.json(
              { ok: false, code: "REASON_REQUIRED" },
              { status: 400 },
            );
          }
          governance = deprecateOrgKnowledgePattern({
            ...base,
            reason: body.reason.trim(),
          });
          break;
        case "archive":
          governance = archiveOrgKnowledgePattern({ ...base, note: body.note });
          break;
        case "restore":
          governance = restoreOrgKnowledgePattern({ ...base, note: body.note });
          break;
        case "override":
          if (!body.suggestion?.trim()) {
            return NextResponse.json(
              { ok: false, code: "SUGGESTION_REQUIRED" },
              { status: 400 },
            );
          }
          governance = overrideOrgKnowledgeSuggestion({
            ...base,
            suggestion: body.suggestion,
            notes: body.notes ?? body.note,
          });
          break;
        default:
          return NextResponse.json({ ok: false, code: "UNKNOWN_ACTION" }, { status: 400 });
      }

      const library = getOrgKnowledgeSnapshot(ctx.organizationId);
      return NextResponse.json({
        ok: true,
        governance,
        patterns: library ? listGovernedPatterns(library) : [],
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "GOVERNANCE_FAILED";
      const status =
        message === "GOVERNANCE_NOT_INITIALIZED" ||
        message === "PATTERN_GOVERNANCE_NOT_FOUND"
          ? 404
          : 400;
      return NextResponse.json({ ok: false, code: message }, { status });
    }
  });
}
