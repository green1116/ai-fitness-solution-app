/**
 * E05-P7 — Strategy Registry
 * Binds strategy agents onto E05 simulations
 */

import { getSimulationById } from "../simulation/simulation.registry";
import {
  E05_STRATEGY_AGENT_ID,
  E05_STRATEGY_BASE,
  E05_STRATEGY_FREEZE_VERSION,
  E05_STRATEGY_VERSION,
} from "./strategy.constants";
import type {
  StrategyDefinition,
  StrategyRegistryManifest,
} from "./strategy.types";

export const STRATEGY_CATALOG: StrategyDefinition[] = [
  {
    id: "e05.strategy.opportunity",
    name: "Opportunity Strategy Agent",
    description: "Generate pursuit strategy from opportunity simulation",
    simulationId: "e05.sim.opportunity",
    preferredStance: "aggressive",
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.strategy.risk",
    name: "Risk Strategy Agent",
    description: "Generate mitigation strategy from risk simulation",
    simulationId: "e05.sim.risk",
    preferredStance: "defensive",
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.strategy.pricing",
    name: "Pricing Strategy Agent",
    description: "Generate pricing strategy from band simulation",
    simulationId: "e05.sim.pricing",
    preferredStance: "balanced",
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.strategy.compliance",
    name: "Compliance Strategy Agent",
    description: "Generate compliance closeout strategy",
    simulationId: "e05.sim.compliance",
    preferredStance: "adaptive",
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.strategy.delivery",
    name: "Delivery Strategy Agent",
    description: "Generate delivery packing strategy",
    simulationId: "e05.sim.delivery",
    preferredStance: "balanced",
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.strategy.synthesis",
    name: "Synthesis Strategy Agent",
    description: "Generate cross-domain synthesis strategy",
    simulationId: "e05.sim.synthesis",
    preferredStance: "adaptive",
    optional: true,
    readOnly: true,
  },
];

export function assertStrategyDefinition(strategy: StrategyDefinition): void {
  if (!strategy.id.trim()) throw new Error("strategy.id is required");
  if (!strategy.name.trim()) throw new Error("strategy.name is required");
  if (strategy.readOnly !== true) throw new Error("readOnly must be true");

  const simulation = getSimulationById(strategy.simulationId);
  if (!simulation) {
    throw new Error(`unknown simulation: ${strategy.simulationId}`);
  }
}

export function buildStrategyRegistryManifest(
  strategies: StrategyDefinition[] = STRATEGY_CATALOG,
): StrategyRegistryManifest {
  for (const strategy of strategies) {
    assertStrategyDefinition(strategy);
  }

  const required = strategies.some((s) => !s.optional);
  if (!required) {
    throw new Error("strategy catalog missing required entry");
  }

  return {
    agentId: E05_STRATEGY_AGENT_ID,
    version: E05_STRATEGY_VERSION,
    freezeVersion: E05_STRATEGY_FREEZE_VERSION,
    base: E05_STRATEGY_BASE,
    strategyCount: strategies.length,
    strategies,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getStrategyById(id: string): StrategyDefinition | undefined {
  return STRATEGY_CATALOG.find((s) => s.id === id);
}

export function listRequiredStrategies(): StrategyDefinition[] {
  return STRATEGY_CATALOG.filter((s) => !s.optional);
}
