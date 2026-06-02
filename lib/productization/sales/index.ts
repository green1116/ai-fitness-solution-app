/**
 * V8.3 Sales Enablement Platform — sales entry
 */

export * from "./types";
export {
  buildSalesDeck,
} from "./deck";
export {
  buildROICalculator,
  DEFAULT_ROI_INPUT,
} from "./roi";
export {
  buildCaseStudyCatalog,
  getCaseStudyBySegment,
} from "./case-study";
export {
  buildProposalTemplateCatalog,
  getProposalTemplateByTier,
} from "./proposal";
export {
  buildSalesAssetCatalog,
  buildSalesEnablementResponse,
  validateSalesEnablement,
} from "./sales";
