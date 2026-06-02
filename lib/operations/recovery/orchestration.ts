import type {
  ContainmentStep,
  DiagnosticStep,
  RecoveryOrchestration,
  RecoveryPlan,
  RecoveryStatus,
  RecoveryStep,
  VerificationStep,
} from "./types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

function stepStatus(
  phase: "contain" | "diagnose" | "recover" | "verify",
  mode: RecoveryPlan["mode"],
  execution?: OperationalAutonomousExecutionRuntimeResult,
): RecoveryStatus {
  if (execution?.status === "failed" && phase === "recover") return "failed";
  if (execution?.status === "completed" && phase === "verify") return "completed";
  if (mode === "manual" && (phase === "recover" || phase === "verify")) return "planned";
  if (phase === "contain") return "isolating";
  if (phase === "diagnose") return "diagnosing";
  if (phase === "recover") return "recovering";
  return "verifying";
}

export function orchestrateRecoveryPlans(input: {
  deploymentId: string;
  plans: RecoveryPlan[];
  execution?: OperationalAutonomousExecutionRuntimeResult;
}): RecoveryOrchestration[] {
  return input.plans.map((plan) => {
    const containment: ContainmentStep[] = [
      {
        stepId: `contain-${plan.planId}`,
        order: 1,
        action: plan.stages.find((s) => s.name === "contain")?.action ?? "contain-risk",
        status: stepStatus("contain", plan.mode, input.execution),
      },
    ];

    const diagnostic: DiagnosticStep[] = [
      {
        stepId: `diagnose-${plan.planId}`,
        order: 1,
        action: plan.stages.find((s) => s.name === "diagnose")?.action ?? "diagnose-root-cause",
        status: stepStatus("diagnose", plan.mode, input.execution),
      },
    ];

    const recovery: RecoveryStep[] = [
      {
        stepId: `recover-${plan.planId}`,
        order: 1,
        action: plan.stages.find((s) => s.name === "recover")?.action ?? "execute-recovery",
        status: stepStatus("recover", plan.mode, input.execution),
      },
    ];

    const verification: VerificationStep[] = [
      {
        stepId: `verify-${plan.planId}`,
        order: 1,
        action: plan.stages.find((s) => s.name === "verify")?.action ?? "verify-recovery",
        status: stepStatus("verify", plan.mode, input.execution),
      },
    ];

    const chainComplete =
      containment.every((s) => s.status !== "failed") &&
      diagnostic.every((s) => s.status !== "failed") &&
      recovery.every((s) => s.status !== "failed") &&
      verification.some((s) => s.status === "completed" || s.status === "verifying");

    return {
      orchestrationId: `recovery-orchestration-${plan.planId}`,
      planId: plan.planId,
      containment,
      diagnostic,
      recovery,
      verification,
      chainComplete,
    };
  });
}

export function resolveRecoveryStatus(input: {
  orchestrations: RecoveryOrchestration[];
  executionStatus?: string;
}): RecoveryStatus {
  if (input.orchestrations.length === 0) return "closed";
  if (input.executionStatus === "failed") return "failed";
  if (input.orchestrations.every((o) => o.chainComplete)) return "completed";
  if (input.orchestrations.some((o) => o.recovery.some((s) => s.status === "recovering"))) return "recovering";
  if (input.orchestrations.some((o) => o.containment.some((s) => s.status === "isolating"))) return "isolating";
  return "planned";
}
