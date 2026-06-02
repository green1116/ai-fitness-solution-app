/**
 * V4 Tender Pack — Pack-Level TOC / Section Registry（整包语义）。
 * 依据 merged 后的页码数学关系 + `computePlanPackMeta` 动态推导，禁止硬编码具体页号码。
 */
import type { PackTocRow } from "@/lib/pdf/renderPlanPdf";
import { computePlanPackMeta } from "@/lib/pdf/renderPlanPdf";
import {
  budgetDonorSectionStarts1Based,
  type BudgetPdfSection,
} from "@/lib/pdf/budgetRender";
import { BUDGET_PACK_MERGE_SECTIONS } from "@/lib/pdf/renderBudgetPdf";
import type { UserTier } from "@/lib/commercial/userTier";
import type { ProductPlaceholder, ProjectRecord, SolutionRecord } from "@/lib/domain/tender";

export type PackSectionRegistryEntry = {
  id: string;
  titleZh: string;
  page1Based: number;
};

export type BuildPackTocInput = {
  project: ProjectRecord;
  solution: SolutionRecord;
  placeholders: ProductPlaceholder[];
  tier: UserTier;
  /** plan donor PDF 的总页数 P（merged 中与「Pack 前缀」占位一致；替换 Plan TOC 后正文起始页仍为原语义） */
  planPageCount: number;
  /** 合并入包的 budget donor 正文页数 B（末尾签章 donor 页已剔除） */
  donorBudgetPageCount: number;
  mergedBudgetSections?: BudgetPdfSection[];
};

function donorToMerged(planPages: number, donor1Based?: number): number {
  const base = planPages + 1;
  return donor1Based != null ? planPages + donor1Based : base;
}

/**
 * Tender Pack Section Registry：`page1Based` 均为 **最终 merged PDF** 上的起始页（1-based，含封面）。
 */
export async function buildPackSectionRegistry(
  input: BuildPackTocInput,
): Promise<PackSectionRegistryEntry[]> {
  const tier = input.tier;
  if (tier !== "enterprise" && tier !== "pro") return [];

  const { firstPageMap } = await computePlanPackMeta({
    project: input.project,
    solution: input.solution,
    placeholders: input.placeholders,
    tier,
  });

  const mergedSections =
    input.mergedBudgetSections && input.mergedBudgetSections.length > 0
      ? input.mergedBudgetSections
      : BUDGET_PACK_MERGE_SECTIONS;

  const donorStarts = budgetDonorSectionStarts1Based(mergedSections);

  const P = Math.max(1, Math.floor(input.planPageCount || 1));
  const B = Math.max(0, Math.floor(input.donorBudgetPageCount || 0));

  const budgetEstimateStart = P + 1;
  const attachmentsStart = P + B + 1;
  const signatureStart = P + B + 2;

  const pick = <K extends keyof typeof firstPageMap>(k: K, fallback: number) =>
    typeof firstPageMap[k] === "number" ? (firstPageMap[k] as number) : fallback;

  return [
    { id: "declaration", titleZh: "投标声明", page1Based: 2 },
    { id: "overview", titleZh: "项目概述", page1Based: pick("overview", 4) },
    { id: "requirements", titleZh: "需求理解", page1Based: pick("requirements", 5) },
    { id: "principles", titleZh: "方案设计原则", page1Based: pick("principles", 6) },
    { id: "zoning", titleZh: "空间规划", page1Based: pick("zoning", 7) },
    { id: "config", titleZh: "建议配置清单", page1Based: pick("config", 8) },
    { id: "implementation", titleZh: "实施计划", page1Based: pick("implementation", 9) },
    { id: "response", titleZh: "商务/技术响应", page1Based: pick("response", 10) },
    { id: "risk", titleZh: "风险与对策", page1Based: pick("risk", 11) },
    { id: "budget_estimate", titleZh: "预算测算", page1Based: budgetEstimateStart },
    {
      id: "pricing_terms",
      titleZh: "报价条款",
      page1Based: donorToMerged(P, donorStarts.pricingStart),
    },
    {
      id: "delivery_terms",
      titleZh: "交付条款",
      page1Based: donorToMerged(P, donorStarts.deliveryStart),
    },
    {
      id: "after_sales",
      titleZh: "售后与质保",
      page1Based: donorToMerged(P, donorStarts.warrantyStart),
    },
    { id: "attachments", titleZh: "附件", page1Based: attachmentsStart },
    { id: "closing_signature", titleZh: "签章页", page1Based: signatureStart },
  ];
}

export function registryToPackTocRows(registry: PackSectionRegistryEntry[]): PackTocRow[] {
  let i = 0;
  return registry.map((e) => {
    i++;
    return {
      chap: String(i).padStart(2, "0"),
      titleZh: e.titleZh,
      page1Based: e.page1Based,
    };
  });
}

/** 供 `drawPackTocPage` 使用；TOC 样式沿用 Plan 已实现版式（本模块只产出数据结构）。 */
export async function buildPackToc(input: BuildPackTocInput): Promise<PackTocRow[]> {
  const registry = await buildPackSectionRegistry(input);
  return registryToPackTocRows(registry);
}

export async function buildPackSectionRegistryAndToc(input: BuildPackTocInput): Promise<{
  registry: PackSectionRegistryEntry[];
  tocRows: PackTocRow[];
}> {
  const registry = await buildPackSectionRegistry(input);
  return { registry, tocRows: registryToPackTocRows(registry) };
}
