import type {
  BrandOnboardingStatus,
  BrandOnboardingSubmission,
  BrandOnboardingWorkflow,
} from "../../shared/types";
import { BRAND_ONBOARDING_WORKFLOW_STATES } from "../../shared/types";

function resolveWorkflowIndex(status: BrandOnboardingStatus): number {
  if (status === "rejected") {
    return BRAND_ONBOARDING_WORKFLOW_STATES.indexOf("review");
  }
  const index = BRAND_ONBOARDING_WORKFLOW_STATES.indexOf(
    status as (typeof BRAND_ONBOARDING_WORKFLOW_STATES)[number],
  );
  return index >= 0 ? index : 0;
}

export function buildBrandOnboardingWorkflow(
  submission: BrandOnboardingSubmission,
): BrandOnboardingWorkflow {
  const currentIndex = resolveWorkflowIndex(submission.status);
  const isRejected = submission.status === "rejected";
  const isPublished = submission.status === "published";

  const steps = BRAND_ONBOARDING_WORKFLOW_STATES.map((status, index) => ({
    status,
    completed: isPublished ? true : index < currentIndex,
    current: !isRejected && !isPublished && index === currentIndex,
  }));

  let nextStatus: BrandOnboardingStatus | null = null;
  if (submission.status === "rejected") {
    nextStatus = null;
  } else if (!isPublished && currentIndex < BRAND_ONBOARDING_WORKFLOW_STATES.length - 1) {
    nextStatus = BRAND_ONBOARDING_WORKFLOW_STATES[currentIndex + 1];
  }

  return {
    submissionId: submission.submissionId,
    currentStatus: submission.status,
    steps,
    nextStatus,
  };
}

export function advanceBrandOnboardingWorkflow(
  submission: BrandOnboardingSubmission,
): BrandOnboardingSubmission {
  const workflow = buildBrandOnboardingWorkflow(submission);
  if (!workflow.nextStatus) return submission;

  return {
    ...submission,
    status: workflow.nextStatus,
    submittedAt: submission.submittedAt ?? new Date().toISOString(),
  };
}
