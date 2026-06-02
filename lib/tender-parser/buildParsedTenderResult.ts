import type { ParsedTenderResult } from "./types";
import { normalizeTenderText } from "./normalizeTenderText";
import { splitTenderIntoBlocks } from "./splitTenderIntoBlocks";
import { detectTenderSections } from "./detectTenderSections";
import { extractTechnicalRequirements } from "./extract/extractTechnicalRequirements";
import { extractBusinessRequirements } from "./extract/extractBusinessRequirements";
import { extractScoreCriteria } from "./extract/extractScoreCriteria";

export function buildParsedTenderResult(input: {
  sourceName?: string;
  rawText: string;
}): ParsedTenderResult {
  const normalized = normalizeTenderText(input.rawText);
  const blocks = splitTenderIntoBlocks(normalized);
  const sections = detectTenderSections(blocks);

  const technicalRequirements = extractTechnicalRequirements(sections);
  const businessRequirements = extractBusinessRequirements(sections);

  let scoreCriteria = extractScoreCriteria(sections);

  if (!scoreCriteria.length) {
    const evaluationSections = sections.filter((s) => s.category === "evaluation");
    scoreCriteria = evaluationSections.flatMap((section, idx) => {
      const lines = String(section.text || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean)
        .filter((x) => /^\d+[\.、]/.test(x));

      return lines.slice(0, 8).map((line, i) => ({
        id: `score-fallback-${idx + 1}-${i + 1}`,
        scoreItem: line.slice(0, 20),
        criteria: line,
        keywords: [],
        category: "other" as const,
        sourceSectionId: section.id,
      }));
    });
  }

  const warnings: string[] = [];
  if (!technicalRequirements.length) warnings.push("technical-empty");
  if (!businessRequirements.length) warnings.push("business-empty");
  if (!scoreCriteria.length) warnings.push("score-empty");

  return {
    sourceName: input.sourceName,
    sections,
    technicalRequirements,
    businessRequirements,
    scoreCriteria,
    warnings,
  };
}
