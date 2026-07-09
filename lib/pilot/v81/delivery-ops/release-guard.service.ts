/**
 * V81 — Post-release immutability guards
 */

import type { TenderIntakeSession } from "@/lib/pilot/v80";

export function isIntakeSessionReleased(
  session: Pick<TenderIntakeSession, "signedOff">,
): boolean {
  return session.signedOff === true;
}

export function assertReleasedReadOnly(
  session: TenderIntakeSession,
  operation = "mutate",
): void {
  if (isIntakeSessionReleased(session)) {
    throw new Error(`RELEASE_LOCKED:${operation}`);
  }
}
