/**
 * V9.1 — /api/pdf/tender/zip 路由与打包管线冒烟验证（无需启动 dev server）
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import JSZip from "jszip";
import { normalizeUserTier } from "../lib/commercial/userTier";
import type { EntitlementDebug } from "../lib/entitlement";
import type { PlanEntitlementSnapshot } from "../lib/entitlements/planEntitlement";
import { evaluateZipAccess, deriveZipPurchaseStatus } from "../lib/entitlements/zipAccess";
import { createDevZipProjectBundle } from "../lib/pdf/devFallback";
import { renderBudgetPdf } from "../lib/pdf/renderBudgetPdf";
import { renderPlanPdf } from "../lib/pdf/renderPlanPdf";
import {
  buildTenderDocumentContext,
  computeTenderPackReqsig,
} from "../lib/pdf/tenderDocumentContext";

function snap(
  level: PlanEntitlementSnapshot["effectiveLevel"],
  planId: string,
): PlanEntitlementSnapshot {
  return {
    planId,
    effectiveLevel: level,
    planEnabled: true,
    proEnabled: level !== "free",
    budgetEnabled: level !== "free",
    enterpriseEnabled: level === "enterprise",
    zipEnabled: level === "enterprise",
  };
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function verifyRouteSource() {
  const routePath = join(
    process.cwd(),
    "app",
    "api",
    "pdf",
    "tender",
    "zip",
    "route.ts",
  );
  const src = readFileSync(routePath, "utf8");
  assert(src.includes('export const runtime = "nodejs"'), "runtime nodejs");
  assert(src.includes("application/zip"), "Content-Type application/zip");
  assert(src.includes("enterprise-package.zip"), "enterprise-package.zip filename");
  assert(src.includes("type: \"nodebuffer\""), "JSZip nodebuffer");
  assert(src.includes("new Uint8Array(zipBuffer)"), "Uint8Array zip body");
  console.log("✓ ZIP route source contract");
}

function verifyZipAccessRules() {
  const env = process.env as Record<string, string | undefined>;
  const prevNodeEnv = env.NODE_ENV;
  const prevDevZipAll = env.DEV_ZIP_ALLOW_ALL;
  const prevDevZipDefault = env.DEV_ZIP_DEFAULT_ALLOW;
  env.NODE_ENV = "production";
  env.DEV_ZIP_ALLOW_ALL = "0";
  env.DEV_ZIP_DEFAULT_ALLOW = "0";

  const planId = "ATG-test-plan";
  const baseDebug = (paid: EntitlementDebug["paidOrders"]): EntitlementDebug => ({
    planId,
    allOrders: [],
    paidOrders: paid,
    orderWinner: paid[0] ?? null,
    licenseWinner: null,
    orderRank: 0,
    licenseRank: 1,
    finalRank: 1,
    finalLevel: "pro",
    winningSource: "license",
    licenseCandidates: [],
    priorityExplanation: "test",
    sourcesDisagree: false,
    policyVersion: "v1-max-order-license",
  });

  const proSnap = snap("pro", planId);
  const proDenied = evaluateZipAccess({
    entitlement: proSnap,
    debug: baseDebug([
      {
        id: "o1",
        status: "paid",
        targetLevel: "pro",
        createdAt: new Date().toISOString(),
      },
    ]),
    planId,
  });
  assert(!proDenied.allowed, "pro paid should not get zip in prod logic");
  assert(proDenied.denyReason === "TIER_INSUFFICIENT", "tier insufficient");
  assert(deriveZipPurchaseStatus(baseDebug([])) === "none", "none purchase");

  const entSnap = snap("enterprise", planId);
  const entAllowed = evaluateZipAccess({
    entitlement: entSnap,
    debug: baseDebug([
      {
        id: "o2",
        status: "paid",
        targetLevel: "enterprise",
        createdAt: new Date().toISOString(),
      },
    ]),
    planId,
  });
  assert(entAllowed.allowed, "enterprise entitled");
  assert(entAllowed.zipFromEntitlement, "zip from entitlement");

  const planScopeDebug: EntitlementDebug = {
    ...baseDebug([]),
    licenseRank: 2,
    finalRank: 2,
    finalLevel: "enterprise",
    winningSource: "license",
    licenseWinner: {
      id: "lic-plan-scope",
      source: "plan-scope",
      level: "enterprise",
      rawPlanLevel: "enterprise",
    },
  };
  const licenseOnlyAllowed = evaluateZipAccess({
    entitlement: entSnap,
    debug: planScopeDebug,
    planId,
  });
  assert(
    licenseOnlyAllowed.allowed,
    "enterprise plan-scope license (zipEnabled) should allow zip without paid order",
  );
  assert(
    licenseOnlyAllowed.allowedReason === "entitlement_zip_enabled",
    "allowed via entitlement snapshot",
  );

  const freeDenied = evaluateZipAccess({
    entitlement: snap("free", planId),
    debug: baseDebug([]),
    planId,
  });
  assert(!freeDenied.allowed, "free tier must not download zip");
  assert(freeDenied.denyReason === "NOT_PURCHASED", "free denied as not purchased");

  if (prevNodeEnv !== undefined) env.NODE_ENV = prevNodeEnv;
  else delete env.NODE_ENV;
  if (prevDevZipAll !== undefined) env.DEV_ZIP_ALLOW_ALL = prevDevZipAll;
  else delete env.DEV_ZIP_ALLOW_ALL;
  if (prevDevZipDefault !== undefined) {
    env.DEV_ZIP_DEFAULT_ALLOW = prevDevZipDefault;
  } else {
    delete env.DEV_ZIP_DEFAULT_ALLOW;
  }

  console.log("✓ ZIP access rules (purchase / tier)");
}

/** Budget 与 ZIP 共用 entitlement 快照：zipEnabled 时 ZIP 必须放行 */
function verifyBudgetZipAlignment() {
  const planId = "align-test-plan";
  const entSnap = snap("enterprise", planId);
  const debug: EntitlementDebug = {
    planId,
    allOrders: [],
    paidOrders: [],
    orderWinner: null,
    licenseWinner: {
      id: "lic-1",
      source: "plan-scope",
      level: "enterprise",
      rawPlanLevel: "enterprise",
    },
    orderRank: 0,
    licenseRank: 2,
    finalRank: 2,
    finalLevel: "enterprise",
    winningSource: "license",
    licenseCandidates: [],
    priorityExplanation: "test",
    sourcesDisagree: false,
    policyVersion: "v1-max-order-license",
  };

  const zipDecision = evaluateZipAccess({
    entitlement: entSnap,
    debug,
    planId,
  });
  if (!entSnap.budgetEnabled || !entSnap.zipEnabled) {
    throw new Error("ASSERT: enterprise snap should enable budget and zip");
  }
  if (!zipDecision.allowed) {
    throw new Error("ASSERT: zipEnabled enterprise must allow ZIP (budget/ZIP alignment)");
  }

  const proSnap = snap("pro", planId);
  const proZip = evaluateZipAccess({
    entitlement: proSnap,
    debug: {
      ...debug,
      licenseRank: 1,
      finalRank: 1,
      finalLevel: "pro",
      licenseWinner: {
        id: "lic-pro",
        source: "plan-scope",
        level: "pro",
        rawPlanLevel: "pro",
      },
    },
    planId,
  });
  if (proSnap.budgetEnabled && proZip.allowed) {
    throw new Error("ASSERT: pro tier must not allow ZIP when zipEnabled is false");
  }

  console.log("✓ Budget / ZIP entitlement alignment");
}

