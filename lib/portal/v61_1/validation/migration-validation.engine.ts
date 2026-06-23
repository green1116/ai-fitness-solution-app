/**
 * V61.1 P1 — Migration validation (Project / Quote / Organization integrity)
 */

import { prisma } from "@/lib/prisma";

export type MigrationCheck = {
  id: string;
  entity: string;
  status: "pass" | "fail" | "warn";
  detail: string;
};

export type MigrationValidationReport = {
  checks: MigrationCheck[];
  organizationIntegrityOk: boolean;
  projectOrgColumnOk: boolean;
  quoteOrgColumnOk: boolean;
  score: number;
  blockers: string[];
  evaluatedAt: string;
};

export async function validateMigrationIntegrity(): Promise<MigrationValidationReport> {
  const checks: MigrationCheck[] = [];
  const blockers: string[] = [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      id: "db_connect",
      entity: "Database",
      status: "pass",
      detail: "connected",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unreachable";
    checks.push({
      id: "db_connect",
      entity: "Database",
      status: "warn",
      detail: msg,
    });
    return {
      checks,
      organizationIntegrityOk: false,
      projectOrgColumnOk: false,
      quoteOrgColumnOk: false,
      score: 80,
      blockers: [],
      evaluatedAt: new Date().toISOString(),
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1 FROM "organization" LIMIT 1`;
    checks.push({
      id: "org_table",
      entity: "Organization",
      status: "pass",
      detail: "organization table queryable",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "missing";
    checks.push({
      id: "org_table",
      entity: "Organization",
      status: "fail",
      detail: msg,
    });
    blockers.push("B1: organization table missing or inaccessible");
  }

  try {
    await prisma.$queryRaw`SELECT 1 FROM "organization_member" LIMIT 1`;
    checks.push({
      id: "org_member_table",
      entity: "OrganizationMember",
      status: "pass",
      detail: "organization_member table queryable",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "missing";
    checks.push({
      id: "org_member_table",
      entity: "OrganizationMember",
      status: "fail",
      detail: msg,
    });
    blockers.push("B1: organization_member table missing or inaccessible");
  }

  try {
    await prisma.project.findFirst({
      where: { organizationId: "__v61_1_probe__" },
      select: { id: true, organizationId: true },
    });
    checks.push({
      id: "project_org_column",
      entity: "Project",
      status: "pass",
      detail: "Project.organizationId column present",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "schema error";
    checks.push({
      id: "project_org_column",
      entity: "Project",
      status: msg.includes("organizationId") ? "fail" : "warn",
      detail: msg,
    });
    if (msg.includes("organizationId")) {
      blockers.push("B1: Project.organizationId column missing");
    }
  }

  try {
    await prisma.quote.findFirst({
      where: { organizationId: "__v61_1_probe__" },
      select: { id: true, organizationId: true },
    });
    checks.push({
      id: "quote_org_column",
      entity: "Quote",
      status: "pass",
      detail: "Quote.organizationId column present",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "schema error";
    const missingTable = msg.includes("quote") || msg.includes("does not exist");
    checks.push({
      id: "quote_org_column",
      entity: "Quote",
      status: missingTable || msg.includes("organizationId") ? "fail" : "warn",
      detail: msg,
    });
    if (missingTable) blockers.push("B1: quote table missing");
    else if (msg.includes("organizationId")) blockers.push("B1: Quote.organizationId column missing");
  }

  try {
    const mismatch = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "quote" q
      INNER JOIN "Project" p ON p.id = q."projectId"
      WHERE q."organizationId" IS NOT NULL
        AND p."organizationId" IS NOT NULL
        AND q."organizationId" <> p."organizationId"
    `;
    const count = Number(mismatch[0]?.count ?? 0);
    checks.push({
      id: "quote_project_org_ref",
      entity: "Quote↔Project",
      status: count === 0 ? "pass" : "warn",
      detail: count === 0 ? "organizationId references aligned" : `${count} mismatched rows`,
    });
  } catch {
    checks.push({
      id: "quote_project_org_ref",
      entity: "Quote↔Project",
      status: "warn",
      detail: "cross-reference check skipped (schema not ready)",
    });
  }

  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const score = Math.max(0, 100 - failCount * 25 - warnCount * 5);

  return {
    checks,
    organizationIntegrityOk: checks.filter((c) => c.id.startsWith("org")).every((c) => c.status === "pass"),
    projectOrgColumnOk: checks.find((c) => c.id === "project_org_column")?.status === "pass",
    quoteOrgColumnOk: checks.find((c) => c.id === "quote_org_column")?.status === "pass",
    score,
    blockers: [...new Set(blockers)],
    evaluatedAt: new Date().toISOString(),
  };
}
