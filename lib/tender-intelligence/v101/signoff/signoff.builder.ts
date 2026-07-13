/**
 * E01-P8 — Tender Intelligence sign-off report builder (read-only)
 */

import { collectTenderPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildTenderFreezeManifest } from "./signoff.manifest";
import type {
  SignoffState,
  TenderSignoffPhase,
  TenderSignoffReport,
  TenderSignoffSignals,
} from "./signoff.types";
import { V101_TENDER_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: TenderSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "E01 Enterprise Tender Intelligence — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
  ];
  return lines.join("\n");
}

function collectPhases(
  deploymentId: string,
  freeze: ReturnType<typeof buildTenderFreezeManifest>,
): TenderSignoffPhase[] {
  const readiness = collectTenderPhaseReadiness(deploymentId);

  const phaseState = (ok: boolean): TenderSignoffPhase["state"] =>
    ok ? "pass" : readiness.blocked ? "blocked" : "fail";

  return [
    {
      id: "P1",
      label: "Tender Intake",
      state: phaseState(readiness.p1),
      ok: readiness.p1,
    },
    {
      id: "P2",
      label: "Document Understanding",
      state: phaseState(readiness.p2),
      ok: readiness.p2,
    },
    {
      id: "P3",
      label: "Tender Intelligence",
      state: phaseState(readiness.p3),
      ok: readiness.p3,
    },
    {
      id: "P4",
      label: "Bid Strategy",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Proposal Intelligence",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Agent Orchestration",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Enterprise Delivery",
      state: phaseState(readiness.p7),
      ok: readiness.p7,
    },
    {
      id: "P8",
      label: "Sign-off & Freeze",
      state: freeze.freezeState.frozen ? "ready" : "fail",
      ok: freeze.freezeState.frozen,
    },
  ];
}

export function buildTenderSignoff(input?: {
  deploymentId?: string;
  signals?: TenderSignoffSignals;
}): TenderSignoffReport {
  const deploymentId = input?.deploymentId ?? "v101-tender-signoff-default";
  const freeze = buildTenderFreezeManifest({ deploymentId, signals: input?.signals });
  const readiness = collectTenderPhaseReadiness(deploymentId);

  const phases = collectPhases(deploymentId, freeze);
  const gateSummary = buildGateSummary(readiness);
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff = freeze.freezeState.frozen && allPhasesPass && gateSummary.allGatesPass;

  const signoffState: SignoffState = {
    signedOff,
    allPhasesPass,
    finalReadinessScore: signedOff ? 100 : freeze.deliveryBaseline.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: V101_TENDER_SIGNOFF_VERSION,
    signoffId: `tender-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    gateSummary,
    readiness,
    freeze,
    signoffState,
    closingSummary,
    summary: [
      `tender-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.freezeState.frozen}`,
      `state=${signoffState.state}`,
    ].join(" "),
  };
}

export function assertTenderSignoffPass(
  report: TenderSignoffReport,
): asserts report is TenderSignoffReport & {
  signoffState: SignoffState & { signedOff: true };
} {
  if (!report.signoffState.signedOff) {
    throw new Error(`V101 tender intelligence sign-off not complete: ${report.summary}`);
  }
}
