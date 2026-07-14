/**
 * E02-P5 — Similar Tender Intelligence builder
 * Tender context → Similar Tender Profile lifecycle
 */

import { createHash, randomUUID } from "node:crypto";

import type { KnowledgeNodeKind } from "../knowledge/knowledge.types";
import type { KnowledgeContext } from "../retrieval/retrieval.types";
import {
  assertValidSimilarTenderProfile,
  SIMILARITY_LIFECYCLE_STAGES,
  validateSimilarityKernelInput,
  validateTenderFeatureFingerprint,
} from "./similarity.schema";
import type {
  SimilarTenderMatch,
  SimilarTenderProfile,
  SimilarityDimension,
  SimilarityKernelInput,
  SimilarityKernelResult,
  SimilarityLifecycle,
  SimilarityLifecycleStage,
  SimilarityLifecycleTransition,
  TenderFeatureFingerprint,
} from "./similarity.types";
import {
  V102_SIMILAR_TENDER_FREEZE_VERSION,
  V102_SIMILAR_TENDER_VERSION,
} from "./similarity.types";

function nowIso(): string {
  return new Date().toISOString();
}

function stableId(prefix: string, seed: string): string {
  const hash = createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return `${prefix}_${hash}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

const KIND_TO_DIMENSION: Partial<Record<KnowledgeNodeKind, SimilarityDimension>> = {
  project: "project_type",
  equipment: "equipment",
  standard: "standard",
  budget: "budget",
  requirement: "requirement",
  deliverable: "deliverable",
  location: "location",
  clause: "clause",
};

type ReferenceTender = {
  id: string;
  title: string;
  sector: string;
  locationHint: string;
  budgetBand: string;
  signals: string[];
  dimensions: SimilarityDimension[];
  reuseHints: string[];
};

const REFERENCE_CORPUS: ReferenceTender[] = [
  {
    id: "ref-gym-campus-a",
    title: "滨江园区企业健身中心设备采购项目",
    sector: "enterprise-fitness",
    locationHint: "杭州市滨江区",
    budgetBand: "200-350万",
    signals: ["健身", "跑步机", "有氧", "力量", "器械", "GB/T 22517", "质保", "园区"],
    dimensions: ["project_type", "equipment", "standard", "budget", "requirement"],
    reuseHints: ["复用有氧/力量分区设备清单", "对齐 GB/T 22517 质保口径"],
  },
  {
    id: "ref-gym-gov-b",
    title: "市级机关文体中心健身区改造项目",
    sector: "public-fitness",
    locationHint: "上海市徐汇区",
    budgetBand: "150-280万",
    signals: ["健身", "改造", "面积", "净高", "技术标", "商务标", "方案书"],
    dimensions: ["project_type", "requirement", "clause", "deliverable", "location"],
    reuseHints: ["复用评标条款应答矩阵", "复用场地指标合规说明"],
  },
  {
    id: "ref-equip-c",
    title: "总部大楼健身器械与配套采购项目",
    sector: "corporate-equip",
    locationHint: "深圳市南山区",
    budgetBand: "180-300万",
    signals: ["器械", "设备", "清单", "预算", "限价", "交付", "安装"],
    dimensions: ["equipment", "budget", "deliverable", "requirement"],
    reuseHints: ["复用设备选型论证章节", "复用限价内报价拆分模板"],
  },
  {
    id: "ref-standard-d",
    title: "体育设施标准化升级与检测服务项目",
    sector: "standards-upgrade",
    locationHint: "苏州市工业园区",
    budgetBand: "100-220万",
    signals: ["标准", "GB/T", "检测", "合规", "质保", "条款"],
    dimensions: ["standard", "clause", "requirement"],
    reuseHints: ["复用标准符合性证明包", "强化检测/验收证据索引"],
  },
  {
    id: "ref-campus-e",
    title: "科技园配套生活服务中心建设项目",
    sector: "campus-amenity",
    locationHint: "上海市浦东新区",
    budgetBand: "250-400万",
    signals: ["科技园", "浦东", "园区", "建设", "交付成果", "预算"],
    dimensions: ["project_type", "location", "budget", "deliverable"],
    reuseHints: ["复用园区场景实施计划", "对齐本地交付与移交节奏"],
  },
];

export function buildTenderFeatureFingerprint(
  context: KnowledgeContext,
): TenderFeatureFingerprint {
  const labels = unique([
    ...context.focusedNodes.map((n) => n.label),
    ...context.hits.map((h) => h.label),
  ]).filter((l) => l.trim().length > 0);

  const kinds = unique(context.focusedNodes.map((n) => n.kind));

  const keywords = unique([
    ...labels.flatMap((l) =>
      ["健身", "跑步机", "器械", "标准", "预算", "限价", "面积", "质保", "园区", "设备", "交付"]
        .filter((k) => l.includes(k)),
    ),
    ...context.hits.flatMap((h) => h.matchedTerms),
    ...context.snippets.flatMap((s) =>
      ["标准", "预算", "设备", "需求", "交付"].filter((k) => s.text.includes(k)),
    ),
  ]).filter((k) => k.trim().length > 0);

  const dimensions = unique(
    kinds
      .map((k) => KIND_TO_DIMENSION[k])
      .filter((d): d is SimilarityDimension => Boolean(d)),
  );

  if (labels.length < 1 || keywords.length < 1 || dimensions.length < 1) {
    throw new Error("Unable to build tender feature fingerprint from context");
  }

  const fingerprint: TenderFeatureFingerprint = {
    id: stableId("fp", `${context.id}|${labels.join("|")}|${keywords.join("|")}`),
    sourceContextId: context.id,
    labels,
    kinds,
    keywords,
    dimensions,
    readOnly: true,
  };

  const validated = validateTenderFeatureFingerprint(fingerprint);
  if (!validated.ok) {
    throw new Error(
      `Invalid TenderFeatureFingerprint: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
  return fingerprint;
}

