/**
 * E02-P7 — Knowledge Delivery builder
 * Memory Recommendation → Enterprise Knowledge Package lifecycle
 */

import { createHash, randomUUID } from "node:crypto";

import type { MemoryRecommendationItem } from "../memory-agent/memory-agent.types";
import {
  assertValidEnterpriseKnowledgePackage,
  KNOWLEDGE_DELIVERY_LIFECYCLE_STAGES,
  validateKnowledgeDeliveryKernelInput,
} from "./delivery.schema";
import type {
  EnterpriseKnowledgePackage,
  KnowledgeDeliveryKernelInput,
  KnowledgeDeliveryKernelResult,
  KnowledgeDeliveryLifecycle,
  KnowledgeDeliveryLifecycleStage,
  KnowledgeDeliveryLifecycleTransition,
  KnowledgePackageChecklistItem,
  KnowledgePackageSeal,
  KnowledgePackageSection,
  KnowledgePackageSectionKind,
} from "./delivery.types";
import {
  V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION,
  V102_KNOWLEDGE_DELIVERY_VERSION,
} from "./delivery.types";

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

const SECTION_TEMPLATES: Array<{
  kind: KnowledgePackageSectionKind;
  title: string;
  categories: Array<MemoryRecommendationItem["category"] | "*">;
}> = [
  {
    kind: "context_summary",
    title: "检索上下文摘要",
    categories: ["*"],
  },
  {
    kind: "similarity_profile",
    title: "相似招标画像",
    categories: ["reuse"],
  },
  {
    kind: "reuse_playbook",
    title: "材料复用手册",
    categories: ["reuse"],
  },
  {
    kind: "evidence_bundle",
    title: "证据与标准包",
    categories: ["evidence", "compliance"],
  },
  {
    kind: "pricing_alignment",
    title: "报价与限价对齐",
    categories: ["pricing"],
  },
  {
    kind: "compliance_checklist",
    title: "合规检查清单",
    categories: ["compliance"],
  },
  {
    kind: "delivery_plan",
    title: "交付与实施建议",
    categories: ["delivery"],
  },
];

function buildSections(
  items: MemoryRecommendationItem[],
  recommendationId: string,
): KnowledgePackageSection[] {
  return SECTION_TEMPLATES.map((template, order) => {
    const matched =
      template.categories.includes("*")
        ? items
        : items.filter((i) => template.categories.includes(i.category));

    return {
      id: stableId("ksec", `${recommendationId}|${template.kind}|${order}`),
      kind: template.kind,
      title: template.title,
      order,
      itemIds: matched.map((i) => i.id),
      summary:
        matched.length > 0
          ? `挂载 ${matched.length} 条记忆推荐`
          : "本节待补充推荐条目",
      readOnly: true as const,
    };
  });
}

function buildChecklist(input: {
  recommendationReady: boolean;
  sectionCount: number;
  highPriorityCount: number;
  sealed: boolean;
  profilePresent: boolean;
  contextPresent: boolean;
  recommendationId: string;
}): KnowledgePackageChecklistItem[] {
  const checks: Array<Omit<KnowledgePackageChecklistItem, "id" | "readOnly">> = [
    {
      code: "REC_READY",
      label: "Memory recommendation ready",
      status: input.recommendationReady ? "pass" : "fail",
      detail: `recommendationReady=${input.recommendationReady}`,
    },
    {
      code: "CTX_LINKED",
      label: "Knowledge context linked",
      status: input.contextPresent ? "pass" : "pending",
      detail: input.contextPresent ? "context provided" : "context optional/missing",
    },
    {
      code: "PROFILE_LINKED",
      label: "Similar tender profile linked",
      status: input.profilePresent ? "pass" : "pending",
      detail: input.profilePresent ? "profile provided" : "profile optional/missing",
    },
    {
      code: "SECTIONS_BUILT",
      label: "Knowledge package sections assembled",
      status: input.sectionCount >= 7 ? "pass" : "fail",
      detail: `sections=${input.sectionCount}`,
    },
    {
      code: "HIGH_PRIORITY",
      label: "High-priority recommendations present",
      status: input.highPriorityCount >= 1 ? "pass" : "fail",
      detail: `high=${input.highPriorityCount}`,
    },
    {
      code: "PACKAGE_SEAL",
      label: "Knowledge package sealed",
      status: input.sealed ? "pass" : "pending",
      detail: input.sealed ? "seal attached" : "awaiting seal",
    },
  ];

  return checks.map((c, index) => ({
    id: stableId("kcheck", `${input.recommendationId}|${c.code}|${index}`),
    ...c,
    readOnly: true as const,
  }));
}

