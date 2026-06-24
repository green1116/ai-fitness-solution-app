/**
 * V60 P4 — Data integrity verification
 */

import { prisma } from "@/lib/prisma";

export type IntegrityIssue = {
  code: string;
  entity: string;
  count: number;
  severity: "critical" | "warning" | "info";
  description: string;
};

export type IntegrityReport = {
  issues: IntegrityIssue[];
  score: number;
  checkedAt: string;
};

export async function runIntegrityCheck(organizationId?: string): Promise<IntegrityReport> {
  const issues: IntegrityIssue[] = [];

  try {
    const quoteWhere = organizationId ? { organizationId } : {};
    const quotes = await prisma.quote.findMany({
      where: quoteWhere,
      select: { id: true, projectId: true, organizationId: true, status: true },
      take: 500,
    });

    const projectIds = [...new Set(quotes.map((q) => q.projectId))];
    const projects =
      projectIds.length > 0
        ? await prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, organizationId: true },
          })
        : [];
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    let orphanQuotes = 0;
    let orgMismatch = 0;
    for (const q of quotes) {
      const project = projectMap.get(q.projectId);
      if (!project) orphanQuotes++;
      else if (
        organizationId &&
        q.organizationId &&
        project.organizationId &&
        q.organizationId !== project.organizationId
      ) {
        orgMismatch++;
      }
    }

    if (orphanQuotes > 0) {
      issues.push({
        code: "orphan_quotes",
        entity: "Quote",
        count: orphanQuotes,
        severity: "critical",
        description: "Quotes referencing missing projects",
      });
    }
    if (orgMismatch > 0) {
      issues.push({
        code: "quote_project_org_mismatch",
        entity: "Quote",
        count: orgMismatch,
        severity: "warning",
        description: "Quote organizationId does not match project organization",
      });
    }

    const invalidStatus = quotes.filter(
      (q) => !["DRAFT", "GENERATING", "READY", "FAILED"].includes(q.status),
    ).length;
    if (invalidStatus > 0) {
      issues.push({
        code: "invalid_quote_status",
        entity: "Quote",
        count: invalidStatus,
        severity: "warning",
        description: "Quotes with unexpected status values",
      });
    }

    const tenders = await prisma.tender.findMany({
      where: projectIds.length ? { projectId: { in: projectIds } } : undefined,
      select: { id: true, projectId: true, quoteId: true },
      take: 500,
    });
    const quoteIds = new Set(quotes.map((q) => q.id));
    const danglingTenders = tenders.filter((t) => t.quoteId && !quoteIds.has(t.quoteId)).length;
    if (danglingTenders > 0) {
      issues.push({
        code: "tender_quote_ref",
        entity: "Tender",
        count: danglingTenders,
        severity: "info",
        description: "Tenders with quoteId not in sampled quote set",
      });
    }
  } catch {
    issues.push({
      code: "integrity_check_degraded",
      entity: "System",
      count: 1,
      severity: "warning",
      description: "Database integrity check degraded — schema/env mismatch",
    });
  }

  const penalty = issues.reduce(
    (n, i) => n + (i.severity === "critical" ? 20 : i.severity === "warning" ? 8 : 2),
    0,
  );
  const score = Math.max(0, Math.min(100, 100 - penalty));

  return { issues, score, checkedAt: new Date().toISOString() };
}
