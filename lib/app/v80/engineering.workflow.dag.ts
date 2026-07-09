/**
 * V80 APP P2 — Workflow DAG (enterprise-gym → budget → proposal → PDF pipeline)
 */
import { PRODUCT_WORKFLOW_MAP } from "./product.workflow.map";
import type { WorkflowDagSpec } from "./engineering.types";

export const TENDER_PACK_WORKFLOW_DAG: WorkflowDagSpec = {
  id: "ENG-DAG-001",
  workflowRef: "APP-WFL-006",
  dagKey: "tender-pack-complete",
  nodes: [
    {
      id: "ENG-NOD-001",
      stepKey: "tender-upload",
      apiRoute: "/api/tender/intake",
      prismaWrite: ["Tender", "Project"],
      required: true,
    },
    {
      id: "ENG-NOD-002",
      stepKey: "tender-intelligence",
      apiRoute: "/api/tender/semantic",
      prismaWrite: ["Tender"],
      required: true,
    },
    {
      id: "ENG-NOD-003",
      stepKey: "proposal-generation",
      apiRoute: "/api/proposal-generation/technical-proposal/run",
      prismaWrite: ["Solution", "Quote"],
      required: true,
    },
    {
      id: "ENG-NOD-004",
      stepKey: "budget-calculate",
      apiRoute: "/api/budget/calculate",
      prismaWrite: ["Budget"],
      required: true,
    },
    {
      id: "ENG-NOD-005",
      stepKey: "plan-pdf",
      apiRoute: "/api/pdf?type=plan",
      pdfStage: "lib/pdf/tender/plan",
      prismaWrite: ["DocumentExport"],
      required: true,
    },
    {
      id: "ENG-NOD-006",
      stepKey: "budget-pdf",
      apiRoute: "/api/pdf?type=budget",
      pdfStage: "lib/pdf/renderBudgetPdf.ts",
      prismaWrite: ["DocumentExport", "PdfDownloadLog"],
      required: true,
    },
    {
      id: "ENG-NOD-007",
      stepKey: "proposal-pdf",
      apiRoute: "/api/proposal-pdf/render",
      pdfStage: "lib/pdf/proposal/assembly",
      prismaWrite: ["DocumentExport"],
      required: true,
    },
    {
      id: "ENG-NOD-008",
      stepKey: "enterprise-zip",
      apiRoute: "/api/tender-response-pack/report/run",
      pdfStage: "merge-pdf-bundle",
      prismaWrite: ["DocumentExport"],
      required: true,
    },
  ],
  edges: [
    { id: "ENG-EDG-001", fromNode: "ENG-NOD-001", toNode: "ENG-NOD-002", condition: "tender.created" },
    { id: "ENG-EDG-002", fromNode: "ENG-NOD-002", toNode: "ENG-NOD-003", condition: "intelligence.ready" },
    { id: "ENG-EDG-003", fromNode: "ENG-NOD-003", toNode: "ENG-NOD-004", condition: "quote.generated" },
    { id: "ENG-EDG-004", fromNode: "ENG-NOD-004", toNode: "ENG-NOD-005", condition: "budget.calculated" },
    { id: "ENG-EDG-005", fromNode: "ENG-NOD-005", toNode: "ENG-NOD-006", condition: "plan-pdf.ready" },
    { id: "ENG-EDG-006", fromNode: "ENG-NOD-006", toNode: "ENG-NOD-007", condition: "budget-pdf.ready" },
    { id: "ENG-EDG-007", fromNode: "ENG-NOD-007", toNode: "ENG-NOD-008", condition: "proposal-pdf.ready" },
  ],
  pdfPipeline: [
    "plan-pdf → lib/pdf/tender/plan (pdf-lib)",
    "budget-pdf → lib/pdf/renderBudgetPdf.ts (pdf-lib)",
    "proposal-pdf → lib/pdf/proposal/assembly (pdf-lib)",
    "enterprise-zip → merge DocumentExport[] → zip",
  ],
  required: true,
  description: "End-to-end DAG: gym intake → budget → proposal → PDF bundle",
};

export function isEngineeringWorkflowDagComplete(): boolean {
  const workflow = PRODUCT_WORKFLOW_MAP.find((w) => w.id === "APP-WFL-006");
  if (!workflow) return false;

  const nodeSteps = new Set(TENDER_PACK_WORKFLOW_DAG.nodes.map((n) => n.stepKey));
  const stepsCovered = workflow.steps.every((s) => nodeSteps.has(s) || s === "proposal-generation");

  return (
    TENDER_PACK_WORKFLOW_DAG.nodes.length === 8 &&
    TENDER_PACK_WORKFLOW_DAG.edges.length === 7 &&
    TENDER_PACK_WORKFLOW_DAG.pdfPipeline.length === 4 &&
    stepsCovered
  );
}

export function getWorkflowDagNodeByStep(stepKey: string) {
  return TENDER_PACK_WORKFLOW_DAG.nodes.find((n) => n.stepKey === stepKey);
}
