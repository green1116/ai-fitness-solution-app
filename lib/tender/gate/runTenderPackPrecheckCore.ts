import {
  rowsFromParsedTenderText,
  computeTenderRiskFromRows,
  DEFAULT_TENDER_ATTACHMENT_CODES,
} from "@/lib/tender/computeTenderRisk";
import { buildScoreProfileFromTenderText } from "@/lib/tender/scoreProfileFromTender";
import { computeTenderScore, resolveScoreProfile } from "@/lib/tender/scoreEngine";
import { buildBidDecisionSummary } from "@/lib/tender/score/buildBidDecisionSummary";
import {
  buildBidDecisionGate,
  type BuildBidDecisionGateInput,
} from "@/lib/tender/score/buildBidDecisionGate";
import { formatBidDecisionGateText } from "@/lib/tender/score/formatBidDecisionGate";
import type { BidDecisionGateResult as LegacyGate } from "@/lib/tender/score/buildBidDecisionGate";

export type TenderPackPrecheckBody = {
  planId?: string;
  rawText?: string;
  tenderRawText?: string;
  mode?: string;
  forceAllow?: boolean;
  gatePolicy?: Record<string, unknown>;
};

export type PrecheckCoreSuccess = {
  ok: true;
  summary: ReturnType<typeof buildBidDecisionSummary> | null;
  gate: LegacyGate;
  gateText: string;
  scoreResult: ReturnType<typeof computeTenderScore> | null;
  risk: ReturnType<typeof computeTenderRiskFromRows>;
  profileSource: string;
  profileName: string;
};

export type PrecheckCoreFailure = {
  ok: false;
  status: number;
  code: string;
  message: string;
};

export async function runTenderPackPrecheckCore(
  body: TenderPackPrecheckBody | null
): Promise<PrecheckCoreSuccess | PrecheckCoreFailure> {
  const planId = String(body?.planId || "").trim();
  const tenderRawText = String(
    body?.rawText || body?.tenderRawText || ""
  ).trim();
  const mode = String(body?.mode || "enterprise");
  const forceAllow = body?.forceAllow === true;
  const gatePolicy: BuildBidDecisionGateInput["policy"] | undefined =
    body?.gatePolicy && typeof body.gatePolicy === "object"
      ? (body.gatePolicy as BuildBidDecisionGateInput["policy"])
      : undefined;

  if (!planId) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_PLAN_ID",
      message: "缺少 planId",
    };
  }

  if (!tenderRawText) {
    const gate: LegacyGate = {
      action: "allow",
      passed: true,
      decisionLevel: "go",
      decisionLabel: "建议投",
      title: "未检测到招标文本，已跳过预检查",
      message:
        "当前未提供可解析的招标正文，系统未执行完整评分诊断，默认放行下载流程。",
      reasons: [],
      suggestedNextSteps: ["建议先上传招标文本以获得完整风险与评分决策。"],
      meta: {
        highRiskCount: 0,
        missingAttachmentCount: 0,
        evidenceWeakCount: 0,
        severeWeaknessCount: 0,
        scoreRatio: 1,
      },
    };
    return {
      ok: true,
      summary: null,
      gate,
      gateText: `${gate.title}\n${gate.message}`,
      scoreResult: null,
      risk: computeTenderRiskFromRows({
        technicalRows: [],
        businessRows: [],
        attachments: DEFAULT_TENDER_ATTACHMENT_CODES,
      }),
      profileSource: "default",
      profileName: "",
    };
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

  return {
    ok: true,
    summary,
    gate,
    gateText,
    scoreResult,
    risk,
    profileSource: extractedProfile ? "tender-extracted" : "default",
    profileName: profile.profileName,
  };
}
