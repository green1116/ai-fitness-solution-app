/**
 * PI-8.1 — Product Closure Foundation verification gate (PD-7 / PI-7).
 */
import fs from "node:fs";
import path from "node:path";

import {
  BE_BASELINE_REF,
  CLOSURE_BASELINE_GATE,
  CLOSURE_BASELINE_ID,
  CLOSURE_BASELINE_REF,
  CLOSURE_FOUNDATION_GATE,
  CLOSURE_FOUNDATION_ID,
  DATA_FOUNDATION_REF,
  DELIVERY_FOUNDATION_REF,
  DELIVERY_FREEZE_REF,
  DELIVERY_READINESS_REF,
  FE_BASELINE_REF,
  IMPLEMENTATION_BASELINE_REF,
  IMPLEMENTATION_FOUNDATION_REF,
  IMPLEMENTATION_FREEZE_REF,
  INTEGRATION_BASELINE_REF,
  PI2_FREEZE_REF,
  PI3_FREEZE_REF,
  PI4_FREEZE_REF,
  PI5_FREEZE_REF,
  PI6_FREEZE_REF,
  PI7_FREEZE_REF,
  UI_BASELINE_REF,
} from "../foundation/closure.constants";
import {
  CLOSURE_BASELINE_DOCS,
  CLOSURE_INVENTORY_REFS,
  CLOSURE_UPSTREAM_EVIDENCE,
} from "../foundation/inventory-refs";
import {
  CLOSURE_DOMAIN_IDS,
  CLOSURE_DOMAIN_MODULE_PATHS,
  CLOSURE_LAYER_CATALOGUE,
  CLOSURE_LAYER_IDS,
} from "../foundation/layer-refs";
import {
  CLOSURE_OWNERSHIP,
  CLOSURE_OWNERSHIP_RULES,
} from "../foundation/ownership-matrix";
import {
  CLOSURE_PACKAGE_CATALOGUE,
  CLOSURE_PACKAGE_IDS,
} from "../foundation/package-refs";

export type ClosureFoundationCheck = Readonly<{
  id: string;
  source: "PI-8.1" | "PD-7" | "PI-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ClosureFoundationReport = Readonly<{
  layer: "PI-8.1";
  foundationId: typeof CLOSURE_FOUNDATION_ID;
  gateId: typeof CLOSURE_FOUNDATION_GATE;
  baselineId: typeof CLOSURE_BASELINE_ID;
  passed: boolean;
  checks: readonly ClosureFoundationCheck[];
  summary: Readonly<{
    packages: number;
    layers: number;
    ownershipRows: number;
    domains: number;
  }>;
}>;

