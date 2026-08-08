/** V80 CODE P3 — Prisma persistence backend */
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { memoryBackend } from "./memory.backend";
import type {
  V80Budget,
  V80Organization,
  V80PdfArtifact,
  V80Project,
  V80Quote,
  V80Tender,
  V80WorkflowJob,
  V80WorkflowStepState,
  V80Plan,
} from "./types";

type V80PrismaClient = {
  v80ScaffoldOrganization: {
    findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
    create: (args: unknown) => Promise<Record<string, unknown>>;
  };
  v80ScaffoldProject: {
    findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
    create: (args: unknown) => Promise<Record<string, unknown>>;
  };
  v80ScaffoldTender: {
    findFirst: (args: unknown) => Promise<Record<string, unknown> | null>;
    create: (args: unknown) => Promise<Record<string, unknown>>;
  };
  v80ScaffoldQuote: {
    findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
    findFirst: (args: unknown) => Promise<Record<string, unknown> | null>;
    create: (args: unknown) => Promise<Record<string, unknown>>;
  };
  v80ScaffoldBudget: {
    findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
    findFirst: (args: unknown) => Promise<Record<string, unknown> | null>;
    create: (args: unknown) => Promise<Record<string, unknown>>;
  };
  v80ScaffoldPlanJob: {
    findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
    upsert: (args: unknown) => Promise<Record<string, unknown>>;
    update: (args: unknown) => Promise<Record<string, unknown>>;
  };
  v80ScaffoldDocumentExport: {
    findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
    findMany: (args: unknown) => Promise<Record<string, unknown>[]>;
    create: (args: unknown) => Promise<Record<string, unknown>>;
  };
  v80ScaffoldUsageRecord: {
    upsert: (args: unknown) => Promise<Record<string, unknown>>;
    findMany: (args: unknown) => Promise<Record<string, unknown>[]>;
  };
  $queryRaw: typeof prisma.$queryRaw;
};

let prismaReady: boolean | null = null;

export function hasV80PrismaModels(): boolean {
  const db = prisma as unknown as V80PrismaClient;
  return typeof db.v80ScaffoldOrganization?.findUnique === "function";
}

export async function isV80PrismaAvailable(): Promise<boolean> {
  if (!hasV80PrismaModels()) return false;
  if (prismaReady !== null) return prismaReady;
  try {
    await (prisma as unknown as V80PrismaClient).$queryRaw`SELECT 1`;
    prismaReady = true;
  } catch {
    prismaReady = false;
  }
  return prismaReady;
}

function db() {
  return prisma as unknown as V80PrismaClient;
}

function mapOrg(row: Record<string, unknown>): V80Organization {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    adminEmail: String(row.adminEmail ?? ""),
    plan: String(row.plan ?? "BASIC") as V80Plan,
    createdAt: new Date(String(row.createdAt)),
  };
}

function mapProject(row: Record<string, unknown>): V80Project {
  return {
    id: String(row.id),
    organizationId: String(row.organizationId),
    name: String(row.name),
    createdAt: new Date(String(row.createdAt)),
  };
}

function mapJob(row: Record<string, unknown>): V80WorkflowJob {
  return {
    id: String(row.id),
    projectId: String(row.projectId),
    workflowKey: String(row.workflowKey) as V80WorkflowJob["workflowKey"],
    status: String(row.status) as V80WorkflowJob["status"],
    steps: (row.steps as V80WorkflowStepState[]) ?? [],
    idempotencyKey: String(row.idempotencyKey),
    createdAt: new Date(String(row.createdAt)),
    updatedAt: new Date(String(row.updatedAt ?? row.createdAt)),
  };
}

function mapBudget(row: Record<string, unknown>): V80Budget {
  return {
    id: String(row.id),
    quoteId: String(row.quoteId),
    tier: String(row.tier) as V80Budget["tier"],
    companySize: Number(row.companySize),
    totalAmount: Number(row.totalAmount),
    idempotencyKey: String(row.idempotencyKey),
    createdAt: new Date(String(row.createdAt)),
  };
}

async function withPrismaFallback<T>(fn: () => Promise<T>, fallback: () => Promise<T>) {
  if (!(await isV80PrismaAvailable())) return fallback();
  try {
    return await fn();
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2021" || err.code === "P2022")
    ) {
      prismaReady = false;
      return fallback();
    }
    throw err;
  }
}

