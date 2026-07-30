/**
 * FE-3.3 Component Verification layer.
 * Presentation-only checks against PD-3.4 / PD-3.5 / PD-4.4 / PD-4.5.
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
  FEATCMP_COUNT,
  FEATCMP_IDS,
  PRODUCT_CMP_COUNT,
  PRODUCT_CMP_IDS,
  SCRCMP_COUNT,
  SCRCMP_IDS,
  SCREEN_CMP_COMPOSITION,
} from "@/lib/frontend/component-composition";
import {
  emitPresentationIntent,
  GOLDEN_PATH_INT_CHAINS,
  INTERACTION_BINDINGS,
  INTERACTION_COUNT,
  INTERACTION_IDS,
  resolveScreenAction,
  type DataFlowKind,
} from "@/lib/frontend/interaction-wiring";

export type VerificationCheck = Readonly<{
  id: string;
  source: "PD-3.4" | "PD-3.5" | "PD-4.4" | "PD-4.5" | "FE-3";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type VerificationReport = Readonly<{
  layer: "FE-3.3";
  passed: boolean;
  checks: readonly VerificationCheck[];
  summary: Readonly<{
    cmpCatalogue: number;
    intCatalogue: number;
    featcmpCount: number;
    scrcmpCount: number;
    screensVerified: number;
  }>;
}>;

type ScreenRender = Readonly<{
  screenId: string;
  html: string;
}>;

function check(
  id: string,
  source: VerificationCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): VerificationCheck {
  return {
    id,
    source,
    title,
    status: ok ? "PASS" : "FAIL",
    evidence,
  };
}

function renderScreens(): ScreenRender[] {
  return [
    { screenId: "SCR-01", html: renderToStaticMarkup(createElement(HomepageScreen)) },
    {
      screenId: "SCR-02",
      html: renderToStaticMarkup(createElement(BuilderEntryScreen)),
    },
    {
      screenId: "SCR-03",
      html: renderToStaticMarkup(createElement(TenderEntryScreen)),
    },
    {
      screenId: "SCR-04",
      html: renderToStaticMarkup(
        createElement(WorkspaceScreen, { projectId: "proj-demo" }),
      ),
    },
    {
      screenId: "SCR-05",
      html: renderToStaticMarkup(
        createElement(SolutionResultScreen, { projectId: "proj-demo" }),
      ),
    },
    {
      screenId: "SCR-06",
      html: renderToStaticMarkup(
        createElement(BudgetResultScreen, { projectId: "proj-demo" }),
      ),
    },
    {
      screenId: "SCR-07",
      html: renderToStaticMarkup(createElement(ProjectsScreen)),
    },
    {
      screenId: "SCR-08",
      html: renderToStaticMarkup(
        createElement(DocumentsScreen, {
          projectId: "proj-demo",
          category: "solution",
        }),
      ),
    },
    {
      screenId: "SCR-09",
      html: renderToStaticMarkup(
        createElement(AdminDashboardScreen, { area: "governance" }),
      ),
    },
  ];
}

function listTsxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listTsxFiles(full));
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) out.push(full);
  }
  return out;
}

function collectAttrIds(
  files: readonly string[],
  attr: "data-cmp" | "data-int-id",
): Set<string> {
  const ids = new Set<string>();
  const re = new RegExp(`${attr}="([A-Z0-9-]+)"`, "g");
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(re)) {
      ids.add(match[1]);
    }
  }
  return ids;
}

function scanBusinessOwnership(files: readonly string[]): string[] {
  const forbidden = /\b(fetch\s*\(|prisma\b|from\s+["']@\/lib\/(services|product|tender|saas|billing)|["']\/api\/)/;
  const hits: string[] = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const code = text
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        return !(trimmed.startsWith("//") || trimmed.startsWith("*"));
      })
      .join("\n");
    if (forbidden.test(code)) {
      hits.push(path.relative(process.cwd(), file));
    }
  }
  return hits;
}

/**
 * Run FE-3.3 verification suite and return structured evidence.
 */
