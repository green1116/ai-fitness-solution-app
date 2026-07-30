/**
 * FE-5.1 — Frontend Verification layer.
 * Consolidates FE-1…FE-4 presentation integrity without redesign.
 * Owns no Domain / API / Persistence behavior.
 */
import fs from "node:fs";
import path from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { HomepageScreen } from "@/components/screens/entry/HomepageScreen";
import { BuilderEntryScreen } from "@/components/screens/entry/BuilderEntryScreen";
import { TenderEntryScreen } from "@/components/screens/entry/TenderEntryScreen";
import { WorkspaceScreen } from "@/components/screens/workspace/WorkspaceScreen";
import { SolutionResultScreen } from "@/components/screens/result/SolutionResultScreen";
import { BudgetResultScreen } from "@/components/screens/result/BudgetResultScreen";
import { ProjectsScreen } from "@/components/screens/library/ProjectsScreen";
import { DocumentsScreen } from "@/components/screens/library/DocumentsScreen";
import { AdminDashboardScreen } from "@/components/screens/ops/AdminDashboardScreen";
import {
  assertComponentVerification,
  runComponentVerification,
  type VerificationReport as Fe3VerificationReport,
} from "@/lib/frontend/component-verification";
import {
  assertFe4Verification,
  runFe4Verification,
  type Fe4VerificationReport,
} from "@/lib/frontend/fe4-verification";
import {
  getScreenLayoutBinding,
  LAYOUT_PATTERN_IDS,
  SCREEN_LAYOUT_BINDINGS,
} from "@/lib/frontend/layout-patterns";
import {
  GUARD_ROUTE_RULES,
  PRESENTATION_GUARD_IDS,
  getGuardsForPath,
  resolvePresentationGuard,
} from "@/lib/frontend/presentation-guards";
import { PRESENTATION_ROUTES } from "@/lib/frontend/presentation-routes";
import { STATE_CLASS_IDS } from "@/lib/frontend/state-taxonomy";
import { PRODUCT_CMP_COUNT } from "@/lib/frontend/component-composition";
import {
  INTERACTION_COUNT,
  INTERACTION_IDS,
} from "@/lib/frontend/interaction-wiring";

