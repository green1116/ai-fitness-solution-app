/**
 * V64+ — Tender Business Loop public API
 */

export type {
  MarketplaceTemplate,
  TemplateMetrics,
  TemplateRecommendation,
  TenderBusinessLoopResult,
  TemplatePriceTier,
} from "./tender-market.types";

export { listMarketplaceTemplates, getMarketplaceTemplate } from "./marketplace/template.store";
export { listTemplateMarketplace, listTemplatesByIndustry, listFreeTemplates } from "./marketplace/template.listing";
export { rateTemplate, rankTemplatesByRevenue } from "./marketplace/template.rating";
export { recommendTemplates } from "./marketplace/template.recommender";

export { resolveTemplatePricing, recommendUpgradeTier } from "./pricing/template.pricing";
export { resolveTemplateLicense, canDownloadWithLicense } from "./pricing/template.license";

export { trackTemplateUsage, getTemplateUsageSnapshot, clearTemplateUsageStoreForTests } from "./analytics/template.usage";
export { analyzeTemplatePerformance, getTopPerformingTemplates } from "./analytics/template.performance";

export { generateTenderFromTemplate, previewTenderResult } from "./core/tender.generator";
export { evaluateTemplateUnlock, resolvePdfDownloadGate } from "./core/template.unlock";
export { runTenderBusinessLoop } from "./core/tender.business.loop";
