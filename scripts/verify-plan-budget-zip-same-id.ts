/**
 * 同一 projectId / planId 串行验证 Plan / Budget / ZIP（需 next start 已运行）
 *   $env:VERIFY_BASE_URL="http://127.0.0.1:3099"; npx tsx scripts/verify-plan-budget-zip-same-id.ts
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";

const BASE = (process.env.VERIFY_BASE_URL || "http://127.0.0.1:3099").replace(/\/$/, "");

async function post(
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const ct = res.headers.get("content-type") || "";
  const bytes = res.ok ? (await res.arrayBuffer()).byteLength : 0;
  const err = res.ok ? "" : (await res.text()).slice(0, 200);
  return { path, status: res.status, ct, bytes, err };
}

async function main() {
  let planId = (process.env.VERIFY_PLAN_ID || "").trim();
  let projectId = (process.env.VERIFY_PROJECT_ID || "").trim();

  if (!planId) {
    const paid = await prisma.upgradeOrder.findFirst({
      where: {
        status: { in: ["paid", "paid_confirmed", "completed", "success"] },
        targetLevel: "enterprise",
      },
      orderBy: { createdAt: "desc" },
      select: { planId: true },
    });
    planId = paid?.planId || "ATG-20260601-2501";
  }

  if (!projectId) {
    const proj = await prisma.project.findFirst({
      where: { solution: { isNot: null }, budgets: { some: {} } },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
    projectId = proj?.id || planId;
  }

  const headers = {
    "x-plan-id": planId,
    "x-mode": "enterprise",
    "x-paid": "true",
  };

  console.log("verify @", BASE, { planId, projectId });

  const plan = await post(
    "/api/pdf/tender/plan",
    { projectId, planId, tier: "enterprise", mode: "enterprise" },
    headers,
  );
  console.log(plan);

  const budget = await post(
    "/api/pdf/tender/budget",
    { projectId, planId, tier: "enterprise" },
    headers,
  );
  console.log(budget);

  const zip = await post(
    "/api/pdf/tender/zip",
    { projectId, planId, tier: "enterprise", mode: "enterprise", docType: "zip" },
    headers,
  );
  console.log(zip);

  const ok =
    plan.status === 200 &&
    budget.status === 200 &&
    zip.status === 200 &&
    zip.ct.includes("zip") &&
    !String(zip.err).includes("ZIP_NOT_PURCHASED");

  if (!ok) {
    console.error("\nverify-plan-budget-zip-same-id: FAIL");
    process.exit(1);
  }
  console.log("\nverify-plan-budget-zip-same-id: PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
