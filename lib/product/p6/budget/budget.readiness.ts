/**
 * Product P6 — Budget & ROI readiness
 */

import { PRODUCT_P5_AI_PROPOSAL_GENERATION_ID } from "../../p5/proposal/proposal.constants";
import { listCostModels } from "../cost-model/cost-model.registry";
import { listFinancialSummaries } from "../financial-summary/summary.registry";
import { listInvestments } from "../investment/investment.registry";
import { listPricing } from "../pricing/pricing.registry";
import { listRois } from "../roi/roi.registry";
import { listScenarios } from "../scenario/scenario.registry";
import { PRODUCT_P6_BUDGET_ROI_BASE } from "./budget.constants";
import { listBudgets } from "./budget.registry";
import type { P6ReadinessCheck, P6ReadinessResult } from "./budget.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P6ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP6BudgetRoiReadiness(): P6ReadinessResult {
  const checks: P6ReadinessCheck[] = [];

  checks.push(
    check(
      "P6-BASE",
      "foundation",
      "P5 AI proposal generation baseline aligned",
      PRODUCT_P6_BUDGET_ROI_BASE === PRODUCT_P5_AI_PROPOSAL_GENERATION_ID,
      `base=${PRODUCT_P6_BUDGET_ROI_BASE}`,
    ),
  );

  const budgets = listBudgets();
  checks.push(
    check(
      "P6-BDG",
      "budget",
      "Budgets present",
      budgets.length >= 1,
      `budgets=${budgets.length}`,
    ),
  );

  const costModels = listCostModels();
  checks.push(
    check(
      "P6-CST",
      "cost-model",
      "Cost models present",
      costModels.length >= 1,
      `costModels=${costModels.length}`,
    ),
  );

  const investments = listInvestments();
  checks.push(
    check(
      "P6-INV",
      "investment",
      "Investments present",
      investments.length >= 1,
      `investments=${investments.length}`,
    ),
  );

  const rois = listRois();
  checks.push(
    check(
      "P6-ROI",
      "roi",
      "ROI projections calculated",
      rois.some((r) => r.status === "CALCULATED" || r.status === "REVIEWED"),
      `rois=${rois.length}`,
    ),
  );

  const summaries = listFinancialSummaries();
  checks.push(
    check(
      "P6-FIN",
      "financial-summary",
      "Financial summaries present",
      summaries.length >= 1,
      `summaries=${summaries.length}`,
    ),
  );

  const scenarios = listScenarios();
  checks.push(
    check(
      "P6-SCN",
      "scenario",
      "Scenarios present",
      scenarios.length >= 1,
      `scenarios=${scenarios.length}`,
    ),
  );

  const pricing = listPricing();
  checks.push(
    check(
      "P6-PRC",
      "pricing",
      "Pricing plans present",
      pricing.length >= 1,
      `pricing=${pricing.length}`,
    ),
  );

  const readyOrApproved = budgets.some(
    (b) => b.status === "READY" || b.status === "APPROVED",
  );
  checks.push(
    check(
      "P6-LIFE",
      "budget",
      "Budget lifecycle advanced to ready",
      readyOrApproved,
      `advanced=${readyOrApproved}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `p6-budget-roi readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP6BudgetRoiReadinessReady(
  result: P6ReadinessResult,
): asserts result is P6ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`p6 budget roi not ready: ${result.summary}`);
  }
}
