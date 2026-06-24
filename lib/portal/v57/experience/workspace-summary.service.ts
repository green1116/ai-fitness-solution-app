/**
 * V57 P3 — Workspace summary aggregation (read-only, Portal layer)
 */

import { prisma } from "@/lib/prisma";
import { getOrganizationById } from "@/lib/organization/organization.service";
import { listProjects } from "@/lib/services/project.service";
import { getOnboardingProfile } from "../onboarding.store";

export type WorkspaceSummaryQuote = {
  id: string;
  projectId: string;
  status: string;
  createdAt: string;
};

export type WorkspaceSummaryProject = {
  id: string;
  name: string;
  clientName: string | null;
  quoteCount: number;
  createdAt: string;
};

export type WorkspaceSummary = {
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
  currentProject: {
    id: string;
    name: string;
  } | null;
  projectsCount: number;
  quotesCount: number;
  reportsCount: number;
  recentProjects: WorkspaceSummaryProject[];
  recentQuotes: WorkspaceSummaryQuote[];
};

export async function getWorkspaceSummary(
  organizationId: string,
  userId?: string,
): Promise<WorkspaceSummary> {
  const org = await getOrganizationById(organizationId);
  const recentProjectsRaw = await listProjects({ organizationId, take: 5 });

  const recentQuotesRaw = await prisma.quote.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, projectId: true, status: true, createdAt: true },
  });

  const [projectsCount, quotesCount, reportsCount] = await Promise.all([
    prisma.project.count({ where: { organizationId } }),
    prisma.quote.count({ where: { organizationId } }),
    prisma.tender.count({ where: { project: { organizationId } } }),
  ]);

  const profile = userId ? getOnboardingProfile(userId) : undefined;
  let currentProject: WorkspaceSummary["currentProject"] = null;
  if (profile?.projectId) {
    const p = await prisma.project.findFirst({
      where: { id: profile.projectId, organizationId },
      select: { id: true, name: true },
    });
    if (p) currentProject = p;
  }
  if (!currentProject && recentProjectsRaw[0]) {
    currentProject = { id: recentProjectsRaw[0].id, name: recentProjectsRaw[0].name };
  }

  return {
    organization: org
      ? { id: org.id, name: org.name, slug: org.slug }
      : null,
    currentProject,
    projectsCount,
    quotesCount,
    reportsCount,
    recentProjects: recentProjectsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      quoteCount: p.quoteCount,
      createdAt: p.createdAt.toISOString(),
    })),
    recentQuotes: recentQuotesRaw.map((q) => ({
      id: q.id,
      projectId: q.projectId,
      status: q.status,
      createdAt: q.createdAt.toISOString(),
    })),
  };
}
