import type { EvidenceDocument, RequirementEvidenceLink } from "./types";

export type RequirementMatchContext = {
  requirementId: string;
  requirementText: string;
  parameterName?: string;
  targetValue?: string;
  unit?: string;
};

const TYPE_KEYWORDS: Record<EvidenceDocument["type"], RegExp[]> = {
  datasheet: [/参数|规格|datasheet|技术参数/i],
  certification: [/ISO|CE|认证|证书|资质/i],
  test_report: [/检测|检验|报告|test/i],
  case_study: [/案例|业绩|合同|项目经验/i],
  warranty: [/质保|保修|warranty/i],
  sla: [/SLA|售后|响应|服务等级/i],
  drawing: [/图纸|布置|安装图|drawing/i],
};

/**
 * 确定性字段匹配（无 AI / 无向量）
 */
export function scoreEvidenceMatch(
  evidence: EvidenceDocument,
  ctx: RequirementMatchContext,
): { confidence: number; matchedField?: string } {
  const req = ctx.requirementText.toLowerCase();
  const corpus = [
    evidence.title,
    evidence.extractedText,
    evidence.brand,
    evidence.fileRef,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let confidence = evidence.confidence ?? 0.5;
  let matchedField: string | undefined;

  if (ctx.parameterName && corpus.includes(ctx.parameterName.toLowerCase())) {
    confidence += 0.2;
    matchedField = ctx.parameterName;
  }

  if (ctx.targetValue && corpus.includes(String(ctx.targetValue))) {
    confidence += 0.15;
    matchedField = matchedField || `value:${ctx.targetValue}`;
  }

  const typePatterns = TYPE_KEYWORDS[evidence.type] || [];
  if (typePatterns.some((p) => p.test(req) || p.test(corpus))) {
    confidence += 0.15;
    matchedField = matchedField || `type:${evidence.type}`;
  }

  if (evidence.skuId && /设备|型号|品牌|跑步机|器械/.test(req)) {
    confidence += 0.1;
    matchedField = matchedField || "skuRef";
  }

  return {
    confidence: Math.min(1, Math.max(0, confidence)),
    matchedField,
  };
}

/**
 * 为单条 requirement 生成候选 link（供 registry 写入）
 */
export function proposeRequirementEvidenceLinks(
  documents: EvidenceDocument[],
  ctx: RequirementMatchContext,
  minConfidence = 0.35,
): RequirementEvidenceLink[] {
  return documents
    .map((doc) => {
      const { confidence, matchedField } = scoreEvidenceMatch(doc, ctx);
      return {
        requirementId: ctx.requirementId,
        evidenceId: doc.id,
        matchedField,
        confidence,
      };
    })
    .filter((l) => (l.confidence ?? 0) >= minConfidence)
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
}

/**
 * 按 requirement 文本筛选可能相关的证据类型
 */
export function filterCandidateEvidence(
  documents: EvidenceDocument[],
  requirementText: string,
): EvidenceDocument[] {
  const t = requirementText;
  const wanted = new Set<EvidenceDocument["type"]>();

  if (/ISO|认证|证书|资质|CE/.test(t)) wanted.add("certification");
  if (/检测|检验|报告/.test(t)) wanted.add("test_report");
  if (/案例|业绩|合同/.test(t)) wanted.add("case_study");
  if (/质保|保修/.test(t)) wanted.add("warranty");
  if (/SLA|售后|响应/.test(t)) wanted.add("sla");
  if (/参数|规格|km\/h|kg|功率/.test(t)) wanted.add("datasheet");
  if (/图纸|布置|安装/.test(t)) wanted.add("drawing");

  if (!wanted.size) return documents;

  const filtered = documents.filter((d) => wanted.has(d.type));
  return filtered.length ? filtered : documents;
}
