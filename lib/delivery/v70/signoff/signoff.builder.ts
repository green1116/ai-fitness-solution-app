/**
 * V70 P8 — Delivery sign-off report builder (read-only)
 */
import { buildDeliveryFreezeManifest } from "./signoff.manifest";
import { collectDeliveryPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import type {
  DeliverySignoffPhase,
  DeliverySignoffReport,
  DeliverySignoffSignals,
  SignoffState,
} from "./signoff.types";
import { V70_DELIVERY_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: DeliverySignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "V70 Delivery Lifecycle — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
  ];
  return lines.join("\n");
}

function collectPhases(
  deploymentId: string,
  freeze: ReturnType<typeof buildDeliveryFreezeManifest>,
): DeliverySignoffPhase[] {
  const readiness = collectDeliveryPhaseReadiness(deploymentId);

  const phaseState = (ok: boolean): DeliverySignoffPhase["state"] =>
    ok ? "pass" : readiness.blocked ? "blocked" : "fail";

  return [
    { id: "P1", label: "Release catalog", state: phaseState(readiness.p1), ok: readiness.p1 },
    {
      id: "P2",
      label: "Release dependency",
      state: phaseState(readiness.p2),
      ok: readiness.p2,
    },
    { id: "P3", label: "Release policy", state: phaseState(readiness.p3), ok: readiness.p3 },
    {
      id: "P4",
      label: "Version compatibility",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Upgrade governance",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Lifecycle management",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Delivery compliance",
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

export function buildDeliverySignoff(input?: {
  deploymentId?: string;
  signals?: DeliverySignoffSignals;
}): DeliverySignoffReport {
  const deploymentId = input?.deploymentId ?? "v70-delivery-signoff-default";
  const freeze = buildDeliveryFreezeManifest({ deploymentId, signals: input?.signals });
  const readiness = collectDeliveryPhaseReadiness(deploymentId);

  const phases = collectPhases(deploymentId, freeze);
  const gateSummary = buildGateSummary(readiness);
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff = freeze.freezeState.frozen && allPhasesPass && gateSummary.allGatesPass;

  const signoffState: SignoffState = {
    signedOff,
    allPhasesPass,
    finalReadinessScore: signedOff ? 100 : freeze.deliveryCompliance.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: V70_DELIVERY_SIGNOFF_VERSION,
    signoffId: `delivery-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    gateSummary,
    readiness,
    freeze,
    signoffState,
    closingSummary,
    summary: [
      `delivery-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.freezeState.frozen}`,
      `state=${signoffState.state}`,
    ].join(" "),
  };
}

export function assertDeliverySignoffPass(
  report: DeliverySignoffReport,
): asserts report is DeliverySignoffReport & {
  signoffState: SignoffState & { signedOff: true };
} {
  if (!report.signoffState.signedOff) {
    throw new Error(`V70 delivery sign-off not complete: ${report.summary}`);
  }
}
