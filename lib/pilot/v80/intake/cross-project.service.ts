/**
 * V80 Pilot P17 — Project fingerprints + deterministic cross-project similarity
 * Read-only over intake sessions; reuses P14 tokenize/jaccard.
 */

import { createHash } from "node:crypto";

import {
  jaccardSimilarity,
  tokenizeForSimilarity,
} from "./knowledge-recommendation.service";
import {
  getIntakeSession,
  listIntakeSessionsForOrg,
  type TenderIntakeSession,
} from "./intake.store";
import { parseTenderRequirements } from "./requirements.validation";
import {
  CROSS_PROJECT_VERSION,
  type CrossProjectExplorerReport,
  type CrossProjectInsight,
  type CrossProjectSimilarityReport,
  type ProjectComparisonView,
  type ProjectFingerprint,
  type ProjectFingerprintFeatures,
  type ReusableArtifact,
  type SimilarProjectMatch,
  type SimilarityDimensionScore,
} from "./cross-project.schema";

const DIM_WEIGHTS = {
  industry: 0.12,
  location: 0.1,
  requirements: 0.28,
  equipment: 0.18,
  standards: 0.1,
  compliance: 0.1,
  clarification: 0.07,
  execution: 0.05,
} as const;

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function isHistoricalCandidate(s: TenderIntakeSession): boolean {
  return (
    s.status === "ready" ||
    s.status === "approved" ||
    s.workflowStatus === "completed" ||
    Boolean(s.productionProjectId && s.qaPassedAt) ||
    s.signedOff === true
  );
}

function setFromList(items: string[]): Set<string> {
  const out = new Set<string>();
  for (const item of items) {
    for (const t of tokenizeForSimilarity(item)) out.add(t);
  }
  return out;
}

function exactScore(a: string, b: string): number {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return 0;
  return na === nb ? 1 : jaccardSimilarity(tokenizeForSimilarity(na), tokenizeForSimilarity(nb));
}

function listOverlap(a: string[], b: string[]): number {
  return jaccardSimilarity(setFromList(a), setFromList(b));
}

function idOverlap(a: string[], b: string[]): number {
  const sa = new Set(a.map(norm).filter(Boolean));
  const sb = new Set(b.map(norm).filter(Boolean));
  return jaccardSimilarity(sa, sb);
}

function hashTokens(tokens: string[]): string {
  return createHash("sha1").update(tokens.join("|")).digest("hex").slice(0, 16);
}

function hashFingerprint(fp: Omit<ProjectFingerprint, "contentHash">): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        sessionId: fp.sessionId,
        features: fp.features,
        tokenHash: fp.tokenHash,
      }),
    )
    .digest("hex");
}

/** Build a deterministic project fingerprint from an intake session. */
export function buildProjectFingerprint(session: TenderIntakeSession): ProjectFingerprint {
  const req = parseTenderRequirements(
    session.requirements ?? session.extractedRequirements ?? {},
  );

  const equipmentTexts = req.equipment.map((e) => e.text).filter((t) => t.trim());
  const standardTexts = req.standards.map((s) => s.text).filter((t) => t.trim());
  const requirementTexts = [
    ...req.functionalRequirements,
    ...req.technicalRequirements,
    ...req.constraints,
  ]
    .map((i) => i.text)
    .filter((t) => t.trim());

  const clarificationFields = (session.clarifications?.questions ?? []).map((q) => q.fieldPath);
  const clarificationQuestions = (session.clarifications?.questions ?? [])
    .filter((q) => q.status === "answered")
    .map((q) => q.question);

  const complianceRuleIds = (session.compliance?.report.findings ?? []).map((f) => f.ruleId);
  const complianceTitles = (session.compliance?.report.findings ?? []).map((f) => f.title);

  const milestoneTitles =
    session.bootstrap?.package.milestones.map((m) => m.title).filter(Boolean) ?? [];
  const taskTitles = session.bootstrap?.package.tasks.map((t) => t.title).filter(Boolean) ?? [];

  const features: ProjectFingerprintFeatures = {
    industry: req.industry || "",
    location: req.location || "",
    projectName: req.projectName || session.fileName,
    scope: req.scope || "",
    status: session.status,
    hasProductionProject: Boolean(session.productionProjectId),
    qaPassed: Boolean(session.qaPassedAt),
    signedOff: Boolean(session.signedOff),
    equipmentTexts,
    standardTexts,
    requirementTexts,
    clarificationFields: [...new Set(clarificationFields)].sort(),
    clarificationQuestions,
    complianceRuleIds: [...new Set(complianceRuleIds)].sort(),
    complianceTitles,
    bootstrapReady: session.bootstrap?.package.kickoff.ready === true,
    milestoneTitles,
    taskTitles,
    documentCount: session.documents?.length ?? (session.fileName ? 1 : 0),
  };

  const blob = [
    features.projectName,
    features.industry,
    features.location,
    features.scope,
    ...equipmentTexts,
    ...standardTexts,
    ...requirementTexts,
    ...clarificationQuestions,
    ...complianceTitles,
    ...milestoneTitles,
  ].join("\n");

  const tokens = [...tokenizeForSimilarity(blob)].sort();
  const label =
    features.projectName.trim() ||
    session.productionProjectId ||
    session.fileName ||
    session.id;

  const base = {
    sessionId: session.id,
    organizationId: session.organizationId,
    tenderIntakeId: session.tenderIntakeId,
    productionProjectId: session.productionProjectId,
    label,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    features,
    tokens,
    tokenHash: hashTokens(tokens),
  };

  return {
    ...base,
    contentHash: hashFingerprint(base),
  };
}

