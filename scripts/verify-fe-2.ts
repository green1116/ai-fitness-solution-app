/**
 * FE-2 Verification — Entry → Workspace → Results → Library → Ops
 *
 * Checks:
 * - SCR-01…09 render (presentation markup)
 * - Routes match PD-4.2 catalogue
 * - Layouts match PD-3 / FE-1 bindings
 * - No extra screens / layouts beyond frozen set
 * - No business / Domain / API / Persistence ownership in FE-2 screens
 */
import fs from "node:fs";
import path from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { HomepageScreen } from "../components/screens/entry/HomepageScreen";
import { BuilderEntryScreen } from "../components/screens/entry/BuilderEntryScreen";
import { TenderEntryScreen } from "../components/screens/entry/TenderEntryScreen";
import { WorkspaceScreen } from "../components/screens/workspace/WorkspaceScreen";
import { SolutionResultScreen } from "../components/screens/result/SolutionResultScreen";
import { BudgetResultScreen } from "../components/screens/result/BudgetResultScreen";
import { ProjectsScreen } from "../components/screens/library/ProjectsScreen";
import { DocumentsScreen } from "../components/screens/library/DocumentsScreen";
import { AdminDashboardScreen } from "../components/screens/ops/AdminDashboardScreen";
import {
  getScreenLayoutBinding,
  LAYOUT_PATTERN_IDS,
  SCREEN_LAYOUT_BINDINGS,
} from "../lib/frontend/layout-patterns";
import { PRESENTATION_ROUTES } from "../lib/frontend/presentation-routes";
import {
  getGuardsForPath,
  resolvePresentationGuard,
} from "../lib/frontend/presentation-guards";

const ROOT = path.resolve(__dirname, "..");
const SCREENS_DIR = path.join(ROOT, "components", "screens");
const APP_APPLICATION = path.join(ROOT, "app", "(application)");

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

function assertIncludes(label: string, html: string, needles: string[]): void {
  const missing = needles.filter((n) => !html.includes(n));
  if (missing.length > 0) {
    throw new Error(`${label} missing: ${missing.join(", ")}`);
  }
  console.log(`PASS ${label}`);
}

function listFilesRecursive(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(full));
    else out.push(full);
  }
  return out;
}

// --- PD-4.2 expected product screen routes (exclude system /home alias) ---
const EXPECTED_PRODUCT_ROUTES = [
  { path: "/", screenId: "SCR-01", layoutId: "LAY-ENTRY" },
  { path: "/builder", screenId: "SCR-02", layoutId: "LAY-INTAKE" },
  { path: "/tender", screenId: "SCR-03", layoutId: "LAY-INTAKE" },
  { path: "/workspace", screenId: "SCR-04", layoutId: "LAY-SPLIT-3" },
  { path: "/solution", screenId: "SCR-05", layoutId: "LAY-RESULT" },
  { path: "/budget", screenId: "SCR-06", layoutId: "LAY-RESULT" },
  { path: "/projects", screenId: "SCR-07", layoutId: "LAY-LIST" },
  { path: "/documents", screenId: "SCR-08", layoutId: "LAY-LIBRARY" },
  { path: "/admin", screenId: "SCR-09", layoutId: "LAY-OPS" },
] as const;

const EXPECTED_APP_PAGES = [
  "page.tsx", // /
  "builder/page.tsx",
  "tender/page.tsx",
  "workspace/page.tsx",
  "solution/page.tsx",
  "budget/page.tsx",
  "projects/page.tsx",
  "documents/page.tsx",
  "admin/page.tsx",
  "home/page.tsx",
  "404/page.tsx",
  "unavailable/page.tsx",
] as const;

console.log("=== FE-2.1 Entry render ===");
assertIncludes(
  "SCR-01",
  renderToStaticMarkup(createElement(HomepageScreen)),
  ['data-screen="SCR-01"', "LAYCMP-ENTRY", "ACT-01-03", "ACT-01-06"],
);
assertIncludes(
  "SCR-02",
  renderToStaticMarkup(createElement(BuilderEntryScreen)),
  ['data-screen="SCR-02"', "LAYCMP-INTAKE", "ACT-02-03"],
);
assertIncludes(
  "SCR-03",
  renderToStaticMarkup(createElement(TenderEntryScreen)),
  ['data-screen="SCR-03"', "LAYCMP-INTAKE", "ACT-03-01", "ACT-03-03"],
);

console.log("=== FE-2.2 Workspace render ===");
assertIncludes(
  "SCR-04",
  renderToStaticMarkup(
    createElement(WorkspaceScreen, { projectId: "proj-demo" }),
  ),
  [
    'data-screen="SCR-04"',
    "LAYCMP-SPLIT-3",
    "CMP-CONV-PANEL",
    "CMP-TASK-PANEL",
    "CMP-CONTEXT-PANEL",
    "CMP-OUTCOME-LINKS",
    'data-project-cue="present"',
  ],
);

console.log("=== FE-2.3 Results render ===");
assertIncludes(
  "SCR-05",
  renderToStaticMarkup(
    createElement(SolutionResultScreen, { projectId: "proj-demo" }),
  ),
  [
    'data-screen="SCR-05"',
    "LAYCMP-RESULT",
    "CMP-ARTIFACT-ACTIONS",
    "ACT-05-03",
    "ACT-05-05",
  ],
);
assertIncludes(
  "SCR-06",
  renderToStaticMarkup(
    createElement(BudgetResultScreen, { projectId: "proj-demo" }),
  ),
  [
    'data-screen="SCR-06"',
    "LAYCMP-RESULT",
    "CMP-BUDGET-OVERVIEW",
    "CMP-ARTIFACT-ACTIONS",
    "ACT-06-02",
  ],
);

