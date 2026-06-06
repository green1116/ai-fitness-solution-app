/**
 * V9.2-RC2 生产级 E2E（对 NODE_ENV=production 的 next start 实例）
 * 前置：npm run build && $env:NODE_ENV="production"; npx next start -p 3099
 *
 *   $env:E2E_BASE_URL="http://127.0.0.1:3099"; npx tsx scripts/v92-rc2-e2e-production.ts
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";
import {
  V92_DEBUG_PROBE_PATHS,
  V92_ZIP_UNAUTHORIZED_TEST_PLAN_ID,
  hasDebugConfigLeak,
  isV92ZipForbiddenCode,
} from "../lib/http/v92Acceptance";

const BASE = (process.env.E2E_BASE_URL || "http://127.0.0.1:3099").replace(/\/$/, "");

type Row = { name: string; ok: boolean; detail: string };
const rows: Row[] = [];

function log(name: string, ok: boolean, detail: string) {
  rows.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}: ${detail}`);
}

async function post(
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

async function main() {
  console.log("\n[V9.2-RC2] production E2E @", BASE);

  for (const path of V92_DEBUG_PROBE_PATHS) {
    const r = await fetch(`${BASE}${path}`, { method: "GET" }).catch(() => null);
    const body = r ? await r.text() : "";
    const ok =
      r?.status === 404 &&
      body.includes('"code":"NOT_FOUND"') &&
      !hasDebugConfigLeak(body);
    log(`block GET ${path}`, ok, `status=${r?.status ?? 0} leak=${hasDebugConfigLeak(body)}`);
  }
  const blocked: Array<{ path: string; method: "GET" | "POST" }> = [
    { path: "/api/test-db", method: "GET" },
    { path: "/api/license/dev-issue", method: "GET" },
    { path: "/api/upgrade/mock-checkout", method: "GET" },
    { path: "/api/pay/fake-success", method: "POST" },
  ];
  for (const { path, method } of blocked) {
    const r = await fetch(`${BASE}${path}`, {
      method,
      headers: method === "POST" ? { "Content-Type": "application/json" } : {},
      body: method === "POST" ? JSON.stringify({ projectId: "x" }) : undefined,
    }).catch(() => null);
    const body = r ? await r.text() : "";
    log(
      `block ${method} ${path}`,
      r?.status === 404 && !hasDebugConfigLeak(body),
      `status=${r?.status ?? 0}`,
    );
  }

  const zipProbe = await fetch(`${BASE}/api/pdf/tender/zip`, { method: "GET" });
  log("zip GET probe", zipProbe.status === 200, `status=${zipProbe.status}`);

  let planId = (process.env.E2E_PLAN_ID || "").trim();
  let projectId = (process.env.E2E_PROJECT_ID || "").trim();
  let licenseKey = (process.env.E2E_LICENSE_KEY || "").trim();

  if (!planId) {
    const paidEnt = await prisma.upgradeOrder.findFirst({
      where: { status: { in: ["paid", "paid_confirmed", "completed", "success"] }, targetLevel: "enterprise" },
      orderBy: { createdAt: "desc" },
      select: { planId: true },
    });
    planId = paidEnt?.planId || "ATG-20260601-2501";
  }

  if (!projectId) {
    const proj = await prisma.project.findFirst({
      where: { solution: { isNot: null }, budgets: { some: {} } },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
    projectId = proj?.id || planId;
  }

  if (!licenseKey) {
    const lic = await prisma.licenseKey.findFirst({
      where: { planLevel: { in: ["enterprise", "tender"] }, OR: [{ planId }, { planId: null }] },
      orderBy: { createdAt: "desc" },
      select: { id: true, note: true },
    });
    if (lic?.note?.startsWith("order:")) {
      log("license lookup", true, `found license ${lic.id} (use x-license-key from fulfill if available)`);
    }
  }

  const entHeaders: Record<string, string> = {
    "x-plan-id": planId,
    "x-mode": "enterprise",
    "x-paid": "true",
  };
  if (licenseKey) entHeaders["x-license-key"] = licenseKey;

  console.log("\n  planId:", planId, "projectId:", projectId, "hasLicenseKey:", Boolean(licenseKey));

  const planRes = await post(
    "/api/pdf/tender/plan",
    { projectId, planId, tier: "enterprise", mode: "enterprise" },
    entHeaders,
  );
  const planCt = planRes.headers.get("content-type") || "";
  const planCd = planRes.headers.get("content-disposition") || "";
  const planBuf = planRes.ok ? await planRes.arrayBuffer() : new ArrayBuffer(0);
  log(
    "Plan PDF",
    planRes.status === 200 && planCt.includes("pdf") && planCd.includes("plan.pdf") && planBuf.byteLength > 500,
    `status=${planRes.status} ct=${planCt} bytes=${planBuf.byteLength}`,
  );

  const budgetRes = await post(
    "/api/pdf/tender/budget",
    { projectId, planId, tier: "enterprise" },
    entHeaders,
  );
  const budgetCt = budgetRes.headers.get("content-type") || "";
  const budgetCd = budgetRes.headers.get("content-disposition") || "";
  const budgetBuf = budgetRes.ok ? await budgetRes.arrayBuffer() : new ArrayBuffer(0);
  log(
    "Budget PDF",
    budgetRes.status === 200 && budgetCt.includes("pdf") && budgetCd.includes("budget.pdf") && budgetBuf.byteLength > 500,
    `status=${budgetRes.status} ct=${budgetCt} bytes=${budgetBuf.byteLength}`,
  );

  const zipRes = await post(
    "/api/pdf/tender/zip",
    { projectId, planId, tier: "enterprise", mode: "enterprise", docType: "zip" },
    entHeaders,
  );
  const zipCt = zipRes.headers.get("content-type") || "";
  const zipCd = zipRes.headers.get("content-disposition") || "";
  const zipBuf = zipRes.ok ? await zipRes.arrayBuffer() : new ArrayBuffer(0);
  log(
    "ZIP enterprise",
    zipRes.status === 200 && zipCt.includes("zip") && zipCd.includes("enterprise-package.zip") && zipBuf.byteLength > 1000,
    `status=${zipRes.status} ct=${zipCt} cd=${zipCd.slice(0, 60)} bytes=${zipBuf.byteLength}`,
  );

  const zip403 = await post(
    "/api/pdf/tender/zip",
    {
      projectId,
      planId: V92_ZIP_UNAUTHORIZED_TEST_PLAN_ID,
      docType: "zip",
    },
    {
      "x-plan-id": V92_ZIP_UNAUTHORIZED_TEST_PLAN_ID,
      "x-mode": "free",
    },
  );
  const zip403Body = await zip403.text();
  let zip403Json: { code?: string; diagnostic?: unknown } = {};
  try {
    zip403Json = JSON.parse(zip403Body);
  } catch {
    /* */
  }
  const zip403Ok =
    zip403.status === 403 &&
    isV92ZipForbiddenCode(zip403Json.code) &&
    zip403Json.diagnostic === undefined &&
    !zip403Body.includes("stack") &&
    !hasDebugConfigLeak(zip403Body);
  log(
    "ZIP 403 unauthorized (project exists, no binding)",
    zip403Ok,
    `status=${zip403.status} code=${zip403Json.code ?? "-"} projectId=${projectId}`,
  );

  const badProject = await post(
    "/api/pdf/tender/plan",
    { projectId: "nonexistent-project-v92-rc2", planId },
    entHeaders,
  );
  const badBody = await badProject.text();
  log(
    "Plan missing project",
    badProject.status === 404 && !badBody.includes("stack"),
    `status=${badProject.status}`,
  );

  const tokenRes = await fetch(
    `${BASE}/api/download-token?mode=preview&planId=${encodeURIComponent(planId)}`,
  );
  log("preview download-token", tokenRes.status === 200, `status=${tokenRes.status}`);

  const badUnlock = await fetch(
    `${BASE}/api/download-token?mode=pack&planId=${encodeURIComponent(planId)}`,
  );
  log(
    "pack download-token requires unlock",
    badUnlock.status === 403,
    `status=${badUnlock.status}`,
  );

  await prisma.$disconnect();

  const failed = rows.filter((r) => !r.ok);
  console.log(`\n[V9.2-RC2] E2E ${failed.length === 0 ? "PASS" : "FAIL"} (${rows.length - failed.length}/${rows.length})`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
