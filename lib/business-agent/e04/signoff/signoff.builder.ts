/**
 * E04-P8 — Business Agent sign-off report builder (read-only)
 */

import { collectBusinessAgentPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildBusinessAgentFreezeManifest } from "./signoff.manifest";
import type {
  BusinessAgentSignoffPhase,
  BusinessAgentSignoffReport,
  BusinessAgentSignoffSignals,
  SignoffState,
} from "./signoff.types";
import { E04_BUSINESS_AGENT_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: BusinessAgentSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "E04 Enterprise Business Agent Platform — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map(
      (p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`,
    ),
  ];
  return lines.join("\n");
}

function collectPhases(
  deploymentId: string,
  freeze: ReturnType<typeof buildBusinessAgentFreezeManifest>,
): BusinessAgentSignoffPhase[] {
  const readiness = collectBusinessAgentPhaseReadiness(deploymentId);

  const phaseState = (ok: boolean): BusinessAgentSignoffPhase["state"] =>
    ok ? "pass" : readiness.blocked ? "blocked" : "fail";

  return [
    {
      id: "P1",
      label: "Business Agent Foundation",
      state: phaseState(readiness.p1),
      ok: readiness.p1,
    },
    {
      id: "P2",
      label: "Business Workflow Runtime",
      state: phaseState(readiness.p2),
      ok: readiness.p2,
    },
    {
      id: "P3",
      label: "Business Process Orchestration",
      state: phaseState(readiness.p3),
      ok: readiness.p3,
    },
    {
      id: "P4",
      label: "Business Decision Runtime",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Business Memory Runtime",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Business Knowledge Runtime",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Enterprise Agent Collaboration",
      state: phaseState(readiness.p7),
      ok: readiness.p7,
    },
    {
      id: "P8",
      label: "Governance Freeze",
      state: freeze.freezeState.frozen ? "ready" : "fail",
      ok: freeze.freezeState.frozen,
    },
  ];
}

export function buildBusinessAgentSignoff(input?: {
  deploymentId?: string;
  signals?: BusinessAgentSignoffSignals;
}): BusinessAgentSignoffReport {
  const deploymentId = input?.deploymentId ?? "e04-business-agent-signoff-default";
  const freeze = buildBusinessAgentFreezeManifest({
    deploymentId,
    signals: input?.signals,
  });
  const readiness = collectBusinessAgentPhaseReadiness(deploymentId);

  const phases = collectPhases(deploymentId, freeze);
  const gateSummary = buildGateSummary(readiness);
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff =
    freeze.freezeState.frozen && allPhasesPass && gateSummary.allGatesPass;

  const signoffState: SignoffState = {
    signedOff,
    allPhasesPass,
    finalReadinessScore: signedOff
      ? 100
      : freeze.collaborationBaseline.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: E04_BUSINESS_AGENT_SIGNOFF_VERSION,
    signoffId: `business-agent-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    gateSummary,
    readiness,
    freeze,
    signoffState,
    closingSummary,
    summary: [
      `business-agent-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.freezeState.frozen}`,
      `state=${signoffState.state}`,
    ].join(" "),
  };
}

export function assertBusinessAgentSignoffPass(
  report: BusinessAgentSignoffReport,
): asserts report is BusinessAgentSignoffReport & {
  signoffState: SignoffState & { signedOff: true };
} {
  if (!report.signoffState.signedOff) {
    throw new Error(
      `E04 business agent sign-off not complete: ${report.summary}`,
    );
  }
}
