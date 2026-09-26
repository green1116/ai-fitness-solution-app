/**
 * V59 Product Engine — V58 Runtime 产品封装层
 *
 * V58 quote-lifecycle 为冻结黑盒；本层仅做产品能力映射。
 */

export type {
  CompanyInfoInput,
  QuoteProposal,
  BudgetStructure,
  TenderArtifact,
} from "./types";

export {
  applyQuoteRevisionOverrides,
  parseExplicitAreaM2FromNotes,
  hasStrengthEquipmentEmphasis,
  hasBasementNoVentilationConstraint,
} from "./quote-revision";

export {
  PRODUCT_INTELLIGENCE_VERSION,
  PRODUCT_SLOT_CATEGORIES,
  NO_CANDIDATE_MESSAGE,
  ProductSelectionInputError,
  applyProductSelections,
  buildCandidateSlots,
  buildProductIntelligenceSnapshot,
  classifyRequirements,
  listCandidatesForSlot,
  productSlotKey,
  readStoredProductIntelligence,
  readStoredProductSelections,
  resolveProductSelectionInputs,
  type ApplyProductSelectionsResult,
  type ProductCandidate,
  type ProductCandidateSlot,
  type ProductIntelligenceSnapshot,
  type ProductSelection,
  type ProductSelectionAction,
  type ProductSelectionInput,
  type RequirementStatus,
  type RequirementStatusItem,
} from "./product-intelligence";

export {
  runQuoteEngine,
  type QuoteEngineInput,
  type QuoteEngineResult,
} from "./quote.engine";

export {
  runBudgetEngine,
  type BudgetEngineInput,
  type BudgetEngineResult,
} from "./budget.engine";

export {
  runTenderEngine,
  type TenderEngineInput,
  type TenderEngineResult,
} from "./tender.engine";

export const V59_PRODUCT_ENGINE_VERSION = "v59-product-engine-1" as const;
