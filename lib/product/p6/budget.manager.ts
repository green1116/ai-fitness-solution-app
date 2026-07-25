/**
 * Product P6 — Budget & ROI Manager
 */

import {
  clearCostModels,
  createCostModel,
  getCostModel,
  listCostModels,
} from "./cost-model/cost-model.registry";
import type {
  CostModel,
  CreateCostModelInput,
} from "./cost-model/cost-model.types";
import {
  clearFinancialSummaries,
  createFinancialSummary,
  getFinancialSummary,
  listFinancialSummaries,
} from "./financial-summary/summary.registry";
import type {
  CreateFinancialSummaryInput,
  FinancialSummary,
} from "./financial-summary/summary.types";
import {
  clearInvestments,
  createInvestment,
  getInvestment,
  listInvestments,
} from "./investment/investment.registry";
import type {
  CreateInvestmentInput,
  Investment,
} from "./investment/investment.types";
import {
  clearPricing,
  createPricing,
  getPricing,
  listPricing,
} from "./pricing/pricing.registry";
import type {
  CreatePricingInput,
  PricingPlan,
} from "./pricing/pricing.types";
import {
  calculateRoi,
  clearRois,
  getRoi,
  listRois,
  updateRoiStatus,
} from "./roi/roi.registry";
import type {
  CalculateRoiInput,
  RoiProjection,
  UpdateRoiStatusInput,
} from "./roi/roi.types";
import {
  clearScenarios,
  createScenario,
  getScenario,
  listScenarios,
} from "./scenario/scenario.registry";
import type {
  BudgetScenario,
  CreateScenarioInput,
} from "./scenario/scenario.types";
import {
  PRODUCT_P6_BUDGET_ROI_BASE,
  PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION,
  PRODUCT_P6_BUDGET_ROI_ID,
  PRODUCT_P6_BUDGET_ROI_VERSION,
} from "./budget/budget.constants";
import {
  assertP6BudgetRoiReadinessReady,
  evaluateP6BudgetRoiReadiness,
} from "./budget/budget.readiness";
import {
  clearBudgets,
  createBudget,
  getBudget,
  listBudgets,
  updateBudgetStatus,
} from "./budget/budget.registry";
import type {
  BudgetPlan,
  CreateBudgetInput,
  P6ManagerStatus,
  P6ReadinessResult,
  P6RegistryManifest,
  UpdateBudgetStatusInput,
} from "./budget/budget.types";

export type P6BudgetRoiManagerSnapshot = {
  managerId: string;
  status: P6ManagerStatus;
  layerId: typeof PRODUCT_P6_BUDGET_ROI_ID;
  version: typeof PRODUCT_P6_BUDGET_ROI_VERSION;
  budgetCount: number;
  costModelCount: number;
  investmentCount: number;
  roiCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P6BudgetRoiManager = {
  initialize: () => P6BudgetRoiManagerSnapshot;
  start: () => P6BudgetRoiManagerSnapshot;
  stop: () => P6BudgetRoiManagerSnapshot;
  status: () => P6BudgetRoiManagerSnapshot;
  createBudget: (input: CreateBudgetInput) => BudgetPlan;
  updateBudgetStatus: (input: UpdateBudgetStatusInput) => BudgetPlan;
  createCostModel: (input: CreateCostModelInput) => CostModel;
  createInvestment: (input: CreateInvestmentInput) => Investment;
  calculateRoi: (input: CalculateRoiInput) => RoiProjection;
  updateRoiStatus: (input: UpdateRoiStatusInput) => RoiProjection;
  createFinancialSummary: (
    input: CreateFinancialSummaryInput,
  ) => FinancialSummary;
  createScenario: (input: CreateScenarioInput) => BudgetScenario;
  createPricing: (input: CreatePricingInput) => PricingPlan;
  evaluateReadiness: () => P6ReadinessResult;
  manifest: () => P6RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP6RegistryManifest(): P6RegistryManifest {
  return {
    foundationId: PRODUCT_P6_BUDGET_ROI_ID,
    version: PRODUCT_P6_BUDGET_ROI_VERSION,
    freezeVersion: PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION,
    base: PRODUCT_P6_BUDGET_ROI_BASE,
    budgetCount: listBudgets().length,
    costModelCount: listCostModels().length,
    investmentCount: listInvestments().length,
    roiCount: listRois().length,
    financialSummaryCount: listFinancialSummaries().length,
    scenarioCount: listScenarios().length,
    pricingCount: listPricing().length,
  };
}

export function clearP6BudgetRoiLayer(): void {
  clearPricing();
  clearScenarios();
  clearFinancialSummaries();
  clearRois();
  clearInvestments();
  clearCostModels();
  clearBudgets();
}

export function createP6BudgetRoiManager(options?: {
  managerId?: string;
}): P6BudgetRoiManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p6-bdg-mgr");
  let state: P6ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P6BudgetRoiManagerSnapshot {
    const reg = getP6RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P6_BUDGET_ROI_ID,
      version: PRODUCT_P6_BUDGET_ROI_VERSION,
      budgetCount: reg.budgetCount,
      costModelCount: reg.costModelCount,
      investmentCount: reg.investmentCount,
      roiCount: reg.roiCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): P6BudgetRoiManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP6BudgetRoiLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P6BudgetRoiManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P6BudgetRoiManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    createBudget: (input) => {
      assertRunning("createBudget");
      return createBudget(input);
    },
    updateBudgetStatus: (input) => {
      assertRunning("updateBudgetStatus");
      return updateBudgetStatus(input);
    },
    createCostModel: (input) => {
      assertRunning("createCostModel");
      return createCostModel(input);
    },
    createInvestment: (input) => {
      assertRunning("createInvestment");
      return createInvestment(input);
    },
    calculateRoi: (input) => {
      assertRunning("calculateRoi");
      return calculateRoi(input);
    },
    updateRoiStatus: (input) => {
      assertRunning("updateRoiStatus");
      return updateRoiStatus(input);
    },
    createFinancialSummary: (input) => {
      assertRunning("createFinancialSummary");
      return createFinancialSummary(input);
    },
    createScenario: (input) => {
      assertRunning("createScenario");
      return createScenario(input);
    },
    createPricing: (input) => {
      assertRunning("createPricing");
      return createPricing(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP6BudgetRoiReadiness();
    },
    manifest: getP6RegistryManifest,
  };
}

export {
  assertP6BudgetRoiReadinessReady,
  getBudget,
  getCostModel,
  getFinancialSummary,
  getInvestment,
  getPricing,
  getRoi,
  getScenario,
  listBudgets,
  listCostModels,
  listFinancialSummaries,
  listInvestments,
  listPricing,
  listRois,
  listScenarios,
};
