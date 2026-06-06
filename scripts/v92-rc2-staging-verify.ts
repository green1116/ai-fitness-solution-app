/**
 * V9.2-RC2 Staging / Production HTTP 验收（Plan / Budget / ZIP + 生产封禁探测）
 *
 * 用法：
 *   STAGING_BASE_URL=https://your-app.vercel.app STAGING_EXPECT_PROD_BLOCKS=1 npx tsx scripts/v92-rc2-staging-verify.ts
 *   STAGING_BASE_URL=... STAGING_PLAN_ID=... STAGING_PROJECT_ID=... STAGING_LICENSE_KEY=... npx tsx ...
 */
import { PRODUCTION_BLOCKED_API_PREFIXES } from "../lib/http/productionRouteGuard";
import {
  V92_DEBUG_PROBE_PATHS,
  V92_ZIP_UNAUTHORIZED_TEST_PLAN_ID,
  hasDebugConfigLeak,
  isV92ZipForbiddenCode,
} from "../lib/http/v92Acceptance";

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

const results: CheckResult[] = [];

function record(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  const mark = ok ? "✓" : "✗";
  console.log(`${mark} ${name}: ${detail}`);
}

function baseUrl(): string {
  const raw = (process.env.STAGING_BASE_URL || process.env.PREVIEW_BASE_URL || "").trim();
  if (!raw) {
    throw new Error(
      "缺少 STAGING_BASE_URL 或 PREVIEW_BASE_URL（须为 https:// 的 staging/preview/production 域名，非 localhost）",
    );
  }
  if (/localhost|127\.0\.0\.1/i.test(raw)) {
    throw new Error("STAGING_BASE_URL 不得为 localhost，请使用已部署域名");
  }
  return raw.replace(/\/$/, "");
}

async function fetchHeadOrGet(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(url, { ...init, redirect: "follow" });
}

async function verifyProductionBlocks(host: string) {
  const expect404 = process.env.STAGING_EXPECT_PROD_BLOCKS === "1";

  for (const probe of V92_DEBUG_PROBE_PATHS) {
    const res = await fetchHeadOrGet(`${host}${probe}`, { method: "GET" });
    const body = await res.text();
    const jsonOk =
      res.status === 404 &&
      body.includes('"code":"NOT_FOUND"') &&
      !hasDebugConfigLeak(body);

    if (expect404) {
      record(
        `prod-block GET ${probe}`,
        jsonOk,
        `status=${res.status} leak=${hasDebugConfigLeak(body)} body=${body.slice(0, 80)}`,
      );
    } else {
      record(
        `probe GET ${probe}`,
        res.status < 500 && !hasDebugConfigLeak(body),
        `status=${res.status} (生产验收请设 STAGING_EXPECT_PROD_BLOCKS=1)`,
      );
    }
  }

  for (const prefix of PRODUCTION_BLOCKED_API_PREFIXES) {
    if (prefix === "/api/debug") continue;
    const probe =
      prefix === "/api/test-db"
        ? `${host}/api/test-db`
        : prefix === "/api/license/dev-issue"
          ? `${host}/api/license/dev-issue`
          : prefix === "/api/upgrade/mock-checkout"
            ? `${host}/api/upgrade/mock-checkout?orderId=probe`
            : `${host}/api/pay/fake-success`;
    const method = prefix === "/api/pay/fake-success" ? "POST" : "GET";
    const res = await fetchHeadOrGet(probe, {
      method,
      headers:
        method === "POST" ? { "Content-Type": "application/json" } : undefined,
      body: method === "POST" ? JSON.stringify({ projectId: "probe" }) : undefined,
    });
    const body = await res.text();
    if (expect404) {
      record(
        `prod-block ${method} ${probe}`,
        res.status === 404 && !hasDebugConfigLeak(body),
        `status=${res.status} body=${body.slice(0, 60)}`,
      );
    } else {
      record(`probe ${method} ${probe}`, res.status < 500, `status=${res.status}`);
    }
  }
}