async function verifyPackPipeline() {
  const projectId = "verify-zip-route-project";
  const planId = "attaguy-plan";
  const project = createDevZipProjectBundle(projectId);
  assert(Boolean(project.solution), "solution");
  assert(project.budgets.length > 0, "budget");

  const tier = normalizeUserTier("enterprise");
  const tenderDocument = buildTenderDocumentContext({
    projectId: project.id,
    planId,
    tier,
  });
  const packReqsig = await computeTenderPackReqsig(tenderDocument, {
    budgetLevel: project.budgetLevel,
  });
  const docCtx = { ...tenderDocument, reqsig: packReqsig };

  const planBytes = await renderPlanPdf(
    project,
    project.solution!,
    project.placeholders,
    { tier, tenderDocument: docCtx },
  );
  const budgetBytes = await renderBudgetPdf(project.budgets[0]!, {
    tier,
    planId,
    companyName: project.clientName ?? project.name,
    companySize: project.targetUsers ?? 200,
    budgetLevel: project.budgetLevel,
    tenderDocument: docCtx,
  });

  assert(planBytes.length > 500, "plan pdf size");
  assert(budgetBytes.length > 500, "budget pdf size");

  const zip = new JSZip();
  zip.file("plan.pdf", planBytes);
  zip.file("budget.pdf", budgetBytes);
  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  assert(zipBuffer.length > 1000, "zip size");
  assert(zipBuffer[0] === 0x50 && zipBuffer[1] === 0x4b, "ZIP magic PK");
  console.log("✓ ZIP pack pipeline (dev fallback)");
  console.log("  planBytes:", planBytes.length, "budgetBytes:", budgetBytes.length);
  console.log("  zipBytes:", zipBuffer.length);
}

async function main() {
  verifyRouteSource();
  verifyZipAccessRules();
  verifyBudgetZipAlignment();
  await verifyPackPipeline();
  console.log("\nverify-pdf-tender-zip-route: PASS");
}

main().catch((e) => {
  console.error("\nverify-pdf-tender-zip-route: FAIL");
  console.error(e);
  process.exit(1);
});
