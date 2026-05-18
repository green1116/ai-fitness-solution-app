import type { BidDecisionGateResult as LegacyGate } from "@/lib/tender/score/buildBidDecisionGate";
import type {
  BidDecisionGateResult,
  BidRiskItem,
  BidRiskLevel,
  BidRiskTarget,
} from "@/lib/tender/gate/types";

type RiskPayload = {
  missingAttachments?: string[];
  topRisks?: string[];
};

function pickTableRef(
  text: string
): { target: BidRiskTarget; rowRef: string } | null {
  const m = text.match(/\b(T-\d{2})\b/);
  if (m) {
    return {
      rowRef: m[1],
      target: { type: "table-row", table: "technical", rowRef: m[1] },
    };
  }
  const b = text.match(/\b(B-\d{2})\b/);
  if (b) {
    return {
      rowRef: b[1],
      target: { type: "table-row", table: "business", rowRef: b[1] },
    };
  }
  const d = text.match(/\b(D-\d{2})\b/);
  if (d) {
    return {
      rowRef: d[1],
      target: { type: "table-row", table: "deviation", rowRef: d[1] },
    };
  }
  return null;
}

function levelForItem(
  gateAction: LegacyGate["action"],
  idx: number
): BidRiskLevel {
  if (gateAction === "allow") return "info";
  if (gateAction === "warn") return "warn";
  return idx === 0 ? "block" : "warn";
}

export function mapLegacyPrecheckToPanelGate(input: {
  gate: LegacyGate;
  risk?: RiskPayload | null;
  totalScore?: number;
  totalMaxScore?: number;
}): BidDecisionGateResult {
  const { gate, risk } = input;
  const risks: BidRiskItem[] = [];
  let idx = 0;

  const scorePct =
    typeof input.totalScore === "number" &&
    typeof input.totalMaxScore === "number" &&
    input.totalMaxScore > 0
      ? Math.round((input.totalScore / input.totalMaxScore) * 100)
      : Math.round((gate.meta?.scoreRatio ?? 0) * 100);

  const summary = [gate.title, gate.message].filter(Boolean).join("\n");

  for (const reason of gate.reasons || []) {
    idx += 1;
    const picked = pickTableRef(reason);
    const id = picked?.rowRef || `R-${String(idx).padStart(2, "0")}`;
    const level = levelForItem(gate.action, risks.length);
    risks.push({
      id,
      level,
      title: reason.slice(0, 80),
      reason,
      suggestion:
        gate.suggestedNextSteps?.[0] ||
        "建议补充明确响应文字、证明材料或人工确认信息。",
      canAutoFix: /^T-|B-/.test(id),
      fixStrategy: /^A-/.test(id) ? "attachment" : "rewrite",
      rowRef: picked?.rowRef,
      target: picked?.target ?? {
        type: "section",
        sectionId: "section-tender-tables",
      },
    });
  }

  const miss = risk?.missingAttachments || [];
  for (let i = 0; i < miss.length; i++) {
    const code = String(miss[i] || "").trim() || `ATT-${i + 1}`;
    const id = code.startsWith("A-") ? code : `A-${String(i + 1).padStart(2, "0")}`;
    risks.push({
      id,
      level: gate.action === "block" ? "block" : "warn",
      title: `缺失附件：${code}`,
      reason: `未发现或未标注附件：${code}`,
      suggestion: "请在资格/商务卷中补齐对应扫描件与索引说明。",
      canAutoFix: false,
      fixStrategy: "attachment",
      target: { type: "attachment", attachmentCode: code },
    });
  }

  for (const line of risk?.topRisks || []) {
    if (!line || risks.some((r) => r.reason.includes(line))) continue;
    idx += 1;
    const picked = pickTableRef(line);
    risks.push({
      id: picked?.rowRef || `TR-${String(idx).padStart(2, "0")}`,
      level: gate.action === "block" ? "warn" : "warn",
      title: line.slice(0, 80),
      reason: line,
      suggestion: "请核对招标条款并在响应表中补充对应承诺与证明材料。",
      canAutoFix: !!picked,
      fixStrategy: picked ? "rewrite" : "manual-confirm",
      target:
        picked?.target ?? {
          type: "section",
          sectionId: "section-tender-tables",
        },
    });
  }

  if (risks.length === 0) {
    risks.push({
      id: "INFO-01",
      level: "info",
      title: gate.title || "预检查摘要",
      reason: gate.message || "暂无结构化风险条目，请结合上方摘要处理。",
      suggestion: gate.suggestedNextSteps?.[0],
      target: { type: "section", sectionId: "section-tender-tables" },
    });
  }

  return {
    action: gate.action,
    summary,
    score: Number.isFinite(scorePct) ? scorePct : undefined,
    risks,
  };
}
