/**
 * Product P6 — Budget & ROI Release Gate
 * BASE: enterprise-product-p5-ai-proposal-generation-v1
 * Isolated — product layer only
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { PRODUCT_P5_AI_PROPOSAL_GENERATION_ID } from "../../p5/proposal/proposal.constants";
import {
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
} from "../budget/budget.constants";
import {
  assertP6BudgetRoiReadinessReady,
  clearP6BudgetRoiLayer,
  createP6BudgetRoiManager,
  getP6RegistryManifest,
} from "../budget.manager";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_P6_SIGNOFF_VERSION = "product-p6-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearP6BudgetRoiLayer();
}

export function checkProductP6ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P6-CONSTANTS",
      "budget",
      "Product P6 budget & ROI version constants",
      PRODUCT_P6_BUDGET_ROI_ID === "enterprise-product-p6-budget-roi-v1" &&
        PRODUCT_P6_BUDGET_ROI_VERSION === "product-p6-1" &&
        PRODUCT_P6_BUDGET_ROI_BASE === PRODUCT_P5_AI_PROPOSAL_GENERATION_ID &&
        PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION ===
          "product-p6-budget-roi-freeze-1" &&
        PRODUCT_P6_BUDGET_FREEZE_VERSION === "product-p6-budget-roi-freeze-1" &&
        BUDGET_STATUSES.length === 5 &&
        COST_MODEL_KINDS.length === 5 &&
        INVESTMENT_CATEGORIES.length === 5 &&
        ROI_STATUSES.length === 3 &&
        SCENARIO_KINDS.length === 4 &&
        PRICING_MODELS.length === 5 &&
        P6_READINESS_VERDICTS.length === 3 &&
        P6_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P6_BUDGET_ROI_ID} base=${PRODUCT_P6_BUDGET_ROI_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P6-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P6-P5-BASE",
      "product-p5",
      "P5 AI proposal generation BASE preserved",
      PRODUCT_P6_BUDGET_ROI_BASE ===
        "enterprise-product-p5-ai-proposal-generation-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P6_BUDGET_ROI_BASE}`,
    ),
  );

  checks.push(
    check(
      "P6-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createP6BudgetRoiManager({ managerId: "prod-p6-gate" });
    mgr.initialize();
    mgr.start();

    const budget = mgr.createBudget({
      id: "p6.gate.bdg",
      proposalRef: "p5.gate.prp",
      name: "Acme AI Coaching Budget",
      currency: "USD",
      owner: "cfo.lee",
    });
    mgr.updateBudgetStatus({
      budgetId: budget.id,
      status: "MODELING",
    });

    const costModel = mgr.createCostModel({
      id: "p6.gate.cst",
      budgetId: budget.id,
      kind: "HYBRID",
      name: "Platform + usage",
      annualCost: 120000,
    });
    const investment = mgr.createInvestment({
      id: "p6.gate.inv",
      budgetId: budget.id,
      category: "IMPLEMENTATION",
      label: "Rollout & onboarding",
      amount: 80000,
    });
    const pricing = mgr.createPricing({
      id: "p6.gate.prc",
      budgetId: budget.id,
      model: "PER_SEAT",
      name: "Coach seats",
      unitPrice: 99,
      seats: 50,
    });
    const scenario = mgr.createScenario({
      id: "p6.gate.scn",
      budgetId: budget.id,
      kind: "BASE",
      name: "Base case",
      upliftPercent: 15,
      assumedReturn: 240000,
    });
    const totalInvestment = investment.amount + costModel.annualCost;
    const roi = mgr.calculateRoi({
      id: "p6.gate.roi",
      budgetId: budget.id,
      horizonMonths: 24,
      expectedReturn: scenario.assumedReturn,
      totalInvestment,
    });
    mgr.createFinancialSummary({
      id: "p6.gate.fin",
      budgetId: budget.id,
      totalInvestment,
      totalAnnualCost: costModel.annualCost,
      projectedReturn: scenario.assumedReturn,
      narrative: `ROI ${roi.roiPercent}% with ${pricing.seats} seats`,
    });
    mgr.updateBudgetStatus({
      budgetId: budget.id,
      status: "READY",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getP6RegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_P6_BUDGET_ROI_ID &&
      registry.base === PRODUCT_P6_BUDGET_ROI_BASE &&
      registry.budgetCount >= 1 &&
      registry.costModelCount >= 1 &&
      registry.investmentCount >= 1 &&
      registry.roiCount >= 1 &&
      registry.financialSummaryCount >= 1 &&
      registry.scenarioCount >= 1 &&
      registry.pricingCount >= 1;

    try {
      assertP6BudgetRoiReadinessReady(readiness);
      checks.push(
        check(
          "P6-STACK",
          "budget",
          "Budget / cost-model / investment / roi / summary / scenario / pricing",
          ok,
          `readiness=${readiness.verdict} roi=${registry.roiCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P6-STACK",
          "budget",
          "Budget / cost-model / investment / roi / summary / scenario / pricing",
          false,
          error instanceof Error ? error.message : "p6 budget roi not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P6-STACK",
        "budget",
        "Budget / cost-model / investment / roi / summary / scenario / pricing",
        false,
        error instanceof Error
          ? error.message
          : "p6 budget roi probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-p6-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP6ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP6ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P6 release gate failed: ${gate.summary}`);
  }
}
