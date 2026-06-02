/**
 * V3.4-E27-C closed-loop adaptation compat entry.
 * Minimal pass-through for engine.ts module resolution (no full closed-loop runtime).
 */

import { ECOLOGY_RUNTIME_PIPELINE } from "./contract";

const ADAPTATION_VERSION = "3.4-e27-c";

export type EcologicalOrchestrationPass = {
  ecologyIndex: number;
  ecologicalState: string;
  slices: Array<{
    stageId: string;
    label: string;
    index: number;
    status: "healthy" | "warning" | "critical";
  }>;
  ctx: {
    traceId: string;
    correlationId: string;
    ranAt: string;
  };
};

export type EcologicalClosedLoopAdaptation = {
  version: typeof ADAPTATION_VERSION;
  passCount: number;
  summary: string;
};

export type EcologicalClosedLoopResult = {
  finalPass: EcologicalOrchestrationPass;
  adaptation: EcologicalClosedLoopAdaptation;
};

type EcologyLoopInput = {
  civilizationId?: string;
  signals?: Record<string, number | undefined>;
};

function deriveEcologyIndex(signals: EcologyLoopInput["signals"]): number {
  const stability = signals?.stabilityScore ?? 50;
  const metabolism = signals?.metabolismIndex ?? 50;
  return Math.round((stability + metabolism) / 2);
}

function deriveEcologicalState(index: number): string {
  if (index >= 75) return "synergistic";
  if (index >= 55) return "balanced";
  if (index >= 35) return "stressed";
  return "critical";
}

function buildOrchestrationPass(input: EcologyLoopInput): EcologicalOrchestrationPass {
  const ecologyIndex = deriveEcologyIndex(input.signals);
  const civilizationId = input.civilizationId ?? "unknown";
  const ranAt = new Date().toISOString();

  return {
    ecologyIndex,
    ecologicalState: deriveEcologicalState(ecologyIndex),
    slices: ECOLOGY_RUNTIME_PIPELINE.map((stage, index) => ({
      stageId: stage.id,
      label: stage.label,
      index,
      status: "healthy" as const,
    })),
    ctx: {
      traceId: `eco-${civilizationId}-${Date.now()}`,
      correlationId: `corr-${civilizationId}`,
      ranAt,
    },
  };
}

/** Single-pass closed loop compat: one orchestration pass, no re-run. */
export function runEcologicalClosedLoop(
  input: EcologyLoopInput,
): EcologicalClosedLoopResult {
  const finalPass = buildOrchestrationPass(input);
  const adaptation: EcologicalClosedLoopAdaptation = {
    version: ADAPTATION_VERSION,
    passCount: 1,
    summary: `closed-loop=compat passCount=1 index=${finalPass.ecologyIndex}`,
  };
  return { finalPass, adaptation };
}

export function orchestrationSummaryFromPass(pass: EcologicalOrchestrationPass): string {
  return `orchestration index=${pass.ecologyIndex} state=${pass.ecologicalState} slices=${pass.slices.length}`;
}

export function formatClosedLoopDebugSummary(
  adaptation: EcologicalClosedLoopAdaptation,
  orchestrationSummary: string,
): string {
  return `closed-loop=${adaptation.version} ${adaptation.summary} ${orchestrationSummary}`;
}
