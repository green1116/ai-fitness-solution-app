import type {
  SupplierOnboardingStatus,
  SupplierOnboardingSubmission,
  SupplierOnboardingWorkflow,
} from "../../shared/types";
import { SUPPLIER_ONBOARDING_WORKFLOW_STATES } from "../../shared/types";

function resolveWorkflowIndex(status: SupplierOnboardingStatus): number {
  if (status === "rejected") {
    return SUPPLIER_ONBOARDING_WORKFLOW_STATES.indexOf("review");
  }
  const index = SUPPLIER_ONBOARDING_WORKFLOW_STATES.indexOf(
    status as (typeof SUPPLIER_ONBOARDING_WORKFLOW_STATES)[number],
  );
  return index >= 0 ? index : 0;
}

export function buildSupplierOnboardingWorkflow(
  submission: SupplierOnboardingSubmission,
): SupplierOnboardingWorkflow {
  const currentIndex = resolveWorkflowIndex(submission.status);
  const isRejected = submission.status === "rejected";
  const isPublished = submission.status === "published";

  const steps = SUPPLIER_ONBOARDING_WORKFLOW_STATES.map((status, index) => ({
    status,
    completed: isPublished ? true : index < currentIndex,
    current: !isRejected && !isPublished && index === currentIndex,
  }));

  let nextStatus: SupplierOnboardingStatus | null = null;
  if (submission.status === "rejected") {
    nextStatus = null;
  } else if (!isPublished && currentIndex < SUPPLIER_ONBOARDING_WORKFLOW_STATES.length - 1) {
    nextStatus = SUPPLIER_ONBOARDING_WORKFLOW_STATES[currentIndex + 1];
  }

  return {
    submissionId: submission.submissionId,
    currentStatus: submission.status,
    steps,
    nextStatus,
  };
}

export function advanceSupplierOnboardingWorkflow(
  submission: SupplierOnboardingSubmission,
): SupplierOnboardingSubmission {
  const workflow = buildSupplierOnboardingWorkflow(submission);
  if (!workflow.nextStatus) return submission;

  return {
    ...submission,
    status: workflow.nextStatus,
    submittedAt: submission.submittedAt ?? new Date().toISOString(),
  };
}
