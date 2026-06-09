/**
 * V9.2 RC5 — Plan Free / Pro 商业边界验证
 *   npx tsx scripts/verify-plan-commercial-boundary.ts
 */
import { PDFDocument } from "pdf-lib";
import {
  extractPlanDocumentTierFromRequest,
  resolvePlanDocumentTier,
} from "../lib/commercial/planDocumentTier";
import type { PlanEntitlementSnapshot } from "../lib/entitlements/planEntitlement";
import { createDevProjectFallback } from "../lib/pdf/devFallback";
import { renderPlanPdf } from "../lib/pdf/renderPlanPdf";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function ent(level: PlanEntitlementSnapshot["effectiveLevel"]): PlanEntitlementSnapshot {
  return {
    planId: "test-plan",
    effectiveLevel: level,
    planEnabled: true,
    proEnabled: level !== "free",
    budgetEnabled: level !== "free",
    enterpriseEnabled: level === "enterprise",
    zipEnabled: level === "enterprise",
  };
}

async function countPages(buf: Buffer): Promise<number> {
  const doc = await PDFDocument.load(buf);
  return doc.getPageCount();
}

function verifyTierResolver() {
  const enterprise = ent("enterprise");
  const freeReq = resolvePlanDocumentTier({
    requestedTier: "free",
    entitlement: enterprise,
  });
  assert(freeReq.ok === true && freeReq.renderTier === "free", "enterprise user + free request => free render");

  const proReq = resolvePlanDocumentTier({
    requestedTier: "pro",
    entitlement: enterprise,
  });
  assert(proReq.ok === true && proReq.renderTier === "pro", "enterprise user + pro request => pro render");

  const freeOnly = ent("free");
  const proDenied = resolvePlanDocumentTier({
    requestedTier: "pro",
    entitlement: freeOnly,
  });
  assert(proDenied.ok === false, "free entitlement cannot request pro plan");

  const req = new Request("http://local/api/pdf/tender/plan", {
    method: "POST",
    headers: {
      "x-mode": "enterprise",
      "x-plan-document-tier": "free",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId: "p1",
      planId: "p1",
      documentTier: "free",
      tier: "free",
    }),
  });
  const extracted = extractPlanDocumentTierFromRequest(req, {
    documentTier: "free",
    tier: "free",
  });
  assert(extracted.tier === "free", "body documentTier wins over enterprise header");

  console.log("✓ plan document tier resolver");
}

async function verifyPageCounts() {
  const bundle = createDevProjectFallback("commercial-boundary-test");
  assert(Boolean(bundle.solution), "dev solution");

  const freeBytes = await renderPlanPdf(
    bundle,
    bundle.solution!,
    bundle.placeholders,
    { tier: "free", omitChrome: true },
  );
  const proBytes = await renderPlanPdf(
    bundle,
    bundle.solution!,
    bundle.placeholders,
    { tier: "pro", omitChrome: true },
  );

  const freePages = await countPages(freeBytes);
  const proPages = await countPages(proBytes);

  assert(freePages === 5, `free plan must be 5 pages, got ${freePages}`);
  assert(proPages > 5, `pro plan must exceed 5 pages, got ${proPages}`);
  assert(proPages > freePages, `pro (${proPages}) must be longer than free (${freePages})`);

  console.log("✓ plan page counts", { freePages, proPages });
}

async function main() {
  verifyTierResolver();
  await verifyPageCounts();
  console.log("\nverify-plan-commercial-boundary: PASS");
}

main().catch((e) => {
  console.error("\nverify-plan-commercial-boundary: FAIL");
  console.error(e);
  process.exit(1);
});
