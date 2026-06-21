/**
 * V59 — Project Service
 */

import { BudgetLevel, DeliveryMode, SiteType, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type CreateProjectInput = {
  name: string;
  clientName?: string;
  industry?: string;
  siteType?: SiteType;
  areaM2?: number;
  targetUsers?: number;
  city?: string;
  budgetLevel?: BudgetLevel;
  deliveryMode?: DeliveryMode;
  notes?: string;
  organizationId?: string;
};

export type ProjectListItem = {
  id: string;
  name: string;
  clientName: string | null;
  city: string | null;
  createdAt: Date;
  quoteCount: number;
  tenderCount: number;
};

export async function createProject(input: CreateProjectInput) {
  return prisma.project.create({
    data: {
      name: input.name,
      clientName: input.clientName,
      industry: input.industry,
      siteType: input.siteType ?? SiteType.office,
      areaM2: input.areaM2,
      targetUsers: input.targetUsers,
      city: input.city,
      budgetLevel: input.budgetLevel ?? BudgetLevel.mid,
      deliveryMode: input.deliveryMode ?? DeliveryMode.standard,
      notes: input.notes,
      organizationId: input.organizationId,
    },
  });
}

export async function listProjects(params: {
  organizationId: string;
  take?: number;
}): Promise<ProjectListItem[]> {
  const where: Prisma.ProjectWhereInput = { organizationId: params.organizationId };

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: params.take ?? 50,
    include: {
      _count: { select: { quotes: true, tenders: true } },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName,
    city: p.city,
    createdAt: p.createdAt,
    quoteCount: p._count.quotes,
    tenderCount: p._count.tenders,
  }));
}

export async function getProjectById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      quotes: { orderBy: { createdAt: "desc" }, take: 5 },
      budgets: { orderBy: { createdAt: "desc" }, take: 1 },
      tenders: { orderBy: { createdAt: "desc" }, take: 5 },
      solution: true,
    },
  });
}
