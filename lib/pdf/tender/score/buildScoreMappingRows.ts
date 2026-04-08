import type {
  BusinessResponseRow,
  ScoreCriterion,
  ScoreMappingRow,
  TechnicalResponseRow,
} from "@/lib/pdf/tender/types";

type CandidateRow = {
  kind: "technical" | "business";
  id: string;
  title: string;
  response: string;
  proof?: string;
};

function norm(s: string): string {
  return String(s || "").trim().toLowerCase();
}

function includesText(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false;
  return norm(haystack).includes(norm(needle));
}

function scoreCriterionMatch(criterion: ScoreCriterion, row: CandidateRow): number {
  let score = 0;

  if (criterion.category === "technical" && row.kind === "technical") score += 0.2;
  if (criterion.category === "business" && row.kind === "business") score += 0.2;
  if (criterion.category === "service" && row.kind === "technical") score += 0.15;
  if (criterion.category === "implementation" && row.kind === "technical") score += 0.15;

  for (const kw of criterion.keywords || []) {
    if (
      includesText(row.title, kw) ||
      includesText(row.response, kw) ||
      includesText(row.proof || "", kw)
    ) {
      score += 0.15;
    }
  }

  if (includesText(row.title, criterion.scoreItem)) score += 0.2;
  if (includesText(row.response, criterion.criteria)) score += 0.15;

  return Math.min(Number(score.toFixed(4)), 1);
}

function joinProof(parts: string[]): string {
  const unique = Array.from(new Set(parts.filter(Boolean)));
  if (!unique.length) return "见技术方案正文及相关表格内容。";
  return unique.slice(0, 3).join("；");
}

function composeScoreSummary(criterion: ScoreCriterion, matchedTitles: string[]): string {
  const refs = matchedTitles.filter(Boolean).slice(0, 3);
  if (!refs.length) {
    return `本方案已针对“${criterion.scoreItem}”相关要求进行响应，相关内容可在技术方案及商务文件中查阅。`;
  }
  return `本方案已针对“${criterion.scoreItem}”相关要求进行响应，相关内容主要体现在${refs.join("、")}等部分。`;
}

export function buildScoreMappingRows(input: {
  criteria: ScoreCriterion[];
  technicalRows: TechnicalResponseRow[];
  businessRows: BusinessResponseRow[];
}): ScoreMappingRow[] {
  const candidates: CandidateRow[] = [
    ...(input.technicalRows || []).map((r) => ({
      kind: "technical" as const,
      id: r.id,
      title: r.requirement,
      response: r.response,
      proof: r.proof,
    })),
    ...(input.businessRows || []).map((r) => ({
      kind: "business" as const,
      id: r.id,
      title: r.clause,
      response: r.response,
      proof: "",
    })),
  ];

  return (input.criteria || []).map((criterion, idx) => {
    const ranked = candidates
      .map((row) => ({ row, score: scoreCriterionMatch(criterion, row) }))
      .sort((a, b) => b.score - a.score);

    const matched = ranked.slice(0, 3);
    const bestScore = matched[0]?.score || 0;
    const proof = joinProof(matched.map((x) => x.row.proof || x.row.title));
    const matchedTitles = matched.map((x) => x.row.title);
    const responseSummary =
      bestScore >= 0.25
        ? composeScoreSummary(criterion, matchedTitles)
        : `本方案已对“${criterion.scoreItem}”相关内容进行整体响应，详见对应技术方案、商务响应及预算配置内容。`;

    return {
      id: criterion.id || `SC-${String(idx + 1).padStart(3, "0")}`,
      scoreItem: criterion.scoreItem,
      criteria: criterion.criteria,
      proof,
      responseSummary,
      confidence: bestScore,
      note: bestScore < 0.25 ? "low-confidence" : undefined,
    };
  });
}