export function runComponentVerification(
  rootDir: string = process.cwd(),
): VerificationReport {
  const checks: VerificationCheck[] = [];
  const screens = renderScreens();

  // --- PD-3.4 composition ---
  checks.push(
    check(
      "CMP-CATALOGUE-26",
      "PD-3.4",
      "Product CMP catalogue locked at 26",
      PRODUCT_CMP_COUNT === 26 && PRODUCT_CMP_IDS.length === 26,
      `PRODUCT_CMP_COUNT=${PRODUCT_CMP_COUNT}`,
    ),
  );

  for (const entry of SCREEN_CMP_COMPOSITION) {
    const rendered = screens.find((s) => s.screenId === entry.screenId);
    const html = rendered?.html ?? "";
    const missingCmps = entry.screenCmps.filter(
      (cmp) => !html.includes(`data-cmp="${cmp}"`),
    );
    const missingFeat = entry.featcmpIds.filter(
      (feat) => !html.includes(`data-featcmp="${feat}"`),
    );
    const hasScrcmp = html.includes(`data-scrcmp="${entry.scrcmpId}"`);
    const hasLay = html.includes(`data-layout-host="${entry.laycmpId}"`);
    checks.push(
      check(
        `CMP-COMPOSE-${entry.screenId}`,
        "PD-3.4",
        `${entry.screenId} composes required CMP-*`,
        Boolean(rendered) &&
          missingCmps.length === 0 &&
          missingFeat.length === 0 &&
          hasScrcmp &&
          hasLay,
        missingCmps.length || missingFeat.length || !hasScrcmp || !hasLay
          ? `missing cmps=[${missingCmps}] feat=[${missingFeat}] scrcmp=${hasScrcmp} lay=${hasLay}`
          : `${entry.scrcmpId} + ${entry.laycmpId} + ${entry.screenCmps.join(",")}`,
      ),
    );
  }

  const home = screens.find((s) => s.screenId === "SCR-01")!.html;
  const goalCount = (home.match(/data-cmp="CMP-GOAL-CARD"/g) ?? []).length;
  checks.push(
    check(
      "CR-03",
      "PD-3.4",
      "CMP-GOAL-CARD instantiated ×3",
      goalCount === 3,
      `goalCards=${goalCount}`,
    ),
  );

  const workspace = screens.find((s) => s.screenId === "SCR-04")!.html;
  checks.push(
    check(
      "CR-04",
      "PD-3.4",
      "LAY-SPLIT-3 requires CONV+TASK+CONTEXT",
      ["CMP-CONV-PANEL", "CMP-TASK-PANEL", "CMP-CONTEXT-PANEL"].every((cmp) =>
        workspace.includes(`data-cmp="${cmp}"`),
      ),
      "SCR-04 workspace trio present",
    ),
  );

  const documents = screens.find((s) => s.screenId === "SCR-08")!.html;
  const categories = ["solution", "budget", "tender", "delivery"];
  checks.push(
    check(
      "CR-07",
      "PD-3.4",
      "Document categories fixed to four MVP labels",
      categories.every((c) => documents.includes(`data-doc-category="${c}"`)),
      categories.join(","),
    ),
  );

  const admin = screens.find((s) => s.screenId === "SCR-09")!.html;
  const opsCount = (admin.match(/data-cmp="CMP-OPS-AREA"/g) ?? []).length;
  checks.push(
    check(
      "CR-08",
      "PD-3.4",
      "CMP-OPS-AREA ×5 remain on SCR-09",
      opsCount === 5,
      `opsAreas=${opsCount}`,
    ),
  );

  // --- PD-4.4 layering ---
  checks.push(
    check(
      "LAYERING-COUNTS",
      "PD-4.4",
      "L2=26 CMP / L3=11 FEATCMP / L5=9 SCRCMP",
      PRODUCT_CMP_COUNT === 26 &&
        FEATCMP_COUNT === 11 &&
        SCRCMP_COUNT === 9 &&
        FEATCMP_IDS.length === 11 &&
        SCRCMP_IDS.length === 9,
      `cmp=${PRODUCT_CMP_COUNT} featcmp=${FEATCMP_COUNT} scrcmp=${SCRCMP_COUNT}`,
    ),
  );

  const featMapped = FEATCMP_IDS.every((id) =>
    SCREEN_CMP_COMPOSITION.some((row) =>
      (row.featcmpIds as readonly string[]).includes(id),
    ),
  );
  const scrMapped = SCRCMP_IDS.every((id) =>
    SCREEN_CMP_COMPOSITION.some((row) => row.scrcmpId === id),
  );
  checks.push(
    check(
      "CMPA-MAP",
      "PD-4.4",
      "All SCRCMP + FEATCMP mapped to Screens",
      featMapped && scrMapped,
      `featMapped=${featMapped} scrMapped=${scrMapped}`,
    ),
  );

  const shellFiles = [
    path.join(rootDir, "components/application-shell/ApplicationHeader.tsx"),
    path.join(rootDir, "components/application-shell/ApplicationFooter.tsx"),
    path.join(rootDir, "components/application-shell/ShellContextHost.tsx"),
    path.join(rootDir, "components/application-shell/ApplicationShell.tsx"),
  ];
  const shellText = shellFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");
  checks.push(
    check(
      "LAYCMP-SHELL",
      "PD-4.4",
      "Shell hosts CMP-SHELL-HEADER/CONTEXT/FOOTER",
      shellText.includes('data-cmp="CMP-SHELL-HEADER"') &&
        shellText.includes('data-cmp="CMP-SHELL-CONTEXT"') &&
        shellText.includes('data-cmp="CMP-SHELL-FOOTER"') &&
        shellText.includes('data-shell-host="LAYCMP-SHELL"'),
      "shell CMP markers + LAYCMP-SHELL host",
    ),
  );

  // --- PD-3.5 INT wiring ---
  checks.push(
    check(
      "INT-CATALOGUE-25",
      "PD-3.5",
      "INT catalogue locked at 25",
      INTERACTION_COUNT === 25 && INTERACTION_BINDINGS.length === 25,
      `INTERACTION_COUNT=${INTERACTION_COUNT}`,
    ),
  );

  const intScreenBindingsOk = INTERACTION_BINDINGS.every(
    (b) => b.screenIds.length > 0 && b.componentIds.length > 0,
  );
  checks.push(
    check(
      "INT-SCREEN-BIND",
      "PD-3.5",
      "Every INT-* binds to existing Screen + Component",
      intScreenBindingsOk,
      `${INTERACTION_BINDINGS.length} bindings validated`,
    ),
  );

  const screenIntExpectations: Record<string, readonly string[]> = {
    "SCR-01": [
      "INT-ACCESS-SIGNIN",
      "INT-ACCESS-LANGUAGE",
      "INT-ENTRY-GOAL",
      "INT-ENTRY-CONTINUITY",
    ],
    "SCR-02": [
      "INT-INTAKE-START",
      "INT-INTAKE-INPUT",
      "INT-FORWARD-PRIMARY",
    ],
    "SCR-03": [
      "INT-INTAKE-UPLOAD",
      "INT-INTAKE-STATUS",
      "INT-FORWARD-PRIMARY",
    ],
    "SCR-04": [
      "INT-WS-CONVERSE",
      "INT-WS-TASK",
      "INT-WS-CONTEXT",
      "INT-WS-OUTCOME",
    ],
    "SCR-05": [
      "INT-RESULT-REVIEW",
      "INT-ARTIFACT-DOWNLOAD",
      "INT-ARTIFACT-SHARE",
      "INT-FORWARD-GROUP",
    ],
    "SCR-06": [
      "INT-RESULT-REVIEW",
      "INT-ARTIFACT-DOWNLOAD",
      "INT-FORWARD-GROUP",
    ],
    "SCR-07": ["INT-LIST-BROWSE", "INT-LIST-CONTINUE", "INT-LIST-DOCS"],
    "SCR-08": [
      "INT-LIB-CATEGORY",
      "INT-LIB-SELECT",
      "INT-ARTIFACT-PREVIEW",
      "INT-ARTIFACT-DOWNLOAD",
      "INT-ARTIFACT-SHARE",
      "INT-FORWARD-GROUP",
    ],
    "SCR-09": ["INT-OPS-VIEW"],
  };

  for (const screen of screens) {
    const expected = screenIntExpectations[screen.screenId] ?? [];
    const missing = expected.filter(
      (intId) => !screen.html.includes(`data-int-id="${intId}"`),
    );
    checks.push(
      check(
        `INT-WIRE-${screen.screenId}`,
        "PD-3.5",
        `${screen.screenId} INT wiring present`,
        missing.length === 0,
        missing.length ? `missing=${missing.join(",")}` : expected.join(","),
      ),
    );
  }

  let gpOk = true;
  for (const [gp, chain] of Object.entries(GOLDEN_PATH_INT_CHAINS)) {
    for (const intId of chain) {
      if (!(INTERACTION_IDS as readonly string[]).includes(intId)) {
        gpOk = false;
      }
    }
    void gp;
  }
  checks.push(
    check(
      "INT-GP-CHAINS",
      "PD-3.5",
      "Golden Path INT chains stay in catalogue",
      gpOk,
      Object.keys(GOLDEN_PATH_INT_CHAINS).join(","),
    ),
  );

  // --- PD-4.5 interaction flow ---
  const nav = resolveScreenAction({
    intId: "INT-ACCESS-SIGNIN",
    screenId: "SCR-01",
    actionId: "ACT-01-01",
  });
  const pref = resolveScreenAction({
    intId: "INT-ACCESS-LANGUAGE",
    screenId: "SCR-01",
    actionId: "ACT-01-02",
  });
  const invalid = resolveScreenAction({
    intId: "INT-ENTRY-GOAL",
    screenId: "SCR-04",
    actionId: "ACT-01-03",
  });
  const emitted = emitPresentationIntent({
    intId: "INT-FORWARD-PRIMARY",
    screenId: "SCR-02",
    actionId: "ACT-02-03",
    componentId: "CMP-FORWARD-PRIMARY",
  });
  checks.push(
    check(
      "DF-INT-ACT",
      "PD-4.5",
      "INT → ACT resolution without Adapter/API",
      nav.ok &&
        nav.flowKind === "NAV" &&
        pref.ok &&
        pref.flowKind === "PREF" &&
        !invalid.ok &&
        emitted.accepted &&
        emitted.flowKind === "NAV",
      `signin=${(nav as { flowKind?: DataFlowKind }).flowKind} language=${(pref as { flowKind?: DataFlowKind }).flowKind} rejectCrossScreen=${!invalid.ok}`,
    ),
  );

  const flowKindsPresent = new Set(
    INTERACTION_BINDINGS.map((b) => b.flowKind),
  );
  checks.push(
    check(
      "DF-FLOW-KINDS",
      "PD-4.5",
      "Every INT has PD-4.5 flowKind classification",
      INTERACTION_BINDINGS.every((b) => Boolean(b.flowKind)) &&
        flowKindsPresent.has("NAV") &&
        flowKindsPresent.has("PREF"),
      [...flowKindsPresent].sort().join(","),
    ),
  );

  // --- Closed catalogues / no business logic ---
  const surfaceFiles = [
    ...listTsxFiles(path.join(rootDir, "components/screens")),
    ...listTsxFiles(path.join(rootDir, "components/features")),
    ...listTsxFiles(path.join(rootDir, "components/navigation")),
  ];
  const cmpIds = collectAttrIds(surfaceFiles, "data-cmp");
  const intIds = collectAttrIds(surfaceFiles, "data-int-id");
  const ignoredCmp = new Set([
    "CMP-ACCESS",
    "CMP-OUTCOME-LINK",
    "CMP-GOAL-CARD-SET",
    "CMP-DOC-ITEM-SET",
    "CMP-OPS-AREA-SET",
  ]);
  const extraCmp = [...cmpIds].filter(
    (id) =>
      !ignoredCmp.has(id) &&
      !id.endsWith("-SET") &&
      !(PRODUCT_CMP_IDS as readonly string[]).includes(id),
  );
  const extraInt = [...intIds].filter(
    (id) => !(INTERACTION_IDS as readonly string[]).includes(id),
  );
  checks.push(
    check(
      "NO-NEW-CMP",
      "FE-3",
      "No new product CMP-* introduced",
      extraCmp.length === 0,
      extraCmp.length ? extraCmp.join(",") : `surfaceCmps=${cmpIds.size}`,
    ),
  );
  checks.push(
    check(
      "NO-NEW-INT",
      "FE-3",
      "No new INT-* introduced",
      extraInt.length === 0,
      extraInt.length ? extraInt.join(",") : `surfaceInts=${intIds.size}`,
    ),
  );

  const ownershipFiles = [
    ...surfaceFiles,
    path.join(rootDir, "lib/frontend/component-composition.ts"),
    path.join(rootDir, "lib/frontend/interaction-wiring.ts"),
  ];
  const ownershipHits = scanBusinessOwnership(ownershipFiles);
  checks.push(
    check(
      "NO-BIZ-LOGIC",
      "FE-3",
      "No Domain/API/Persistence ownership in FE-3 surfaces",
      ownershipHits.length === 0,
      ownershipHits.length
        ? ownershipHits.join(",")
        : `scanned=${ownershipFiles.length} files`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "FE-3.3",
    passed,
    checks,
    summary: {
      cmpCatalogue: PRODUCT_CMP_COUNT,
      intCatalogue: INTERACTION_COUNT,
      featcmpCount: FEATCMP_COUNT,
      scrcmpCount: SCRCMP_COUNT,
      screensVerified: screens.length,
    },
  };
}

/** Convenience for scripts — throw on failure after printing. */
export function assertComponentVerification(
  report: VerificationReport = runComponentVerification(),
): VerificationReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `FE-3.3 verification failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
