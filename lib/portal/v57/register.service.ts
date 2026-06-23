/**
 * V57 P2 — Register completion (User + Organization + Membership)
 */

import { normalizeEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { trackSignup } from "@/lib/growth/analytics.events";
import { recordProductAnalytics } from "./experience/product-analytics";
import { advanceOnboardingStep } from "@/lib/growth/activation/onboarding.flow";
import {
  createOrganization,
  listOrganizationsForUser,
} from "@/lib/organization/organization.service";

export type RegisterCompletionResult = {
  user: { id: string; email: string; name: string | null };
  organizationId: string;
  membership: { role: string };
  isNewOrganization: boolean;
};

export async function completeRegistration(input: {
  email: string;
  companyName: string;
}): Promise<RegisterCompletionResult> {
  const email = normalizeEmail(input.email);
  const companyName = input.companyName.trim() || "My Organization";

  if (!email.includes("@")) {
    throw new Error("INVALID_EMAIL");
  }

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: companyName },
    update: { name: companyName },
    select: { id: true, email: true, name: true },
  });

  const existingOrgs = await listOrganizationsForUser(user.id);

  if (existingOrgs.length > 0) {
    const primary = existingOrgs[0]!;
    return {
      user,
      organizationId: primary.organization.id,
      membership: { role: primary.role },
      isNewOrganization: false,
    };
  }

  const organization = await createOrganization({
    name: companyName,
    ownerUserId: user.id,
  });

  advanceOnboardingStep(user.id, "create_account");
  advanceOnboardingStep(user.id, "create_organization", organization.id);
  trackSignup({ userId: user.id, source: "register" });
  recordProductAnalytics({
    event: "user_signup",
    userId: user.id,
    organizationId: organization.id,
  });

  return {
    user,
    organizationId: organization.id,
    membership: { role: "OWNER" },
    isNewOrganization: true,
  };
}