function scoreReferenceAgainstFingerprint(
  ref: ReferenceTender,
  fingerprint: TenderFeatureFingerprint,
): { overlapScore: number; overlapDimensions: SimilarityDimension[]; sharedSignals: string[] } {
  const sharedSignals = unique(
    ref.signals.filter((s) =>
      fingerprint.keywords.some((k) => k.includes(s) || s.includes(k)) ||
      fingerprint.labels.some((l) => l.includes(s)),
    ),
  );

  const overlapDimensions = unique(
    ref.dimensions.filter((d) => fingerprint.dimensions.includes(d)),
  );

  const signalScore =
    ref.signals.length === 0 ? 0 : sharedSignals.length / ref.signals.length;
  const dimensionScore =
    ref.dimensions.length === 0
      ? 0
      : overlapDimensions.length / ref.dimensions.length;

  const overlapScore = round2(Math.min(1, signalScore * 0.65 + dimensionScore * 0.35));

  return { overlapScore, overlapDimensions, sharedSignals };
}

export function matchSimilarTenders(input: {
  fingerprint: TenderFeatureFingerprint;
  limit?: number;
  minOverlapScore?: number;
}): SimilarTenderMatch[] {
  const limit = Math.max(1, input.limit ?? 5);
  const minOverlapScore = input.minOverlapScore ?? 0.25;

  const ranked = REFERENCE_CORPUS.map((ref) => {
    const scored = scoreReferenceAgainstFingerprint(ref, input.fingerprint);
    return { ref, ...scored };
  })
    .filter((r) => r.overlapScore >= minOverlapScore && r.overlapDimensions.length > 0)
    .sort(
      (a, b) =>
        b.overlapScore - a.overlapScore || a.ref.title.localeCompare(b.ref.title),
    )
    .slice(0, limit);

  if (ranked.length < 1) {
    throw new Error("No similar tenders matched the tender context");
  }

  return ranked.map((item, index) => ({
    id: stableId("sim", `${item.ref.id}|${input.fingerprint.id}|${item.overlapScore}`),
    rank: index + 1,
    title: item.ref.title,
    sector: item.ref.sector,
    locationHint: item.ref.locationHint,
    budgetBand: item.ref.budgetBand,
    overlapScore: item.overlapScore,
    overlapDimensions: item.overlapDimensions,
    sharedSignals: item.sharedSignals,
    reuseHints: [...item.ref.reuseHints],
    readOnly: true as const,
  }));
}

