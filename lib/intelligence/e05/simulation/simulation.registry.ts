/**
 * E05-P6 — Simulation Registry
 * Binds simulations onto E05 optimizations
 */

import { getOptimizationById } from "../optimization/optimization.registry";
import {
  E05_SIMULATION_BASE,
  E05_SIMULATION_FREEZE_VERSION,
  E05_SIMULATION_RUNTIME_ID,
  E05_SIMULATION_VERSION,
} from "./simulation.constants";
import type {
  SimulationDefinition,
  SimulationRegistryManifest,
} from "./simulation.types";

export const SIMULATION_CATALOG: SimulationDefinition[] = [
  {
    id: "e05.sim.opportunity",
    name: "Opportunity Simulation",
    description: "Compare opportunity pursuit scenarios",
    optimizationId: "e05.opt.opportunity",
    optional: false,
    readOnly: true,
    scenarios: [
      {
        id: "sc.opp.baseline",
        kind: "baseline",
        name: "Baseline",
        description: "Current opportunity posture",
        inputDelta: {},
        weight: 1,
        readOnly: true,
      },
      {
        id: "sc.opp.optimistic",
        kind: "optimistic",
        name: "Optimistic Push",
        description: "Higher opportunity score path",
        inputDelta: { opportunityScore: 10 },
        weight: 1.1,
        readOnly: true,
      },
      {
        id: "sc.opp.pessimistic",
        kind: "pessimistic",
        name: "Soft Market",
        description: "Weaker opportunity score path",
        inputDelta: { opportunityScore: -15 },
        weight: 0.9,
        readOnly: true,
      },
    ],
  },
  {
    id: "e05.sim.risk",
    name: "Risk Simulation",
    description: "Compare risk mitigation scenarios",
    optimizationId: "e05.opt.risk",
    optional: false,
    readOnly: true,
    scenarios: [
      {
        id: "sc.risk.baseline",
        kind: "baseline",
        name: "Baseline Risk",
        description: "Current risk index",
        inputDelta: {},
        weight: 1,
        readOnly: true,
      },
      {
        id: "sc.risk.stress",
        kind: "stress",
        name: "Stress Spike",
        description: "Elevated equipment risk",
        inputDelta: { riskIndex: 35 },
        weight: 1.2,
        readOnly: true,
      },
      {
        id: "sc.risk.optimistic",
        kind: "optimistic",
        name: "Contained Risk",
        description: "Risk index improves",
        inputDelta: { riskIndex: -10 },
        weight: 1,
        readOnly: true,
      },
    ],
  },
  {
    id: "e05.sim.pricing",
    name: "Pricing Simulation",
    description: "Compare pricing band scenarios",
    optimizationId: "e05.opt.pricing",
    optional: false,
    readOnly: true,
    scenarios: [
      {
        id: "sc.price.baseline",
        kind: "baseline",
        name: "Baseline Pricing",
        description: "Current pricing band",
        inputDelta: {},
        weight: 1,
        readOnly: true,
      },
      {
        id: "sc.price.optimistic",
        kind: "optimistic",
        name: "Band Lift",
        description: "Pricing band improves",
        inputDelta: { pricingBand: 1 },
        weight: 1,
        readOnly: true,
      },
      {
        id: "sc.price.pessimistic",
        kind: "pessimistic",
        name: "Band Pressure",
        description: "Pricing band softens",
        inputDelta: { pricingBand: -1 },
        weight: 1,
        readOnly: true,
      },
    ],
  },
  {
    id: "e05.sim.compliance",
    name: "Compliance Simulation",
    description: "Compare compliance readiness scenarios",
    optimizationId: "e05.opt.compliance",
    optional: false,
    readOnly: true,
    scenarios: [
      {
        id: "sc.comp.baseline",
        kind: "baseline",
        name: "Baseline Compliance",
        description: "Current compliance ratio",
        inputDelta: {},
        weight: 1,
        readOnly: true,
      },
      {
        id: "sc.comp.optimistic",
        kind: "optimistic",
        name: "Closeout Surge",
        description: "Compliance ratio rises",
        inputDelta: { complianceRatio: 0.05 },
        weight: 1.05,
        readOnly: true,
      },
      {
        id: "sc.comp.stress",
        kind: "stress",
        name: "Gap Stress",
        description: "Compliance ratio drops",
        inputDelta: { complianceRatio: -0.2 },
        weight: 1.1,
        readOnly: true,
      },
    ],
  },
  {
    id: "e05.sim.delivery",
    name: "Delivery Simulation",
    description: "Compare delivery milestone scenarios",
    optimizationId: "e05.opt.delivery",
    optional: false,
    readOnly: true,
    scenarios: [
      {
        id: "sc.del.baseline",
        kind: "baseline",
        name: "Baseline Delivery",
        description: "Current milestone count",
        inputDelta: {},
        weight: 1,
        readOnly: true,
      },
      {
        id: "sc.del.optimistic",
        kind: "optimistic",
        name: "Milestone Surge",
        description: "More milestones packed",
        inputDelta: { milestoneCount: 2 },
        weight: 1,
        readOnly: true,
      },
      {
        id: "sc.del.pessimistic",
        kind: "pessimistic",
        name: "Milestone Slip",
        description: "Fewer milestones packed",
        inputDelta: { milestoneCount: -2 },
        weight: 0.95,
        readOnly: true,
      },
    ],
  },
  {
    id: "e05.sim.synthesis",
    name: "Synthesis Simulation",
    description: "Compare synthesis posture scenarios",
    optimizationId: "e05.opt.synthesis",
    optional: true,
    readOnly: true,
    scenarios: [
      {
        id: "sc.syn.baseline",
        kind: "baseline",
        name: "Baseline Synthesis",
        description: "Current synthesis index",
        inputDelta: {},
        weight: 1,
        readOnly: true,
      },
      {
        id: "sc.syn.optimistic",
        kind: "optimistic",
        name: "Aligned Synthesis",
        description: "Synthesis index improves",
        inputDelta: { synthesisIndex: 8 },
        weight: 1,
        readOnly: true,
      },
    ],
  },
];

