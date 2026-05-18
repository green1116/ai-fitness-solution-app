import { NextRequest, NextResponse } from "next/server";
import {
  computeTenderScore,
  resolveScoreProfile,
  type TenderRiskData,
} from "@/lib/tender/scoreEngine";
import { buildScoreProfileFromTenderText } from "@/lib/tender/scoreProfileFromTender";
import { buildBidDecisionSummary } from "@/lib/tender/score/buildBidDecisionSummary";
import { formatBidDecisionSummaryText } from "@/lib/tender/score/formatBidDecisionSummaryText";
import { buildBidDecisionGate } from "@/lib/tender/score/buildBidDecisionGate";
import { formatBidDecisionGateText } from "@/lib/tender/score/formatBidDecisionGate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const mode = String(body?.mode || "enterprise");
    const risk = body?.risk as TenderRiskData | undefined;
    const tenderText = String(body?.tenderText || "");

    if (!risk?.summary || !risk?.level) {
      return NextResponse.json(
        { ok: false, code: "MISSING_RISK", message: "risk.level and risk.summary are required" },
        { status: 400 }
      );
    }

    const extractedProfile = tenderText
      ? buildScoreProfileFromTenderText(tenderText)
      : null;

    const profile =
      extractedProfile ||
      resolveScoreProfile(mode, body?.customProfile || null);

    const resultWithEvidence = computeTenderScore(risk, profile, {
      responseRows: Array.isArray(body?.responseRows) ? body.responseRows : [],
      attachmentIndex: Array.isArray(body?.attachmentIndex)
        ? body.attachmentIndex
        : [],
    });
    const decisionSummary = buildBidDecisionSummary({
      items: resultWithEvidence.breakdown,
      totalScore: resultWithEvidence.totalScore,
      totalMaxScore: resultWithEvidence.totalMaxScore,
      topRisks: Array.isArray(risk?.topRisks) ? risk.topRisks : [],
      missingAttachments: Array.isArray(risk?.missingAttachments)
        ? risk.missingAttachments
        : [],
    });
    const decisionText = formatBidDecisionSummaryText(decisionSummary);
    const gate = buildBidDecisionGate({
      summary: decisionSummary,
      forceAllow: body?.forceAllow === true,
      policy:
        body?.gatePolicy && typeof body.gatePolicy === "object"
          ? body.gatePolicy
          : undefined,
    });
    const gateText = formatBidDecisionGateText(gate);

    return NextResponse.json({
      ok: true,
      profileSource: extractedProfile ? "tender-extracted" : "default",
      profile: {
        profileId: profile.profileId,
        profileName: profile.profileName,
        items: profile.items,
      },
      result: resultWithEvidence,
      decisionSummary,
      decisionText,
      gate,
      gateText,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "score calc failed";
    return NextResponse.json(
      {
        ok: false,
        code: "TENDER_SCORE_INTERNAL_ERROR",
        message,
      },
      { status: 500 }
    );
  }
}
