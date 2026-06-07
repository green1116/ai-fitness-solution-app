import { isProductionRuntime } from "@/lib/http/productionRouteGuard";

const SENSITIVE_PATTERNS = [
  /prisma\./i,
  /P1001/i,
  /ENOTFOUND/i,
  /tenant\/user/i,
  /stack/i,
  /at\s+\w+\./i,
  /[A-Z]:\\Users\\/i,
  /\/Users\//i,
];

export function sanitizeProductionClientMessage(
  message: string,
  fallback: string,
): string {
  if (!isProductionRuntime()) return message;
  if (SENSITIVE_PATTERNS.some((re) => re.test(message))) return fallback;
  return message;
}

/** 403/4xx/5xx 对外 JSON：生产环境剔除 diagnostic / debug 摘要 */
export function clientErrorExtras(
  extra?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!isProductionRuntime()) return extra;
  if (!extra) return undefined;
  const { diagnostic, allowedReason, winningSource, ...safe } = extra;
  void diagnostic;
  void allowedReason;
  void winningSource;
  return Object.keys(safe).length ? safe : undefined;
}
