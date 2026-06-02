import type { SemanticRequirement } from "@/lib/tender/semantic/types";
import type { TenderTableBlock } from "@/lib/tender/types";

import type { TechnicalRequirement, TechnicalRequirementCategory } from "./types";
import {
  inferParameterName,
  parseOperator,
  parseParameterFromText,
} from "./normalizeParameters";

function inferCategory(text: string): TechnicalRequirementCategory | undefined {
  if (/速度|功率|性能|km\/h|HP/i.test(text)) return "performance";
  if (/尺寸|外形|mm|cm|m²|面积/.test(text)) return "dimension";
  if (/电压|电流|电气|功率因数/.test(text)) return "electrical";
  if (/安全|防护|急停/.test(text)) return "safety";
  if (/ISO|认证|证书|CE|检测/.test(text)) return "certification";
  if (/质保|售后|SLA|服务|交付/.test(text)) return "service";
  return undefined;
}

function fromSemanticRequirement(req: SemanticRequirement): TechnicalRequirement[] {
  const text = req.requirement;
  const results: TechnicalRequirement[] = [];
  const fields = req.measurableFields?.length
    ? req.measurableFields
    : [text];

  fields.forEach((chunk, idx) => {
    const parsed = parseParameterFromText(chunk);
    results.push({
      id: `${req.id}-P${idx + 1}`,
      requirementText: chunk,
      category: inferCategory(chunk) || inferCategory(text),
      parameterName: parsed?.name,
      operator: parsed?.operator || parseOperator(chunk),
      targetValue: parsed ? String(parsed.value) : undefined,
      unit: parsed?.unit,
      mandatory: req.importance === "mandatory",
      sourceSectionId: req.sourceSectionId,
      sourcePage: req.sourcePage,
      rawChunk: chunk,
    });
  });

  if (!results.length && (req.measurable || req.category === "technical")) {
    const parsed = parseParameterFromText(text);
    results.push({
      id: `${req.id}-P1`,
      requirementText: text,
      category: inferCategory(text),
      parameterName: parsed?.name,
      operator: parsed?.operator,
      targetValue: parsed ? String(parsed.value) : undefined,
      unit: parsed?.unit,
      mandatory: req.importance === "mandatory",
      sourceSectionId: req.sourceSectionId,
      sourcePage: req.sourcePage,
      rawChunk: text,
    });
  }

  return results;
}

function fromTableRows(tables: TenderTableBlock[]): TechnicalRequirement[] {
  const out: TechnicalRequirement[] = [];
  let seq = 0;

  for (const table of tables) {
    const header = (table.rows[0] || []).join(" ");
    if (!/参数|指标|要求|规格|技术/.test(header + (table.title || ""))) continue;

    for (let r = 1; r < table.rows.length; r++) {
      const row = table.rows[r];
      if (!row?.length) continue;
      const name = String(row[0] || "").trim();
      const reqCell = String(row[1] || row[2] || "").trim();
      if (!name || !reqCell || reqCell.length < 2) continue;

      const parsed = parseParameterFromText(reqCell, inferParameterName(name + reqCell));
      seq += 1;
      out.push({
        id: `TBL-${seq}`,
        requirementText: `${name}：${reqCell}`,
        category: inferCategory(name + reqCell),
        parameterName: parsed?.name || inferParameterName(name),
        operator: parsed?.operator,
        targetValue: parsed ? String(parsed.value) : undefined,
        unit: parsed?.unit,
        mandatory: /必须|应|不得|≥|≤/.test(reqCell),
        rawChunk: row.join(" | "),
      });
    }
  }

  return out;
}

/**
 * 从技术要求 / 表格 / 参数块提取可度量 TechnicalRequirement
 */
export function extractTechnicalRequirements(
  semanticRequirements: SemanticRequirement[],
  tables: TenderTableBlock[] = [],
): TechnicalRequirement[] {
  const technical = semanticRequirements.filter(
    (r) =>
      r.category === "technical" ||
      r.measurable ||
      r.category === "qualification" ||
      /参数|规格|速度|承重|质保|ISO|检测|km\/h|kg/i.test(r.requirement),
  );

  const fromReqs = technical.flatMap(fromSemanticRequirement);
  const fromTables = fromTableRows(tables);

  const seen = new Set<string>();
  const merged: TechnicalRequirement[] = [];

  for (const item of [...fromReqs, ...fromTables]) {
    const key = `${item.parameterName}|${item.targetValue}|${item.unit}|${item.requirementText.slice(0, 32)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged;
}
