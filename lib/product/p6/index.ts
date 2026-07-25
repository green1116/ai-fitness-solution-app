/**
 * Product P6 — Budget & ROI public exports
 * Isolated namespace: lib/product/p6
 */

export {
  BUDGET_STATUSES,
  COST_MODEL_KINDS,
  INVESTMENT_CATEGORIES,
  P6_MANAGER_STATUSES,
  P6_READINESS_VERDICTS,
  PRICING_MODELS,
  PRODUCT_P6_BUDGET_FREEZE_VERSION,
  PRODUCT_P6_BUDGET_ROI_BASE,
  PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION,
  PRODUCT_P6_BUDGET_ROI_ID,
  PRODUCT_P6_BUDGET_ROI_VERSION,
  ROI_STATUSES,
  SCENARIO_KINDS,
} from "./budget/budget.constants";

export type {
  BudgetMetadata,
  BudgetPlan,
  BudgetStatus,
  CreateBudgetInput,
  P6ManagerStatus,
  P6ReadinessCheck,
  P6ReadinessResult,
  P6ReadinessVerdict,
  P6RegistryManifest,
  UpdateBudgetStatusInput,
} from "./budget/budget.types";

export {
  clearBudgets,
  createBudget,
  getBudget,
  listBudgets,
  updateBudgetStatus,
} from "./budget/budget.registry";

export type {
  CostModel,
  CostModelKind,
  CostModelMetadata,
  CreateCostModelInput,
} from "./cost-model/cost-model.types";

export {
  clearCostModels,
  createCostModel,
  getCostModel,
  listCostModels,
} from "./cost-model/cost-model.registry";

export type {
  CreateInvestmentInput,
  Investment,
  InvestmentCategory,
  InvestmentMetadata,
} from "./investment/investment.types";

export {
  clearInvestments,
  createInvestment,
  getInvestment,
  listInvestments,
} from "./investment/investment.registry";

export type {
  CalculateRoiInput,
  RoiMetadata,
  RoiProjection,
  RoiStatus,
  UpdateRoiStatusInput,
} from "./roi/roi.types";

export {
  calculateRoi,
  clearRois,
  getRoi,
  listRois,
  updateRoiStatus,
} from "./roi/roi.registry";

export type {
  CreateFinancialSummaryInput,
  FinancialSummary,
  FinancialSummaryMetadata,
} from "./financial-summary/summary.types";

export {
  clearFinancialSummaries,
  createFinancialSummary,
  getFinancialSummary,
  listFinancialSummaries,
} from "./financial-summary/summary.registry";

export type {
  BudgetScenario,
  CreateScenarioInput,
  ScenarioKind,
  ScenarioMetadata,
} from "./scenario/scenario.types";

export {
  clearScenarios,
  createScenario,
  getScenario,
  listScenarios,
} from "./scenario/scenario.registry";

export type {
  CreatePricingInput,
  PricingMetadata,
  PricingModel,
  PricingPlan,
} from "./pricing/pricing.types";

export {
  clearPricing,
  createPricing,
  getPricing,
  listPricing,
} from "./pricing/pricing.registry";

export {
  assertP6BudgetRoiReadinessReady,
  evaluateP6BudgetRoiReadiness,
} from "./budget/budget.readiness";

export {
  clearP6BudgetRoiLayer,
  createP6BudgetRoiManager,
  getP6RegistryManifest,
  type P6BudgetRoiManager,
  type P6BudgetRoiManagerSnapshot,
} from "./budget.manager";

export {
  assertProductP6ReleaseGatePass,
  checkProductP6ReleaseGate,
  PRODUCT_P6_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