export function scoreFingerprintSimilarity(
  a: ProjectFingerprint,
  b: ProjectFingerprint,
): { similarity: number; dimensions: SimilarityDimensionScore[] } {
  const dimensions: SimilarityDimensionScore[] = [
    {
      id: "industry",
      label: "行业",
      weight: DIM_WEIGHTS.industry,
      score: round3(exactScore(a.features.industry, b.features.industry)),
    },
    {
      id: "location",
      label: "地点",
      weight: DIM_WEIGHTS.location,
      score: round3(exactScore(a.features.location, b.features.location)),
    },
    {
      id: "requirements",
      label: "需求",
      weight: DIM_WEIGHTS.requirements,
      score: round3(listOverlap(a.features.requirementTexts, b.features.requirementTexts)),
    },
    {
      id: "equipment",
      label: "设备",
      weight: DIM_WEIGHTS.equipment,
      score: round3(listOverlap(a.features.equipmentTexts, b.features.equipmentTexts)),
    },
    {
      id: "standards",
      label: "标准",
      weight: DIM_WEIGHTS.standards,
      score: round3(listOverlap(a.features.standardTexts, b.features.standardTexts)),
    },
    {
      id: "compliance",
      label: "合规",
      weight: DIM_WEIGHTS.compliance,
      score: round3(
        Math.max(
          idOverlap(a.features.complianceRuleIds, b.features.complianceRuleIds),
          listOverlap(a.features.complianceTitles, b.features.complianceTitles),
        ),
      ),
    },
    {
      id: "clarification",
      label: "澄清",
      weight: DIM_WEIGHTS.clarification,
      score: round3(
        Math.max(
          idOverlap(a.features.clarificationFields, b.features.clarificationFields),
          listOverlap(a.features.clarificationQuestions, b.features.clarificationQuestions),
        ),
      ),
    },
    {
      id: "execution",
      label: "执行",
      weight: DIM_WEIGHTS.execution,
      score: round3(
        Math.max(
          listOverlap(a.features.milestoneTitles, b.features.milestoneTitles),
          listOverlap(a.features.taskTitles, b.features.taskTitles),
          a.features.bootstrapReady && b.features.bootstrapReady ? 0.6 : 0,
        ),
      ),
    },
  ];

  const similarity = round3(
    dimensions.reduce((sum, d) => sum + d.score * d.weight, 0),
  );

  return { similarity, dimensions };
}

