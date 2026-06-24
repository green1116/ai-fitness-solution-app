/**
 * V57 P2 — Portal session context (User + Organization + Membership)
 */

import { getCurrentUser } from "@/lib/auth/currentUser";
import { listOrganizationsForUser } from "@/lib/organization/organization.service";
import { getOnboardingProfile } from "./onboarding.store";

export type PortalMembership = {
  id: string;
  role: string;
  organizationId: string;
};

export type PortalUserContext = {
  id: string;
  email: string;
  name: string | null;
  organizationId: string | null;
  membership: PortalMembership | null;
  projectId: string | null;
};

export async function getPortalUserContext(): Promise<PortalUserContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const orgs = await listOrganizationsForUser(user.id);
  const primary = orgs[0];
  const profile = getOnboardingProfile(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    organizationId: primary?.organization.id ?? profile?.organizationId ?? null,
    membership: primary
      ? {
          id: primary.membershipId,
          role: primary.role,
          organizationId: primary.organization.id,
        }
      : null,
    projectId: profile?.projectId ?? null,
  };
}
