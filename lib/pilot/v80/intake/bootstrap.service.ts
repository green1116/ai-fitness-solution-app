/**
 * V80 Pilot P10 — Execution seed from approved intake (idempotent, no new engine)
 */

import { createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

import { appendIntakeAudit } from "./audit-trail.service";
import { buildIntakeHandoffPackage } from "./handoff-package.service";
import {
  PROJECT_BOOTSTRAP_VERSION,
  type BootstrapMilestone,
  type BootstrapOwner,
  type BootstrapOwnerRole,
  type BootstrapTask,
  type IntakeBootstrapState,
  type ProjectBootstrapPackage,
} from "./bootstrap.schema";
import {
  getIntakeSession,
  updateIntakeSession,
  type TenderIntakeSession,
} from "./intake.store";
import { listIntakeDocuments } from "./multidoc.service";
import type { TenderRequirements } from "./requirements.schema";
import { parseTenderRequirements } from "./requirements.validation";

const ITEM_KEYS = [
  "functionalRequirements",
  "technicalRequirements",
  "equipment",
  "space",
  "compliance",
  "standards",
  "evaluation",
] as const;

function hashOf(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function bootstrapId(projectId: string, hash: string): string {
  return `boot_${projectId.slice(0, 8)}_${hash.slice(0, 10)}`;
}

function mapOwners(session: TenderIntakeSession, actorEmail?: string): BootstrapOwner[] {
  const email = actorEmail?.trim() || `${session.userId}@local`;
  const display = email.split("@")[0] || session.userId;
  return [
    {
      role: "project_manager",
      label: "项目经理",
      userId: session.userId,
      email,
      displayName: display,
    },
    {
      role: "technical_lead",
      label: "技术负责人",
      userId: session.userId,
      email,
      displayName: `${display}-tech`,
    },
    {
      role: "commercial_owner",
      label: "商务负责人",
      userId: session.userId,
      email,
      displayName: `${display}-commercial`,
    },
    {
      role: "compliance_owner",
      label: "合规负责人",
      userId: session.userId,
      email,
      displayName: `${display}-compliance`,
    },
    {
      role: "delivery_owner",
      label: "交付负责人",
      userId: session.userId,
      email,
      displayName: `${display}-delivery`,
    },
  ];
}

function seedMilestones(req: TenderRequirements): BootstrapMilestone[] {
  const hasDeadline = Boolean(req.schedule.deadline?.trim());
  return [
    {
      id: "ms-kickoff",
      title: "项目启动 / 需求冻结",
      description: "确认交接包、澄清闭环与合规门禁结果",
      status: "in_progress",
      ownerRole: "project_manager",
      dueOffsetDays: 3,
      order: 1,
    },
    {
      id: "ms-solution",
      title: "方案设计对齐",
      description: "基于技术/功能/空间需求完成方案框架",
      status: "planned",
      ownerRole: "technical_lead",
      dueOffsetDays: 10,
      order: 2,
    },
    {
      id: "ms-quote",
      title: "报价与商务确认",
      description: hasDeadline
        ? `对齐预算与截止（${req.schedule.deadline}）`
        : "对齐预算区间与商务条款",
      status: "planned",
      ownerRole: "commercial_owner",
      dueOffsetDays: 14,
      order: 3,
    },
    {
      id: "ms-tender-pack",
      title: "标书包完善",
      description: "完成 V80 标书产物核对与修订",
      status: "planned",
      ownerRole: "delivery_owner",
      dueOffsetDays: 21,
      order: 4,
    },
    {
      id: "ms-acceptance",
      title: "交付验收准备",
      description: "合规与验收标准核对、客户确认",
      status: "planned",
      ownerRole: "compliance_owner",
      dueOffsetDays: 30,
      order: 5,
    },
  ];
}

function seedTasks(
  req: TenderRequirements,
  session: TenderIntakeSession,
): BootstrapTask[] {
  const tasks: BootstrapTask[] = [
    {
      id: "task-review-handoff",
      milestoneId: "ms-kickoff",
      title: "审阅交接摘要包",
      description: "内部确认需求摘要、证据与合规结论",
      ownerRole: "project_manager",
      status: "todo",
      source: "handoff",
      dueOffsetDays: 2,
    },
    {
      id: "task-freeze-requirements",
      milestoneId: "ms-kickoff",
      title: "冻结已确认必选需求",
      description: "确认 must 条目均已审核，准备执行",
      ownerRole: "project_manager",
      status: "todo",
      source: "system",
      dueOffsetDays: 3,
    },
  ];

  for (const key of ITEM_KEYS) {
    for (const item of req[key].slice(0, 8)) {
      if (!item.text.trim()) continue;
      if (item.reviewStatus === "rejected") continue;
      const ownerRole: BootstrapOwnerRole =
        key === "compliance" || key === "standards"
          ? "compliance_owner"
          : key === "evaluation"
            ? "commercial_owner"
            : "technical_lead";
      tasks.push({
        id: `task-req-${item.id}`.slice(0, 64),
        milestoneId: key === "compliance" || key === "standards" ? "ms-acceptance" : "ms-solution",
        title: `落实：${item.text.slice(0, 36)}`,
        description: item.text.slice(0, 200),
        ownerRole,
        status: item.reviewStatus === "confirmed" ? "todo" : "blocked",
        source: "intake_requirement",
        relatedItemIds: [item.id],
        dueOffsetDays: ownerRole === "compliance_owner" ? 28 : 12,
      });
    }
  }

  const openClarify =
    session.clarifications?.questions.filter((q) => q.status === "open") ?? [];
  for (const q of openClarify.slice(0, 5)) {
    tasks.push({
      id: `task-clarify-${q.id}`.slice(0, 64),
      milestoneId: "ms-kickoff",
      title: `跟进澄清：${q.question.slice(0, 32)}`,
      description: q.question,
      ownerRole: "project_manager",
      status: "blocked",
      source: "clarification",
      dueOffsetDays: 2,
    });
  }

  const blockingCompliance =
    session.compliance?.report.findings.filter((f) => f.severity === "blocking") ?? [];
  for (const f of blockingCompliance.slice(0, 5)) {
    tasks.push({
      id: `task-comp-${f.ruleId}`.slice(0, 64),
      milestoneId: "ms-acceptance",
      title: `合规阻断：${f.title}`,
      description: f.message,
      ownerRole: "compliance_owner",
      status: "blocked",
      source: "compliance",
      dueOffsetDays: 5,
    });
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return tasks.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

function buildKickoffSummary(
  req: TenderRequirements,
  milestones: BootstrapMilestone[],
  tasks: BootstrapTask[],
  owners: BootstrapOwner[],
  ready: boolean,
): ProjectBootstrapPackage["kickoff"] {
  const risks = [
    ...(req.risks ?? []).slice(0, 5),
    ...tasks.filter((t) => t.status === "blocked").slice(0, 3).map((t) => t.title),
  ];
  return {
    projectName: req.projectName,
    clientName: req.organization,
    location: req.location,
    milestoneCount: milestones.length,
    taskCount: tasks.length,
    ownerCount: owners.length,
    ready,
    headline: ready
      ? "执行种子已就绪，可进入项目启动"
      : "执行种子已生成，但仍有阻断项待关闭",
    bullets: [
      `里程碑 ${milestones.length} 个 / 任务 ${tasks.length} 条`,
      `负责人角色 ${owners.length} 个`,
      `预算：${req.budget.min ?? "—"} ~ ${req.budget.max ?? "—"} ${req.budget.currency}`,
      req.schedule.deadline ? `截止：${req.schedule.deadline}` : "截止：待确认",
    ],
    risks,
    nextActions: ready
      ? ["召开 kickoff", "分配任务 Owner", "跟踪 V80 标书产物"]
      : ["关闭阻断任务", "完成澄清/合规", "重新生成 bootstrap"],
  };
}

/** Pure deterministic builder */
export function buildProjectBootstrapPackage(input: {
  session: TenderIntakeSession;
  actorEmail?: string;
}): ProjectBootstrapPackage {
  const session = input.session;
  if (!session.productionProjectId) {
    throw new Error("PROJECT_NOT_CREATED");
  }

  const req = parseTenderRequirements(
    session.requirements ?? session.extractedRequirements ?? {},
  );
  const handoff = buildIntakeHandoffPackage(session, "internal");
  const owners = mapOwners(session, input.actorEmail);
  const milestones = seedMilestones(req);
  const tasks = seedTasks(req, session);
  const docs = listIntakeDocuments(session.id).map((d) => ({
    id: d.id,
    fileName: d.fileName,
    docType: d.docType,
  }));

  const ready =
    handoff.approval.readyForV80 &&
    tasks.filter((t) => t.source === "compliance" && t.status === "blocked").length === 0 &&
    tasks.filter((t) => t.source === "clarification" && t.status === "blocked").length === 0;

  const stablePayload = {
    version: PROJECT_BOOTSTRAP_VERSION,
    projectId: session.productionProjectId,
    sessionId: session.id,
    revision: session.requirementsRevision ?? 0,
    handoffHash: handoff.traceability.contentHash,
    milestoneIds: milestones.map((m) => m.id),
    taskIds: tasks.map((t) => t.id),
    ownerRoles: owners.map((o) => o.role),
    requirementIds: ITEM_KEYS.flatMap((k) => req[k].map((i) => i.id)),
  };
  const contentHash = hashOf(stablePayload);
  const id = bootstrapId(session.productionProjectId, contentHash);

  return {
    version: PROJECT_BOOTSTRAP_VERSION,
    bootstrapId: id,
    contentHash,
    builtAt: new Date().toISOString(),
    organizationId: session.organizationId,
    sessionId: session.id,
    tenderIntakeId: session.tenderIntakeId,
    projectId: session.productionProjectId,
    quoteId: session.productionQuoteId,
    tenderId: session.productionTenderId,
    handoffPackageId: handoff.packageId,
    handoffContentHash: handoff.traceability.contentHash,
    v80WorkflowJobId: session.v80WorkflowJobId,
    owners,
    milestones,
    tasks,
    kickoff: buildKickoffSummary(req, milestones, tasks, owners, ready),
    traceability: {
      intakeRevision: session.requirementsRevision ?? 0,
      sourceDocuments: docs,
      requirementItemCount: ITEM_KEYS.reduce((n, k) => n + req[k].length, 0),
      compliancePassed: session.compliance?.report.passed,
    },
  };
}

async function persistBootstrapToProduction(
  pkg: ProjectBootstrapPackage,
): Promise<void> {
  const marker = `\n\n[V80_PILOT_BOOTSTRAP]\n${JSON.stringify({
    bootstrapId: pkg.bootstrapId,
    contentHash: pkg.contentHash,
    builtAt: pkg.builtAt,
    handoffPackageId: pkg.handoffPackageId,
    milestoneCount: pkg.milestones.length,
    taskCount: pkg.tasks.length,
  })}\n[/V80_PILOT_BOOTSTRAP]`;

  const project = await prisma.project.findUnique({ where: { id: pkg.projectId } });
  if (project) {
    const baseNotes = (project.notes ?? "").replace(
      /\n*\[V80_PILOT_BOOTSTRAP\][\s\S]*?\[\/V80_PILOT_BOOTSTRAP\]/g,
      "",
    );
    await prisma.project.update({
      where: { id: pkg.projectId },
      data: {
        notes: `${baseNotes.trim()}${marker}`.slice(0, 8000),
        description:
          project.description ??
          `Kickoff seeded: ${pkg.kickoff.headline} (${pkg.bootstrapId})`,
      },
    });
  }

  if (pkg.tenderId) {
    const tender = await prisma.tender.findUnique({ where: { id: pkg.tenderId } });
    if (tender) {
      const prev =
        tender.metadata && typeof tender.metadata === "object" && !Array.isArray(tender.metadata)
          ? (tender.metadata as Record<string, unknown>)
          : {};
      await prisma.tender.update({
        where: { id: pkg.tenderId },
        data: {
          metadata: {
            ...prev,
            executionBootstrap: pkg,
          } as Prisma.JsonObject,
        },
      });
    }
  }

  if (pkg.quoteId) {
    const quote = await prisma.quote.findUnique({ where: { id: pkg.quoteId } });
    if (quote) {
      const prev =
        quote.content && typeof quote.content === "object" && !Array.isArray(quote.content)
          ? (quote.content as Record<string, unknown>)
          : {};
      await prisma.quote.update({
        where: { id: pkg.quoteId },
        data: {
          content: {
            ...prev,
            executionBootstrap: {
              bootstrapId: pkg.bootstrapId,
              contentHash: pkg.contentHash,
              milestones: pkg.milestones,
              tasks: pkg.tasks,
              owners: pkg.owners,
              kickoff: pkg.kickoff,
              handoffPackageId: pkg.handoffPackageId,
            },
          } as Prisma.JsonObject,
        },
      });
    }
  }
}

export type SeedBootstrapResult = {
  session: TenderIntakeSession;
  bootstrap: IntakeBootstrapState;
  package: ProjectBootstrapPackage;
  idempotent: boolean;
};

/**
 * Seed execution bootstrap for approved intake.
 * Idempotent on same contentHash for the project.
 */
export async function seedProjectBootstrap(input: {
  sessionId: string;
  organizationId: string;
  actorId?: string;
  actorEmail?: string;
  persistProduction?: boolean;
}): Promise<SeedBootstrapResult> {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");
  if (!session.productionProjectId) throw new Error("PROJECT_NOT_CREATED");

  const pkg = buildProjectBootstrapPackage({
    session,
    actorEmail: input.actorEmail,
  });

  const existing = session.bootstrap;
  if (existing?.contentHash === pkg.contentHash && existing.projectId === pkg.projectId) {
    return {
      session,
      bootstrap: { ...existing, idempotent: true },
      package: existing.package,
      idempotent: true,
    };
  }

  if (input.persistProduction !== false) {
    await persistBootstrapToProduction(pkg);
  }

  const bootstrap: IntakeBootstrapState = {
    bootstrapId: pkg.bootstrapId,
    contentHash: pkg.contentHash,
    builtAt: pkg.builtAt,
    projectId: pkg.projectId,
    package: pkg,
    idempotent: false,
  };

  const updated = updateIntakeSession(input.sessionId, { bootstrap });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "bootstrap",
    statusBefore: session.status,
    statusAfter: updated.status,
    message: `项目执行种子 ${pkg.bootstrapId}（里程碑 ${pkg.milestones.length} / 任务 ${pkg.tasks.length}）`,
    linkage: {
      projectId: pkg.projectId,
      quoteId: pkg.quoteId,
      tenderId: pkg.tenderId,
      workflowJobId: pkg.v80WorkflowJobId,
    },
    meta: {
      bootstrapId: pkg.bootstrapId,
      contentHash: pkg.contentHash,
      handoffPackageId: pkg.handoffPackageId,
      ready: pkg.kickoff.ready,
      milestoneCount: pkg.milestones.length,
      taskCount: pkg.tasks.length,
    },
  });

  return { session: updated, bootstrap, package: pkg, idempotent: false };
}

export function getProjectBootstrap(sessionId: string): IntakeBootstrapState | null {
  return getIntakeSession(sessionId)?.bootstrap ?? null;
}
