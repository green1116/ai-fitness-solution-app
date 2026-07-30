import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AdminDashboardScreen } from "../components/screens/ops/AdminDashboardScreen";
import { getScreenLayoutBinding } from "../lib/frontend/layout-patterns";
import { buildAdminHref, OPS_AREA_IDS } from "../lib/frontend/navigation";
import {
  getGuardsForPath,
  resolvePresentationGuard,
} from "../lib/frontend/presentation-guards";
import { PRESENTATION_ROUTES } from "../lib/frontend/presentation-routes";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function assertIncludes(label: string, html: string, needles: string[]) {
  const missing = needles.filter((n) => !html.includes(n));
  if (missing.length > 0) {
    throw new Error(`${label} missing: ${missing.join(", ")}`);
  }
  console.log(`PASS ${label}`);
}

const markup = renderToStaticMarkup(
  createElement(AdminDashboardScreen, { area: "organizations" }),
);
assertIncludes("SCR-09 markup", markup, [
  'data-screen="SCR-09"',
  'data-layout="LAY-OPS"',
  "LAYCMP-OPS",
  "CMP-OPS-AREA",
  "ACT-09-01",
  "ACT-09-02",
  "ACT-09-03",
  "ACT-09-04",
  "ACT-09-05",
  "ACT-09-06",
  'data-ops-area="organizations"',
  'data-ops-area="users"',
  'data-ops-area="usage"',
  'data-ops-area="security"',
  'data-ops-area="governance"',
]);

const route = PRESENTATION_ROUTES.find((r) => r.path === "/admin");
assert(Boolean(route), "RT-ADMIN missing");
assert(route?.screenId === "SCR-09", "route screen mismatch");
assert(route?.layoutId === "LAY-OPS", "route layout mismatch");
console.log("PASS route /admin → SCR-09/LAY-OPS");

const binding = getScreenLayoutBinding("SCR-09");
assert(binding.layoutId === "LAY-OPS", "layout binding mismatch");
assert(binding.shellMode === "ops", "shell mode mismatch");
assert(binding.layoutHostId === "LAYCMP-OPS", "layout host mismatch");
console.log("PASS layout binding SCR-09 → LAY-OPS / ops");

const guards = getGuardsForPath("/admin");
assert(guards.includes("GRD-OPS"), "GRD-OPS not bound to /admin");
const denied = resolvePresentationGuard({
  pathname: "/admin",
  session: { presentedSession: true, presentedOpsCapability: false },
});
assert(
  denied.action === "redirect" && denied.reason === "GRD-OPS",
  "GRD-OPS should redirect without ops capability",
);
const allowed = resolvePresentationGuard({
  pathname: "/admin",
  session: { presentedSession: true, presentedOpsCapability: true },
});
assert(allowed.action === "allow", "GRD-OPS should allow ops-capable session");
console.log("PASS GRD-OPS reused for /admin");

assert(OPS_AREA_IDS.length === 5, "expected five ops areas");
assert(
  buildAdminHref("security") === "/admin?area=security",
  "admin area href failed",
);
assert(buildAdminHref() === "/admin", "admin bare href failed");
console.log("PASS ops area catalogue + href helper");

console.log("FE-2.5 ops screen verification complete");
