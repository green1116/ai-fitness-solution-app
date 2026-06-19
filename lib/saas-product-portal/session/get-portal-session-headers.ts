import { cookies } from "next/headers";
import { getDefaultMockMembershipUserId } from "@/lib/saas-runtime";

/**
 * P1 session bridge: when an auth session cookie exists, map to V48 mock enterprise headers
 * so /api/saas-product/me can resolve tenant via resolveTenantContext.
 * P2 will replace this with cookie-backed membership resolution.
 */
export async function getPortalSessionHeaders(): Promise<Record<string, string> | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    return null;
  }

  return {
    "x-user-id": getDefaultMockMembershipUserId(),
    "x-user-email": "owner@example.com",
  };
}