console.log("=== FE-2.4 Library render ===");
assertIncludes(
  "SCR-07",
  renderToStaticMarkup(createElement(ProjectsScreen)),
  [
    'data-screen="SCR-07"',
    "LAYCMP-LIST",
    "CMP-PROJECT-LIST",
    "ACT-07-02",
    "ACT-07-03",
  ],
);
assertIncludes(
  "SCR-08",
  renderToStaticMarkup(
    createElement(DocumentsScreen, {
      projectId: "proj-demo",
      category: "solution",
    }),
  ),
  [
    'data-screen="SCR-08"',
    "LAYCMP-LIBRARY",
    "CMP-DOC-CATEGORIES",
    "CMP-ARTIFACT-ACTIONS",
    "ACT-08-01",
    "ACT-08-06",
  ],
);

console.log("=== FE-2.5 Ops render ===");
assertIncludes(
  "SCR-09",
  renderToStaticMarkup(
    createElement(AdminDashboardScreen, { area: "governance" }),
  ),
  [
    'data-screen="SCR-09"',
    "LAYCMP-OPS",
    "CMP-OPS-AREA",
    "ACT-09-01",
    "ACT-09-06",
    'data-ops-area="governance"',
  ],
);

console.log("=== Routes match PD-4.2 ===");
for (const expected of EXPECTED_PRODUCT_ROUTES) {
  const route = PRESENTATION_ROUTES.find((r) => r.path === expected.path);
  assert(Boolean(route), `missing route ${expected.path}`);
  assert(
    route?.screenId === expected.screenId,
    `${expected.path} screen mismatch`,
  );
  assert(
    route?.layoutId === expected.layoutId,
    `${expected.path} layout mismatch`,
  );
}
const productRoutes = PRESENTATION_ROUTES.filter((r) => r.screenId !== null);
assert(productRoutes.length === 10, `expected 10 product routes (9+home alias), got ${productRoutes.length}`);
const screenIds = new Set(
  productRoutes.map((r) => r.screenId).filter(Boolean),
);
assert(screenIds.size === 9, `expected SCR-01…09 only, got ${[...screenIds]}`);
console.log("PASS PD-4.2 product route catalogue (SCR-01…09)");

console.log("=== Layouts match PD-3 / FE-1 bindings ===");
assert(SCREEN_LAYOUT_BINDINGS.length === 9, "expected 9 screen bindings");
assert(LAYOUT_PATTERN_IDS.length === 7, "expected 7 frozen LAY-* patterns");
for (const expected of EXPECTED_PRODUCT_ROUTES) {
  const binding = getScreenLayoutBinding(expected.screenId);
  assert(
    binding.layoutId === expected.layoutId,
    `${expected.screenId} layout binding mismatch`,
  );
}
console.log("PASS PD-3 layout bindings for SCR-01…09");

console.log("=== No extra application product pages ===");
for (const rel of EXPECTED_APP_PAGES) {
  const full = path.join(APP_APPLICATION, rel);
  assert(fs.existsSync(full), `missing application page ${rel}`);
}
const appPages = listFilesRecursive(APP_APPLICATION).filter((f) =>
  f.endsWith(`${path.sep}page.tsx`),
);
const allowedAppPageEnds = EXPECTED_APP_PAGES.map((p) =>
  path.normalize(path.join(APP_APPLICATION, p)),
);
for (const page of appPages) {
  assert(
    allowedAppPageEnds.includes(path.normalize(page)),
    `extra application page: ${path.relative(ROOT, page)}`,
  );
}
console.log("PASS application pages exactly FE-1/FE-2 set");

console.log("=== No Domain/API/Persistence ownership in FE-2 screens ===");
const forbidden =
  /\b(fetch\s*\(|prisma\b|from\s+["']@\/lib\/(services|product|tender|saas|billing)|["']\/api\/|useRouter\s*\()/;
const screenFiles = listFilesRecursive(SCREENS_DIR).filter((f) =>
  f.endsWith(".tsx"),
);
assert(screenFiles.length > 0, "no screen files found");
const violations: string[] = [];
for (const file of screenFiles) {
  const text = fs.readFileSync(file, "utf8");
  // allow comments mentioning "does not parse" / "API"
  const codeLines = text
    .split("\n")
    .filter((line) => !line.trim().startsWith("*") && !line.trim().startsWith("//"))
    .join("\n");
  if (forbidden.test(codeLines)) {
    violations.push(path.relative(ROOT, file));
  }
}
assert(
  violations.length === 0,
  `business/API ownership in: ${violations.join(", ")}`,
);
console.log(`PASS no business ownership in ${screenFiles.length} screen files`);

console.log("=== GRD-OPS still bound (FE-2.5) ===");
assert(getGuardsForPath("/admin").includes("GRD-OPS"), "GRD-OPS missing");
const denied = resolvePresentationGuard({
  pathname: "/admin",
  session: { presentedSession: true, presentedOpsCapability: false },
});
assert(
  denied.action === "redirect" && denied.reason === "GRD-OPS",
  "GRD-OPS deny failed",
);
console.log("PASS GRD-OPS presentation gate intact");

console.log("\nFE-2 Verification COMPLETE — all checks passed");