function check(
  id: string,
  source: ClosureFoundationCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ClosureFoundationCheck {
  return {
    id,
    source,
    title,
    status: ok ? "PASS" : "FAIL",
    evidence,
  };
}

function resolveRoot(rootDir?: string): string {
  return rootDir ? path.resolve(rootDir) : path.resolve(__dirname, "../../..");
}

function listTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listTsFiles(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

export function runClosureFoundationGate(
  rootDir?: string,
): ClosureFoundationReport {
  const root = resolveRoot(rootDir);
  const checks: ClosureFoundationCheck[] = [];

  checks.push(
    check(
      "CLSF-IDS",
      "PD-7",
      "Closure foundation / baseline IDs locked",
      CLOSURE_FOUNDATION_ID === "product-closure-foundation-v1" &&
        CLOSURE_FOUNDATION_GATE === "product-closure-foundation-gate" &&
        CLOSURE_BASELINE_ID === "product-closure-baseline-v1" &&
        CLOSURE_BASELINE_GATE === "product-closure-baseline-gate" &&
        CLOSURE_BASELINE_REF === CLOSURE_BASELINE_ID &&
        UI_BASELINE_REF === "product-ui-baseline-v1" &&
        FE_BASELINE_REF ===
          "product-frontend-architecture-baseline-v1" &&
        BE_BASELINE_REF === "product-backend-architecture-baseline-v1" &&
        DATA_FOUNDATION_REF === "product-data-foundation-v1" &&
        INTEGRATION_BASELINE_REF === "product-integration-baseline-v1" &&
        DELIVERY_READINESS_REF ===
          "product-delivery-readiness-baseline-v1" &&
        DELIVERY_FOUNDATION_REF === "product-delivery-foundation-v1" &&
        IMPLEMENTATION_FOUNDATION_REF ===
          "product-implementation-foundation-v1" &&
        IMPLEMENTATION_BASELINE_REF ===
          "product-implementation-baseline-v1" &&
        IMPLEMENTATION_FREEZE_REF === "product-implementation-freeze-1" &&
        DELIVERY_FREEZE_REF === "product-delivery-freeze-1" &&
        PI2_FREEZE_REF === "pi-2-frontend-implementation-v1" &&
        PI3_FREEZE_REF === "pi-3-backend-implementation-v1" &&
        PI4_FREEZE_REF === "pi-4-data-implementation-v1" &&
        PI5_FREEZE_REF === "pi-5-integration-implementation-v1" &&
        PI6_FREEZE_REF === "pi-6-delivery-readiness-v1" &&
        PI7_FREEZE_REF === "pi-7-product-implementation-v1",
      `${CLOSURE_FOUNDATION_ID} / ${CLOSURE_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "CLSF-REGISTRY",
      "PI-8.1",
      "Closure foundation registry established",
      CLOSURE_PACKAGE_IDS.length === CLOSURE_INVENTORY_REFS.packages &&
        CLOSURE_PACKAGE_CATALOGUE.length === 6 &&
        CLOSURE_LAYER_IDS.length === CLOSURE_INVENTORY_REFS.layers &&
        CLOSURE_LAYER_CATALOGUE.length === 7 &&
        CLOSURE_OWNERSHIP.length === CLOSURE_INVENTORY_REFS.ownershipRows &&
        CLOSURE_OWNERSHIP_RULES.length ===
          CLOSURE_INVENTORY_REFS.ownershipRules &&
        CLOSURE_DOMAIN_IDS.length === CLOSURE_INVENTORY_REFS.domains,
      `packages=${CLOSURE_PACKAGE_CATALOGUE.length} layers=${CLOSURE_LAYER_CATALOGUE.length} ownership=${CLOSURE_OWNERSHIP.length}`,
    ),
  );

  const packagesExist = CLOSURE_PACKAGE_CATALOGUE.every(
    (pkg) =>
      fs.existsSync(path.join(root, pkg.modulePath)) &&
      fs.existsSync(path.join(root, pkg.evidenceScript)),
  );
  const layersExist = CLOSURE_LAYER_CATALOGUE.every((layer) =>
    fs.existsSync(path.join(root, layer.modulePath)),
  );
  const domainsExist = CLOSURE_DOMAIN_IDS.every((id) =>
    fs.existsSync(path.join(root, CLOSURE_DOMAIN_MODULE_PATHS[id])),
  );
  const upstreamExist = CLOSURE_UPSTREAM_EVIDENCE.every((rel) =>
    fs.existsSync(path.join(root, rel)),
  );
  const docsExist = CLOSURE_BASELINE_DOCS.every((rel) =>
    fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "CLSF-LAYERS",
      "PI-8.1",
      "Existing layers reused",
      packagesExist &&
        layersExist &&
        domainsExist &&
        upstreamExist &&
        docsExist &&
        CLOSURE_UPSTREAM_EVIDENCE.length ===
          CLOSURE_INVENTORY_REFS.upstreamEvidence &&
        CLOSURE_BASELINE_DOCS.length === CLOSURE_INVENTORY_REFS.baselineDocs,
      packagesExist && layersExist && upstreamExist && docsExist
        ? `packages=${CLOSURE_PACKAGE_CATALOGUE.length} layers=${CLOSURE_LAYER_CATALOGUE.length} upstream=${CLOSURE_UPSTREAM_EVIDENCE.length} docs=${CLOSURE_BASELINE_DOCS.length}`
        : "missing paths",
    ),
  );

  checks.push(
    check(
      "CLSF-DOMAINS",
      "PI-8.1",
      "Existing domains reused",
      domainsExist &&
        CLOSURE_DOMAIN_IDS.join(",") === "M11,M12,M13,M14,M15" &&
        CLOSURE_DOMAIN_IDS.length === 5,
      `domains=${CLOSURE_DOMAIN_IDS.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "CLSF-NO-NEW-DOMAIN",
      "PI-8.1",
      "No new Domain",
      forbidden.length === 0 && CLOSURE_DOMAIN_IDS.length === 5,
      forbidden.length
        ? forbidden.join(",")
        : `domains=${CLOSURE_DOMAIN_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "CLSF-NO-NEW-ARCH",
      "PD-7",
      "No new architecture",
      CLOSURE_BASELINE_ID === "product-closure-baseline-v1" &&
        CLOSURE_BASELINE_REF === CLOSURE_BASELINE_ID &&
        CLOSURE_PACKAGE_IDS.join("→") ===
          "PI-2→PI-3→PI-4→PI-5→PI-6→PI-7" &&
        !fs.existsSync(path.join(root, "lib/closure/engines")) &&
        !fs.existsSync(path.join(root, "lib/closure/new-architecture")) &&
        !fs.existsSync(path.join(root, "lib/closure-architecture")),
      "closure-baseline locked; PI-2…PI-7 closed; no parallel architecture tree",
    ),
  );

  const pi8Dirs = [
    path.join(root, "lib/closure/foundation"),
    path.join(root, "lib/closure/routing"),
    path.join(root, "lib/closure/runtime"),
    path.join(root, "lib/closure/exposure"),
    path.join(root, "lib/closure/hardening"),
    path.join(root, "lib/closure/verify"),
  ];
  const pi8Files = pi8Dirs.flatMap((d) => listTsFiles(d));
  const coupleHits = pi8Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration|delivery|implementation)|from\s+["'][^"']*lib\/(frontend|backend|data|integration|delivery|implementation)/.test(
      text,
    );
  });
  checks.push(
    check(
      "CLSF-NO-COUPLE",
      "PI-8.1",
      "No cross-layer coupling",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi8Files.length}`,
    ),
  );

  checks.push(
    check(
      "CLSF-TREE",
      "PI-8.1",
      "Closure foundation tree established",
      fs.existsSync(path.join(root, "lib/closure/foundation/index.ts")) &&
        fs.existsSync(
          path.join(root, "lib/closure/verify/closure.foundation.gate.ts"),
        ),
      "lib/closure/foundation + verify",
    ),
  );

  checks.push(
    check(
      "CLSF-PI7",
      "PI-7",
      "PI-7 product implementation freeze evidence present",
      fs.existsSync(path.join(root, "scripts/verify-pi-7.ts")) &&
        fs.existsSync(
          path.join(root, "lib/implementation/foundation/index.ts"),
        ) &&
        PI7_FREEZE_REF === "pi-7-product-implementation-v1",
      PI7_FREEZE_REF,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-8.1",
    foundationId: CLOSURE_FOUNDATION_ID,
    gateId: CLOSURE_FOUNDATION_GATE,
    baselineId: CLOSURE_BASELINE_ID,
    passed,
    checks,
    summary: {
      packages: CLOSURE_PACKAGE_CATALOGUE.length,
      layers: CLOSURE_LAYER_CATALOGUE.length,
      ownershipRows: CLOSURE_OWNERSHIP.length,
      domains: CLOSURE_DOMAIN_IDS.length,
    },
  };
}

export function assertClosureFoundationGate(
  report: ClosureFoundationReport = runClosureFoundationGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Closure foundation gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
