/**
 * AE-2 — Declarative application runtime lifecycle phases.
 * Lifecycle catalogue only — not workflow / orchestration / deployment.
 */
import type { Ae2RuntimeStateId } from "./runtime.state";

export const AE2_LIFECYCLE_PHASE_IDS = [
  "BOOTSTRAP",
  "BIND",
  "ACTIVATE",
  "HOLD",
  "SHUTDOWN",
] as const;

export type Ae2LifecyclePhaseId = (typeof AE2_LIFECYCLE_PHASE_IDS)[number];

export type Ae2LifecyclePhase = Readonly<{
  phaseId: Ae2LifecyclePhaseId;
  order: number;
  entersState: Ae2RuntimeStateId;
  notes: string;
}>;

/**
 * Closed lifecycle phases mapping to runtime states — declarative only.
 */
export const AE2_LIFECYCLE_PHASES = [
  {
    phaseId: "BOOTSTRAP",
    order: 1,
    entersState: "ASSEMBLED",
    notes: "Load AE-1 assembly identity",
  },
  {
    phaseId: "BIND",
    order: 2,
    entersState: "BOUND",
    notes: "Bind runtime context to assembly registry",
  },
  {
    phaseId: "ACTIVATE",
    order: 3,
    entersState: "READY",
    notes: "Mark runtime plan ready (no side effects)",
  },
  {
    phaseId: "HOLD",
    order: 4,
    entersState: "SUSPENDED",
    notes: "Policy hold — no workflow progression",
  },
  {
    phaseId: "SHUTDOWN",
    order: 5,
    entersState: "STOPPED",
    notes: "Terminal catalogue phase",
  },
] as const satisfies readonly Ae2LifecyclePhase[];

export function getAe2LifecyclePhase(
  phaseId: Ae2LifecyclePhaseId,
): Ae2LifecyclePhase | undefined {
  return AE2_LIFECYCLE_PHASES.find((p) => p.phaseId === phaseId);
}

export const AE2_LIFECYCLE_CHAIN = AE2_LIFECYCLE_PHASE_IDS.join("→");
