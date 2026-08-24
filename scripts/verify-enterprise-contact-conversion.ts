import fs from "node:fs";
import path from "node:path";

import {
  buildEnterpriseContactNote,
  buildTenderUpgradeHref,
  isEnterpriseRegisterHref,
  resolveEnterpriseContactPlanId,
} from "../app/(product)/tender-entitlement";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkPlanIdResolver() {
  assert(
    resolveEnterpriseContactPlanId({ projectId: "p1", organizationId: "o1" }) === "p1",
    "planId prefers projectId",
  );
  assert(
    resolveEnterpriseContactPlanId({ organizationId: "o1" }) === "o1",
    "planId falls back to organizationId",
  );
  assert(resolveEnterpriseContactPlanId({}) === "product-tender", "planId default product-tender");
  console.log("✓ planId resolver");
}

function checkNoteBuilder() {
  const note = buildEnterpriseContactNote(
    { phone: "13800138000", title: "HRD" },
    {
      organizationId: "org1",
      projectId: "proj1",
      quoteId: "q1",
      budgetId: "b1",
    },
  );
  assert(note.includes("手机：13800138000"), "note has phone");
  assert(note.includes("职位：HRD"), "note has title");
  assert(note.includes("organizationId：org1"), "note has org");
  assert(note.includes("projectId：proj1"), "note has project");
  assert(note.includes("quoteId：q1"), "note has quote");
  assert(note.includes("budgetId：b1"), "note has budget");
  assert(note.includes("tender_upgrade"), "note has tender_upgrade");
  console.log("✓ contact note builder");
}

function checkGuestVsAuthHref() {
  const guest = buildTenderUpgradeHref({ projectId: "p1" }, { authenticated: false });
  const auth = buildTenderUpgradeHref(
    { organizationId: "org1", projectId: "p1" },
    { authenticated: true, currentPath: "/budget" },
  );
  assert(isEnterpriseRegisterHref(guest), "guest href is register");
  assert(guest.includes("plan=ENTERPRISE"), "guest keeps ENTERPRISE plan");
  assert(!isEnterpriseRegisterHref(auth), "auth href is not register");
  assert(auth.startsWith("/budget?"), "auth stays on product page");
  assert(!auth.includes("/dashboard"), "auth href avoids dashboard");
  console.log("✓ guest register / auth inline split");
}

function checkCtaReuse() {
  const cta = read("app/(product)/TenderEnterpriseUpgradeCta.tsx");
  assert(cta.includes('"use client"'), "CTA is client for form");
  assert(cta.includes("EnterpriseLeadForm"), "reuses EnterpriseLeadForm");
  assert(cta.includes('/api/lead/create'), "posts to lead create");
  assert(cta.includes("/api/auth/me"), "loads initialEmail from auth/me");
  assert(cta.includes("商务团队将与您联系"), "shows success message");
  assert(cta.includes("submittedRef"), "guards duplicate submit");
  assert(cta.includes("isEnterpriseRegisterHref"), "guest keeps register link");
  assert(!cta.includes("/dashboard"), "CTA has no dashboard target");
  assert(!read("app/api/lead/create/route.ts").includes("tender_upgrade"), "lead API not rewritten");
  console.log("✓ CTA reuse + conversion flow");
}

function checkCallSitesPassContext() {
  for (const file of [
    "app/(product)/ProductCommercialNav.tsx",
    "app/(product)/budget/page.tsx",
    "app/(product)/tender/page.tsx",
    "app/(workspace)/projects/[id]/page.tsx",
  ]) {
    const src = read(file);
    assert(src.includes("context="), `${file} passes commercial context`);
    assert(!/href=["'`]\/dashboard/.test(src), `${file} has no /dashboard href`);
  }
  console.log("✓ call sites pass context");
}

function main() {
  checkPlanIdResolver();
  checkNoteBuilder();
  checkGuestVsAuthHref();
  checkCtaReuse();
  checkCallSitesPassContext();
  console.log("\n✓ enterprise contact conversion — ALL CHECKS PASSED");
}

main();
