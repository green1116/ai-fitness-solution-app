import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";

export const CRM_PLATFORM_MUTATION_BLOCKED_MESSAGE =
  "Platform admin required for CRM mutation";

export function isCrmPlatformMutationAllowed(
  email: string | null | undefined,
): boolean {
  return isPlatformAdminEmail(email);
}
