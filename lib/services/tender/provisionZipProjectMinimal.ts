import type { Prisma } from "@prisma/client";
import {
  BudgetLevel,
  DeliveryMode,
  SiteType,
} from "@prisma/client";
import type {
  BudgetRecord,
  ProjectInput,
  ProjectRecord,
  SolutionRecord,
  TenderPackage,
} from "@/lib/domain/tender";
import { prisma } from "@/lib/prisma";
import { generateBudget } from "./generateBudget";
import { generateSolution } from "./generateSolution";

function mapBudgetLevel(value: ProjectInput["budgetLevel"]): BudgetLevel {
  return value as BudgetLevel;
}

function mapDeliveryMode(value: ProjectInput["deliveryMode"]): DeliveryMode {
  return value as DeliveryMode;
}

function mapSiteType(value: ProjectInput["siteType"]): SiteType {
  return value as SiteType;
}

/**
 * 为 ZIP 打包「热补」一条最小可渲染的 Project/Solution/Budget（**不写 ProductPlaceholder**）。
 *
 * 相比 `generateTenderPackage`，避免 N 次 `productPlaceholder.create` 占用连接池；
 * `renderPlanPdf` 在占位为空时仍会用占位文案渲染「建议配置清单」章节。
 */
export async function provisionZipProjectMinimal(
  input: ProjectInput,
): Promise<TenderPackage> {
  return prisma.$transaction(
    async (tx) => {
      const project = await tx.project.create({
        data: {
          name: input.name,
          clientName: input.clientName,
          industry: input.industry,
          siteType: mapSiteType(input.siteType),
          areaM2: input.areaM2,
          targetUsers: input.targetUsers,
          city: input.city,
          budgetLevel: mapBudgetLevel(input.budgetLevel),
          deliveryMode: mapDeliveryMode(input.deliveryMode),
          notes: input.notes,
        },
      });

      const solutionData = generateSolution(input);
      const budgetData = generateBudget(project.id, []);

      const solution = await tx.solution.create({
        data: {
          projectId: project.id,
          summary: solutionData.summary,
          background: solutionData.background,
          requirements: solutionData.requirements as unknown as Prisma.JsonArray,
          objectives: solutionData.objectives as unknown as Prisma.JsonArray,
          zoning: solutionData.zoning as unknown as Prisma.JsonArray,
          implementationPlan:
            solutionData.implementationPlan as unknown as Prisma.JsonArray,
          operationsPlan: solutionData.operationsPlan as unknown as Prisma.JsonArray,
          riskControl: solutionData.riskControl as unknown as Prisma.JsonArray,
          acceptanceCriteria:
            solutionData.acceptanceCriteria as unknown as Prisma.JsonArray,
        },
      });

      const budget = await tx.budget.create({
        data: {
          projectId: project.id,
          currency: budgetData.currency,
          totalEstimateMin: budgetData.totalEstimateMin,
          totalEstimateMax: budgetData.totalEstimateMax,
          items: budgetData.items as unknown as Prisma.JsonArray,
          assumptions: budgetData.assumptions as unknown as Prisma.JsonArray,
        },
      });

      const projectRecord: ProjectRecord = {
        id: project.id,
        input,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      };

      const solutionRecord: SolutionRecord = {
        id: solution.id,
        projectId: solution.projectId,
        summary: solution.summary,
        background: solution.background,
        requirements: solution.requirements as string[],
        objectives: solution.objectives as string[],
        zoning: solution.zoning as unknown as SolutionRecord["zoning"],
        implementationPlan:
          solution.implementationPlan as unknown as SolutionRecord["implementationPlan"],
        operationsPlan: solution.operationsPlan as string[],
        riskControl: solution.riskControl as string[],
        acceptanceCriteria: solution.acceptanceCriteria as string[],
        createdAt: solution.createdAt.toISOString(),
        updatedAt: solution.updatedAt.toISOString(),
      };

      const budgetRecord: BudgetRecord = {
        id: budget.id,
        projectId: budget.projectId,
        currency: budget.currency as BudgetRecord["currency"],
        totalEstimateMin: budget.totalEstimateMin,
        totalEstimateMax: budget.totalEstimateMax,
        items: budget.items as unknown as BudgetRecord["items"],
        assumptions: budget.assumptions as string[],
        createdAt: budget.createdAt.toISOString(),
        updatedAt: budget.updatedAt.toISOString(),
      };

      return {
        project: projectRecord,
        solution: solutionRecord,
        placeholders: [],
        budget: budgetRecord,
      };
    },
    {
      maxWait: 15_000,
      timeout: 60_000,
    },
  );
}
