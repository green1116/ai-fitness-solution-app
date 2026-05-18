import type { ComplianceNode } from "@/lib/tender/semantic/types";
import type { SemanticRequirement } from "@/lib/tender/semantic/types";

import type { ResponseConfidence } from "./types";

export function quoteRequirement(text: string, max = 72): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export function extractEvidenceRefs(text: string): string[] {
  const refs: string[] = [];
  const rules: { pattern: RegExp; label: string }[] = [
    { pattern: /ISO\s*\d+/i, label: "ISO 体系认证" },
    { pattern: /检测报告|检验报告|型式检验/, label: "检测报告" },
    { pattern: /类似案例|业绩|合同复印件/, label: "类似业绩材料" },
    { pattern: /授权书|承诺函/, label: "承诺函/授权书" },
    { pattern: /营业执照|资质证书/, label: "资质证明文件" },
    { pattern: /加盖公章|原件|扫描件/, label: "盖章原件/扫描件" },
  ];
  for (const { pattern, label } of rules) {
    if (pattern.test(text) && !refs.includes(label)) refs.push(label);
  }
  return refs;
}

export function inferConfidence(
  req: SemanticRequirement,
  compliance?: ComplianceNode,
): ResponseConfidence {
  if (compliance?.responseStatus === "missing") return "low";
  if (compliance?.responseStatus === "partial") return "medium";
  if (req.evidenceRequired && !req.measurable) return "medium";
  if (req.measurable && (req.measurableFields?.length ?? 0) > 0) return "high";
  if (req.importance === "mandatory") return "high";
  if (req.importance === "preferred") return "medium";
  return "medium";
}

export function nextBlockId(prefix: string, seq: number): string {
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}