export function buildSimilarTenderProfile(input: {
  context: KnowledgeContext;
  fingerprint: TenderFeatureFingerprint;
  matches: SimilarTenderMatch[];
  titleHint?: string;
}): SimilarTenderProfile {
  const createdAt = nowIso();
  const topScore = input.matches[0]?.overlapScore ?? 0;
  const dimensionCoverage = unique(
    input.matches.flatMap((m) => m.overlapDimensions),
  );

  const status: SimilarTenderProfile["status"] =
    input.matches.length >= 2 && topScore >= 0.35 ? "ready" : "matched";

  const title =
    input.titleHint?.trim() ||
    `相似招标画像 · ${input.context.title.slice(0, 24)}`;

  const insights = [
    `基于检索上下文「${input.context.title}」生成相似招标画像`,
    `特征指纹覆盖维度: ${input.fingerprint.dimensions.join(", ")}`,
    `匹配 ${input.matches.length} 条历史相近项目，最高重叠度 ${topScore}`,
    status === "ready"
      ? "画像已就绪，可复用设备清单/合规证据/报价拆分模板"
      : "画像已形成匹配，建议补充上下文命中以提升重叠度",
  ];

  const profile: SimilarTenderProfile = {
    id: stableId(
      "prof",
      `${input.context.id}|${input.fingerprint.id}|${input.matches.map((m) => m.id).join("|")}`,
    ),
    status,
    title,
    contextId: input.context.id,
    fingerprintId: input.fingerprint.id,
    matchCount: input.matches.length,
    topScore,
    dimensionCoverage,
    fingerprint: input.fingerprint,
    matches: input.matches,
    insights,
    summary: [
      `status=${status}`,
      `matches=${input.matches.length}`,
      `top=${topScore}`,
      `dimensions=${dimensionCoverage.length}`,
    ].join(" "),
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  assertValidSimilarTenderProfile(profile);
  return profile;
}

function pushTransition(
  transitions: SimilarityLifecycleTransition[],
  from: SimilarityLifecycleStage,
  to: SimilarityLifecycleStage,
  note?: string,
): void {
  transitions.push({
    from,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  });
}

export function buildSimilarityLifecycle(input: {
  context: KnowledgeContext;
  matches: SimilarTenderMatch[];
  profile: SimilarTenderProfile | null;
}): SimilarityLifecycle {
  const transitions: SimilarityLifecycleTransition[] = [];
  let current: SimilarityLifecycleStage = "context";

  if (input.matches.length > 0) {
    pushTransition(
      transitions,
      "context",
      "matches",
      `matches=${input.matches.length}`,
    );
    current = "matches";
  }

  if (input.profile) {
    pushTransition(
      transitions,
      current,
      "profile",
      `status=${input.profile.status}|top=${input.profile.topScore}`,
    );
    current = "profile";
  }

  const complete =
    input.profile !== null &&
    input.profile.status === "ready" &&
    input.matches.length >= 2 &&
    current === "profile";

  return {
    current,
    stages: [...SIMILARITY_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildSimilarityKernel(
  input: SimilarityKernelInput,
): SimilarityKernelResult {
  const validated = validateSimilarityKernelInput(input);
  if (!validated.ok) {
    throw new Error(
      `Invalid similarity kernel input: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }

  const deploymentId = input.deploymentId?.trim() || "v102-p5-similarity-default";
  const generatedAt = nowIso();

  const fingerprint = buildTenderFeatureFingerprint(input.context);
  const matches = matchSimilarTenders({
    fingerprint,
    limit: input.limit,
    minOverlapScore: input.minOverlapScore,
  });
  const profile = buildSimilarTenderProfile({
    context: input.context,
    fingerprint,
    matches,
    titleHint: input.titleHint,
  });
  const lifecycle = buildSimilarityLifecycle({
    context: input.context,
    matches,
    profile,
  });
  const ready = lifecycle.complete;

  return {
    version: V102_SIMILAR_TENDER_VERSION,
    freezeVersion: V102_SIMILAR_TENDER_FREEZE_VERSION,
    reportId: `similar-tender-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    context: input.context,
    fingerprint,
    matches,
    profile,
    lifecycle,
    ready,
    readinessScore: ready
      ? 100
      : Math.min(90, Math.round(matches.length * 15 + profile.topScore * 40)),
    summary: [
      `similar-tender ready=${ready}`,
      `matches=${matches.length}`,
      `top=${profile.topScore}`,
      `profile=${profile.status}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V102_SIMILAR_TENDER_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertSimilarityKernelPass(
  result: SimilarityKernelResult,
): asserts result is SimilarityKernelResult & {
  ready: true;
  profile: SimilarTenderProfile;
} {
  if (!result.ready || !result.profile) {
    throw new Error(`V102 similar tender kernel not ready: ${result.summary}`);
  }
}
