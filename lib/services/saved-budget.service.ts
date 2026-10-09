/**
 * C.7-F1 — Read-only access to persisted Budget snapshots.
 *
 * Every query is scoped by projectId AND the project's organizationId, so a Budget is only ever read
 * through the organization that owns its project. Nothing here writes, recalculates or re-prices.
 */
import { resolveOrganizationFeatures } from "@/lib/billing/subscription/subscription.resolver";
import { resolveExactSingleOrganizationIdForUser } from "@/lib/organization/single-org-context";
import { prisma } from "@/lib/prisma";
import { readBudgetQuoteBasis, type BudgetTier } from "@/lib/services/budget.service";

export const SAVED_BUDGET_PAGE_SIZE = 20;

const HEADCOUNT_PREFIX = "方案人数：";

const savedBudgetSelect = {
  id: true,
  projectId: true,
  currency: true,
  totalEstimateMin: true,
  totalEstimateMax: true,
  items: true,
  assumptions: true,
  createdAt: true,
} as const;

type SavedBudgetRow = {
  id: string;
  projectId: string;
  currency: string;
  totalEstimateMin: number;
  totalEstimateMax: number;
  items: unknown;
  assumptions: unknown;
  createdAt: Date;
};

export type SavedBudget = SavedBudgetRow & {
  /** Quote the Budget was calculated from, as recorded in its own assumptions (null for older rows). */
  quoteId: string | null;
  budgetTier: BudgetTier | null;
  /** Headcount recorded in the assumptions; null when absent or not a positive integer. */
  companySize: number | null;
};

export type SavedBudgetPage = {
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  budgets: SavedBudget[];
};

export type SavedBudgetProjectAccess =
  | { kind: "not-found" }
  | { kind: "locked"; organizationId: string; projectId: string; projectName: string }
  | { kind: "ok"; organizationId: string; projectId: string; projectName: string };

function readHeadcount(assumptions: unknown): number | null {
  if (!Array.isArray(assumptions)) return null;
  for (const line of assumptions) {
    if (typeof line !== "string" || !line.startsWith(HEADCOUNT_PREFIX)) continue;
    const value = Number(line.slice(HEADCOUNT_PREFIX.length).trim());
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  return null;
}

function toSavedBudget(row: SavedBudgetRow): SavedBudget {
  const basis = readBudgetQuoteBasis(row.assumptions);
  return {
    ...row,
    quoteId: basis?.quoteId ?? null,
    budgetTier: basis?.budgetTier ?? null,
    companySize: readHeadcount(row.assumptions),
  };
}

const ownedBy = (projectId: string, organizationId: string) => ({
  projectId,
  project: { organizationId },
});

const usable = (...ids: string[]) => ids.every((id) => id.trim().length > 0);

/** Viewing saved Budgets follows the Budget PDF gate: plan feature only, no generation quota consumed. */
export async function canViewSavedBudgets(organizationId: string): Promise<boolean> {
  if (!usable(organizationId)) return false;
  const features = await resolveOrganizationFeatures(organizationId);
  return features.flags.canGenerateBudget === true;
}

export async function resolveSavedBudgetProjectAccess(
  userId: string,
  projectId: string,
): Promise<SavedBudgetProjectAccess> {
  const organizationId = await resolveExactSingleOrganizationIdForUser(userId);
  if (!organizationId || !usable(projectId)) return { kind: "not-found" };
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    select: { id: true, name: true },
  });
  if (!project) return { kind: "not-found" };
  const base = { organizationId, projectId: project.id, projectName: project.name };
  return (await canViewSavedBudgets(organizationId)) ? { kind: "ok", ...base } : { kind: "locked", ...base };
}

export async function countProjectBudgets(projectId: string, organizationId: string): Promise<number> {
  if (!usable(projectId, organizationId)) return 0;
  return prisma.budget.count({ where: ownedBy(projectId, organizationId) });
}

/** Newest first; `page` is 1-based and clamped to the available pages. */
export async function listProjectBudgets(
  projectId: string,
  organizationId: string,
  page: number,
): Promise<SavedBudgetPage> {
  const pageSize = SAVED_BUDGET_PAGE_SIZE;
  const total = await countProjectBudgets(projectId, organizationId);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Number.isInteger(page) ? page : 1), pageCount);
  if (total === 0) return { total, page: current, pageCount, pageSize, budgets: [] };
  const rows = await prisma.budget.findMany({
    where: ownedBy(projectId, organizationId),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (current - 1) * pageSize,
    take: pageSize,
    select: savedBudgetSelect,
  });
  return { total, page: current, pageCount, pageSize, budgets: rows.map(toSavedBudget) };
}

export async function getProjectBudget(
  projectId: string,
  budgetId: string,
  organizationId: string,
): Promise<SavedBudget | null> {
  if (!usable(projectId, budgetId, organizationId)) return null;
  const row = await prisma.budget.findFirst({
    where: { id: budgetId, ...ownedBy(projectId, organizationId) },
    select: savedBudgetSelect,
  });
  return row ? toSavedBudget(row) : null;
}
