/**
 * V57 P2 — Onboarding submit + project bootstrap
 */

import { advanceOnboardingStep } from "@/lib/growth/activation/onboarding.flow";
import { recordProjectCreation } from "@/lib/growth/growth.service";
import { createProject } from "@/lib/services/project.service";
import type { PortalUserContext } from "./auth-context";
import { recordProductAnalytics } from "./experience/product-analytics";
import { saveOnboardingProfile, type OnboardingProfile } from "./onboarding.store";
import { resolvePostOnboardingPath } from "./journey.redirect";

export type OnboardingSubmitInput = {
  company: string;
  industry?: string;
  teamSize?: string;
  budgetRange?: string;
  location?: string;
};

export type OnboardingSubmitResult = {
  projectId: string;
  organizationId: string;
  nextPath: string;
  profile: OnboardingProfile;
};

export async function submitOnboarding(
  ctx: PortalUserContext,
  input: OnboardingSubmitInput,
): Promise<OnboardingSubmitResult> {
  if (!ctx.organizationId || !ctx.membership) {
    throw new Error("ORGANIZATION_REQUIRED");
  }

  const company = input.company.trim() || ctx.name || "First Project";
  const project = await createProject({
    name: company,
    clientName: company,
    industry: input.industry,
    city: input.location,
    notes: [input.teamSize, input.budgetRange].filter(Boolean).join(" · ") || undefined,
    organizationId: ctx.organizationId,
  });

  await recordProjectCreation({
    userId: ctx.id,
    organizationId: ctx.organizationId,
    projectId: project.id,
    isFirst: true,
  });

  advanceOnboardingStep(ctx.id, "create_first_project", ctx.organizationId);

  const profile: OnboardingProfile = {
    userId: ctx.id,
    organizationId: ctx.organizationId,
    company,
    industry: input.industry,
    teamSize: input.teamSize,
    budgetRange: input.budgetRange,
    location: input.location,
    projectId: project.id,
    updatedAt: new Date().toISOString(),
  };

  saveOnboardingProfile(profile);

  recordProductAnalytics({
    event: "project_created",
    userId: ctx.id,
    organizationId: ctx.organizationId,
    projectId: project.id,
  });

  return {
    projectId: project.id,
    organizationId: ctx.organizationId,
    nextPath: resolvePostOnboardingPath(project.id),
    profile,
  };
}