export type Fe5VerificationCheck = Readonly<{
  id: string;
  source: "FE-1" | "FE-2" | "FE-3" | "FE-4" | "FE-5.1";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type Fe5VerificationReport = Readonly<{
  layer: "FE-5.1";
  passed: boolean;
  checks: readonly Fe5VerificationCheck[];
  children: Readonly<{
    fe3: Fe3VerificationReport;
    fe4: Fe4VerificationReport;
  }>;
  summary: Readonly<{
    routes: number;
    screens: number;
    layouts: number;
    cmpCatalogue: number;
    intCatalogue: number;
    stateClasses: number;
    fe3Checks: number;
    fe4Checks: number;
    scannedFiles: number;
  }>;
}>;

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

const FE1_SHELL_FILES = [
  "components/application-shell/ApplicationShell.tsx",
  "components/application-shell/ApplicationHeader.tsx",
  "components/application-shell/ApplicationFooter.tsx",
  "components/application-shell/ShellContextHost.tsx",
  "components/application-shell/MainContentHost.tsx",
  "components/guards/PresentationGuardHost.tsx",
  "lib/frontend/presentation-routes.ts",
  "lib/frontend/presentation-guards.ts",
  "lib/frontend/layout-patterns.ts",
  "lib/frontend/navigation.ts",
] as const;

const EXPECTED_APP_PAGES = [
  "page.tsx",
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

const OWNERSHIP_SCAN_GLOBS = [
  "components/application-shell",
  "components/guards",
  "components/layout-host",
  "components/navigation",
  "components/screens",
  "components/features",
  "components/presentation",
  "lib/frontend",
] as const;

function check(
  id: string,
  source: Fe5VerificationCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): Fe5VerificationCheck {
  return {
    id,
    source,
    title,
    status: ok ? "PASS" : "FAIL",
    evidence,
  };
}

function resolveRoot(rootDir?: string): string {
  return rootDir ? path.resolve(rootDir) : path.resolve(__dirname, "../..");
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

function scanOwnershipHits(root: string): { hits: string[]; scanned: number } {
  const hits: string[] = [];
  let scanned = 0;
  const domainImport =
    /from\s+["']@\/lib\/(services|product|tender|saas|billing|operations|persistence)/;
  const engineCall =
    /\b(evaluatePermission|checkEntitlement|hasRole)\s*\(/;
  const skipRel =
    /(?:^|\/)(?:frontend-verification|fe4-verification|component-verification)\.ts$/;

  for (const rel of OWNERSHIP_SCAN_GLOBS) {
    const abs = path.join(root, rel);
    const files = listFilesRecursive(abs).filter(
      (f) => f.endsWith(".ts") || f.endsWith(".tsx"),
    );
    for (const file of files) {
      const relFile = path.relative(root, file).replace(/\\/g, "/");
      if (skipRel.test(relFile)) continue;
      scanned += 1;
      const text = fs.readFileSync(file, "utf8");
      const codeLines = text
        .split("\n")
        .filter(
          (line) =>
            !line.trim().startsWith("*") && !line.trim().startsWith("//"),
        )
        .join("\n");

      if (domainImport.test(codeLines) || engineCall.test(codeLines)) {
        hits.push(`${relFile}:domain-or-engine`);
      }
      if (
        relFile !== "lib/frontend/session-observation.ts" &&
        /\bfetch\s*\(/.test(codeLines)
      ) {
        hits.push(`${relFile}:fetch`);
      }
      if (
        relFile !== "lib/frontend/state-taxonomy.ts" &&
        /^export const STATE_CLASS_IDS\b/m.test(text)
      ) {
        hits.push(`${relFile}:taxonomy-redefine`);
      }
    }
  }
  return { hits, scanned };
}

function renderScreenHtml(): Record<string, string> {
  return {
    "SCR-01": renderToStaticMarkup(createElement(HomepageScreen)),
    "SCR-02": renderToStaticMarkup(createElement(BuilderEntryScreen)),
    "SCR-03": renderToStaticMarkup(createElement(TenderEntryScreen)),
    "SCR-04": renderToStaticMarkup(
      createElement(WorkspaceScreen, { projectId: "proj-demo" }),
    ),
    "SCR-05": renderToStaticMarkup(
      createElement(SolutionResultScreen, { projectId: "proj-demo" }),
    ),
    "SCR-06": renderToStaticMarkup(
      createElement(BudgetResultScreen, { projectId: "proj-demo" }),
    ),
    "SCR-07": renderToStaticMarkup(createElement(ProjectsScreen)),
    "SCR-08": renderToStaticMarkup(
      createElement(DocumentsScreen, {
        projectId: "proj-demo",
        category: "solution",
      }),
    ),
    "SCR-09": renderToStaticMarkup(
      createElement(AdminDashboardScreen, { area: "governance" }),
    ),
  };
}

export function runFrontendVerification(
  rootDir?: string,
): Fe5VerificationReport {
  const root = resolveRoot(rootDir);
  const checks: Fe5VerificationCheck[] = [];

  // --- FE-1 Foundation ---
  const missingShell = FE1_SHELL_FILES.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "FE1-SHELL",
      "FE-1",
      "Application shell / routes / guards foundation files present",
      missingShell.length === 0,
      missingShell.length ? missingShell.join(",") : `files=${FE1_SHELL_FILES.length}`,
    ),
  );

  checks.push(
    check(
      "FE1-ROUTES",
      "FE-1",
      "PD-4.2 presentation route catalogue intact",
      PRESENTATION_ROUTES.length >= 12 &&
        EXPECTED_PRODUCT_ROUTES.every((expected) =>
          PRESENTATION_ROUTES.some(
            (r) =>
              r.path === expected.path &&
              r.screenId === expected.screenId &&
              r.layoutId === expected.layoutId,
          ),
        ),
      `routes=${PRESENTATION_ROUTES.length}`,
    ),
  );

  checks.push(
    check(
      "FE1-GUARDS-LAYOUTS",
      "FE-1",
      "GRD-* catalogue + LAY-* screen bindings intact",
      PRESENTATION_GUARD_IDS.length === 5 &&
        GUARD_ROUTE_RULES.length === 12 &&
        SCREEN_LAYOUT_BINDINGS.length === 9 &&
        LAYOUT_PATTERN_IDS.length === 7 &&
        getGuardsForPath("/admin").includes("GRD-OPS") &&
        getGuardsForPath("/builder").includes("GRD-SESSION"),
      `guards=${PRESENTATION_GUARD_IDS.length} layouts=${LAYOUT_PATTERN_IDS.length} bindings=${SCREEN_LAYOUT_BINDINGS.length}`,
    ),
  );

  const opsDenied = resolvePresentationGuard({
    pathname: "/admin",
    session: { presentedSession: true, presentedOpsCapability: false },
  });
  checks.push(
    check(
      "FE1-GRD-OPS",
      "FE-1",
      "GRD-OPS presentation gate still denies without ops capability",
      opsDenied.action === "redirect" && opsDenied.reason === "GRD-OPS",
      `action=${opsDenied.action}`,
    ),
  );

  // --- FE-2 Screens ---
  const htmlByScreen = renderScreenHtml();
  const screenMarkers: Record<string, string[]> = {
    "SCR-01": ['data-screen="SCR-01"', "LAYCMP-ENTRY"],
    "SCR-02": ['data-screen="SCR-02"', "LAYCMP-INTAKE"],
    "SCR-03": ['data-screen="SCR-03"', "LAYCMP-INTAKE"],
    "SCR-04": ['data-screen="SCR-04"', "LAYCMP-SPLIT-3", "CMP-CONV-PANEL"],
    "SCR-05": ['data-screen="SCR-05"', "LAYCMP-RESULT", "CMP-ARTIFACT-ACTIONS"],
    "SCR-06": ['data-screen="SCR-06"', "LAYCMP-RESULT", "CMP-BUDGET-OVERVIEW"],
    "SCR-07": ['data-screen="SCR-07"', "LAYCMP-LIST", "CMP-PROJECT-LIST"],
    "SCR-08": ['data-screen="SCR-08"', "LAYCMP-LIBRARY", "CMP-DOC-CATEGORIES"],
    "SCR-09": ['data-screen="SCR-09"', "LAYCMP-OPS", "CMP-OPS-AREA"],
  };
  const screenFailures: string[] = [];
  for (const [screenId, needles] of Object.entries(screenMarkers)) {
    const html = htmlByScreen[screenId] ?? "";
    const missing = needles.filter((n) => !html.includes(n));
    if (missing.length) screenFailures.push(`${screenId}:{${missing.join("|")}}`);
  }
  checks.push(
    check(
      "FE2-SCREENS",
      "FE-2",
      "SCR-01…09 render with PD-3/PD-4 layout hosts",
      screenFailures.length === 0,
      screenFailures.length ? screenFailures.join(",") : "screens=9",
    ),
  );

  const layoutOk = EXPECTED_PRODUCT_ROUTES.every((expected) => {
    const binding = getScreenLayoutBinding(expected.screenId);
    return binding.layoutId === expected.layoutId;
  });
  checks.push(
    check(
      "FE2-LAYOUT-BIND",
      "FE-2",
      "Screen → LAY-* bindings match FE-1 / PD-3",
      layoutOk,
      `bindings=${SCREEN_LAYOUT_BINDINGS.length}`,
    ),
  );

  const appRoot = path.join(root, "app", "(application)");
  const missingPages = EXPECTED_APP_PAGES.filter(
    (rel) => !fs.existsSync(path.join(appRoot, rel)),
  );
  checks.push(
    check(
      "FE2-APP-PAGES",
      "FE-2",
      "Application pages match frozen FE-1/FE-2 set",
      missingPages.length === 0,
      missingPages.length ? missingPages.join(",") : `pages=${EXPECTED_APP_PAGES.length}`,
    ),
  );

  // --- FE-3 Component Composition (reuse FE-3.3) ---
  const fe3 = runComponentVerification(root);
  checks.push(
    check(
      "FE3-COMPOSITION",
      "FE-3",
      "FE-3.3 component verification intact",
      fe3.passed &&
        fe3.summary.cmpCatalogue === 26 &&
        fe3.summary.intCatalogue === INTERACTION_IDS.length,
      `passed=${fe3.passed} cmp=${fe3.summary.cmpCatalogue} int=${fe3.summary.intCatalogue} checks=${fe3.checks.length}`,
    ),
  );

  // --- FE-4 Verification Consolidation (reuse FE-4.5) ---
  const fe4 = runFe4Verification();
  checks.push(
    check(
      "FE4-CONSOLIDATION",
      "FE-4",
      "FE-4.5 state/adapter/security/performance consolidation intact",
      fe4.passed &&
        fe4.summary.stateClasses === 7 &&
        fe4.summary.adapterBindings === 47,
      `passed=${fe4.passed} ST=${fe4.summary.stateClasses} bindings=${fe4.summary.adapterBindings} checks=${fe4.checks.length}`,
    ),
  );

  // --- FE-5.1 cross ---
  checks.push(
    check(
      "X-TAXONOMY",
      "FE-5.1",
      "No new state taxonomy beyond FE-4.1 lock",
      STATE_CLASS_IDS.length === 7,
      `STATE_CLASS_IDS=${STATE_CLASS_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "X-CATALOGUES",
      "FE-5.1",
      "Frozen CMP / INT / SCR catalogues remain closed",
      PRODUCT_CMP_COUNT === 26 &&
        INTERACTION_COUNT === 25 &&
        SCREEN_LAYOUT_BINDINGS.length === 9,
      `CMP=${PRODUCT_CMP_COUNT} INT=${INTERACTION_COUNT} SCR=${SCREEN_LAYOUT_BINDINGS.length}`,
    ),
  );

  const ownership = scanOwnershipHits(root);
  checks.push(
    check(
      "NO-BIZ-LOGIC",
      "FE-5.1",
      "No Domain/API/Persistence ownership across FE presentation surfaces",
      ownership.hits.length === 0,
      ownership.hits.length
        ? ownership.hits.slice(0, 12).join(",")
        : `scanned=${ownership.scanned} files`,
    ),
  );

  const childScripts = [
    "scripts/verify-fe-2.ts",
    "scripts/verify-fe-3.3-component-verification.ts",
    "scripts/verify-fe-4.ts",
    "scripts/verify-fe-4.5.ts",
  ];
  const missingScripts = childScripts.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "CHILD-EVIDENCE",
      "FE-5.1",
      "FE-2 / FE-3.3 / FE-4 evidence scripts present",
      missingScripts.length === 0,
      missingScripts.length ? missingScripts.join(",") : childScripts.join(","),
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "FE-5.1",
    passed,
    checks,
    children: { fe3, fe4 },
    summary: {
      routes: PRESENTATION_ROUTES.length,
      screens: EXPECTED_PRODUCT_ROUTES.length,
      layouts: LAYOUT_PATTERN_IDS.length,
      cmpCatalogue: PRODUCT_CMP_COUNT,
      intCatalogue: INTERACTION_COUNT,
      stateClasses: STATE_CLASS_IDS.length,
      fe3Checks: fe3.checks.length,
      fe4Checks: fe4.checks.length,
      scannedFiles: ownership.scanned,
    },
  };
}

export function assertFrontendVerification(
  report: Fe5VerificationReport = runFrontendVerification(),
): Fe5VerificationReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `FE-5.1 verification failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  // Keep child assert helpers available for strict reuse paths.
  assertComponentVerification(report.children.fe3);
  assertFe4Verification(report.children.fe4);
  return report;
}
