import { buildSupplierOnboardingIntake } from "../intake/builders";
import type { SupplierOnboardingSubmission } from "../../shared/types";

const WORKFLOW_SUPPLIERS: Array<{
  supplierId: string;
  submissionId: string;
  status: SupplierOnboardingSubmission["status"];
  submittedAt: string | null;
}> = [
  {
    supplierId: "supplier-life-fitness-cn",
    submissionId: "onboarding-life-fitness-cn-001",
    status: "published",
    submittedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    supplierId: "supplier-technogym-cn",
    submissionId: "onboarding-technogym-cn-001",
    status: "published",
    submittedAt: "2026-06-03T10:00:00.000Z",
  },
  {
    supplierId: "supplier-matrix-cn",
    submissionId: "onboarding-matrix-cn-001",
    status: "published",
    submittedAt: "2026-06-05T10:00:00.000Z",
  },
  {
    supplierId: "supplier-relax-cn",
    submissionId: "onboarding-relax-cn-001",
    status: "submitted",
    submittedAt: "2026-06-07T10:00:00.000Z",
  },
  {
    supplierId: "supplier-shuhua",
    submissionId: "onboarding-shuhua-001",
    status: "published",
    submittedAt: "2026-06-08T10:00:00.000Z",
  },
  {
    supplierId: "supplier-precor-cn",
    submissionId: "onboarding-precor-cn-001",
    status: "rejected",
    submittedAt: "2026-06-04T10:00:00.000Z",
  },
  {
    supplierId: "supplier-impulse-cn",
    submissionId: "onboarding-impulse-cn-001",
    status: "published",
    submittedAt: "2026-06-02T10:00:00.000Z",
  },
  {
    supplierId: "supplier-dhz-cn",
    submissionId: "onboarding-dhz-cn-001",
    status: "approved",
    submittedAt: "2026-06-06T10:00:00.000Z",
  },
];

function buildSubmissionFromConfig(
  config: (typeof WORKFLOW_SUPPLIERS)[number],
): SupplierOnboardingSubmission | null {
  const intake = buildSupplierOnboardingIntake({ supplierId: config.supplierId });
  if (!intake) return null;

  return {
    ...intake,
    submissionId: config.submissionId,
    submittedAt: config.submittedAt,
    status: config.status,
  };
}

export const ONBOARDING_SUBMISSIONS: SupplierOnboardingSubmission[] = WORKFLOW_SUPPLIERS.map(
  buildSubmissionFromConfig,
).filter((submission): submission is SupplierOnboardingSubmission => submission !== null);

export function getAllOnboardingSubmissions(): SupplierOnboardingSubmission[] {
  return [...ONBOARDING_SUBMISSIONS];
}

export function getOnboardingSubmissionById(
  submissionId: string,
): SupplierOnboardingSubmission | undefined {
  return ONBOARDING_SUBMISSIONS.find((s) => s.submissionId === submissionId);
}
