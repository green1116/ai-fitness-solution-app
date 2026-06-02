import type {
  RecoveryAction,
  RecoveryAssessment,
  RecoveryDependency,
  RecoveryMode,
  RecoveryPlan,
  RecoveryRequest,
  RecoveryStage,
  RecoveryWindow,
} from "./types";

function resolveRecoveryMode(request: RecoveryRequest, assessment: RecoveryAssessment): RecoveryMode {
  if (request.severity === "critical" || !assessment.recoveryReady) return "staged";
  if (request.priority === "low" && assessment.compositeScore >= 60) return "automatic";
  if (request.owner === "operator") return "manual";
  return "automatic";
}

export function buildRecoveryPlans(input: {
  deploymentId: string;
  requests: RecoveryRequest[];
  assessments: RecoveryAssessment[];
}): RecoveryPlan[] {
  const now = Date.now();

  return input.requests
    .map((request) => {
      const assessment = input.assessments.find((a) => a.requestId === request.requestId);
      if (!assessment) return null;

      const mode = resolveRecoveryMode(request, assessment);
      const window: RecoveryWindow = {
        windowId: `recovery-window-${request.requestId}`,
        startsAt: new Date(now).toISOString(),
        endsAt: new Date(now + 5400_000).toISOString(),
        timezone: "UTC",
      };

      const stages: RecoveryStage[] = [
        {
          stageId: `stage-contain-${request.requestId}`,
          order: 1,
          name: "contain",
          action: `contain-${request.recoveryType}`,
          status: "isolating",
        },
        {
          stageId: `stage-diagnose-${request.requestId}`,
          order: 2,
          name: "diagnose",
          action: `diagnose-${request.recoveryType}`,
          status: "diagnosing",
        },
        {
          stageId: `stage-recover-${request.requestId}`,
          order: 3,
          name: "recover",
          action: request.title,
          status: "recovering",
        },
        {
          stageId: `stage-verify-${request.requestId}`,
          order: 4,
          name: "verify",
          action: `verify-${request.recoveryType}`,
          status: "verifying",
        },
      ];

      const actions: RecoveryAction[] = stages.map((stage) => ({
        actionId: `action-${stage.stageId}`,
        stageId: stage.stageId,
        name: stage.action,
        category:
          stage.name === "contain"
            ? "contain"
            : stage.name === "diagnose"
              ? "diagnose"
              : stage.name === "recover"
                ? "recover"
                : "verify",
      }));

      const dependencies: RecoveryDependency[] = [
        {
          dependencyId: `dep-contain-diagnose-${request.requestId}`,
          fromStageId: stages[0]!.stageId,
          toStageId: stages[1]!.stageId,
          relation: "requires",
        },
        {
          dependencyId: `dep-diagnose-recover-${request.requestId}`,
          fromStageId: stages[1]!.stageId,
          toStageId: stages[2]!.stageId,
          relation: "requires",
        },
        {
          dependencyId: `dep-recover-verify-${request.requestId}`,
          fromStageId: stages[2]!.stageId,
          toStageId: stages[3]!.stageId,
          relation: "requires",
        },
      ];

      return {
        planId: `recovery-plan-${request.requestId}`,
        requestId: request.requestId,
        mode,
        stages,
        actions,
        dependencies,
        window,
        sequence: stages.map((s) => s.order),
      };
    })
    .filter((plan): plan is RecoveryPlan => plan !== null);
}
