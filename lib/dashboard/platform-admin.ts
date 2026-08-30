/**
 * Fail-closed platform admin gate (ADMIN_EMAILS).
 * Empty or unmatched email => deny.
 */

export function parsePlatformAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  const allow = parsePlatformAdminEmails();
  return allow.length > 0 && allow.includes(email.trim().toLowerCase());
}