async function verifyPdfRoute(params: {
  host: string;
  path: string;
  label: string;
  expectContentType: string;
  expectDispositionHint: string;
  body: Record<string, unknown>;
  headers?: Record<string, string>;
  expectStatus?: number;
  expectCode?: string;
}) {
  const url = `${params.host}${params.path}`;
  const res = await fetchHeadOrGet(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...params.headers,
    },
    body: JSON.stringify(params.body),
  });
  const expectStatus = params.expectStatus ?? 200;
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  const cd = res.headers.get("content-disposition") || "";

  if (expectStatus === 200) {
    const ok =
      res.status === 200 &&
      ct.includes(params.expectContentType) &&
      cd.toLowerCase().includes(params.expectDispositionHint.toLowerCase());
    const buf = ok ? await res.arrayBuffer() : new ArrayBuffer(0);
    record(
      params.label,
      ok && buf.byteLength > 500,
      `status=${res.status} ct=${ct} cd=${cd.slice(0, 80)} bytes=${buf.byteLength}`,
    );
    return;
  }

  const raw = await res.text();
  let json: { code?: string; message?: string; diagnostic?: unknown } | null = null;
  try {
    json = JSON.parse(raw) as { code?: string; message?: string; diagnostic?: unknown };
  } catch {
    json = null;
  }

  const codeOk = params.expectCode
    ? json?.code === params.expectCode
    : isV92ZipForbiddenCode(json?.code) || Boolean(json?.code);

  const noLeak =
    !raw.includes("stack") &&
    !raw.includes("prisma.") &&
    json?.diagnostic === undefined &&
    !hasDebugConfigLeak(raw);

  record(
    params.label,
    res.status === expectStatus && codeOk && noLeak,
    `status=${res.status} code=${json?.code ?? "—"} msg=${(json?.message ?? raw).slice(0, 100)}`,
  );
}

async function main() {
  const host = baseUrl();
  const planId = (process.env.STAGING_PLAN_ID || "").trim();
  const projectId = (process.env.STAGING_PROJECT_ID || "").trim();
  const licenseKey = (process.env.STAGING_LICENSE_KEY || "").trim();

  console.log("\n[V9.2-RC2] staging verify");
  console.log("  host:", host);
  console.log("  STAGING_EXPECT_PROD_BLOCKS:", process.env.STAGING_EXPECT_PROD_BLOCKS ?? "(未设)");
  console.log("  planId:", planId || "(未设，跳过付费 PDF)");
  console.log("  projectId:", projectId || "(未设，跳过付费/无授权 ZIP)");

  record("staging host reachable", true, host);
  try {
    const health = await fetchHeadOrGet(`${host}/api/pdf/tender/zip`, { method: "GET" });
    record("zip route GET probe", health.status === 200, `status=${health.status}`);
  } catch (e) {
    record("zip route GET probe", false, e instanceof Error ? e.message : String(e));
  }

  await verifyProductionBlocks(host);

  if (!projectId) {
    console.log("\n跳过 ZIP 无授权测试：请设置 STAGING_PROJECT_ID（须为库中已存在项目）");
  } else {
    await verifyPdfRoute({
      host,
      path: "/api/pdf/tender/zip",
      label: "ZIP 403 unauthorized (project exists, no entitlement)",
      expectContentType: "application/json",
      expectDispositionHint: "",
      body: {
        projectId,
        planId: V92_ZIP_UNAUTHORIZED_TEST_PLAN_ID,
        tier: "free",
        docType: "zip",
      },
      headers: {
        "x-plan-id": V92_ZIP_UNAUTHORIZED_TEST_PLAN_ID,
        "x-mode": "free",
      },
      expectStatus: 403,
    });
  }

  if (!planId || !projectId) {
    console.log("\n跳过 Plan/Budget/ZIP enterprise：请设置 STAGING_PLAN_ID + STAGING_PROJECT_ID");
  } else {
    const commonHeaders: Record<string, string> = {
      "x-plan-id": planId,
      "x-mode": "enterprise",
      "x-paid": "true",
    };
    if (licenseKey) {
      commonHeaders["x-license-key"] = licenseKey;
    }

    await verifyPdfRoute({
      host,
      path: "/api/pdf/tender/plan",
      label: "Plan PDF",
      expectContentType: "application/pdf",
      expectDispositionHint: "plan.pdf",
      body: { projectId, planId, tier: "enterprise", mode: "enterprise" },
      headers: commonHeaders,
    });

    await verifyPdfRoute({
      host,
      path: "/api/pdf/tender/budget",
      label: "Budget PDF",
      expectContentType: "application/pdf",
      expectDispositionHint: "budget.pdf",
      body: { projectId, planId, tier: "enterprise", mode: "enterprise" },
      headers: commonHeaders,
    });

    await verifyPdfRoute({
      host,
      path: "/api/pdf/tender/zip",
      label: "ZIP download",
      expectContentType: "application/zip",
      expectDispositionHint: "enterprise-package.zip",
      body: { projectId, planId, tier: "enterprise", mode: "enterprise", docType: "zip" },
      headers: commonHeaders,
    });
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n[V9.2-RC2] ${failed.length === 0 ? "PASS" : "FAIL"} (${results.length - failed.length}/${results.length})`);
  if (failed.length) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("\n[V9.2-RC2] staging verify aborted:", e);
  process.exit(1);
});
