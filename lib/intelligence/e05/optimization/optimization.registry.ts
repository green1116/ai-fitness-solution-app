/**
 * E05-P5 — Optimization Registry
 * Binds optimizations onto E05 forecasts
 */

import { getForecastById } from "../forecast/forecast.registry";
import {
  E05_OPTIMIZATION_BASE,
  E05_OPTIMIZATION_ENGINE_ID,
  E05_OPTIMIZATION_FREEZE_VERSION,
  E05_OPTIMIZATION_VERSION,
} from "./optimization.constants";
import type {
  OptimizationDefinition,
  OptimizationRegistryManifest,
} from "./optimization.types";

export const OPTIMIZATION_CATALOG: OptimizationDefinition[] = [
  {
    id: "e05.opt.opportunity",
    name: "Opportunity Optimization",
    description: "Recommend actions for opportunity trajectory",
    forecastId: "e05.forecast.opportunity",
    objective: "maximize",
    options: [
      {
        id: "opt.opp.accelerate",
        action: "accelerate",
        label: "Accelerate tender pursuit",
        bias: 0.2,
        cost: 2,
        readOnly: true,
      },
      {
        id: "opt.opp.hold",
        action: "hold",
        label: "Hold current pursuit pace",
        bias: 0.05,
        cost: 1,
        readOnly: true,
      },
      {
        id: "opt.opp.reprioritize",
        action: "reprioritize",
        label: "Reprioritize pursuit scope",
        bias: 0.1,
        cost: 3,
        readOnly: true,
      },
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.opt.pricing",
    name: "Pricing Optimization",
    description: "Recommend pricing posture adjustments",
    forecastId: "e05.forecast.pricing",
    objective: "stabilize",
    options: [
      {
        id: "opt.price.hold",
        action: "hold",
        label: "Hold pricing band",
        bias: 0.15,
        cost: 1,
        readOnly: true,
      },
      {
        id: "opt.price.hedge",
        action: "hedge",
        label: "Hedge commercial exposure",
        bias: 0.1,
        cost: 2,
        readOnly: true,
      },
      {
        id: "opt.price.accelerate",
        action: "accelerate",
        label: "Push aggressive band shift",
        bias: 0.05,
        cost: 4,
        readOnly: true,
      },
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.opt.risk",
    name: "Risk Optimization",
    description: "Recommend risk mitigation posture",
    forecastId: "e05.forecast.risk",
    objective: "minimize",
    options: [
      {
        id: "opt.risk.hedge",
        action: "hedge",
        label: "Hedge equipment risk",
        bias: 0.2,
        cost: 2,
        readOnly: true,
      },
      {
        id: "opt.risk.reprioritize",
        action: "reprioritize",
        label: "Reprioritize risk workstream",
        bias: 0.15,
        cost: 3,
        readOnly: true,
      },
      {
        id: "opt.risk.hold",
        action: "hold",
        label: "Monitor risk trajectory",
        bias: 0.05,
        cost: 1,
        readOnly: true,
      },
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.opt.compliance",
    name: "Compliance Optimization",
    description: "Recommend compliance readiness actions",
    forecastId: "e05.forecast.compliance",
    objective: "maximize",
    options: [
      {
        id: "opt.comp.accelerate",
        action: "accelerate",
        label: "Accelerate compliance closeout",
        bias: 0.2,
        cost: 2,
        readOnly: true,
      },
      {
        id: "opt.comp.hold",
        action: "hold",
        label: "Maintain compliance cadence",
        bias: 0.1,
        cost: 1,
        readOnly: true,
      },
      {
        id: "opt.comp.reprioritize",
        action: "reprioritize",
        label: "Reprioritize compliance gaps",
        bias: 0.12,
        cost: 3,
        readOnly: true,
      },
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.opt.delivery",
    name: "Delivery Optimization",
    description: "Recommend delivery milestone actions",
    forecastId: "e05.forecast.delivery",
    objective: "maximize",
    options: [
      {
        id: "opt.del.accelerate",
        action: "accelerate",
        label: "Accelerate milestone packing",
        bias: 0.18,
        cost: 2,
        readOnly: true,
      },
      {
        id: "opt.del.hold",
        action: "hold",
        label: "Hold delivery plan",
        bias: 0.08,
        cost: 1,
        readOnly: true,
      },
      {
        id: "opt.del.hedge",
        action: "hedge",
        label: "Hedge delivery contingency",
        bias: 0.1,
        cost: 3,
        readOnly: true,
      },
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.opt.synthesis",
    name: "Synthesis Optimization",
    description: "Recommend cross-domain synthesis actions",
    forecastId: "e05.forecast.synthesis",
    objective: "stabilize",
    options: [
      {
        id: "opt.syn.hold",
        action: "hold",
        label: "Hold synthesis posture",
        bias: 0.12,
        cost: 1,
        readOnly: true,
      },
      {
        id: "opt.syn.reprioritize",
        action: "reprioritize",
        label: "Reprioritize synthesis focus",
        bias: 0.15,
        cost: 2,
        readOnly: true,
      },
    ],
    optional: true,
    readOnly: true,
  },
];

export function assertOptimizationDefinition(
  optimization: OptimizationDefinition,
): void {
  if (!optimization.id.trim()) throw new Error("optimization.id is required");
  if (!optimization.name.trim()) throw new Error("optimization.name is required");
  if (optimization.readOnly !== true) throw new Error("readOnly must be true");
  if (optimization.options.length < 2) {
    throw new Error(`optimization ${optimization.id} needs >= 2 options`);
  }

  const forecast = getForecastById(optimization.forecastId);
  if (!forecast) {
    throw new Error(`unknown forecast: ${optimization.forecastId}`);
  }

  const ids = new Set<string>();
  for (const option of optimization.options) {
    if (ids.has(option.id)) {
      throw new Error(`duplicate option ${option.id}`);
    }
    ids.add(option.id);
    if (option.readOnly !== true) {
      throw new Error("option.readOnly must be true");
    }
  }
}

export function buildOptimizationRegistryManifest(
  optimizations: OptimizationDefinition[] = OPTIMIZATION_CATALOG,
): OptimizationRegistryManifest {
  for (const optimization of optimizations) {
    assertOptimizationDefinition(optimization);
  }

  const required = optimizations.some((o) => !o.optional);
  if (!required) {
    throw new Error("optimization catalog missing required entry");
  }

  return {
    engineId: E05_OPTIMIZATION_ENGINE_ID,
    version: E05_OPTIMIZATION_VERSION,
    freezeVersion: E05_OPTIMIZATION_FREEZE_VERSION,
    base: E05_OPTIMIZATION_BASE,
    optimizationCount: optimizations.length,
    optimizations,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getOptimizationById(
  id: string,
): OptimizationDefinition | undefined {
  return OPTIMIZATION_CATALOG.find((o) => o.id === id);
}

export function listRequiredOptimizations(): OptimizationDefinition[] {
  return OPTIMIZATION_CATALOG.filter((o) => !o.optional);
}
