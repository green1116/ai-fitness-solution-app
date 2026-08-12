/**
 * EPI — Product intelligence public exports
 */

export {
  EPI_WP1_ID,
  PRODUCT_INTELLIGENCE_VIEW_CAPABILITY,
  PRODUCT_INTELLIGENCE_VIEW_VERSION,
  ENTERPRISE_SAAS_OPERATIONS_SURFACE_V1,
  buildProductIntelligenceView,
  getProductIntelligenceView,
  productIntelligenceViewFingerprint,
  clearProductIntelligenceView,
  type ProductIntelligenceView,
} from "./product-intelligence-view";

export {
  EPI_WP3_ID,
  PRODUCT_INTELLIGENCE_EXPOSURE_ENDPOINT,
  PRODUCT_INTELLIGENCE_EXPOSURE_METHOD,
  buildProductIntelligenceExposure,
  getProductIntelligenceExposure,
  clearProductIntelligenceExposure,
  type ProductIntelligenceExposure,
} from "./exposure";

export {
  EPI_WP4_ID,
  PRODUCT_INTELLIGENCE_ADOPTION_PRODUCTS,
  buildProductIntelligenceAdoption,
  getProductIntelligenceAdoption,
  clearProductIntelligenceAdoption,
  type ProductIntelligenceAdoptionProduct,
  type ProductIntelligenceAdoption,
} from "./adoption";

export {
  EPI_WP5_ID,
  buildProductIntelligenceFeedback,
  getProductIntelligenceFeedback,
  clearProductIntelligenceFeedback,
  type ProductIntelligenceFeedback,
} from "./feedback";

export {
  EPI_FREEZE_ID,
  EPI_FREEZE_VERSION,
  EPI_FREEZE_DATE,
  EPI_WP2_ID,
  ENTERPRISE_SAAS_PRODUCT_INTELLIGENCE_V1,
  EPI_COMPONENTS,
  buildEpiFreeze,
  getEpiFreeze,
  clearEpiFreeze,
  type EpiFreeze,
} from "./epi-freeze-manifest";
