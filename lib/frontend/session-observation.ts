import type { SessionObservation } from "./presentation-guards";

type AuthMeResponse = Readonly<{
  ok?: boolean;
  authenticated?: boolean;
  user?: { id?: string } | null;
  membership?: { id?: string; role?: string; organizationId?: string } | null;
}>;

/**
 * Observe existing auth surface only (`/api/auth/me`).
 * Does not implement a permission engine or Domain authorization.
 *
 * SES-OPS-CAPABLE presentation = authenticated session with membership
 * already presented by the existing auth/org observation payload.
 */
export async function observeSessionPresentation(
  fetcher: typeof fetch = fetch,
): Promise<SessionObservation> {
  try {
    const response = await fetcher("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await response.json()) as AuthMeResponse;
    const presentedSession = Boolean(
      data.ok && data.authenticated && data.user?.id,
    );
    const presentedOpsCapability = Boolean(
      presentedSession && data.membership?.id && data.membership?.organizationId,
    );
    return { presentedSession, presentedOpsCapability };
  } catch {
    return { presentedSession: false, presentedOpsCapability: false };
  }
}
