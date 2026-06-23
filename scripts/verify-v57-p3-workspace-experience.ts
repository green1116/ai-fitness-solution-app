/**
 * V57 P3 — Workspace Product Experience Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  PRODUCT_ANALYTICS_EVENTS,
  recordProductAnalytics,
  getWorkspaceSummary,
} from "../lib/portal/v57";
import {
  WORKSPACE_DASHBOARD_PATH,
} from "../lib/portal/v57/journey.redirect";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkStructure() {
  const required = [
    "components/workspace/WorkspaceShell.tsx",
    "components/workspace/WorkspaceHeader.tsx",
    "components/workspace/WorkspaceNav.tsx",
    "components/workspace/WorkspaceProvider.tsx",
    "components/workspace/EmptyState.tsx",
    "components/workspace/QuoteResultCard.tsx",
    "components/workspace/WorkspaceDashboardPage.tsx",
    "lib/portal/v57/experience/workspace-summary.service.ts",
    "lib/portal/v57/experience/product-analytics.ts",
    "app/api/workspace/summary/route.ts",
    "app/api/workspace/analytics/route.ts",
    "app/api/workspace/quotes/[quoteId]/route.ts",
    "app/(workspace)/quotes/page.tsx",
    "app/(workspace)/reports/page.tsx",
    "app/(workspace)/settings/page.tsx",
    "app/(workspace)/layout.tsx",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ V57 P3 module structure");
}

function checkNavAndGuard() {
  const nav = fs.readFileSync(path.join(ROOT, "components/workspace/WorkspaceNav.tsx"), "utf8");
  for (const label of ["Overview", "Projects", "Quotes", "Reports", "Settings"]) {
    assert(nav.includes(label), `nav has ${label}`);
  }
  assert(nav.includes("/dashboard"), "nav overview → dashboard");

  const provider = fs.readFileSync(
    path.join(ROOT, "components/workspace/WorkspaceProvider.tsx"),
    "utf8",
  );
  assert(provider.includes("/api/workspace/summary"), "context uses summary API");
  assert(provider.includes("/api/auth/me") === false || provider.includes("/register"), "session guard");

  const dash = fs.readFileSync(path.join(ROOT, "app/dashboard/page.tsx"), "utf8");
  assert(dash.includes("WorkspaceShell"), "dashboard uses shell");
  assert(!dash.includes("attaguy_authed"), "no localStorage auth");

  const quote = fs.readFileSync(path.join(ROOT, "app/(product)/quote/page.tsx"), "utf8");
  assert(!quote.includes("ws-default"), "no ws-default");
  assert(quote.includes("quote_generated"), "quote analytics wired");

  console.log("✓ WORKSPACE_HEADER_NAV_GUARD");
}

function checkAnalytics() {
  assert(PRODUCT_ANALYTICS_EVENTS.length === 6, "6 analytics events");
  for (const ev of [
    "user_signup",
    "workspace_entered",
    "project_created",
    "quote_generated",
    "quote_viewed",
    "pdf_downloaded",
  ]) {
    assert(PRODUCT_ANALYTICS_EVENTS.includes(ev as typeof PRODUCT_ANALYTICS_EVENTS[number]), ev);
  }

  const entry = recordProductAnalytics({ event: "workspace_entered", organizationId: "org-test" });
  assert(entry.event === "workspace_entered", "record analytics");
  console.log("✓ PRODUCT_ANALYTICS_FOUNDATION");
}

function checkExperience() {
  assert(typeof getWorkspaceSummary === "function", "workspace summary service");
  assert(WORKSPACE_DASHBOARD_PATH === "/dashboard", "workspace entry");
  console.log("✓ WORKSPACE_SUMMARY_API");
}

function main() {
  console.log("V57 P3 Workspace Product Experience Verification\n");
  checkStructure();
  checkNavAndGuard();
  checkAnalytics();
  checkExperience();
  console.log("\n✅ V57 P3 Workspace Product Experience verified");
}

main();
