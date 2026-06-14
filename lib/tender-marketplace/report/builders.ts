import { getAllEvaluationProfiles } from "../evaluation-profile";
import { getAllOpportunityProfiles } from "../opportunity-profile";
import { getAllRequirementProfiles } from "../requirement-profile";
import { getAllTenderProfiles } from "../tender-profile";
import type { TenderMarketplaceReport } from "../shared/types";
import {
  CANONICAL_TENDER_MARKETPLACE_QUERY,
  TENDER_MARKETPLACE_VERSION,
} from "../shared/types";
import { validateTenderMarketplace } from "../validation/validators";

export function buildTenderMarketplaceReport(): TenderMarketplaceReport {
  const tenders = getAllTenderProfiles();
  const requirements = getAllRequirementProfiles();
  const evaluations = getAllEvaluationProfiles();
  const opportunities = getAllOpportunityProfiles();
  const validation = validateTenderMarketplace();

  return {
    version: TENDER_MARKETPLACE_VERSION,
    reportId: `tender-marketplace-report-${Date.now()}`,
    tenderCount: tenders.length,
    requirementCount: requirements.length,
    evaluationCount: evaluations.length,
    opportunityCount: opportunities.length,
    validation,
    summary: [
      "tender-marketplace-report",
      `tenders=${tenders.length}`,
      `requirements=${requirements.length}`,
      `evaluations=${evaluations.length}`,
      `opportunities=${opportunities.length}`,
      `valid=${validation.valid}`,
      `v20Compatible=${validation.v20CatalogCompatible}`,
      `v21Compatible=${validation.v21SupplierCompatible}`,
      `v22Compatible=${validation.v22ProcurementCompatible}`,
      `v23Compatible=${validation.v23ProposalCompatible}`,
      `v24Compatible=${validation.v24IntelligenceCompatible}`,
      `v25Compatible=${validation.v25KnowledgeCompatible}`,
      `canonical=${CANONICAL_TENDER_MARKETPLACE_QUERY.tenderId}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
