/**
 * V62 P1 — Decision pipeline: INPUT → ANALYSIS → STRATEGY → ACTION → OPTIMIZATION
 */

import type { BusinessContext, DecisionPipelineResult, StrategyPlan } from "./decision.types";
import { buildBusinessContext } from "./decision.context";
import {
  analyzeBusinessState,
  detectGrowthBottlenecks,
  detectRevenueLeaks,
  generateStrategyPlan,
  optimizeGrowthFunnels,
  optimizePricingStrategy,
  optimizeSalesPipeline,
  generateActionPlan,
} from "./decision-engine";
import { buildDecisionOutput } from "../actions/action.generator";
import { executeActionPlan } from "../actions/action.executor";
import { optimizeConversion } from "../optimizer/conversion.optimizer";
import { optimizeRevenue } from "../optimizer/revenue.optimizer";

export type PipelineOptions = {
  organizationId: string;
  context?: BusinessContext;
  executeActions?: boolean;
};

export async function runDecisionPipeline(options: PipelineOptions): Promise<DecisionPipelineResult> {
  const organizationId = options.organizationId;
  const context = options.context ?? buildBusinessContext(organizationId);

  // ANALYSIS
  const analysis = analyzeBusinessState(context);
  const growthBottlenecks = detectGrowthBottlenecks(context);
  const revenueLeaks = detectRevenueLeaks(context);
  analysis.bottlenecks.push(...growthBottlenecks);
  analysis.revenueLeaks.push(...revenueLeaks);

  // STRATEGY
  const strategy: StrategyPlan = generateStrategyPlan(context, organizationId);

  // OPTIMIZATION LOOP
  optimizeGrowthFunnels(context);
  optimizePricingStrategy(context);
  optimizeSalesPipeline(context, organizationId);
  optimizeConversion(context);
  optimizeRevenue(context);

  // ACTION
  const actions = generateActionPlan(context, organizationId);
  const output = buildDecisionOutput(context, analysis, strategy, actions);

  const executed =
    options.executeActions === true ? await executeActionPlan(actions) : [];

  return {
    context,
    analysis,
    strategy,
    output,
    actions,
    executed,
    generatedAt: new Date().toISOString(),
  };
}
