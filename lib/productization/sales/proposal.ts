import type { ProposalTemplate, ProposalTemplateCatalog } from "./types";
import { SALES_ENABLEMENT_VERSION } from "./types";

const PROPOSAL_TEMPLATES: readonly Omit<ProposalTemplate, "id">[] = [
  {
    tier: "starter",
    title: "Starter Proposal Template",
    description: "Entry-level proposal for small teams beginning AI-assisted fitness solution planning.",
    recommendedPackage: "starter",
    commercialSummary: "Custom pricing — Starter tier with plan generation, budget generation, and proposal PDF.",
    sections: [
      "Executive Summary",
      "Customer Requirements",
      "Proposed Solution — Starter",
      "Entitlements & Limits",
      "Investment Summary",
      "Next Steps",
    ],
  },
  {
    tier: "professional",
    title: "Professional Proposal Template",
    description: "Mid-tier proposal for growing organizations requiring tender workflows and priority support.",
    recommendedPackage: "professional",
    commercialSummary: "Custom pricing — Professional tier with tender package, expanded limits, and priority support.",
    sections: [
      "Executive Summary",
      "Business Context",
      "Proposed Solution — Professional",
      "Tender Package Scope",
      "Entitlements & Workspace Limits",
      "ROI Projection",
      "Commercial Terms",
      "Next Steps",
    ],
  },
  {
    tier: "enterprise",
    title: "Enterprise Proposal Template",
    description: "Enterprise proposal for large-scale deployments with unlimited scale and dedicated support.",
    recommendedPackage: "enterprise",
    commercialSummary: "Custom pricing — Enterprise tier with unlimited generation, full tender package, and dedicated support.",
    sections: [
      "Executive Summary",
      "Strategic Alignment",
      "Proposed Solution — Enterprise",
      "Governance & Compliance Alignment",
      "Full Entitlement Matrix",
      "ROI & Business Case",
      "Implementation Roadmap",
      "Commercial Terms & SLA",
      "Next Steps",
    ],
  },
];

export function buildProposalTemplateCatalog(input?: {
  deploymentId?: string;
}): ProposalTemplateCatalog {
  const deploymentId = input?.deploymentId ?? "sales-enablement-default";
  const templates: ProposalTemplate[] = PROPOSAL_TEMPLATES.map((template) => ({
    id: `proposal-template-${template.tier}`,
    ...template,
  }));

  return {
    catalogId: `proposal-template-catalog-${deploymentId}`,
    version: SALES_ENABLEMENT_VERSION,
    templates,
    summary: `proposal-template-catalog count=${templates.length} tiers=starter,professional,enterprise`,
  };
}

export function getProposalTemplateByTier(tier: ProposalTemplate["tier"]): ProposalTemplate {
  const catalog = buildProposalTemplateCatalog();
  const template = catalog.templates.find((t) => t.tier === tier);
  if (!template) {
    throw new Error(`Unknown proposal template tier: ${tier}`);
  }
  return template;
}
