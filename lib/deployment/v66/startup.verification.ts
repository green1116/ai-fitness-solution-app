/**
 * V66 P2 — Startup verification sequence (declarative, ordered)
 */
import type {
  DeploymentExecutionSignals,
  HealthCheckStatus,
  StartupVerificationManifest,
  StartupVerificationStep,
} from "./execution.types";
import { V66_DEPLOYMENT_EXECUTION_VERSION } from "./execution.types";

type StartupStepDefinition = {
  id: string;
  order: number;
  label: string;
  required: boolean;
  evaluate: (signals: DeploymentExecutionSignals) => HealthCheckStatus;
  notes?: string;
};

const STARTUP_STEP_DEFINITIONS: StartupStepDefinition[] = [
  {
    id: "SV-001",
    order: 1,
    label: "Load V66 env contract catalog",
    required: true,
    evaluate: (s) => (s.baselineReady ? "pass" : "fail"),
  },
  {
    id: "SV-002",
    order: 2,
    label: "Confirm upstream frozen layers (V48–V65)",
    required: true,
    evaluate: (s) => (s.baselineReady ? "pass" : "fail"),
  },
  {
    id: "SV-003",
    order: 3,
    label: "Validate required production secrets",
    required: true,
    evaluate: (s) => (s.requiredSecretsConfigured ? "pass" : "fail"),
    notes: "Declarative gate; live audit via v92:env-audit",
  },
  {
    id: "SV-004",
    order: 4,
    label: "Reject forbidden production flags",
    required: true,
    evaluate: (s) => (s.forbiddenFlagsClear ? "pass" : "fail"),
  },
  {
    id: "SV-005",
    order: 5,
    label: "Prisma client generated",
    required: true,
    evaluate: (s) => (s.prismaClientGenerated ? "pass" : "fail"),
    notes: "prisma generate / postinstall",
  },
  {
    id: "SV-006",
    order: 6,
    label: "Lockfile integrity present",
    required: true,
    evaluate: (s) => (s.lockfilePresent ? "pass" : "fail"),
  },
  {
    id: "SV-007",
    order: 7,
    label: "Readiness probe surface registered",
    required: true,
    evaluate: (s) => (s.probeSurfaceComplete ? "pass" : "fail"),
  },
  {
    id: "SV-008",
    order: 8,
    label: "Startup sequence finalized",
    required: true,
    evaluate: (s) => (s.startupSequenceComplete ? "pass" : "fail"),
  },
];

export const STARTUP_VERIFICATION_STEP_COUNT = STARTUP_STEP_DEFINITIONS.length;

export function buildStartupVerificationManifest(
  signals: DeploymentExecutionSignals,
): StartupVerificationManifest {
  const steps: StartupVerificationStep[] = STARTUP_STEP_DEFINITIONS.map((def) => ({
    id: def.id,
    order: def.order,
    label: def.label,
    status: def.evaluate(signals),
    required: def.required,
    notes: def.notes,
  }));

  const passCount = steps.filter((s) => s.status === "pass").length;
  const sequenceComplete =
    steps.filter((s) => s.required).every((s) => s.status === "pass") &&
    signals.startupSequenceComplete !== false;

  return {
    version: V66_DEPLOYMENT_EXECUTION_VERSION,
    stepCount: steps.length,
    passCount,
    sequenceComplete,
    steps,
    summary: [
      `startup-verification pass=${passCount}/${steps.length}`,
      `complete=${sequenceComplete}`,
    ].join(" "),
  };
}