function overlapSummary(dimensions: SimilarityDimensionScore[]): string {
  const strong = dimensions
    .filter((d) => d.score >= 0.45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((d) => d.label);
  if (strong.length === 0) return "弱重叠";
  return `强重叠：${strong.join("、")}`;
}

function collectReuseArtifacts(
  match: SimilarProjectMatch,
  session: TenderIntakeSession,
  limit: number,
): ReusableArtifact[] {
  const arts: ReusableArtifact[] = [];
  const fp = match.fingerprint;
  const push = (a: Omit<ReusableArtifact, "id">) => {
    arts.push({
      id: createHash("sha1")
        .update(`${a.kind}:${a.sourceSessionId}:${a.title}:${a.detail}`)
        .digest("hex")
        .slice(0, 12),
      ...a,
    });
  };

  for (const text of fp.features.equipmentTexts.slice(0, 4)) {
    push({
      kind: "equipment",
      title: "可复用设备规格",
      detail: text,
      sourceSessionId: match.sessionId,
      sourceLabel: match.label,
      similarity: match.similarity,
      fieldPath: "equipment",
    });
  }
  for (const text of fp.features.requirementTexts.slice(0, 4)) {
    push({
      kind: "requirement",
      title: "可复用需求表述",
      detail: text,
      sourceSessionId: match.sessionId,
      sourceLabel: match.label,
      similarity: match.similarity,
      fieldPath: "technicalRequirements",
    });
  }
  for (const text of fp.features.standardTexts.slice(0, 3)) {
    push({
      kind: "standard",
      title: "可复用标准引用",
      detail: text,
      sourceSessionId: match.sessionId,
      sourceLabel: match.label,
      similarity: match.similarity,
      fieldPath: "standards",
    });
  }

  for (const q of session.clarifications?.questions ?? []) {
    if (q.status !== "answered" || !q.answer) continue;
    push({
      kind: "clarification",
      title: q.question.slice(0, 48),
      detail: `答：${q.answer}`,
      sourceSessionId: match.sessionId,
      sourceLabel: match.label,
      similarity: match.similarity,
      fieldPath: q.fieldPath,
    });
  }

  for (const f of session.compliance?.report.findings ?? []) {
    push({
      kind: "compliance",
      title: f.title,
      detail: f.recommendation || f.message,
      sourceSessionId: match.sessionId,
      sourceLabel: match.label,
      similarity: match.similarity,
      fieldPath: "compliance",
    });
  }

  const kickoff = session.bootstrap?.package.kickoff;
  if (kickoff?.ready) {
    push({
      kind: "execution",
      title: "执行 Kickoff 经验",
      detail: `${kickoff.headline || "ready"} · 里程碑 ${kickoff.milestoneCount} · 任务 ${kickoff.taskCount}`,
      sourceSessionId: match.sessionId,
      sourceLabel: match.label,
      similarity: match.similarity,
      fieldPath: "bootstrap",
    });
  }
  for (const m of fp.features.milestoneTitles.slice(0, 3)) {
    push({
      kind: "execution",
      title: "里程碑模板",
      detail: m,
      sourceSessionId: match.sessionId,
      sourceLabel: match.label,
      similarity: match.similarity,
      fieldPath: "bootstrap",
    });
  }

  return arts
    .sort(
      (a, b) =>
        b.similarity - a.similarity ||
        a.kind.localeCompare(b.kind) ||
        a.title.localeCompare(b.title),
    )
    .slice(0, limit);
}

export function buildProjectComparison(
  query: ProjectFingerprint,
  match: ProjectFingerprint,
  similarity: number,
): ProjectComparisonView {
  const rows = [
    {
      dimension: "行业",
      queryValue: query.features.industry || "—",
      matchValue: match.features.industry || "—",
      overlap: round3(exactScore(query.features.industry, match.features.industry)),
    },
    {
      dimension: "地点",
      queryValue: query.features.location || "—",
      matchValue: match.features.location || "—",
      overlap: round3(exactScore(query.features.location, match.features.location)),
    },
    {
      dimension: "设备条目数",
      queryValue: String(query.features.equipmentTexts.length),
      matchValue: String(match.features.equipmentTexts.length),
      overlap: round3(
        listOverlap(query.features.equipmentTexts, match.features.equipmentTexts),
      ),
    },
    {
      dimension: "标准条目数",
      queryValue: String(query.features.standardTexts.length),
      matchValue: String(match.features.standardTexts.length),
      overlap: round3(listOverlap(query.features.standardTexts, match.features.standardTexts)),
    },
    {
      dimension: "需求条目数",
      queryValue: String(query.features.requirementTexts.length),
      matchValue: String(match.features.requirementTexts.length),
      overlap: round3(
        listOverlap(query.features.requirementTexts, match.features.requirementTexts),
      ),
    },
    {
      dimension: "澄清字段",
      queryValue: query.features.clarificationFields.join(", ") || "—",
      matchValue: match.features.clarificationFields.join(", ") || "—",
      overlap: round3(
        idOverlap(query.features.clarificationFields, match.features.clarificationFields),
      ),
    },
    {
      dimension: "合规规则",
      queryValue: query.features.complianceRuleIds.join(", ") || "—",
      matchValue: match.features.complianceRuleIds.join(", ") || "—",
      overlap: round3(
        idOverlap(query.features.complianceRuleIds, match.features.complianceRuleIds),
      ),
    },
    {
      dimension: "执行就绪",
      queryValue: query.features.bootstrapReady ? "是" : "否",
      matchValue: match.features.bootstrapReady ? "是" : "否",
      overlap:
        query.features.bootstrapReady === match.features.bootstrapReady
          ? query.features.bootstrapReady
            ? 1
            : 0.3
          : 0,
    },
  ];

  return {
    querySessionId: query.sessionId,
    matchSessionId: match.sessionId,
    similarity,
    rows,
  };
}

function buildInsight(
  matches: SimilarProjectMatch[],
  artifacts: ReusableArtifact[],
  poolSize: number,
): CrossProjectInsight {
  const top = matches.slice(0, 5);
  const avgTopSimilarity =
    top.length === 0
      ? 0
      : round3(top.reduce((s, m) => s + m.similarity, 0) / top.length);
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (top[0] && top[0].similarity >= 0.45) {
    strengths.push(`最相似项目「${top[0].label}」相似度 ${(top[0].similarity * 100).toFixed(0)}%`);
  }
  if (artifacts.some((a) => a.kind === "equipment")) {
    strengths.push("可复用历史设备规格");
  }
  if (artifacts.some((a) => a.kind === "compliance")) {
    strengths.push("可参考历史合规结论");
  }
  if (matches.length === 0) {
    gaps.push("历史完成项目不足，暂无高相似匹配");
  } else if ((top[0]?.similarity ?? 0) < 0.25) {
    gaps.push("相似度过低，建议补充需求/设备后再检索");
  }
  if (!artifacts.some((a) => a.kind === "execution")) {
    gaps.push("缺少可复用执行 Kickoff 经验");
  }

  const headline =
    matches.length === 0
      ? "暂无跨项目相似匹配"
      : `发现 ${matches.length} 个相似历史项目，可复用 ${artifacts.length} 条经验`;

  return {
    candidatePoolSize: poolSize,
    matchCount: matches.length,
    topSimilarity: top[0]?.similarity ?? 0,
    avgTopSimilarity,
    reusableArtifactCount: artifacts.length,
    strengths,
    gaps,
    headline,
  };
}

function hashReport(parts: unknown): string {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

/** Find similar historical projects for a query session. */
export function findSimilarProjects(input: {
  organizationId: string;
  sessionId: string;
  limit?: number;
  minSimilarity?: number;
  compareWith?: string;
}): CrossProjectSimilarityReport {
  const session = getIntakeSession(input.sessionId);
  if (!session || session.organizationId !== input.organizationId) {
    throw new Error("SESSION_NOT_FOUND");
  }

  const queryFp = buildProjectFingerprint(session);
  const all = listIntakeSessionsForOrg(input.organizationId);
  const candidates = all.filter(
    (s) => s.id !== input.sessionId && isHistoricalCandidate(s),
  );

  const minSimilarity = input.minSimilarity ?? 0.08;
  const limit = input.limit ?? 8;

  const matches: SimilarProjectMatch[] = [];
  for (const cand of candidates) {
    const fp = buildProjectFingerprint(cand);
    const { similarity, dimensions } = scoreFingerprintSimilarity(queryFp, fp);
    if (similarity < minSimilarity) continue;
    matches.push({
      sessionId: cand.id,
      label: fp.label,
      status: cand.status,
      productionProjectId: cand.productionProjectId,
      similarity,
      dimensions,
      overlapSummary: overlapSummary(dimensions),
      fingerprint: fp,
    });
  }

  matches.sort(
    (a, b) =>
      b.similarity - a.similarity ||
      a.label.localeCompare(b.label) ||
      a.sessionId.localeCompare(b.sessionId),
  );
  const trimmed = matches.slice(0, limit);

  const reuseArtifacts: ReusableArtifact[] = [];
  for (const m of trimmed.slice(0, 5)) {
    const src = getIntakeSession(m.sessionId);
    if (!src) continue;
    reuseArtifacts.push(...collectReuseArtifacts(m, src, 6));
  }
  const dedupedArts: ReusableArtifact[] = [];
  const seen = new Set<string>();
  for (const a of reuseArtifacts.sort((x, y) => y.similarity - x.similarity)) {
    const key = `${a.kind}:${norm(a.detail).slice(0, 60)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedupedArts.push(a);
  }
  const arts = dedupedArts.slice(0, 16);

  const compareId = input.compareWith || trimmed[0]?.sessionId;
  let comparison: ProjectComparisonView | undefined;
  if (compareId) {
    const matchFp =
      trimmed.find((m) => m.sessionId === compareId)?.fingerprint ||
      (() => {
        const s = getIntakeSession(compareId);
        return s ? buildProjectFingerprint(s) : null;
      })();
    if (matchFp) {
      const sim =
        trimmed.find((m) => m.sessionId === compareId)?.similarity ??
        scoreFingerprintSimilarity(queryFp, matchFp).similarity;
      comparison = buildProjectComparison(queryFp, matchFp, sim);
    }
  }

  const insight = buildInsight(trimmed, arts, candidates.length);
  const generatedAt = new Date().toISOString();
  const contentHash = hashReport({
    version: CROSS_PROJECT_VERSION,
    query: queryFp.contentHash,
    matches: trimmed.map((m) => ({ id: m.sessionId, s: m.similarity })),
    arts: arts.map((a) => a.id),
  });

  return {
    version: CROSS_PROJECT_VERSION,
    organizationId: input.organizationId,
    querySessionId: input.sessionId,
    generatedAt,
    contentHash,
    queryFingerprint: queryFp,
    matches: trimmed,
    reuseArtifacts: arts,
    comparison,
    insight,
  };
}

/** Org-level explorer: fingerprints + top similar pairs among historical projects. */
export function buildCrossProjectExplorer(input: {
  organizationId: string;
  pairLimit?: number;
}): CrossProjectExplorerReport {
  const historical = listIntakeSessionsForOrg(input.organizationId).filter(
    isHistoricalCandidate,
  );
  const fingerprints = historical
    .map(buildProjectFingerprint)
    .sort((a, b) => a.label.localeCompare(b.label) || a.sessionId.localeCompare(b.sessionId));

  const pairs: CrossProjectExplorerReport["topPairs"] = [];
  for (let i = 0; i < fingerprints.length; i++) {
    for (let j = i + 1; j < fingerprints.length; j++) {
      const left = fingerprints[i]!;
      const right = fingerprints[j]!;
      const { similarity } = scoreFingerprintSimilarity(left, right);
      pairs.push({
        leftSessionId: left.sessionId,
        rightSessionId: right.sessionId,
        leftLabel: left.label,
        rightLabel: right.label,
        similarity,
      });
    }
  }
  pairs.sort(
    (a, b) =>
      b.similarity - a.similarity ||
      a.leftLabel.localeCompare(b.leftLabel) ||
      a.rightLabel.localeCompare(b.rightLabel),
  );
  const topPairs = pairs.slice(0, input.pairLimit ?? 12);
  const avgPairSimilarity =
    topPairs.length === 0
      ? 0
      : round3(topPairs.reduce((s, p) => s + p.similarity, 0) / topPairs.length);

  const generatedAt = new Date().toISOString();
  return {
    version: CROSS_PROJECT_VERSION,
    organizationId: input.organizationId,
    generatedAt,
    contentHash: hashReport({
      version: CROSS_PROJECT_VERSION,
      fps: fingerprints.map((f) => f.contentHash),
      pairs: topPairs,
    }),
    fingerprints,
    topPairs,
    insight: {
      projectCount: fingerprints.length,
      pairCount: topPairs.length,
      avgPairSimilarity,
      headline:
        fingerprints.length < 2
          ? "完成更多项目后可进行跨项目对标"
          : `${fingerprints.length} 个历史项目 · 平均高相似对 ${(avgPairSimilarity * 100).toFixed(0)}%`,
    },
  };
}

export function exportCrossProjectJson(
  report: CrossProjectSimilarityReport | CrossProjectExplorerReport,
): { fileName: string; body: string } {
  const stamp = report.generatedAt.slice(0, 10);
  const kind = "querySessionId" in report ? "similarity" : "explorer";
  return {
    fileName: `cross-project-${kind}-${report.organizationId}-${stamp}.json`,
    body: JSON.stringify(report, null, 2),
  };
}
