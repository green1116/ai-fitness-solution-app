/**
 * V9.2-RC2：生产环境禁止访问的诊断/测试 API。
 * middleware 与单路由均可复用。
 *
 * 判定顺序（请求时，避免 build 时 NODE_ENV 被内联）：
 * 1. ALLOW_DEBUG_API=1 → 不封禁（仅 staging/preview 显式配置）
 * 2. VERCEL_ENV=preview|development → 不封禁
 * 3. VERCEL_ENV=production → 封禁
 * 4. NODE_ENV=production（本地 next start）→ 封禁
 */
import { NextResponse } from "next/server";

/** 生产环境一律 404（不暴露路由是否存在） */
export const PRODUCTION_BLOCKED_API_PREFIXES = [
  "/api/debug",
  "/api/test-db",
  "/api/license/dev-issue",
  "/api/upgrade/mock-checkout",
  "/api/pay/fake-success",
] as const;

function readEnv(name: string): string {
  return String(process.env[name] ?? "").trim();
}

/** 请求时读取，避免 webpack DefinePlugin 将 NODE_ENV 固化为 build 时常量 */
function readNodeEnv(): string {
  const key = ["NODE", "ENV"].join("_");
  return String(process.env[key] ?? "").trim();
}

export function isProductionRuntime(): boolean {
  if (readEnv("ALLOW_DEBUG_API") === "1") return false;

  const vercel = readEnv("VERCEL_ENV");
  if (vercel === "preview" || vercel === "development") return false;
  if (vercel === "production") return true;

  return readNodeEnv() === "production";
}

export function isBlockedProductionApiPath(pathname: string): boolean {
  if (!isProductionRuntime()) return false;
  const p = pathname.split("?")[0] ?? pathname;
  return PRODUCTION_BLOCKED_API_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`),
  );
}

export function productionBlockedResponse(): NextResponse {
  return NextResponse.json(
    { ok: false, code: "NOT_FOUND", message: "Not Found" },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}

/** /api/debug/* handler 兜底 */
export function blockDebugInProduction(): NextResponse | null {
  if (!isProductionRuntime()) return null;
  return productionBlockedResponse();
}

/** 路由 handler 入口兜底（middleware 未命中时） */
export function guardProductionApiRoute(pathname: string): NextResponse | null {
  if (isBlockedProductionApiPath(pathname)) {
    return productionBlockedResponse();
  }
  return null;
}
