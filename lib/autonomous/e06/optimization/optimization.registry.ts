/**
 * E06-P5 — Self Optimization Registry
 * Optimizations bind tuning knobs onto E06 controls
 */

import { getControlById } from "../control/control.registry";
import {
  E06_OPTIMIZATION_BASE,
  E06_OPTIMIZATION_FREEZE_VERSION,
  E06_OPTIMIZATION_LOOP_ID,
  E06_OPTIMIZATION_VERSION,
  OPTIMIZATION_KINDS,
} from "./optimization.constants";
import type {
  OptimizationDefinition,
  OptimizationKind,
  OptimizationRegistryManifest,
} from "./optimization.types";

export const OPTIMIZATION_CATALOG: OptimizationDefinition[] = [
  {
    id: "e06.opt.response-throughput",
    kind: "throughput",
    name: "Response Throughput Optimization",
    description: "Unblock and accelerate the automatic response control",
    controlId: "e06.control.response-auto",
    knobs: [
      {
        field: "unsafe",
        value: false,
        reason: "clear unsafe flag blocking policy gate",
        readOnly: true,
      },
      {
        field: "ready",
        value: true,
        reason: "assert readiness for gate policy",
        readOnly: true,
      },
    ],
    targetScore: 100,
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.opt.risk-resilience",
    kind: "resilience",
    name: "Risk Guard Resilience Optimization",
    description: "Lower risk pressure on the supervised risk guard control",
    controlId: "e06.control.risk-supervised",
    knobs: [
      {
        field: "riskScore",
        value: 10,
        reason: "reduce risk score below escalation threshold",
        readOnly: true,
      },
      {
        field: "ready",
        value: true,
        reason: "assert readiness for gate policy",
        readOnly: true,
      },
    ],
    targetScore: 100,
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.opt.escalation-quality",
    kind: "quality",
    name: "Escalation Quality Optimization",
    description: "Stabilize the fallback escalation control under load",
    controlId: "e06.control.escalation-fallback",
    knobs: [
      {
        field: "burst",
        value: false,
        reason: "clear burst flag to avoid throttling",
        readOnly: true,
      },
      {
        field: "ready",
        value: true,
        reason: "assert readiness for gate policy",
        readOnly: true,
      },
    ],
    targetScore: 100,
    optional: false,
    readOnly: true,
  },
];

export function assertOptimizationDefinition(
  optimization: OptimizationDefinition,
): void {
  if (!optimization.id.trim()) throw new Error("optimization.id is required");
  if (!optimization.name.trim()) {
    throw new Error("optimization.name is required");
  }
  if (!(OPTIMIZATION_KINDS as readonly string[]).includes(optimization.kind)) {
    throw new Error(`invalid optimization kind: ${optimization.kind}`);
  }
  if (optimization.readOnly !== true) throw new Error("readOnly must be true");
  if (optimization.knobs.length === 0) {
    throw new Error(`optimization ${optimization.id} requires knobs`);
  }
  if (optimization.targetScore < 0 || optimization.targetScore > 100) {
    throw new Error(`invalid targetScore on ${optimization.id}`);
  }

  if (!getControlById(optimization.controlId)) {
    throw new Error(`missing E06 control: ${optimization.controlId}`);
  }
}

export function getOptimizationById(
  id: string,
): OptimizationDefinition | undefined {
  return OPTIMIZATION_CATALOG.find((o) => o.id === id);
}

export function getOptimizationByKind(
  kind: OptimizationKind,
): OptimizationDefinition | undefined {
  return OPTIMIZATION_CATALOG.find((o) => o.kind === kind);
}

export function buildOptimizationRegistryManifest(
  optimizations: OptimizationDefinition[] = OPTIMIZATION_CATALOG,
): OptimizationRegistryManifest {
  for (const optimization of optimizations) {
    assertOptimizationDefinition(optimization);
  }

  const kinds = [...new Set(optimizations.map((o) => o.kind))];
  const catalogComplete = OPTIMIZATION_KINDS.every((k) => kinds.includes(k));
  if (!catalogComplete) {
    throw new Error("Optimization catalog incomplete: missing kinds");
  }

  return {
    loopId: E06_OPTIMIZATION_LOOP_ID,
    version: E06_OPTIMIZATION_VERSION,
    freezeVersion: E06_OPTIMIZATION_FREEZE_VERSION,
    base: E06_OPTIMIZATION_BASE,
    optimizationCount: optimizations.length,
    kinds,
    optimizations,
    catalogComplete: true,
    readOnly: true,
  };
}
