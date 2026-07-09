/**
 * V80 APP P1 — System → workflow mapping (gym / budget / PDF / enterprise)
 */
import type { ProductWorkflowEntry } from "./product.compiler";

export const PRODUCT_WORKFLOW_MAP: ProductWorkflowEntry[] = [
  {
    id: "APP-WFL-001",
    kernelRef: "SYS-SIM-001",
    workflowKey: "enterprise-gym-intake",
    steps: ["tender-upload", "tender-intelligence", "knowledge-fusion"],
    domain: "gym",
    apiRoutes: ["/api/tender/intake", "/api/tender/semantic"],
    pdfOutputs: [],
    required: true,
    description: "Enterprise gym RFP intake → intelligence",
  },
  {
    id: "APP-WFL-002",
    kernelRef: "SYS-SIM-002",
    workflowKey: "fitness-plan-generation",
    steps: ["proposal-generation", "plan-pdf"],
    domain: "gym",
    apiRoutes: ["/api/v1/plan/generate", "/api/pdf"],
    pdfOutputs: ["plan-pdf"],
    required: true,
    description: "AI fitness floor plan → plan PDF",
  },
  {
    id: "APP-WFL-003",
    kernelRef: "SYS-SIM-003",
    workflowKey: "budget-composition",
    steps: ["budget-calculate", "budget-pdf"],
    domain: "budget",
    apiRoutes: ["/api/budget/calculate", "/api/pdf"],
    pdfOutputs: ["budget-pdf"],
    required: true,
    description: "Equipment budget calc → government/brand budget PDF",
  },
  {
    id: "APP-WFL-004",
    kernelRef: "SYS-SIM-005",
    workflowKey: "proposal-delivery",
    steps: ["proposal-generation", "proposal-pdf", "enterprise-zip"],
    domain: "pdf",
    apiRoutes: [
      "/api/proposal-generation/technical-proposal/run",
      "/api/proposal-pdf/render",
    ],
    pdfOutputs: ["proposal-pdf"],
    required: true,
    description: "Full proposal assembly → PDF + enterprise pack",
  },
  {
    id: "APP-WFL-005",
    kernelRef: "SYS-INT-004",
    workflowKey: "enterprise-go-live",
    steps: ["integrity-check", "launch-readiness", "commercial-go-live"],
    domain: "enterprise",
    apiRoutes: [
      "/api/production/integrity",
      "/api/launch/readiness",
      "/api/commercialization/go-live",
    ],
    pdfOutputs: ["launch-report"],
    required: true,
    description: "Integrity → launch gate → enterprise activation",
  },
  {
    id: "APP-WFL-006",
    kernelRef: "SYS-CLS-006",
    workflowKey: "tender-pack-complete",
    steps: [
      "tender-upload",
      "proposal-generation",
      "proposal-pdf",
      "plan-pdf",
      "budget-pdf",
      "enterprise-zip",
    ],
    domain: "enterprise",
    apiRoutes: ["/api/autopilot/job/run", "/api/tender-response-pack/report/run"],
    pdfOutputs: ["proposal-pdf", "plan-pdf", "budget-pdf"],
    required: true,
    description: "End-to-end tender pack — gym + budget + PDF bundle",
  },
];

export function isProductWorkflowMapComplete(): boolean {
  const domains = new Set(PRODUCT_WORKFLOW_MAP.map((w) => w.domain));
  return (
    PRODUCT_WORKFLOW_MAP.length === 6 &&
    domains.has("gym") &&
    domains.has("budget") &&
    domains.has("pdf") &&
    domains.has("enterprise") &&
    PRODUCT_WORKFLOW_MAP.every((w) => w.steps.length >= 2)
  );
}

export function getProductWorkflowByKey(key: string): ProductWorkflowEntry | undefined {
  return PRODUCT_WORKFLOW_MAP.find((w) => w.workflowKey === key);
}
