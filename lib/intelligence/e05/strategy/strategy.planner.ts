/**
 * E05-P7 — Strategy Planner
 * Composes strategy plans from simulation comparison
 */

import type { SimulationComparison } from "../simulation/simulation.types";
import type {
  StrategyDefinition,
  StrategyPlan,
  StrategyPlanStep,
  StrategyStance,
} from "./strategy.types";

function resolveStance(
  preferred: StrategyStance,
  bestKind: string,
  preferredAction: string,
): StrategyStance {
  if (preferredAction === "hedge" || bestKind === "stress") return "defensive";
  if (preferredAction === "accelerate" || bestKind === "optimistic") {
    return preferred === "defensive" ? "balanced" : "aggressive";
  }
  if (preferredAction === "reprioritize") return "adaptive";
  if (preferredAction === "hold") return "balanced";
  return preferred;
}

function confidenceFromSpread(spread: number): number {
  const value = 0.9 - Math.min(0.4, spread);
  return Math.max(0.4, Math.min(0.95, value));
}

export function planStrategy(
  strategy: StrategyDefinition,
  comparison: SimulationComparison,
): StrategyPlan {
  const best = comparison.results.find(
    (r) => r.scenarioId === comparison.bestScenarioId,
  );
  if (!best) {
    throw new Error(`best scenario missing: ${comparison.bestScenarioId}`);
  }

  const stance = resolveStance(
    strategy.preferredStance,
    best.kind,
    best.selectedAction,
  );

  const steps: StrategyPlanStep[] = [
    {
      id: `${strategy.id}.observe`,
      kind: "observe",
      title: "Observe simulation verdict",
      detail: comparison.verdict,
      order: 1,
      readOnly: true,
    },
    {
      id: `${strategy.id}.decide`,
      kind: "decide",
      title: "Select preferred scenario path",
      detail: `Adopt ${best.scenarioId} with action ${best.selectedAction}`,
      order: 2,
      readOnly: true,
    },
    {
      id: `${strategy.id}.act`,
      kind: "act",
      title: "Execute preferred action",
      detail: best.optimizationSummary,
      order: 3,
      readOnly: true,
    },
    {
      id: `${strategy.id}.monitor`,
      kind: "monitor",
      title: "Monitor posture under stance",
      detail: `Track outcomes under ${stance} stance; watch spread=${comparison.spread.toFixed(2)}`,
      order: 4,
      readOnly: true,
    },
  ];

  const confidence = confidenceFromSpread(comparison.spread);
  const narrative = [
    `${strategy.name} adopts ${stance} stance`,
    `via scenario ${best.scenarioId}`,
    `(action=${best.selectedAction}, confidence=${confidence.toFixed(2)})`,
  ].join(" ");

  return {
    strategyId: strategy.id,
    simulationId: strategy.simulationId,
    stance,
    preferredScenarioId: best.scenarioId,
    preferredAction: best.selectedAction,
    steps: Object.freeze([...steps]) as StrategyPlanStep[],
    narrative,
    confidence,
    readOnly: true,
  };
}
