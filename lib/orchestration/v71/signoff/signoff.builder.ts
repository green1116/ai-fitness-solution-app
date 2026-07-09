/**
 * V71 P8 — Workflow sign-off report builder (read-only)
 */
import { buildWorkflowFreezeManifest } from "./signoff.manifest";
import { collectWorkflowPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import type {
  SignoffState,
  WorkflowSignoffPhase,
  WorkflowSignoffReport,
  WorkflowSignoffSignals,
} from "./signoff.types";
import { V71_WORKFLOW_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: WorkflowSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "V71 Workflow Orchestration — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
  ];
  return lines.join("\n");
}

function collectPhases(
  deploymentId: string,
  freeze: ReturnType<typeof buildWorkflowFreezeManifest>,
): WorkflowSignoffPhase[] {
  const readiness = collectWorkflowPhaseReadiness(deploymentId);

  const phaseState = (ok: boolean): WorkflowSignoffPhase["state"] =>
    ok ? "pass" : readiness.blocked ? "blocked" : "fail";

  return [
    {
      id: "P1",
      label: "Orchestration catalog",
      state: phaseState(readiness.p1),
      ok: readiness.p1,
    },
    {
      id: "P2",
      label: "Workflow dependency",
      state: phaseState(readiness.p2),
      ok: readiness.p2,
    },
    {
      id: "P3",
      label: "Workflow policy",
      state: phaseState(readiness.p3),
      ok: readiness.p3,
    },
    {
      id: "P4",
      label: "Workflow compatibility",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Workflow governance",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Workflow lifecycle",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Workflow compliance",
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

export function buildWorkflowSignoff(input?: {
  deploymentId?: string;
  signals?: WorkflowSignoffSignals;
}): WorkflowSignoffReport {
  const deploymentId = input?.deploymentId ?? "v71-workflow-signoff-default";
  const freeze = buildWorkflowFreezeManifest({ deploymentId, signals: input?.signals });
  const readiness = collectWorkflowPhaseReadiness(deploymentId);

  const phases = collectPhases(deploymentId, freeze);
  const gateSummary = buildGateSummary(readiness);
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff = freeze.freezeState.frozen && allPhasesPass && gateSummary.allGatesPass;

  const signoffState: SignoffState = {
    signedOff,
    allPhasesPass,
    finalReadinessScore: signedOff ? 100 : freeze.workflowCompliance.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: V71_WORKFLOW_SIGNOFF_VERSION,
    signoffId: `workflow-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    gateSummary,
    readiness,
    freeze,
    signoffState,
    closingSummary,
    summary: [
      `workflow-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.freezeState.frozen}`,
      `state=${signoffState.state}`,
    ].join(" "),
  };
}

export function assertWorkflowSignoffPass(
  report: WorkflowSignoffReport,
): asserts report is WorkflowSignoffReport & {
  signoffState: SignoffState & { signedOff: true };
} {
  if (!report.signoffState.signedOff) {
    throw new Error(`V71 workflow sign-off not complete: ${report.summary}`);
  }
}