export const prismaBackend = {
  findOrgBySlug(slug: string) {
    return withPrismaFallback(
      async () => {
        const row = await db().v80ScaffoldOrganization.findUnique({ where: { slug } });
        return row ? mapOrg(row) : null;
      },
      () => memoryBackend.findOrgBySlug(slug),
    );
  },

  getOrg(id: string) {
    return withPrismaFallback(
      async () => {
        const row = await db().v80ScaffoldOrganization.findUnique({ where: { id } });
        return row ? mapOrg(row) : null;
      },
      () => memoryBackend.getOrg(id),
    );
  },

  saveOrg(org: V80Organization) {
    return withPrismaFallback(
      async () => {
        await db().v80ScaffoldOrganization.create({
          data: {
            id: org.id,
            name: org.name,
            slug: org.slug,
            adminEmail: org.adminEmail,
            plan: org.plan,
            createdAt: org.createdAt,
          },
        });
      },
      () => memoryBackend.saveOrg(org),
    );
  },

  saveProject(project: V80Project) {
    return withPrismaFallback(
      async () => {
        await db().v80ScaffoldProject.create({
          data: {
            id: project.id,
            organizationId: project.organizationId,
            name: project.name,
            createdAt: project.createdAt,
          },
        });
      },
      () => memoryBackend.saveProject(project),
    );
  },

  getProject(id: string) {
    return withPrismaFallback(
      async () => {
        const row = await db().v80ScaffoldProject.findUnique({ where: { id } });
        return row ? mapProject(row) : null;
      },
      () => memoryBackend.getProject(id),
    );
  },

  saveTender(tender: V80Tender) {
    return withPrismaFallback(
      async () => {
        await db().v80ScaffoldTender.create({
          data: {
            id: tender.id,
            projectId: tender.projectId,
            status: tender.status,
            tenderType: tender.tenderType,
            createdAt: tender.createdAt,
          },
        });
      },
      () => memoryBackend.saveTender(tender),
    );
  },

  findTenderByProject(projectId: string) {
    return withPrismaFallback(
      async () => {
        const row = await db().v80ScaffoldTender.findFirst({ where: { projectId } });
        return row
          ? ({
              id: String(row.id),
              projectId: String(row.projectId),
              status: String(row.status),
              tenderType: String(row.tenderType ?? "enterprise-gym"),
              createdAt: new Date(String(row.createdAt)),
            } satisfies V80Tender)
          : null;
      },
      () => memoryBackend.findTenderByProject(projectId),
    );
  },

  saveQuote(quote: V80Quote) {
    return withPrismaFallback(
      async () => {
        await db().v80ScaffoldQuote.create({
          data: {
            id: quote.id,
            organizationId: quote.organizationId,
            projectId: quote.projectId,
            createdAt: quote.createdAt,
          },
        });
      },
      () => memoryBackend.saveQuote(quote),
    );
  },

  getQuote(id: string) {
    return withPrismaFallback(
      async () => {
        const row = await db().v80ScaffoldQuote.findUnique({ where: { id } });
        return row
          ? ({
              id: String(row.id),
              organizationId: String(row.organizationId),
              projectId: String(row.projectId),
              createdAt: new Date(String(row.createdAt)),
            } satisfies V80Quote)
          : null;
      },
      () => memoryBackend.getQuote(id),
    );
  },

  findQuoteByProject(projectId: string) {
    return withPrismaFallback(
      async () => {
        const row = await db().v80ScaffoldQuote.findFirst({ where: { projectId } });
        return row
          ? ({
              id: String(row.id),
              organizationId: String(row.organizationId),
              projectId: String(row.projectId),
              createdAt: new Date(String(row.createdAt)),
            } satisfies V80Quote)
          : null;
      },
      () => memoryBackend.findQuoteByProject(projectId),
    );
  },

  findBudgetByIdempotency(key: string) {
    return withPrismaFallback(
      async () => {
        const row = await db().v80ScaffoldBudget.findUnique({ where: { idempotencyKey: key } });
        return row ? mapBudget(row) : null;
      },
      () => memoryBackend.findBudgetByIdempotency(key),
    );
  },

  saveBudget(budget: V80Budget) {
    return withPrismaFallback(
      async () => {
        await db().v80ScaffoldBudget.create({
          data: {
            id: budget.id,
            quoteId: budget.quoteId,
            tier: budget.tier,
            companySize: budget.companySize,
            totalAmount: budget.totalAmount,
            idempotencyKey: budget.idempotencyKey,
            createdAt: budget.createdAt,
          },
        });
      },
      () => memoryBackend.saveBudget(budget),
    );
  },

  findBudgetForProject(projectId: string) {
    return memoryBackend.findBudgetForProject(projectId);
  },

  getBudget(id: string) {
    return withPrismaFallback(
      async () => {
        const row = await db().v80ScaffoldBudget.findUnique({ where: { id } });
        return row ? mapBudget(row) : null;
      },
      () => memoryBackend.getBudget(id),
    );
  },

  incrementUsage(organizationId: string, usageType: string) {
    return withPrismaFallback(
      async () => {
        await db().v80ScaffoldUsageRecord.upsert({
          where: { organizationId_usageType: { organizationId, usageType } },
          create: { organizationId, usageType, count: 1 },
          update: { count: { increment: 1 } },
        });
      },
      () => memoryBackend.incrementUsage(organizationId, usageType),
    );
  },

  getUsageMap(organizationId: string) {
    return withPrismaFallback(
      async () => {
        const rows = await db().v80ScaffoldUsageRecord.findMany({ where: { organizationId } });
        const out: Record<string, number> = {};
        for (const row of rows) out[String(row.usageType)] = Number(row.count);
        return out;
      },
      () => memoryBackend.getUsageMap(organizationId),
    );
  },

  findJobByIdempotency(key: string) {
    return withPrismaFallback(
      async () => {
        const row = await db().v80ScaffoldPlanJob.findUnique({ where: { idempotencyKey: key } });
        return row ? mapJob(row) : null;
      },
      () => memoryBackend.findJobByIdempotency(key),
    );
  },

  saveJob(job: V80WorkflowJob) {
    return withPrismaFallback(
      async () => {
        await db().v80ScaffoldPlanJob.upsert({
          where: { idempotencyKey: job.idempotencyKey },
          create: {
            id: job.id,
            projectId: job.projectId,
            workflowKey: job.workflowKey,
            status: job.status,
            steps: job.steps,
            idempotencyKey: job.idempotencyKey,
            updatedAt: job.updatedAt,
            createdAt: job.createdAt,
          },
          update: {
            status: job.status,
            steps: job.steps,
            updatedAt: job.updatedAt,
          },
        });
      },
      () => memoryBackend.saveJob(job),
    );
  },

  getJob(id: string) {
    return withPrismaFallback(
      async () => {
        const row = await db().v80ScaffoldPlanJob.findUnique({ where: { id } });
        return row ? mapJob(row) : null;
      },
      () => memoryBackend.getJob(id),
    );
  },

  saveArtifact(input: Omit<V80PdfArtifact, "id" | "createdAt">) {
    return withPrismaFallback(
      async () => {
        const { randomUUID } = await import("node:crypto");
        const id = randomUUID();
        await db().v80ScaffoldDocumentExport.create({
          data: {
            id,
            projectId: input.projectId,
            type: input.type,
            data: Buffer.from(input.buffer),
            createdAt: new Date(),
          },
        });
        return id;
      },
      () => memoryBackend.saveArtifact(input),
    );
  },

  getArtifact(id: string) {
    return withPrismaFallback(
      async () => {
        const row = await db().v80ScaffoldDocumentExport.findUnique({ where: { id } });
        if (!row) return null;
        const buf = row.data;
        return {
          id: String(row.id),
          projectId: String(row.projectId),
          type: String(row.type) as V80PdfArtifact["type"],
          buffer: buf instanceof Buffer ? new Uint8Array(buf) : new Uint8Array(),
          createdAt: new Date(String(row.createdAt)),
        };
      },
      () => memoryBackend.getArtifact(id),
    );
  },

  listArtifactsByProject(projectId: string) {
    return withPrismaFallback(
      async () => {
        const rows = await db().v80ScaffoldDocumentExport.findMany({ where: { projectId } });
        return rows.map((row) => ({
          id: String(row.id),
          projectId: String(row.projectId),
          type: String(row.type) as V80PdfArtifact["type"],
          buffer: row.data instanceof Buffer ? new Uint8Array(row.data) : new Uint8Array(),
          createdAt: new Date(String(row.createdAt)),
        }));
      },
      () => memoryBackend.listArtifactsByProject(projectId),
    );
  },
};
