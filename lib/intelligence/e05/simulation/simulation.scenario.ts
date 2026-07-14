/**
 * E05-P6 — Simulation Scenario helpers
 */

import type {
  SimulationComparison,
  SimulationDefinition,
  SimulationScenarioDefinition,
  SimulationScenarioResult,
} from "./simulation.types";

export function mergeScenarioInput(
  base: Readonly<Record<string, unknown>>,
  scenario: SimulationScenarioDefinition,
): Readonly<Record<string, unknown>> {
  const merged: Record<string, unknown> = { ...base };
  for (const [key, delta] of Object.entries(scenario.inputDelta)) {
    const current = merged[key];
    if (typeof current === "number") {
      merged[key] = current + delta;
    } else if (current === undefined) {
      merged[key] = delta;
    }
  }
  return Object.freeze(merged);
}

export function compareScenarioResults(
  simulation: SimulationDefinition,
  results: SimulationScenarioResult[],
): SimulationComparison {
  if (results.length === 0) {
    throw new Error(`simulation ${simulation.id} produced no scenario results`);
  }

  const withWeight = results.map((result) => {
    const scenario = simulation.scenarios.find((s) => s.id === result.scenarioId);
    const weight = scenario?.weight ?? 1;
    return { result, weighted: result.score * weight };
  });

  withWeight.sort(
    (a, b) =>
      b.weighted - a.weighted ||
      a.result.scenarioId.localeCompare(b.result.scenarioId),
  );

  const best = withWeight[0]!.result;
  const worst = withWeight[withWeight.length - 1]!.result;
  const scores = results.map((r) => r.score);
  const spread = Math.max(...scores) - Math.min(...scores);

  const verdict = [
    `${simulation.name} prefers ${best.scenarioId}`,
    `(action=${best.selectedAction}, score=${best.score.toFixed(2)})`,
    `over ${worst.scenarioId}`,
    `(spread=${spread.toFixed(2)})`,
  ].join(" ");

  return {
    simulationId: simulation.id,
    bestScenarioId: best.scenarioId,
    worstScenarioId: worst.scenarioId,
    spread,
    verdict,
    results: Object.freeze([...results]) as SimulationScenarioResult[],
    readOnly: true,
  };
}
