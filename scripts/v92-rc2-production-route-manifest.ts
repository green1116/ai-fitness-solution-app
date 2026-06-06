/**
 * V9.2-RC2：输出生产可访问 API 白名单（下载链路 + 商业化核心）与封禁列表。
 */
import { PRODUCTION_BLOCKED_API_PREFIXES } from "../lib/http/productionRouteGuard";

/** 正式上线必须可达（V9.2 下载与权益） */
export const PRODUCTION_ALLOW_API_ROUTES = [
  "GET/POST /api/pdf/tender/plan",
  "POST /api/pdf/tender/budget",
  "GET/POST /api/pdf/tender/zip",
  "GET /api/entitlements",
  "GET /api/me/entitlements",
  "POST /api/pay/create-order",
  "POST /api/pay/confirm",
  "POST /api/pay/webhook",
  "POST /api/upgrade/create-order",
  "POST /api/upgrade/confirm",
  "GET /api/license/status",
  "POST /api/license/verify",
  "POST /api/download-token",
  "GET /api/auth/me",
  "POST /api/auth/logout",
  "POST /api/auth/email/*",
  "POST /api/tender/generate",
  "GET /api/tender/[projectId]",
] as const;

/** 生产禁止（middleware 404） */
export const PRODUCTION_DENY_API_ROUTES = [...PRODUCTION_BLOCKED_API_PREFIXES] as const;

/** 生产默认关闭或需显式开关 */
export const PRODUCTION_CONDITIONAL_ROUTES = [
  "POST /api/auth/mock-login (ENABLE_MOCK_AUTH=1 only)",
] as const;

function main() {
  console.log("=== V9.2-RC2 Production API Allowlist (download-critical) ===\n");
  for (const r of PRODUCTION_ALLOW_API_ROUTES) {
    console.log(`  ALLOW  ${r}`);
  }
  console.log("\n=== Production API Denylist (middleware → 404) ===\n");
  for (const r of PRODUCTION_DENY_API_ROUTES) {
    console.log(`  DENY   ${r}/*`);
  }
  console.log("\n=== Conditional (not denylisted) ===\n");
  for (const r of PRODUCTION_CONDITIONAL_ROUTES) {
    console.log(`  COND   ${r}`);
  }
}

main();
