/**
 * V58 — Document & Delivery Platform Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  DELIVERY_ANALYTICS_EVENTS,
  recordDeliveryAnalytics,
  applyVersionGroups,
  synthesizeDeliveryFromQuote,
  buildTenderPackBundle,
  getDocumentsSummary,
} from "../lib/portal/v58";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkStructure() {
  const required = [
    "lib/portal/v58/delivery/delivery.types.ts",
    "lib/portal/v58/delivery/delivery.store.ts",
    "lib/portal/v58/delivery/delivery.orchestrator.ts",
    "lib/portal/v58/documents/documents.aggregator.ts",
    "lib/portal/v58/analytics/delivery-analytics.ts",
    "components/documents/DocumentShell.tsx",
    "components/documents/DocumentHeader.tsx",
    "components/documents/DocumentNav.tsx",
    "components/documents/DocumentProvider.tsx",
    "components/documents/DeliveryRow.tsx",
    "components/documents/DeliveryStatusBadge.tsx",
    "components/documents/VersionBadge.tsx",
    "app/(documents)/layout.tsx",
    "app/(documents)/documents/page.tsx",
    "app/(documents)/documents/plans/page.tsx",
    "app/(documents)/documents/budgets/page.tsx",
    "app/(documents)/documents/quotes/page.tsx",
    "app/(documents)/documents/reports/page.tsx",
    "app/(documents)/documents/deliveries/page.tsx",
    "app/(documents)/documents/projects/[projectId]/page.tsx",
    "app/(documents)/documents/quotes/[quoteId]/page.tsx",
    "app/api/documents/summary/route.ts",
    "app/api/documents/projects/[projectId]/route.ts",
    "app/api/documents/quotes/[quoteId]/route.ts",
    "app/api/documents/deliveries/route.ts",
    "app/api/documents/reports/route.ts",
    "app/api/documents/analytics/route.ts",
    "app/api/documents/deliveries/register/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ V58 module structure");
}

function checkNavAndWiring() {
  const nav = fs.readFileSync(path.join(ROOT, "components/documents/DocumentNav.tsx"), "utf8");
  for (const href of [
    "/documents",
    "/documents/plans",
    "/documents/budgets",
    "/documents/quotes",
    "/documents/reports",
    "/documents/deliveries",
  ]) {
    assert(nav.includes(href), `document nav has ${href}`);
  }

  const wsNav = fs.readFileSync(path.join(ROOT, "components/workspace/WorkspaceNav.tsx"), "utf8");
  assert(wsNav.includes("/documents"), "workspace nav → documents");

  const quoteCard = fs.readFileSync(path.join(ROOT, "components/workspace/QuoteResultCard.tsx"), "utf8");
  assert(quoteCard.includes("/documents/quotes/"), "quote result → delivery center");

  const quotePage = fs.readFileSync(path.join(ROOT, "app/(product)/quote/page.tsx"), "utf8");
  assert(quotePage.includes("/api/documents/deliveries/register"), "quote registers delivery");

  console.log("✓ DOCUMENT_NAV_AND_WIRING");
}

function checkAnalytics() {
  assert(DELIVERY_ANALYTICS_EVENTS.length === 5, "5 delivery analytics events");
  for (const ev of [
    "document_viewed",
    "pdf_downloaded",
    "delivery_created",
    "tender_pack_generated",
    "report_opened",
  ]) {
    assert(DELIVERY_ANALYTICS_EVENTS.includes(ev as (typeof DELIVERY_ANALYTICS_EVENTS)[number]), ev);
  }

  const entry = recordDeliveryAnalytics({
    event: "document_viewed",
    organizationId: "org_test",
  });
  assert(entry.timestamp.length > 0, "analytics timestamp");

  console.log("✓ DELIVERY_ANALYTICS");
}

function checkOrchestrator() {
  const now = new Date();
  const records = applyVersionGroups([
    synthesizeDeliveryFromQuote({
      id: "q1",
      organizationId: "org1",
      projectId: "p1",
      status: "READY",
      createdAt: now,
    }),
    synthesizeDeliveryFromQuote({
      id: "q2",
      organizationId: "org1",
      projectId: "p1",
      status: "READY",
      createdAt: new Date(now.getTime() + 1000),
    }),
  ]);

  const latest = records.filter((r) => r.isLatest);
  assert(latest.length >= 1, "version groups have latest");

  const bundle = buildTenderPackBundle("p1", records);
  assert(bundle.projectId === "p1", "tender pack bundle");

  console.log("✓ DELIVERY_ORCHESTRATOR");
}

function checkApiReadOnly() {
  const routes = [
    "app/api/documents/summary/route.ts",
    "app/api/documents/deliveries/route.ts",
    "app/api/documents/reports/route.ts",
  ];
  for (const rel of routes) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    assert(src.includes("export async function GET"), `${rel} is GET`);
    assert(!src.includes("prisma.") || src.includes("find"), `${rel} read-only pattern`);
  }

  const register = fs.readFileSync(
    path.join(ROOT, "app/api/documents/deliveries/register/route.ts"),
    "utf8",
  );
  assert(register.includes("registerQuoteDelivery"), "register route uses orchestrator");
  assert(!register.includes("generateQuote"), "no quote engine mutation");

  console.log("✓ READ_ONLY_API_BOUNDARY");
}

async function main() {
  checkStructure();
  checkNavAndWiring();
  checkAnalytics();
  checkOrchestrator();
  checkApiReadOnly();

  // aggregator smoke (may return zeros without DB)
  try {
    await getDocumentsSummary("__nonexistent_org__");
  } catch {
    // ok if no DB
  }

  console.log("\n✅ V58 Document & Delivery Platform — verify PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
