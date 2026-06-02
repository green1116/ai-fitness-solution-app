import type { Prisma } from "@prisma/client";
import {
  BudgetLevel,
  DeliveryMode,
  PriceBand,
  SiteType,
} from "@prisma/client";
import type {
  BudgetRecord,
  ProductPlaceholder,
  ProjectInput,
  ProjectRecord,
  SolutionRecord,
  TenderPackage,
} from "@/lib/domain/tender";
import { prisma } from "@/lib/prisma";
import { generateBudget } from "./generateBudget";
import { generatePlaceholders } from "./generatePlaceholders";
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

function mapPriceBand(value: ProductPlaceholder["priceBand"]): PriceBand {
  return value as PriceBand;
}

/**
 * 在**单条连接**的交互式事务里顺序写入 Project / Solution / Placeholders / Budget。
 *
 * 原先对 `productPlaceholder` 使用 `Promise.all` 并发 `create`，在连接池较小或
 * 与其它请求（entitlements、ZIP 读路径）叠加时，极易触发
 * `Timed out fetching a new connection from the connection pool`。
 */
export async function generateTenderPackage(
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
      const placeholdersData = generatePlaceholders(project.id, input);
      const budgetData = generateBudget(project.id, placeholdersData);

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

      const placeholders: Awaited<
        ReturnType<typeof tx.productPlaceholder.create>
      >[] = [];
      for (const item of placeholdersData) {
        const row = await tx.productPlaceholder.create({
          data: {
            projectId: project.id,
            category: item.category,
            subCategory: item.subCategory,
            specTags: item.specTags as unknown as Prisma.JsonArray,
            quantity: item.quantity,
            priceBand: mapPriceBand(item.priceBand),
            recommendationReason: item.recommendationReason,
            replaceable: item.replaceable,
            skuId: item.skuId,
            skuName: item.skuName,
            brand: item.brand,
            model: item.model,
            imageUrl: item.imageUrl,
          },
        });
        placeholders.push(row);
      }

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

      const placeholderRecords: ProductPlaceholder[] = placeholders.map(
        (item) => ({
          id: item.id,
          projectId: item.projectId,
          category: item.category,
          subCategory: item.subCategory ?? undefined,
          specTags: item.specTags as string[],
          quantity: item.quantity,
          priceBand: item.priceBand as ProductPlaceholder["priceBand"],
          recommendationReason: item.recommendationReason,
          replaceable: item.replaceable,
          skuId: item.skuId ?? undefined,
          skuName: item.skuName ?? undefined,
          brand: item.brand ?? undefined,
          model: item.model ?? undefined,
          imageUrl: item.imageUrl ?? undefined,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }),
      );

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
        placeholders: placeholderRecords,
        budget: budgetRecord,
      };
    },
    {
      maxWait: 15_000,
      timeout: 120_000,
    },
  );
}
