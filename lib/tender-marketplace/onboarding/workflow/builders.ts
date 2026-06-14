import type {
  TenderPublishingStatus,
  TenderPublishingWorkflow,
  TenderSubmission,
} from "../../shared/types";
import { TENDER_PUBLISHING_WORKFLOW_STATES } from "../../shared/types";

function resolveWorkflowIndex(status: TenderPublishingStatus): number {
  if (status === "rejected") {
    return TENDER_PUBLISHING_WORKFLOW_STATES.indexOf("review");
  }
  const index = TENDER_PUBLISHING_WORKFLOW_STATES.indexOf(
    status as (typeof TENDER_PUBLISHING_WORKFLOW_STATES)[number],
  );
  return index >= 0 ? index : 0;
}

export function buildTenderPublishingWorkflow(
  submission: TenderSubmission,
): TenderPublishingWorkflow {
  const currentIndex = resolveWorkflowIndex(submission.status);
  const isRejected = submission.status === "rejected";
  const isPublished = submission.status === "published";

  const steps = TENDER_PUBLISHING_WORKFLOW_STATES.map((status, index) => ({
    status,
    completed: isPublished ? true : index < currentIndex,
    current: !isRejected && !isPublished && index === currentIndex,
  }));

  let nextStatus: TenderPublishingStatus | null = null;
  if (submission.status === "rejected") {
    nextStatus = null;
  } else if (!isPublished && currentIndex < TENDER_PUBLISHING_WORKFLOW_STATES.length - 1) {
    nextStatus = TENDER_PUBLISHING_WORKFLOW_STATES[currentIndex + 1];
  }

  return {
    submissionId: submission.submissionId,
    currentStatus: submission.status,
    steps,
    nextStatus,
  };
}

export function advanceTenderPublishingWorkflow(
  submission: TenderSubmission,
): TenderSubmission {
  const workflow = buildTenderPublishingWorkflow(submission);
  if (!workflow.nextStatus) return submission;

  return {
    ...submission,
    status: workflow.nextStatus,
    submittedAt: submission.submittedAt ?? new Date().toISOString(),
  };
}
