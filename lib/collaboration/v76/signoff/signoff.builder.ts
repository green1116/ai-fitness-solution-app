/**
 * V76 P8 — Collaboration sign-off report builder (read-only)
 */
import { collectCollaborationPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildCollaborationFreezeManifest } from "./signoff.manifest";
import type {
  CollaborationSignoffPhase,
  CollaborationSignoffReport,
  CollaborationSignoffSignals,
  SignoffState,
} from "./signoff.types";
import { V76_COLLABORATION_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: CollaborationSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "V76 Collaboration — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
  ];
  return lines.join("\n");
}

function collectPhases(
  deploymentId: string,
  freeze: ReturnType<typeof buildCollaborationFreezeManifest>,
): CollaborationSignoffPhase[] {
  const readiness = collectCollaborationPhaseReadiness(deploymentId);

  const phaseState = (ok: boolean): CollaborationSignoffPhase["state"] =>
    ok ? "pass" : readiness.blocked ? "blocked" : "fail";

  return [
    {
      id: "P1",
      label: "Collaboration inventory",
      state: phaseState(readiness.p1),
      ok: readiness.p1,
    },
    {
      id: "P2",
      label: "Collaboration policy",
      state: phaseState(readiness.p2),
      ok: readiness.p2,
    },
    {
      id: "P3",
      label: "Collaboration context",
      state: phaseState(readiness.p3),
      ok: readiness.p3,
    },
    {
      id: "P4",
      label: "Collaboration constraint",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Collaboration evaluation",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Collaboration simulation",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Collaboration compliance",
      state: phaseState(readiness.p7),
      ok: readiness.p7,
    },
    {
      id: "P8",
      label: "Sign-off & freeze",
      state: freeze.freezeState.frozen ? "ready" : "fail",
      ok: freeze.freezeState.frozen,
    },
  ];
}

export function buildCollaborationSignoff(input?: {
  deploymentId?: string;
  signals?: CollaborationSignoffSignals;
}): CollaborationSignoffReport {
  const deploymentId = input?.deploymentId ?? "v76-collaboration-signoff-default";
  const freeze = buildCollaborationFreezeManifest({ deploymentId, signals: input?.signals });
  const readiness = collectCollaborationPhaseReadiness(deploymentId);

  const phases = collectPhases(deploymentId, freeze);
  const gateSummary = buildGateSummary(readiness);
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff = freeze.freezeState.frozen && allPhasesPass && gateSummary.allGatesPass;

  const signoffState: SignoffState = {
    signedOff,
    allPhasesPass,
    finalReadinessScore: signedOff ? 100 : freeze.collaborationCompliance.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: V76_COLLABORATION_SIGNOFF_VERSION,
    signoffId: `collaboration-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    gateSummary,
    readiness,
    freeze,
    signoffState,
    closingSummary,
    summary: [
      `collaboration-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.freezeState.frozen}`,
      `state=${signoffState.state}`,
    ].join(" "),
  };
}

export function assertCollaborationSignoffPass(
  report: CollaborationSignoffReport,
): asserts report is CollaborationSignoffReport & {
  signoffState: SignoffState & { signedOff: true };
} {
  if (!report.signoffState.signedOff) {
    throw new Error(`V76 collaboration sign-off not complete: ${report.summary}`);
  }
}
