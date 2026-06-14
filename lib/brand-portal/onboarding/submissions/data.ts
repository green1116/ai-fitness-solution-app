import { buildBrandOnboardingIntake } from "../intake/builders";
import type { BrandOnboardingSubmission } from "../../shared/types";

const WORKFLOW_BRANDS: Array<{
  brandId: string;
  submissionId: string;
  status: BrandOnboardingSubmission["status"];
  submittedAt: string | null;
}> = [
  {
    brandId: "brand-life-fitness",
    submissionId: "onboarding-life-fitness-001",
    status: "published",
    submittedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    brandId: "brand-technogym",
    submissionId: "onboarding-technogym-001",
    status: "published",
    submittedAt: "2026-06-03T10:00:00.000Z",
  },
  {
    brandId: "brand-matrix",
    submissionId: "onboarding-matrix-001",
    status: "published",
    submittedAt: "2026-06-05T10:00:00.000Z",
  },
  {
    brandId: "brand-relax",
    submissionId: "onboarding-relax-001",
    status: "submitted",
    submittedAt: "2026-06-07T10:00:00.000Z",
  },
  {
    brandId: "brand-shuhua",
    submissionId: "onboarding-shuhua-001",
    status: "published",
    submittedAt: "2026-06-08T10:00:00.000Z",
  },
  {
    brandId: "brand-precor",
    submissionId: "onboarding-precor-001",
    status: "rejected",
    submittedAt: "2026-06-04T10:00:00.000Z",
  },
  {
    brandId: "brand-impulse",
    submissionId: "onboarding-impulse-001",
    status: "published",
    submittedAt: "2026-06-02T10:00:00.000Z",
  },
  {
    brandId: "brand-dhz",
    submissionId: "onboarding-dhz-001",
    status: "approved",
    submittedAt: "2026-06-06T10:00:00.000Z",
  },
];

function buildSubmissionFromConfig(
  config: (typeof WORKFLOW_BRANDS)[number],
): BrandOnboardingSubmission | null {
  const intake = buildBrandOnboardingIntake({ brandId: config.brandId });
  if (!intake) return null;

  return {
    ...intake,
    submissionId: config.submissionId,
    submittedAt: config.submittedAt,
    status: config.status,
  };
}

export const ONBOARDING_SUBMISSIONS: BrandOnboardingSubmission[] = WORKFLOW_BRANDS.map(
  buildSubmissionFromConfig,
).filter((submission): submission is BrandOnboardingSubmission => submission !== null);

export function getAllOnboardingSubmissions(): BrandOnboardingSubmission[] {
  return [...ONBOARDING_SUBMISSIONS];
}

export function getOnboardingSubmissionById(
  submissionId: string,
): BrandOnboardingSubmission | undefined {
  return ONBOARDING_SUBMISSIONS.find((s) => s.submissionId === submissionId);
}
