/**
 * V9.2-RC2：本地 production 进程下验证 middleware 封禁（需先 npm run build && npm run start）
 *   $env:NODE_ENV="production"; npm run start
 *   npx tsx scripts/v92-rc2-e2e-middleware.ts
 */
import { PRODUCTION_BLOCKED_API_PREFIXES } from "../lib/http/productionRouteGuard";

const BASE = (process.env.E2E_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

async function probe(path: string): Promise<number> {
  const res = await fetch(`${BASE}${path}`, { method: "GET" }).catch(() => null);
  return res?.status ?? 0;
}

async function main() {
  console.log("[V9.2-RC2] middleware E2E @", BASE);
  let fail = 0;
  const paths = [
    "/api/debug/env",
    "/api/test-db",
    "/api/license/dev-issue",
    "/api/upgrade/mock-checkout",
    "/api/pay/fake-success",
  ];
  for (const p of paths) {
    const status = await probe(p);
    const ok = status === 404;
    console.log(`${ok ? "✓" : "✗"} ${p} → ${status}`);
    if (!ok) fail++;
  }
  if (!PRODUCTION_BLOCKED_API_PREFIXES.length) fail++;
  process.exit(fail ? 1 : 0);
}

main();
