/**
 * V79 P8 — Task sign-off report builder (read-only)
 */
import { collectTaskPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildTaskFreezeManifest } from "./signoff.manifest";
import type {
  SignoffState,
  TaskSignoffPhase,
  TaskSignoffReport,
  TaskSignoffSignals,
} from "./signoff.types";
import { V79_TASK_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: TaskSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "V79 Task — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
  ];
  return lines.join("\n");
}

function collectPhases(
  deploymentId: string,
  freeze: ReturnType<typeof buildTaskFreezeManifest>,
): TaskSignoffPhase[] {
  const readiness = collectTaskPhaseReadiness(deploymentId);

  const phaseState = (ok: boolean): TaskSignoffPhase["state"] =>
    ok ? "pass" : readiness.blocked ? "blocked" : "fail";

  return [
    { id: "P1", label: "Task inventory", state: phaseState(readiness.p1), ok: readiness.p1 },
    { id: "P2", label: "Task policy", state: phaseState(readiness.p2), ok: readiness.p2 },
    { id: "P3", label: "Task context", state: phaseState(readiness.p3), ok: readiness.p3 },
    {
      id: "P4",
      label: "Task constraint",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Task evaluation",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Task simulation",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Task compliance",
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

export function buildTaskSignoff(input?: {
  deploymentId?: string;
  signals?: TaskSignoffSignals;
}): TaskSignoffReport {
  const deploymentId = input?.deploymentId ?? "v79-task-signoff-default";
  const freeze = buildTaskFreezeManifest({ deploymentId, signals: input?.signals });
  const readiness = collectTaskPhaseReadiness(deploymentId);

  const phases = collectPhases(deploymentId, freeze);
  const gateSummary = buildGateSummary(readiness);
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff = freeze.freezeState.frozen && allPhasesPass && gateSummary.allGatesPass;

  const signoffState: SignoffState = {
    signedOff,
    allPhasesPass,
    finalReadinessScore: signedOff ? 100 : freeze.taskCompliance.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: V79_TASK_SIGNOFF_VERSION,
    signoffId: `task-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    gateSummary,
    readiness,
    freeze,
    signoffState,
    closingSummary,
    summary: [
      `task-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.freezeState.frozen}`,
      `state=${signoffState.state}`,
    ].join(" "),
  };
}

export function assertTaskSignoffPass(
  report: TaskSignoffReport,
): asserts report is TaskSignoffReport & {
  signoffState: SignoffState & { signedOff: true };
} {
  if (!report.signoffState.signedOff) {
    throw new Error(`V79 task sign-off not complete: ${report.summary}`);
  }
}
