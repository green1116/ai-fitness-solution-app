/**
 * E02-P8 — Knowledge Graph sign-off report builder (read-only)
 */

import { collectKnowledgePhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildKnowledgeFreezeManifest } from "./signoff.manifest";
import type {
  KnowledgeSignoffPhase,
  KnowledgeSignoffReport,
  KnowledgeSignoffSignals,
  SignoffState,
} from "./signoff.types";
import { V102_KNOWLEDGE_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: KnowledgeSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "E02 Enterprise Tender Knowledge Graph — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
  ];
  return lines.join("\n");
}

function collectPhases(
  deploymentId: string,
  freeze: ReturnType<typeof buildKnowledgeFreezeManifest>,
): KnowledgeSignoffPhase[] {
  const readiness = collectKnowledgePhaseReadiness(deploymentId);

  const phaseState = (ok: boolean): KnowledgeSignoffPhase["state"] =>
    ok ? "pass" : readiness.blocked ? "blocked" : "fail";

  return [
    {
      id: "P1",
      label: "Knowledge Graph Kernel",
      state: phaseState(readiness.p1),
      ok: readiness.p1,
    },
    {
      id: "P2",
      label: "Entity Extraction",
      state: phaseState(readiness.p2),
      ok: readiness.p2,
    },
    {
      id: "P3",
      label: "Relationship Engine",
      state: phaseState(readiness.p3),
      ok: readiness.p3,
    },
    {
      id: "P4",
      label: "Knowledge Retrieval",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Similar Tender Intelligence",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Enterprise Memory Agent",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Knowledge Delivery",
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

export function buildKnowledgeSignoff(input?: {
  deploymentId?: string;
  signals?: KnowledgeSignoffSignals;
}): KnowledgeSignoffReport {
  const deploymentId = input?.deploymentId ?? "v102-knowledge-signoff-default";
  const freeze = buildKnowledgeFreezeManifest({
    deploymentId,
    signals: input?.signals,
  });
  const readiness = collectKnowledgePhaseReadiness(deploymentId);

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
      : freeze.deliveryBaseline.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: V102_KNOWLEDGE_SIGNOFF_VERSION,
    signoffId: `knowledge-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    gateSummary,
    readiness,
    freeze,
    signoffState,
    closingSummary,
    summary: [
      `knowledge-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.freezeState.frozen}`,
      `state=${signoffState.state}`,
    ].join(" "),
  };
}

export function assertKnowledgeSignoffPass(
  report: KnowledgeSignoffReport,
): asserts report is KnowledgeSignoffReport & {
  signoffState: SignoffState & { signedOff: true };
} {
  if (!report.signoffState.signedOff) {
    throw new Error(
      `V102 knowledge graph sign-off not complete: ${report.summary}`,
    );
  }
}
