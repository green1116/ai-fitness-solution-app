/**
 * E01-P7 — Enterprise Delivery builder
 * Assembles P1–P6 outputs into Enterprise Delivery Package lifecycle
 */

import { createHash, randomUUID } from "node:crypto";

import type { AgentOrchestrationResult } from "../agent/agent.types";
import {
  assertValidOrchestration,
  DELIVERY_LIFECYCLE_STAGES,
  validateDeliveryPackage,
} from "./delivery.schema";
import type {
  DeliveryArtifactKind,
  DeliveryChecklistItem,
  DeliveryKernelInput,
  DeliveryKernelResult,
  DeliveryLayer,
  DeliveryLifecycle,
  DeliveryLifecycleStage,
  DeliveryLifecycleTransition,
  DeliveryPackageItem,
  DeliverySeal,
  EnterpriseDeliveryPackage,
} from "./delivery.types";
import {
  V101_ENTERPRISE_DELIVERY_FREEZE_VERSION,
  V101_ENTERPRISE_DELIVERY_VERSION,
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

type InventorySpec = {
  kind: DeliveryArtifactKind;
  layer: DeliveryLayer;
  label: string;
  required: boolean;
  resolve: (orchestration: AgentOrchestrationResult) => string | undefined;
};

const INVENTORY_SPECS: InventorySpec[] = [
  {
    kind: "intake_report",
    layer: "P1",
    label: "Tender Intake Report",
    required: true,
    resolve: (o) => o.artifacts.intakeReportId,
  },
  {
    kind: "workspace",
    layer: "P1",
    label: "Tender Workspace",
    required: true,
    resolve: (o) => o.artifacts.workspaceId,
  },
  {
    kind: "understanding_report",
    layer: "P2",
    label: "Document Understanding Report",
    required: true,
    resolve: (o) => o.artifacts.understandingReportId,
  },
  {
    kind: "requirement_index",
    layer: "P2",
    label: "Requirement Index",
    required: true,
    resolve: (o) => o.artifacts.requirementIndexId,
  },
  {
    kind: "intelligence_report",
    layer: "P3",
    label: "Tender Intelligence Report",
    required: true,
    resolve: (o) => o.artifacts.intelligenceReportId,
  },
  {
    kind: "opportunity",
    layer: "P3",
    label: "Opportunity Profile",
    required: true,
    resolve: (o) => o.artifacts.opportunityId,
  },
  {
    kind: "strategy_report",
    layer: "P4",
    label: "Bid Strategy Report",
    required: true,
    resolve: (o) => o.artifacts.strategyReportId,
  },
  {
    kind: "strategy",
    layer: "P4",
    label: "Bid Strategy",
    required: true,
    resolve: (o) => o.artifacts.strategyId,
  },
  {
    kind: "proposal_report",
    layer: "P5",
    label: "Proposal Intelligence Report",
    required: true,
    resolve: (o) => o.artifacts.proposalReportId,
  },
  {
    kind: "blueprint",
    layer: "P5",
    label: "Proposal Blueprint",
    required: true,
    resolve: (o) => o.artifacts.blueprintId,
  },
  {
    kind: "orchestration_report",
    layer: "P6",
    label: "Agent Orchestration Report",
    required: true,
    resolve: (o) => o.reportId,
  },
];

function buildPackageItems(
  orchestration: AgentOrchestrationResult,
): DeliveryPackageItem[] {
  return INVENTORY_SPECS.map((spec, index) => {
    const refId = spec.resolve(orchestration)?.trim() || undefined;
    const present = Boolean(refId);
    return {
      id: stableId("item", `${orchestration.reportId}|${spec.kind}|${index}`),
      kind: spec.kind,
      layer: spec.layer,
      label: spec.label,
      refId,
      required: spec.required,
      present,
      readOnly: true as const,
    };
  });
}

function buildChecklist(input: {
  orchestration: AgentOrchestrationResult;
  items: DeliveryPackageItem[];
  sealed: boolean;
}): DeliveryChecklistItem[] {
  const { orchestration, items, sealed } = input;
  const presentRequired = items.filter((i) => i.required && i.present).length;
  const required = items.filter((i) => i.required).length;
  const succeededRuns = orchestration.runs.filter((r) => r.status === "succeeded").length;

  const checks: Array<Omit<DeliveryChecklistItem, "id" | "readOnly">> = [
    {
      code: "ORCH_READY",
      label: "P6 orchestration ready",
      status: orchestration.ready ? "pass" : "fail",
      detail: `ready=${orchestration.ready} score=${orchestration.readinessScore}`,
    },
    {
      code: "ORCH_LIFECYCLE",
      label: "P6 lifecycle complete",
      status: orchestration.lifecycle.complete ? "pass" : "fail",
      detail: `current=${orchestration.lifecycle.current}`,
    },
    {
      code: "AGENT_RUNS",
      label: "Executable agents succeeded",
      status: succeededRuns >= 5 ? "pass" : "fail",
      detail: `succeeded=${succeededRuns}`,
    },
    {
      code: "ARTIFACT_COMPLETE",
      label: "Required P1–P6 artifacts present",
      status: presentRequired === required ? "pass" : "fail",
      detail: `present=${presentRequired}/${required}`,
    },
    {
      code: "BLUEPRINT_REF",
      label: "Proposal blueprint linked",
      status: items.some((i) => i.kind === "blueprint" && i.present) ? "pass" : "fail",
      detail: `blueprint=${orchestration.artifacts.blueprintId ?? "none"}`,
    },
    {
      code: "PACKAGE_SEAL",
      label: "Delivery package sealed",
      status: sealed ? "pass" : "pending",
      detail: sealed ? "seal attached" : "awaiting seal",
    },
  ];

  return checks.map((c, index) => ({
    id: stableId("check", `${orchestration.reportId}|${c.code}|${index}`),
    ...c,
    readOnly: true as const,
  }));
}

function buildSeal(input: {
  packageId: string;
  items: DeliveryPackageItem[];
}): DeliverySeal {
  const presentRefs = input.items
    .filter((i) => i.present && i.refId)
    .map((i) => `${i.kind}:${i.refId}`)
    .sort()
    .join("|");
  const packageHash = createHash("sha256")
    .update(`${input.packageId}|${presentRefs}|${V101_ENTERPRISE_DELIVERY_FREEZE_VERSION}`)
    .digest("hex")
    .slice(0, 24);

  return {
    id: stableId("seal", `${input.packageId}|${packageHash}`),
    packageId: input.packageId,
    sealedAt: nowIso(),
    packageHash,
    freezeVersion: V101_ENTERPRISE_DELIVERY_FREEZE_VERSION,
    artifactCount: input.items.filter((i) => i.present).length,
    readOnly: true,
  };
}

export function buildEnterpriseDeliveryPackage(input: {
  orchestration: AgentOrchestrationResult;
  deploymentId: string;
  titleHint?: string;
  ownerHint?: string;
}): EnterpriseDeliveryPackage {
  const createdAt = nowIso();
  const items = buildPackageItems(input.orchestration);
  const presentCount = items.filter((i) => i.present).length;
  const requiredCount = items.filter((i) => i.required).length;
  const requiredPresent = items.filter((i) => i.required && i.present).length;
  const completenessRatio =
    requiredCount === 0 ? 0 : round2(requiredPresent / requiredCount);

  const packageId = stableId(
    "delivery",
    `${input.orchestration.reportId}|${input.deploymentId}|${completenessRatio}`,
  );

  const canSeal =
    input.orchestration.ready &&
    input.orchestration.lifecycle.complete &&
    requiredPresent === requiredCount &&
    completenessRatio === 1;

  const seal = canSeal ? buildSeal({ packageId, items }) : null;
  const checklist = buildChecklist({
    orchestration: input.orchestration,
    items,
    sealed: seal !== null,
  });
  const checklistPassCount = checklist.filter((c) => c.status === "pass").length;

  const title =
    input.titleHint?.trim() ||
    `Enterprise Delivery Package · ${input.orchestration.deploymentId}`;

  const narrative = [
    "汇总 P1 招采接入与工作区产物",
    "汇总 P2 文档理解与需求索引",
    "汇总 P3 情报分析与机会画像",
    "汇总 P4 投标策略",
    "汇总 P5 方案蓝图",
    "汇总 P6 Agent 编排运行记录",
    seal ? "交付包已封印，可进入企业交付通道" : "交付包尚未封印，需补齐缺失产物",
  ];

  const status: EnterpriseDeliveryPackage["status"] = !canSeal
    ? requiredPresent === 0
      ? "failed"
      : "assembled"
    : "sealed";

  const pkg: EnterpriseDeliveryPackage = {
    id: packageId,
    orchestrationReportId: input.orchestration.reportId,
    deploymentId: input.deploymentId,
    status,
    title,
    ownerHint: input.ownerHint?.trim() || "enterprise-delivery",
    itemCount: items.length,
    presentCount,
    requiredCount,
    completenessRatio,
    checklistPassCount,
    checklistCount: checklist.length,
    items,
    checklist,
    seal,
    narrative,
    summary: [
      `status=${status}`,
      `completeness=${completenessRatio}`,
      `items=${presentCount}/${items.length}`,
      `checklist=${checklistPassCount}/${checklist.length}`,
      seal ? `seal=${seal.packageHash}` : "seal=none",
    ].join(" "),
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };

  const validated = validateDeliveryPackage(pkg);
  if (!validated.ok) {
    throw new Error(
      `Invalid EnterpriseDeliveryPackage: ${validated.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }

  return pkg;
}

function pushTransition(
  transitions: DeliveryLifecycleTransition[],
  from: DeliveryLifecycleStage,
  to: DeliveryLifecycleStage,
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

export function buildDeliveryLifecycle(input: {
  package: EnterpriseDeliveryPackage | null;
}): DeliveryLifecycle {
  const transitions: DeliveryLifecycleTransition[] = [];
  let current: DeliveryLifecycleStage = "orchestration";

  if (input.package) {
    pushTransition(
      transitions,
      "orchestration",
      "package",
      `items=${input.package.itemCount}|completeness=${input.package.completenessRatio}`,
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
    stages: [...DELIVERY_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildDeliveryKernel(input: DeliveryKernelInput): DeliveryKernelResult {
  const deploymentId =
    input.deploymentId?.trim() ||
    input.orchestration.deploymentId ||
    "v101-p7-delivery-default";
  const generatedAt = nowIso();

  assertValidOrchestration(input.orchestration);

  const pkg = buildEnterpriseDeliveryPackage({
    orchestration: input.orchestration,
    deploymentId,
    titleHint: input.titleHint,
    ownerHint: input.ownerHint,
  });

  const lifecycle = buildDeliveryLifecycle({ package: pkg });
  const ready = lifecycle.complete;

  return {
    version: V101_ENTERPRISE_DELIVERY_VERSION,
    freezeVersion: V101_ENTERPRISE_DELIVERY_FREEZE_VERSION,
    reportId: `enterprise-delivery-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    orchestration: input.orchestration,
    package: pkg,
    lifecycle,
    ready,
    readinessScore: ready
      ? 100
      : Math.round(pkg.completenessRatio * 80 + (pkg.checklistPassCount / Math.max(pkg.checklistCount, 1)) * 20),
    summary: [
      `enterprise-delivery ready=${ready}`,
      `orchestration=${input.orchestration.reportId}`,
      `package=${pkg.status}`,
      `completeness=${pkg.completenessRatio}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V101_ENTERPRISE_DELIVERY_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertDeliveryKernelPass(
  result: DeliveryKernelResult,
): asserts result is DeliveryKernelResult & {
  ready: true;
  package: EnterpriseDeliveryPackage & {
    status: "sealed";
    seal: DeliverySeal;
  };
} {
  if (!result.ready || !result.package || result.package.status !== "sealed" || !result.package.seal) {
    throw new Error(`V101 enterprise delivery kernel not ready: ${result.summary}`);
  }
}
