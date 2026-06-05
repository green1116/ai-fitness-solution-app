/**
 * V9.2 验收用常量（非产品功能开关）。
 */

/** 无订单、无绑定的 planId，用于 ZIP 403 E2E（配合真实 projectId） */
export const V92_ZIP_UNAUTHORIZED_TEST_PLAN_ID =
  "v92-rc2-zip-unauthorized-test";

/** 合法 ZIP 403 业务码 */
export const V92_ZIP_FORBIDDEN_CODES = [
  "ZIP_NOT_PURCHASED",
  "ZIP_NOT_ENTITLED",
  "ZIP_TIER_INSUFFICIENT",
] as const;

export type V92ZipForbiddenCode = (typeof V92_ZIP_FORBIDDEN_CODES)[number];

export function isV92ZipForbiddenCode(
  code: string | undefined,
): code is V92ZipForbiddenCode {
  return (
    code !== undefined &&
    (V92_ZIP_FORBIDDEN_CODES as readonly string[]).includes(code)
  );
}

/** production 下 debug 探测路径 */
export const V92_DEBUG_PROBE_PATHS = [
  "/api/debug",
  "/api/debug/env",
  "/api/debug/db",
  "/api/debug/session",
  "/api/debug/token",
  "/api/debug/plan",
  "/api/debug/pay-env",
] as const;

/** 生产响应不得出现的调试/配置摘要字段 */
export const V92_DEBUG_LEAK_MARKERS = [
  "PDF_LICENSE_KEYS",
  "PDF_PAYWALL_BYPASS",
  "PAY_WEBHOOK_SECRET",
  "DEFAULT_MAX_DOWNLOADS",
  '"diagnostic"',
] as const;

export function hasDebugConfigLeak(body: string): boolean {
  return V92_DEBUG_LEAK_MARKERS.some((m) => body.includes(m));
}
