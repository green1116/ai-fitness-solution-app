/**
 * V80 PRODUCT P1 — User journey flows (gym / tender / budget / proposal)
 */
import type { ProductJourneyFlow } from "./productization.types";

export const PRODUCT_JOURNEY_FLOWS: ProductJourneyFlow[] = [
  {
    id: "PRD-JRN-001",
    journeyKey: "enterprise-gym",
    persona: "Gym operator procurement lead",
    workflowRef: "APP-WFL-001",
    activationMetric: "first_tender_intake_completed",
    required: true,
    steps: [
      { step: 1, actor: "Admin", action: "Create operator workspace", touchpoint: "Signup / Tenant", apiRoute: "/api/v80/tenant/run", successCriteria: "organizationId + workspaceId returned" },
      { step: 2, actor: "Buyer", action: "Review plan entitlements", touchpoint: "Billing page", apiRoute: "/api/v80/entitlements", successCriteria: "tier + features visible" },
      { step: 3, actor: "Project mgr", action: "Upload gym RFP", touchpoint: "Tender intake", apiRoute: "/api/v80/tender/intake", successCriteria: "tenderId + quoteId created" },
      { step: 4, actor: "Consultant", action: "Download floor plan PDF", touchpoint: "Documents", apiRoute: "/api/v80/pdf?type=plan", pdfArtifact: "plan-pdf", successCriteria: "PDF buffer returned" },
    ],
  },
  {
    id: "PRD-JRN-002",
    journeyKey: "tender-intake",
    persona: "Equipment integrator bid manager",
    workflowRef: "APP-WFL-006",
    activationMetric: "tender_pack_workflow_completed",
    required: true,
    steps: [
      { step: 1, actor: "Bid mgr", action: "Select project workspace", touchpoint: "Project hub", successCriteria: "projectId active" },
      { step: 2, actor: "Bid mgr", action: "Submit tender documents", touchpoint: "Intake wizard", apiRoute: "/api/v80/tender/intake", successCriteria: "status=draft" },
      { step: 3, actor: "System", action: "Run tender-pack-complete", touchpoint: "Autopilot", apiRoute: "/api/v80/autopilot/job/run", successCriteria: "8 steps completed" },
      { step: 4, actor: "Bid mgr", action: "Download response bundle", touchpoint: "Pack download", apiRoute: "/api/v80/pdf?artifactId", pdfArtifact: "bundle", successCriteria: "bundle PDF available" },
    ],
  },
  {
    id: "PRD-JRN-003",
    journeyKey: "budget-planning",
    persona: "Financial planner / CFO advisor",
    workflowRef: "APP-WFL-003",
    activationMetric: "first_budget_pdf_downloaded",
    required: true,
    steps: [
      { step: 1, actor: "Planner", action: "Open quote from tender", touchpoint: "Quote detail", successCriteria: "quoteId linked to project" },
      { step: 2, actor: "Planner", action: "Enter company size + tier", touchpoint: "Budget calculator", apiRoute: "/api/v80/budget/calculate", successCriteria: "budgetId + totals" },
      { step: 3, actor: "Planner", action: "Preview budget PDF", touchpoint: "PDF preview", apiRoute: "/api/v80/pdf?type=budget", pdfArtifact: "budget-pdf", successCriteria: "brand or government PDF" },
      { step: 4, actor: "Sales", action: "Share budget with stakeholder", touchpoint: "Export / email", successCriteria: "artifact downloaded" },
    ],
  },
  {
    id: "PRD-JRN-004",
    journeyKey: "proposal-delivery",
    persona: "Proposal writer / technical sales",
    workflowRef: "APP-WFL-004",
    activationMetric: "first_proposal_pdf_rendered",
    required: true,
    steps: [
      { step: 1, actor: "Writer", action: "Define proposal sections", touchpoint: "Proposal builder UI", successCriteria: "sections[] configured" },
      { step: 2, actor: "Writer", action: "Render proposal PDF", touchpoint: "Generate", apiRoute: "/api/v80/proposal-pdf/render", pdfArtifact: "proposal-pdf", successCriteria: "artifactId + downloadUrl" },
      { step: 3, actor: "Reviewer", action: "Download & review PDF", touchpoint: "Document viewer", apiRoute: "/api/v80/pdf?artifactId", successCriteria: "PDF opens correctly" },
      { step: 4, actor: "Sales lead", action: "Submit tender response", touchpoint: "Submission portal", successCriteria: "proposal attached to pack" },
    ],
  },
];

export function isProductJourneyMapComplete(): boolean {
  const keys = new Set(PRODUCT_JOURNEY_FLOWS.map((j) => j.journeyKey));
  return (
    PRODUCT_JOURNEY_FLOWS.length === 4 &&
    keys.has("enterprise-gym") &&
    keys.has("tender-intake") &&
    keys.has("budget-planning") &&
    keys.has("proposal-delivery") &&
    PRODUCT_JOURNEY_FLOWS.every((j) => j.steps.length >= 3)
  );
}

export function getJourneyByKey(key: ProductJourneyFlow["journeyKey"]) {
  return PRODUCT_JOURNEY_FLOWS.find((j) => j.journeyKey === key);
}
