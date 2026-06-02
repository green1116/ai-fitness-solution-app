import { buildSalesDeck } from "./deck";
import { buildCaseStudyCatalog } from "./case-study";
import { buildROICalculator } from "./roi";
import { buildProposalTemplateCatalog } from "./proposal";
import type { DemoEnvironment, SalesAssetCatalog, SalesEnablementResponse } from "./types";
import { SALES_ENABLEMENT_VERSION } from "./types";

const PRODUCT_NAME = "AI Fitness Solution";

function buildDemoEnvironment(input?: { deploymentId?: string }): DemoEnvironment {
  const deploymentId = input?.deploymentId ?? "sales-enablement-default";
  return {
    environmentId: `demo-environment-${deploymentId}`,
    name: "AI Fitness Solution Demo Environment",
    description: "Sandbox demo environment for sales-qualified prospects to explore plan generation and proposal export.",
    tiers: ["starter", "professional", "enterprise"],
    features: [
      "Plan generation preview",
      "Budget generation preview",
      "Proposal PDF sample export",
      "Tender package walkthrough",
    ],
    ready: true,
  };
}

export function buildSalesAssetCatalog(input?: {
  deploymentId?: string;
}): SalesAssetCatalog {
  const deploymentId = input?.deploymentId ?? "sales-enablement-default";
  const deck = buildSalesDeck({ deploymentId });
  const roiCalculator = buildROICalculator({ deploymentId });
  const caseStudyCatalog = buildCaseStudyCatalog({ deploymentId });
  const proposalCatalog = buildProposalTemplateCatalog({ deploymentId });
  const demoEnvironment = buildDemoEnvironment({ deploymentId });

  const totalAssets =
    deck.slides.length +
    caseStudyCatalog.caseStudies.length +
    proposalCatalog.templates.length +
    1 +
    1;

  return {
    catalogId: `sales-asset-catalog-${deploymentId}`,
    version: SALES_ENABLEMENT_VERSION,
    productName: PRODUCT_NAME,
    deck,
    roiCalculator,
    caseStudies: caseStudyCatalog.caseStudies,
    proposalTemplates: proposalCatalog.templates,
    demoEnvironment,
    totalAssets,
    summary: [
      `sales-asset-catalog product=${PRODUCT_NAME}`,
      `slides=${deck.slides.length}`,
      `caseStudies=${caseStudyCatalog.caseStudies.length}`,
      `templates=${proposalCatalog.templates.length}`,
      `totalAssets=${totalAssets}`,
    ].join(" "),
  };
}

export function buildSalesEnablementResponse(input?: {
  deploymentId?: string;
}): SalesEnablementResponse {
  const deploymentId = input?.deploymentId ?? "sales-enablement-default";
  const salesAssets = buildSalesAssetCatalog({ deploymentId });
  return {
    version: SALES_ENABLEMENT_VERSION,
    salesAssets,
    roiCalculator: salesAssets.roiCalculator,
    caseStudies: salesAssets.caseStudies,
    proposalTemplates: salesAssets.proposalTemplates,
    salesDeck: salesAssets.deck,
  };
}

export function validateSalesEnablement(input?: { deploymentId?: string }): {
  salesDeckExists: boolean;
  roiCalculatorExists: boolean;
  caseStudiesExist: boolean;
  proposalTemplatesExist: boolean;
  assetCatalogValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "sales-enablement-default";
  const response = buildSalesEnablementResponse({ deploymentId });
  const { salesAssets } = response;

  const salesDeckExists = salesAssets.deck.slides.length >= 6;
  const roiCalculatorExists =
    salesAssets.roiCalculator.estimatedRoi >= 0 &&
    salesAssets.roiCalculator.productivityImpact > 0 &&
    salesAssets.roiCalculator.wellnessImpact > 0;
  const caseStudiesExist =
    salesAssets.caseStudies.length === 3 &&
    salesAssets.caseStudies.every((c) => c.problem.length > 0 && c.roi > 0);
  const proposalTemplatesExist =
    salesAssets.proposalTemplates.length === 3 &&
    salesAssets.proposalTemplates.every((t) => t.commercialSummary.length > 0);
  const assetCatalogValid =
    salesAssets.totalAssets > 0 &&
    salesAssets.demoEnvironment.ready &&
    salesDeckExists &&
    roiCalculatorExists &&
    caseStudiesExist &&
    proposalTemplatesExist;

  return {
    salesDeckExists,
    roiCalculatorExists,
    caseStudiesExist,
    proposalTemplatesExist,
    assetCatalogValid,
  };
}

// Re-export engine entry points
export { buildSalesDeck } from "./deck";
export { buildROICalculator, DEFAULT_ROI_INPUT } from "./roi";
export { buildCaseStudyCatalog, getCaseStudyBySegment } from "./case-study";
export { buildProposalTemplateCatalog, getProposalTemplateByTier } from "./proposal";
