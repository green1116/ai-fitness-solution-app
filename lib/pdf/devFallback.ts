import {
  BudgetLevel,
  DeliveryMode,
  SiteType,
} from "@prisma/client";
import type { ProjectInput } from "@/lib/domain/tender";
import { generateBudget } from "@/lib/services/tender/generateBudget";
import { generateSolution } from "@/lib/services/tender/generateSolution";

const DEV_FALLBACK_NOW = () => new Date();

/** Prisma plan route `include: { solution, placeholders }` shape (in-memory). */
export type DevProjectWithRelations = {
  id: string;
  name: string;
  description: string | null;
  clientName: string | null;
  industry: string | null;
  siteType: SiteType;
  areaM2: number | null;
  targetUsers: number | null;
  city: string | null;
  budgetLevel: BudgetLevel;
  deliveryMode: DeliveryMode;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  solution: {
    id: string;
    projectId: string;
    summary: string;
    background: string;
    requirements: unknown;
    objectives: unknown;
    zoning: unknown;
    implementationPlan: unknown;
    operationsPlan: unknown;
    riskControl: unknown;
    acceptanceCriteria: unknown;
    createdAt: Date;
    updatedAt: Date;
  };
  placeholders: [];
};

export function isDatabaseConnectivityError(error: unknown): boolean {
  if (!error) return false;

  const message =
    error instanceof Error ? error.message : String(error ?? "");
  const name = error instanceof Error ? error.name : "";
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  return (
    /Can't reach database server/i.test(message) ||
    /P1001/i.test(message) ||
    /ENOTFOUND/i.test(message) ||
    /tenant\/user/i.test(message) ||
    /PrismaClientInitializationError/i.test(name) ||
    /P1001/i.test(code) ||
    /ENOTFOUND/i.test(code)
  );
}

function projectInputFromDevRow(projectId: string): ProjectInput {
  return {
    name: `Mock-${projectId}`,
    clientName: "投标企业",
    industry: "enterprise",
    siteType: "office",
    areaM2: 120,
    targetUsers: 200,
    city: "上海市",
    budgetLevel: "mid",
    deliveryMode: "tender",
    notes: "dev: database unavailable; in-memory project fallback",
  };
}

/**
 * Development-only in-memory Project (+ Solution) when Prisma cannot reach the DB.
 * Keeps plan/budget PDF routes usable without Supabase connectivity.
 */
export function createDevProjectFallback(
  projectId: string,
): DevProjectWithRelations {
  const now = DEV_FALLBACK_NOW();
  const input = projectInputFromDevRow(projectId);
  const generated = generateSolution(input);

  return {
    id: projectId,
    name: input.name,
    description: null,
    clientName: input.clientName ?? null,
    industry: input.industry ?? null,
    siteType: input.siteType as SiteType,
    areaM2: input.areaM2 ?? null,
    targetUsers: input.targetUsers ?? null,
    city: input.city ?? null,
    budgetLevel: input.budgetLevel as BudgetLevel,
    deliveryMode: input.deliveryMode as DeliveryMode,
    notes: input.notes ?? null,
    createdAt: now,
    updatedAt: now,
    solution: {
      id: `dev-solution-${projectId}`,
      projectId,
      summary: generated.summary,
      background: generated.background,
      requirements: generated.requirements,
      objectives: generated.objectives,
      zoning: generated.zoning,
      implementationPlan: generated.implementationPlan,
      operationsPlan: generated.operationsPlan,
      riskControl: generated.riskControl,
      acceptanceCriteria: generated.acceptanceCriteria,
      createdAt: now,
      updatedAt: now,
    },
    placeholders: [],
  };
}

/** ZIP route `include` shape: project + solution + placeholders + latest budget */
export type DevZipProjectBundle = DevProjectWithRelations & {
  budgets: Array<{
    id: string;
    projectId: string;
    currency: string;
    totalEstimateMin: number;
    totalEstimateMax: number;
    items: unknown;
    assumptions: unknown;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

/** In-memory project bundle for ZIP when DB is unreachable (development only). */
export function createDevZipProjectBundle(projectId: string): DevZipProjectBundle {
  const base = createDevProjectFallback(projectId);
  const now = DEV_FALLBACK_NOW();
  const budgetData = generateBudget(projectId, []);

  return {
    ...base,
    budgets: [
      {
        id: `dev-budget-${projectId}`,
        projectId,
        currency: budgetData.currency,
        totalEstimateMin: budgetData.totalEstimateMin,
        totalEstimateMax: budgetData.totalEstimateMax,
        items: budgetData.items,
        assumptions: budgetData.assumptions,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

/** Budget route `select` subset derived from the dev project fallback. */
export function devProjectFallbackBudgetSelect(
  projectId: string,
): Pick<
  DevProjectWithRelations,
  "id" | "name" | "clientName" | "budgetLevel" | "areaM2" | "targetUsers"
> {
  const row = createDevProjectFallback(projectId);
  return {
    id: row.id,
    name: row.name,
    clientName: row.clientName,
    budgetLevel: row.budgetLevel,
    areaM2: row.areaM2,
    targetUsers: row.targetUsers,
  };
}
