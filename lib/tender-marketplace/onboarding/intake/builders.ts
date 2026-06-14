import { getEvaluationProfileByTenderId } from "../../evaluation-profile";
import { getOpportunityProfileByTenderId } from "../../opportunity-profile";
import { getRequirementProfilesByTenderId } from "../../requirement-profile";
import { getTenderProfileById } from "../../tender-profile";
import type {
  TenderPublishingIntakeInput,
  TenderSubmission,
} from "../../shared/types";

export function buildTenderPublishingIntake(
  input: TenderPublishingIntakeInput,
): TenderSubmission | null {
  const tenderProfile = getTenderProfileById(input.tenderId);
  if (!tenderProfile) return null;

  const requirements = getRequirementProfilesByTenderId(input.tenderId);
  const evaluation = getEvaluationProfileByTenderId(input.tenderId);
  const opportunity = getOpportunityProfileByTenderId(input.tenderId);
  if (!evaluation || !opportunity) return null;

  return {
    submissionId: `publishing-${input.tenderId.replace("tender-", "")}-draft`,
    tenderProfile,
    requirements,
    evaluation,
    opportunity,
    submittedAt: null,
    status: "draft",
    mode: "tender-marketplace",
  };
}

export function buildTenderPublishingIntakeFromSubmission(
  submission: TenderSubmission,
): TenderSubmission {
  return {
    ...submission,
    submittedAt: submission.submittedAt ?? new Date().toISOString(),
    status: submission.status === "draft" ? "submitted" : submission.status,
  };
}
