import { NextRequest, NextResponse } from "next/server";
import { rowsFromParsedTenderText, computeTenderRiskFromRows, DEFAULT_TENDER_ATTACHMENT_CODES } from "@/lib/tender/computeTenderRisk";
import { buildScoreProfileFromTenderText } from "@/lib/tender/scoreProfileFromTender";
import { computeTenderScore, resolveScoreProfile } from "@/lib/tender/scoreEngine";
import { buildBidDecisionSummary } from "@/lib/tender/score/buildBidDecisionSummary";
import { buildBidDecisionGate } from "@/lib/tender/score/buildBidDecisionGate";
import { formatBidDecisionGateText } from "@/lib/tender/score/formatBidDecisionGate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const planId = String(body?.planId || "").trim();
    const tenderRawText = String(body?.rawText || body?.tenderRawText || "").trim();
    const mode = String(body?.mode || "enterprise");
    const forceAllow = body?.forceAllow === true;
    const gatePolicy =
      body?.gatePolicy && typeof body.gatePolicy === "object"
        ? body.gatePolicy
        : undefined;

    if (!planId) {
      return json(400, {
        ok: false,
        code: "INVALID_PLAN_ID",
        message: "缺少 planId",
      });
    }

    // 未提供招标文本时，预检查不阻断（避免误拦截 legacy 链路）
    if (!tenderRawText) {
      const gate = {
        action: "allow",
        passed: true,
        decisionLevel: "go",
        decisionLabel: "建议投",
        title: "未检测到招标文本，已跳过预检查",
        message: "当前未提供可解析的招标正文，系统未执行完整评分诊断，默认放行下载流程。",
        reasons: [] as string[],
        suggestedNextSteps: ["建议先上传招标文本以获得完整风险与评分决策。"],
        meta: {
          highRiskCount: 0,
          missingAttachmentCount: 0,
          evidenceWeakCount: 0,
          severeWeaknessCount: 0,
          scoreRatio: 1,
        },
      };
      return json(200, {
        ok: true,
        summary: null,
        gate,
        gateText: `${gate.title}\n${gate.message}`,
      });
    }

    const { technicalRows, businessRows } = rowsFromParsedTenderText(tenderRawText);
    const risk = computeTenderRiskFromRows({
      technicalRows,
      businessRows,
      attachments: DEFAULT_TENDER_ATTACHMENT_CODES,
    });
    const extractedProfile = buildScoreProfileFromTenderText(tenderRawText);
    const profile = extractedProfile || resolveScoreProfile(mode);
    const scoreResult = computeTenderScore(
      {
        level: risk.level,
        summary: risk.summary,
        topRisks: risk.topRisks,
        missingAttachments: risk.missingAttachments,
      },
      profile,
      {
        responseRows: [
          ...technicalRows.map((r) => ({
            ref: r.ref,
            label: r.requirement,
            section: "技术响应",
            content: r.requirement,
          })),
          ...businessRows.map((r) => ({
            ref: r.ref,
            label: r.requirement,
            section: "商务响应",
            content: r.requirement,
          })),
        ],
        attachmentIndex: DEFAULT_TENDER_ATTACHMENT_CODES.map((code) => ({
          ref: code,
          title: code,
        })),
      }
    );

    const summary = buildBidDecisionSummary({
      items: scoreResult.breakdown,
      totalScore: scoreResult.totalScore,
      totalMaxScore: scoreResult.totalMaxScore,
      topRisks: risk.topRisks,
      missingAttachments: risk.missingAttachments,
    });
    const gate = buildBidDecisionGate({
      summary,
      forceAllow,
      policy: gatePolicy,
    });
    const gateText = formatBidDecisionGateText(gate);

    return json(200, {
      ok: true,
      summary,
      gate,
      gateText,
      scoreResult,
      risk,
      profileSource: extractedProfile ? "tender-extracted" : "default",
      profileName: profile.profileName,
    });
  } catch (error: any) {
    return json(500, {
      ok: false,
      code: "TENDER_PRECHECK_INTERNAL_ERROR",
      message: error?.message || "预检查失败",
    });
  }
}
