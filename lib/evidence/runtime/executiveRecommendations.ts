import type { BuildExecutiveOversightInput, ExecutiveFinding } from "../types";

type RecommendationRule = {
  id: string;
  match: (input: BuildExecutiveOversightInput, findings: ExecutiveFinding[]) => boolean;
  text: string;
};

const RULES: RecommendationRule[] = [
  {
    id: "REC_SLA_GOVERNANCE",
    match: (input) =>
      input.governance?.controls.some(
        (c) => !c.passed && c.controlId === "validation_gate",
      ) ?? false,
    text: "建议补充 SLA evidence 与 governance trace",
  },
  {
    id: "REC_OCR_COORDS",
    match: (input, findings) =>
      findings.some((f) => f.category === "traceability") ||
      (input.linking?.matches.some((m) => m.locations.length === 0) ?? false),
    text: "建议补充 OCR evidence coordinates",
  },
  {
    id: "REC_VALIDATION_INCONSISTENCY",
    match: (input) =>
      input.validation?.outcome === "conditional" ||
      input.governance?.controls.some((c) => c.controlId === "decision_alignment" && !c.passed) ===
        true,
    text: "建议补充验收与签章 evidence",
  },
  {
    id: "REC_MANDATORY_EVIDENCE",
    match: (input) => (input.coverage?.summary.mandatoryMissing ?? 0) > 0,
    text: "建议补充强制性需求对应的资质/技术附件",
  },
  {
    id: "REC_AUDIT_TRAIL",
    match: (input) => (input.audit?.trail.summary.totalEntries ?? 0) < 5,
    text: "建议完善审计轨迹后再提请高管审批",
  },
  {
    id: "REC_COMPLIANCE_SIGNOFF",
    match: (input) =>
      input.governance?.escalation.required === true ||
      input.validation?.complianceChecks.some((c) => !c.passed) === true,
    text: "建议完成合规会签后推进投标",
  },
  {
    id: "REC_ACCEPTANCE_OCR",
    match: (input, findings) =>
      findings.some((f) => f.summary.toLowerCase().includes("acceptance")) ||
      findings.some((f) => f.summary.includes("验收")),
    text: "建议补充 Acceptance OCR trace",
  },
];

/**
 * buildExecutiveRecommendations — 确定性建议（非 GPT）
 */
export function buildExecutiveRecommendations(
  input: BuildExecutiveOversightInput,
  findings: ExecutiveFinding[],
): string[] {
  const out: string[] = [];
  for (const rule of RULES) {
    if (rule.match(input, findings)) {
      out.push(rule.text);
    }
  }
  return [...new Set(out)];
}