function buildSeal(input: {
  packageId: string;
  sections: KnowledgePackageSection[];
  recommendations: MemoryRecommendationItem[];
}): KnowledgePackageSeal {
  const payload = [
    input.packageId,
    ...input.sections.map((s) => `${s.kind}:${s.itemIds.join(",")}`),
    ...input.recommendations.map((r) => `${r.category}:${r.id}`),
    V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION,
  ].join("|");

  const packageHash = createHash("sha256").update(payload).digest("hex").slice(0, 24);

  return {
    id: stableId("kseal", `${input.packageId}|${packageHash}`),
    packageId: input.packageId,
    sealedAt: nowIso(),
    packageHash,
    freezeVersion: V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION,
    sectionCount: input.sections.length,
    recommendationCount: input.recommendations.length,
    readOnly: true,
  };
}

export function buildEnterpriseKnowledgePackage(input: {
  recommendation: KnowledgeDeliveryKernelInput["recommendation"];
  deploymentId: string;
  contextId?: string;
  profileId?: string;
  titleHint?: string;
  ownerHint?: string;
  contextPresent?: boolean;
  profilePresent?: boolean;
}): EnterpriseKnowledgePackage {
  const createdAt = nowIso();
  const items = input.recommendation.items;
  const sections = buildSections(items, input.recommendation.id);
  const highPriorityCount = items.filter((i) => i.priority === "high").length;

  const contextId = input.contextId ?? input.recommendation.contextId;
  const profileId = input.profileId ?? input.recommendation.profileId;

  const packageId = stableId(
    "kpkg",
    `${input.recommendation.id}|${input.deploymentId}|${items.map((i) => i.id).join("|")}`,
  );

  const recommendationReady =
    input.recommendation.status === "ready" && items.length >= 2;
  const canSeal =
    recommendationReady &&
    sections.length >= 7 &&
    highPriorityCount >= 1;

  const seal = canSeal
    ? buildSeal({
        packageId,
        sections,
        recommendations: items,
      })
    : null;

  const checklist = buildChecklist({
    recommendationReady,
    sectionCount: sections.length,
    highPriorityCount,
    sealed: seal !== null,
    profilePresent: input.profilePresent ?? Boolean(input.profileId),
    contextPresent: input.contextPresent ?? Boolean(input.contextId),
    recommendationId: input.recommendation.id,
  });

  // If optional context/profile missing, pending checks should not block seal when recommendation ready
  const checklistForPass = checklist.filter((c) => c.code !== "CTX_LINKED" && c.code !== "PROFILE_LINKED");
  const checklistPassCount = checklist.filter((c) => c.status === "pass").length;
  const requiredPass = checklistForPass.every((c) => c.status === "pass");

  const completenessRatio = round2(
    checklistPassCount / Math.max(checklist.length, 1),
  );

  const status: EnterpriseKnowledgePackage["status"] = !canSeal
    ? items.length === 0
      ? "failed"
      : "assembled"
    : seal && requiredPass
      ? "sealed"
      : "assembled";

  // If sealed but optional pending, still allow sealed when canSeal true
  const finalStatus: EnterpriseKnowledgePackage["status"] =
    seal && canSeal ? "sealed" : status;

  const title =
    input.titleHint?.trim() ||
    `企业知识包 · ${input.recommendation.title.slice(0, 24)}`;

  const narrative = [
    "汇总 Memory Agent 推荐条目",
    "装配知识包七大交付章节",
    "关联检索上下文与相似招标画像",
    finalStatus === "sealed"
      ? "知识包已封印，可进入企业知识交付通道"
      : "知识包已组装，待补齐高优先推荐或封印条件",
  ];

  const pkg: EnterpriseKnowledgePackage = {
    id: packageId,
    recommendationId: input.recommendation.id,
    contextId,
    profileId,
    deploymentId: input.deploymentId,
    status: finalStatus,
    title,
    ownerHint: input.ownerHint?.trim() || "knowledge-delivery",
    sectionCount: sections.length,
    recommendationCount: items.length,
    highPriorityCount,
    checklistPassCount,
    checklistCount: checklist.length,
    completenessRatio,
    sections,
    recommendations: items,
    checklist,
    seal: finalStatus === "sealed" ? seal : null,
    narrative,
    summary: [
      `status=${finalStatus}`,
      `sections=${sections.length}`,
      `recs=${items.length}`,
      `high=${highPriorityCount}`,
      `completeness=${completenessRatio}`,
      seal && finalStatus === "sealed" ? `seal=${seal.packageHash}` : "seal=none",
    ].join(" "),
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  assertValidEnterpriseKnowledgePackage(pkg);
  return pkg;
}

function pushTransition(
  transitions: KnowledgeDeliveryLifecycleTransition[],
  from: KnowledgeDeliveryLifecycleStage,
  to: KnowledgeDeliveryLifecycleStage,
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

export function buildKnowledgeDeliveryLifecycle(input: {
  package: EnterpriseKnowledgePackage | null;
}): KnowledgeDeliveryLifecycle {
  const transitions: KnowledgeDeliveryLifecycleTransition[] = [];
  let current: KnowledgeDeliveryLifecycleStage = "recommendation";

  if (input.package) {
    pushTransition(
      transitions,
      "recommendation",
      "package",
      `sections=${input.package.sectionCount}|recs=${input.package.recommendationCount}`,
    );
    current = "package";

    if (input.package.seal && input.package.status === "sealed") {
      pushTransition(
        transitions,
        "package",
        "seal",
        `hash=${input.package.seal.packageHash}`,
      );
      current = "seal";
    }
  }

  const complete =
    input.package !== null &&
    input.package.status === "sealed" &&
    input.package.seal !== null &&
    current === "seal";

  return {
    current,
    stages: [...KNOWLEDGE_DELIVERY_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildKnowledgeDeliveryKernel(
  input: KnowledgeDeliveryKernelInput,
): KnowledgeDeliveryKernelResult {
  const validated = validateKnowledgeDeliveryKernelInput(input);
  if (!validated.ok) {
    throw new Error(
      `Invalid knowledge delivery input: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }

  const deploymentId = input.deploymentId?.trim() || "v102-p7-delivery-default";
  const generatedAt = nowIso();

  const pkg = buildEnterpriseKnowledgePackage({
    recommendation: input.recommendation,
    deploymentId,
    contextId: input.context?.id ?? input.recommendation.contextId,
    profileId: input.profile?.id ?? input.recommendation.profileId,
    titleHint: input.titleHint,
    ownerHint: input.ownerHint,
    contextPresent: Boolean(input.context),
    profilePresent: Boolean(input.profile),
  });

  const lifecycle = buildKnowledgeDeliveryLifecycle({ package: pkg });
  const ready = lifecycle.complete;

  return {
    version: V102_KNOWLEDGE_DELIVERY_VERSION,
    freezeVersion: V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION,
    reportId: `knowledge-delivery-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    recommendation: input.recommendation,
    package: pkg,
    lifecycle,
    ready,
    readinessScore: ready
      ? 100
      : Math.round(pkg.completenessRatio * 80 + Math.min(20, pkg.highPriorityCount * 5)),
    summary: [
      `knowledge-delivery ready=${ready}`,
      `recommendation=${input.recommendation.id}`,
      `package=${pkg.status}`,
      `sections=${pkg.sectionCount}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertKnowledgeDeliveryKernelPass(
  result: KnowledgeDeliveryKernelResult,
): asserts result is KnowledgeDeliveryKernelResult & {
  ready: true;
  package: EnterpriseKnowledgePackage & {
    status: "sealed";
    seal: KnowledgePackageSeal;
  };
} {
  if (
    !result.ready ||
    !result.package ||
    result.package.status !== "sealed" ||
    !result.package.seal
  ) {
    throw new Error(
      `V102 knowledge delivery kernel not ready: ${result.summary}`,
    );
  }
}
