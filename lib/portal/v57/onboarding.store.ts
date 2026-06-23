/**
 * V57 P2 — Onboarding profile store (Portal Wiring, no schema change)
 */

export type OnboardingProfile = {
  userId: string;
  organizationId: string;
  company: string;
  industry?: string;
  teamSize?: string;
  budgetRange?: string;
  location?: string;
  projectId?: string;
  updatedAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __portalOnboardingProfiles: Map<string, OnboardingProfile> | undefined;
}

function store(): Map<string, OnboardingProfile> {
  globalThis.__portalOnboardingProfiles ||= new Map();
  return globalThis.__portalOnboardingProfiles;
}

export function saveOnboardingProfile(profile: OnboardingProfile): void {
  store().set(profile.userId, profile);
}

export function getOnboardingProfile(userId: string): OnboardingProfile | undefined {
  return store().get(userId);
}