export function assertSimulationDefinition(
  simulation: SimulationDefinition,
): void {
  if (!simulation.id.trim()) throw new Error("simulation.id is required");
  if (!simulation.name.trim()) throw new Error("simulation.name is required");
  if (simulation.readOnly !== true) throw new Error("readOnly must be true");
  if (simulation.scenarios.length < 2) {
    throw new Error(`simulation ${simulation.id} needs >= 2 scenarios`);
  }

  const optimization = getOptimizationById(simulation.optimizationId);
  if (!optimization) {
    throw new Error(`unknown optimization: ${simulation.optimizationId}`);
  }

  const ids = new Set<string>();
  for (const scenario of simulation.scenarios) {
    if (ids.has(scenario.id)) {
      throw new Error(`duplicate scenario ${scenario.id}`);
    }
    ids.add(scenario.id);
    if (scenario.readOnly !== true) {
      throw new Error("scenario.readOnly must be true");
    }
  }
}

export function buildSimulationRegistryManifest(
  simulations: SimulationDefinition[] = SIMULATION_CATALOG,
): SimulationRegistryManifest {
  for (const simulation of simulations) {
    assertSimulationDefinition(simulation);
  }

  const required = simulations.some((s) => !s.optional);
  if (!required) {
    throw new Error("simulation catalog missing required entry");
  }

  return {
    runtimeId: E05_SIMULATION_RUNTIME_ID,
    version: E05_SIMULATION_VERSION,
    freezeVersion: E05_SIMULATION_FREEZE_VERSION,
    base: E05_SIMULATION_BASE,
    simulationCount: simulations.length,
    simulations,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getSimulationById(
  id: string,
): SimulationDefinition | undefined {
  return SIMULATION_CATALOG.find((s) => s.id === id);
}

export function listRequiredSimulations(): SimulationDefinition[] {
  return SIMULATION_CATALOG.filter((s) => !s.optional);
}
