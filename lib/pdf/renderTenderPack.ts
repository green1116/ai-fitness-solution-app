/**
 * V4 Tender Pack — Minimal Merge + Unified Document Identity
 * plan 全量 + budget 全量 → 统一 metadata / footer / REQSIG / tenderId
 */
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument } from "pdf-lib";

import type { UserTier } from "@/lib/commercial/userTier";
import type { BudgetRecord, ProductPlaceholder, ProjectRecord, SolutionRecord } from "@/lib/domain/tender";
import { renderBudgetPdf } from "@/lib/pdf/renderBudgetPdf";
import {
  normalizePlaceholders,
  normalizeProject,
  normalizeSolution,
  type PlaceholderLike,
  type ProjectLike,
  renderPlanPdf,
  type SolutionLike,
} from "@/lib/pdf/renderPlanPdf";
import { loadChineseFont } from "@/lib/pdf/shared/chineseFont";
import {
  applyTenderDocumentMetadata,
  buildTenderDocumentContext,
  computeTenderPackReqsig,
  formatReqsigLine,
  TENDER_DOC_VERSION,
  type TenderDocumentContext,
} from "@/lib/pdf/tenderDocumentContext";
import { repaginateMergedPdf } from "@/lib/pdf/utils/repaginate";

function allPageIndices(doc: { getPageCount(): number }): number[] {
  const n = doc.getPageCount();
  return Array.from({ length: n }, (_, i) => i);
}

export type RenderTenderPackInput = {
  project: ProjectRecord;
  solution: SolutionRecord;
  placeholders: ProductPlaceholder[];
  budget: BudgetRecord;
  tier: UserTier;
  planId: string;
  companyName: string;
  companySize: number;
  budgetLevel?: "low" | "mid" | "high" | "custom";
  /** 可选：调用方已构建的统一身份 */
  tenderDocument?: TenderDocumentContext;
  /** 可选：覆盖自动计算的 pack REQSIG */
  reqsig?: string;
};

/**
 * 最小合并 + Phase 3 统一身份层。
 */
export async function renderTenderPack(input: RenderTenderPackInput): Promise<Buffer> {
  const { tier } = input;
  if (tier !== "enterprise" && tier !== "pro") {
    console.log("[PACK] tier skip merge", { tier });
    return renderPlanPdf({
      project: normalizeProject(input.project as ProjectLike | ProjectRecord),
      solution: normalizeSolution(input.solution as SolutionLike | SolutionRecord),
      placeholders: normalizePlaceholders(
        input.placeholders as PlaceholderLike[] | ProductPlaceholder[],
      ),
      tier,
    });
  }

  try {
    const projectRec = normalizeProject(input.project as ProjectLike | ProjectRecord);
    const solutionRec = normalizeSolution(input.solution as SolutionLike | SolutionRecord);
    const placeholdersRec = normalizePlaceholders(
      input.placeholders as PlaceholderLike[] | ProductPlaceholder[],
    );

    let docCtx =
      input.tenderDocument ??
      buildTenderDocumentContext({
        projectId: projectRec.id,
        planId: input.planId,
        tier,
      });

    const reqsig =
      input.reqsig?.trim() ||
      docCtx.reqsig?.trim() ||
      (await computeTenderPackReqsig(docCtx, {
        budgetLevel: input.budgetLevel,
        companyName: input.companyName,
      }));

    docCtx = { ...docCtx, reqsig };

    console.log("[PACK] tender-context", {
      tenderId: docCtx.tenderId,
      projectId: docCtx.projectId,
      planId: docCtx.planId,
      version: docCtx.version,
      reqsig,
    });

    console.log("[PACK] renderPlanPdf:start", { tier, tenderId: docCtx.tenderId });
    const planBuf = await renderPlanPdf({
      project: projectRec,
      solution: solutionRec,
      placeholders: placeholdersRec,
      tier,
      omitChrome: true,
      tenderDocument: docCtx,
    });
    console.log("[PACK] renderPlanPdf:done", { planBytes: planBuf?.length });

    console.log("[PACK] renderBudgetPdf:start", { tenderId: docCtx.tenderId });
    const budgetBuf = await renderBudgetPdf(input.budget, {
      tier,
      planId: input.planId,
      companyName: input.companyName,
      companySize: input.companySize,
      budgetLevel: input.budgetLevel,
      packMerge: true,
      tenderDocument: docCtx,
    });
    console.log("[PACK] renderBudgetPdf:done", { budgetBytes: budgetBuf?.length });

    if (!planBuf?.length) console.error("[PACK] planBuf empty or undefined");
    if (!budgetBuf?.length) console.error("[PACK] budgetBuf empty or undefined");

    const planDoc = await PDFDocument.load(planBuf);
    const budgetDoc = await PDFDocument.load(budgetBuf);

    const merged = await PDFDocument.create();
    merged.registerFontkit(fontkit);

    const planPages = await merged.copyPages(planDoc, allPageIndices(planDoc));
    planPages.forEach((p) => merged.addPage(p));

    const budgetPages = await merged.copyPages(budgetDoc, allPageIndices(budgetDoc));
    budgetPages.forEach((p) => merged.addPage(p));

    console.log("[PACK] merged pages", merged.getPageCount());

    applyTenderDocumentMetadata(merged, docCtx, reqsig, "pack");

    const font = await loadChineseFont(merged);
    repaginateMergedPdf(merged, font, {
      skipFooterPageIndexes: [0],
      footerVariant: "tender_delivery",
      footerCenterLabel: docCtx.version ?? TENDER_DOC_VERSION,
      footerSigLine: formatReqsigLine(reqsig),
      marginL: 46,
      marginR: 46,
    });

    console.log("[PACK] identity-applied", {
      tenderId: docCtx.tenderId,
      reqsig,
      pages: merged.getPageCount(),
    });

    const out = Buffer.from(await merged.save());
    console.log("[PACK] save:done", { mergedBytes: out?.length });
    return out;
  } catch (err) {
    console.error("[PACK][FATAL]", err);
    if (err instanceof Error) {
      console.error("[PACK][FATAL] message", err.message);
      console.error("[PACK][FATAL] stack", err.stack);
      const c = (err as Error & { cause?: unknown }).cause;
      if (c !== undefined) console.error("[PACK][FATAL] cause", c);
    }
    throw err;
  }
}
