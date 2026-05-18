import type { BidDecisionGateResult as LegacyScoreGate } from "@/lib/tender/score/buildBidDecisionGate";
import type {
  BidDecisionGateResult,
  BidRiskItem,
  BidRiskLevel,
} from "@/lib/tender/gate/types";

function refToTable(ref: string): "technical" | "business" | "deviation" {
  const u = ref.toUpperCase();
  if (u.startsWith("B-")) return "business";
  if (u.startsWith("D-") || u.startsWith("DEV-")) return "deviation";
  return "technical";
}

function actionToRiskLevel(action: LegacyScoreGate["action"]): BidRiskLevel {
  if (action === "block") return "block";
  if (action === "warn") return "warn";
  return "info";
}

export function mapScoreGateToViewModel(
  scoreGate: LegacyScoreGate,
  opts: {
    topRisks: string[];
    missingAttachments: string[];
    totalScore?: number;
    totalMaxScore?: number;
  }
): BidDecisionGateResult {
  const baseLevel = actionToRiskLevel(scoreGate.action);
  const risks: BidRiskItem[] = [];
  const seen = new Set<string>();

  const scorePct =
    typeof opts.totalScore === "number" &&
    typeof opts.totalMaxScore === "number" &&
    opts.totalMaxScore > 0
      ? Math.round((opts.totalScore / opts.totalMaxScore) * 100)
      : undefined;

  for (const ref of opts.topRisks || []) {
    const r = String(ref || "").trim();
    if (!r || seen.has(r)) continue;
    seen.add(r);
    risks.push({
      id: r,
      level: baseLevel,
      title: `条款风险：${r}`,
      reason: `系统识别条款 ${r} 与当前评估结果存在关联，请核查响应完整性。`,
      suggestion:
        "请在下方「技术 / 商务响应表」对应行补充明确响应与可验证依据。",
      canAutoFix: /^T-|^B-/i.test(r),
      fixStrategy: "rewrite",
      rowRef: r,
      target: {
        type: "table-row",
        table: refToTable(r),
        rowRef: r,
      },
    });
  }

  let attachIdx = 0;
  for (const code of opts.missingAttachments || []) {
    const c = String(code || "").trim();
    if (!c) continue;
    const id = `ATT-${++attachIdx}`;
    if (seen.has(id)) continue;
    seen.add(id);
    risks.push({
      id,
      level: "block",
      title: `缺失附件：${c}`,
      reason: `未发现或未标注附件「${c}」。`,
      suggestion: "请在投标材料中补齐，并在响应表中关联说明。",
      canAutoFix: false,
      fixStrategy: "attachment",
      section: "attachments",
      target: { type: "attachment", attachmentCode: c },
    });
  }

  if (risks.length === 0) {
    scoreGate.reasons.forEach((reason, i) => {
      const id = `G-${i + 1}`;
      if (seen.has(id)) return;
      seen.add(id);
      risks.push({
        id,
        level: baseLevel,
        title: `评估说明 ${i + 1}`,
        reason,
        suggestion:
          scoreGate.suggestedNextSteps[i] ||
          scoreGate.suggestedNextSteps[0] ||
          "请逐项核对招标要求与当前响应材料。",
        canAutoFix: false,
        fixStrategy: "manual-confirm",
        target: {
          type: "section",
          sectionId: "section-tender-response-tables",
        },
      });
    });
  }

  const summaryLines = [scoreGate.title, scoreGate.message].filter(Boolean);
  return {
    action: scoreGate.action,
    summary: summaryLines.join(" "),
    score: scorePct,
    risks,
  };
}
