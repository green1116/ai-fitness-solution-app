/**
 * V80 APP P3 — PDF render pipeline (pdf-lib: sections/pages/assets flow)
 */
import type { PdfPipelineBlueprint } from "./blueprint.types";

export const PDF_PIPELINE_BLUEPRINTS: PdfPipelineBlueprint[] = [
  {
    id: "BLP-PDF-001",
    artifactType: "plan",
    entry: "lib/pdf/tender/plan/renderPlan.ts",
    pdfLibFlow: [
      "PDFDocument.create()",
      "embedFont(StandardFonts.Helvetica)",
      "drawPage(floorPlanSvg → embedPng)",
      "save() → Uint8Array",
    ],
    sections: [
      { key: "cover", pages: 1, renderer: "drawPlanCover", assets: ["logo.png"] },
      { key: "floor-plan", pages: 1, renderer: "drawFloorLayout", assets: ["plan.svg"] },
      { key: "legend", pages: 1, renderer: "drawEquipmentLegend", assets: [] },
    ],
    output: {
      mime: "application/pdf",
      storage: "DocumentExport.url | blob",
      model: "DocumentExport type=plan",
    },
  },
  {
    id: "BLP-PDF-002",
    artifactType: "budget",
    entry: "lib/pdf/renderBudgetPdf.ts",
    pdfLibFlow: [
      "PDFDocument.create()",
      "level=brand|government → pageCount 2|4-6",
      "renderBudgetPdfBuffer(input, { level, sections })",
      "PdfDownloadLog.create on stream",
    ],
    sections: [
      { key: "header", pages: 1, renderer: "drawBudgetHeader", assets: ["logo.png"] },
      { key: "overall", pages: 1, renderer: "drawBudgetOverall", assets: [] },
      { key: "table", pages: 1, renderer: "drawBudgetTable", assets: [] },
      { key: "sign_seal", pages: 1, renderer: "drawSignSeal", assets: ["seal.png"] },
    ],
    output: {
      mime: "application/pdf",
      storage: "DocumentExport + PdfDownloadLog",
      model: "DocumentExport type=budget",
    },
  },
  {
    id: "BLP-PDF-003",
    artifactType: "proposal",
    entry: "lib/pdf/proposal/assembly/renderProposal.ts",
    pdfLibFlow: [
      "PDFDocument.create()",
      "for section in sections: addPage + drawSection",
      "merge branding header/footer",
      "save() → DocumentExport",
    ],
    sections: [
      { key: "cover", pages: 1, renderer: "drawProposalCover", assets: ["brand-logo"] },
      { key: "executive-summary", pages: 2, renderer: "drawExecutiveSummary", assets: [] },
      { key: "technical", pages: 4, renderer: "drawTechnicalProposal", assets: ["equipment-images"] },
      { key: "commercial", pages: 2, renderer: "drawCommercialTerms", assets: [] },
    ],
    output: {
      mime: "application/pdf",
      storage: "DocumentExport.url",
      model: "DocumentExport type=proposal",
    },
  },
  {
    id: "BLP-PDF-004",
    artifactType: "bundle",
    entry: "lib/tender-response-pack/mergeBundle.ts",
    pdfLibFlow: [
      "load DocumentExport[] for projectId",
      "PDFDocument.load each → copyPages into mergedDoc",
      "optional zip with enterprise-zip",
    ],
    sections: [
      { key: "proposal-pdf", pages: 0, renderer: "embedExisting", assets: [] },
      { key: "plan-pdf", pages: 0, renderer: "embedExisting", assets: [] },
      { key: "budget-pdf", pages: 0, renderer: "embedExisting", assets: [] },
    ],
    output: {
      mime: "application/zip",
      storage: "DocumentExport type=bundle",
      model: "DocumentExport type=bundle",
    },
  },
];

export function isPdfPipelineBlueprintComplete(): boolean {
  const types = new Set(PDF_PIPELINE_BLUEPRINTS.map((p) => p.artifactType));
  return (
    PDF_PIPELINE_BLUEPRINTS.length === 4 &&
    types.has("plan") &&
    types.has("budget") &&
    types.has("proposal") &&
    types.has("bundle") &&
    PDF_PIPELINE_BLUEPRINTS.every((p) => p.pdfLibFlow.length >= 3)
  );
}

export function getPdfPipelineByType(
  type: PdfPipelineBlueprint["artifactType"],
): PdfPipelineBlueprint | undefined {
  return PDF_PIPELINE_BLUEPRINTS.find((p) => p.artifactType === type);
}
