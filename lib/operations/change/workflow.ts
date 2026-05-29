import type {
  ChangeDependency,
  ChangeExecutionWindow,
  ChangePlan,
  ChangeRequest,
  ChangeStage,
  ChangeStatus,
} from "./types";
import type { ApprovalDecision } from "./types";

export function buildChangeWorkflowPlans(input: {
  deploymentId: string;
  requests: ChangeRequest[];
  approvals: ApprovalDecision[];
}): ChangePlan[] {
  const now = Date.now();

  return input.requests
    .filter((request) => {
      const approval = input.approvals.find((a) => a.requestId === request.requestId);
      return approval?.approved;
    })
    .map((request) => {
      const window: ChangeExecutionWindow = {
        windowId: `change-window-${request.requestId}`,
        startsAt: new Date(now).toISOString(),
        endsAt: new Date(now + 7200_000).toISOString(),
        timezone: "UTC",
      };

      const stages: ChangeStage[] = [
        {
          stageId: `stage-prepare-${request.requestId}`,
          order: 1,
          name: "prepare",
          action: `prepare-${request.changeType}`,
          status: "approved",
        },
        {
          stageId: `stage-apply-${request.requestId}`,
          order: 2,
          name: "apply",
          action: request.title,
          status: "executing",
        },
        {
          stageId: `stage-verify-${request.requestId}`,
          order: 3,
          name: "verify",
          action: `verify-${request.changeType}`,
          status: "pending_approval",
        },
      ];

      const dependencies: ChangeDependency[] = [
        {
          dependencyId: `dep-prepare-apply-${request.requestId}`,
          fromStageId: stages[0]!.stageId,
          toStageId: stages[1]!.stageId,
          relation: "requires",
        },
        {
          dependencyId: `dep-apply-verify-${request.requestId}`,
          fromStageId: stages[1]!.stageId,
          toStageId: stages[2]!.stageId,
          relation: "requires",
        },
      ];

      return {
        planId: `change-plan-${request.requestId}`,
        requestId: request.requestId,
        stages,
        window,
        dependencies,
        sequence: stages.map((s) => s.order),
      };
    });
}

export function resolveChangeStatusFromExecution(input: {
  plans: ChangePlan[];
  executionStatus?: string;
}): ChangeStatus {
  if (input.plans.length === 0) return "rejected";
  if (input.executionStatus === "failed") return "failed";
  if (input.executionStatus === "rolled_back") return "rolled_back";
  if (input.executionStatus === "completed") return "completed";
  if (input.executionStatus === "blocked") return "pending_approval";
  return "executing";
}
