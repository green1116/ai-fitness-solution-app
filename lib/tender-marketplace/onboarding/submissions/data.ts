import { buildTenderPublishingIntake } from "../intake/builders";
import type { TenderSubmission } from "../../shared/types";

const WORKFLOW_TENDERS: Array<{
  tenderId: string;
  submissionId: string;
  status: TenderSubmission["status"];
  submittedAt: string | null;
}> = [
  {
    tenderId: "tender-sh-commercial-gym-2025-001",
    submissionId: "publishing-sh-commercial-gym-001",
    status: "published",
    submittedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    tenderId: "tender-bj-hotel-2025-002",
    submissionId: "publishing-bj-hotel-002",
    status: "published",
    submittedAt: "2026-06-03T10:00:00.000Z",
  },
  {
    tenderId: "tender-gz-campus-2025-004",
    submissionId: "publishing-gz-campus-004",
    status: "published",
    submittedAt: "2026-06-05T10:00:00.000Z",
  },
  {
    tenderId: "tender-sh-enterprise-2025-005",
    submissionId: "publishing-sh-enterprise-005",
    status: "published",
    submittedAt: "2026-06-08T10:00:00.000Z",
  },
  {
    tenderId: "tender-cd-community-2025-003",
    submissionId: "publishing-cd-community-003",
    status: "published",
    submittedAt: "2026-06-02T10:00:00.000Z",
  },
  {
    tenderId: "tender-sz-fitness-club-2025-006",
    submissionId: "publishing-sz-fitness-club-006",
    status: "approved",
    submittedAt: "2026-06-06T10:00:00.000Z",
  },
  {
    tenderId: "tender-nj-government-2025-007",
    submissionId: "publishing-nj-government-007",
    status: "submitted",
    submittedAt: "2026-06-07T10:00:00.000Z",
  },
  {
    tenderId: "tender-wh-corporate-2025-008",
    submissionId: "publishing-wh-corporate-008",
    status: "rejected",
    submittedAt: "2026-06-04T10:00:00.000Z",
  },
];

function buildSubmissionFromConfig(
  config: (typeof WORKFLOW_TENDERS)[number],
): TenderSubmission | null {
  const intake = buildTenderPublishingIntake({ tenderId: config.tenderId });
  if (!intake) return null;

  return {
    ...intake,
    submissionId: config.submissionId,
    submittedAt: config.submittedAt,
    status: config.status,
  };
}

export const PUBLISHING_SUBMISSIONS: TenderSubmission[] = WORKFLOW_TENDERS.map(
  buildSubmissionFromConfig,
).filter((submission): submission is TenderSubmission => submission !== null);

export function getAllPublishingSubmissions(): TenderSubmission[] {
  return [...PUBLISHING_SUBMISSIONS];
}

export function getPublishingSubmissionById(
  submissionId: string,
): TenderSubmission | undefined {
  return PUBLISHING_SUBMISSIONS.find((s) => s.submissionId === submissionId);
}
