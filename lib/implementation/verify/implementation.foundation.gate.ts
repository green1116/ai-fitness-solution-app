/**
 * PI-7.1 — Product Implementation Foundation verification gate (PD-7 / PI-6).
 */
import fs from "node:fs";
import path from "node:path";

import {
  BE_BASELINE_REF,
  DATA_FOUNDATION_REF,
  DELIVERY_FOUNDATION_REF,
  DELIVERY_FREEZE_REF,
  DELIVERY_READINESS_REF,
  FE_BASELINE_REF,
  IMPLEMENTATION_BASELINE_GATE,
  IMPLEMENTATION_BASELINE_ID,
  IMPLEMENTATION_BASELINE_REF,
  IMPLEMENTATION_FOUNDATION_GATE,
  IMPLEMENTATION_FOUNDATION_ID,
  INTEGRATION_BASELINE_REF,
  PI2_FREEZE_REF,
  PI3_FREEZE_REF,
  PI4_FREEZE_REF,
  PI5_FREEZE_REF,
  PI6_FREEZE_REF,
  UI_BASELINE_REF,
} from "../foundation/implementation.constants";
import {
  IMPLEMENTATION_BASELINE_DOCS,
  IMPLEMENTATION_INVENTORY_REFS,
  IMPLEMENTATION_UPSTREAM_EVIDENCE,
} from "../foundation/inventory-refs";
import {
  IMPLEMENTATION_DOMAIN_IDS,
  IMPLEMENTATION_DOMAIN_MODULE_PATHS,
  IMPLEMENTATION_LAYER_CATALOGUE,
  IMPLEMENTATION_LAYER_IDS,
} from "../foundation/layer-refs";
import {
  IMPLEMENTATION_OWNERSHIP,
  IMPLEMENTATION_OWNERSHIP_RULES,
} from "../foundation/ownership-matrix";
import {
  IMPLEMENTATION_PACKAGE_CATALOGUE,
  IMPLEMENTATION_PACKAGE_IDS,
} from "../foundation/package-refs";

export type ImplementationFoundationCheck = Readonly<{
  id: string;
  source: "PI-7.1" | "PD-7" | "PI-6";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ImplementationFoundationReport = Readonly<{
  layer: "PI-7.1";
  foundationId: typeof IMPLEMENTATION_FOUNDATION_ID;
  gateId: typeof IMPLEMENTATION_FOUNDATION_GATE;
  baselineId: typeof IMPLEMENTATION_BASELINE_ID;
  passed: boolean;
  checks: readonly ImplementationFoundationCheck[];
  summary: Readonly<{
    packages: number;
    layers: number;
    ownershipRows: number;
    domains: number;
  }>;
}>;

function check(
  id: string,
  source: ImplementationFoundationCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ImplementationFoundationCheck {
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

export function runImplementationFoundationGate(
  rootDir?: string,
): ImplementationFoundationReport {
  const root = resolveRoot(rootDir);
  const checks: ImplementationFoundationCheck[] = [];

  checks.push(
    check(
      "IMPF-IDS",
      "PD-7",
      "Implementation foundation / baseline IDs locked",
      IMPLEMENTATION_FOUNDATION_ID ===
        "product-implementation-foundation-v1" &&
        IMPLEMENTATION_FOUNDATION_GATE ===
          "product-implementation-foundation-gate" &&
        IMPLEMENTATION_BASELINE_ID === "product-implementation-baseline-v1" &&
        IMPLEMENTATION_BASELINE_GATE ===
          "product-implementation-baseline-gate" &&
        IMPLEMENTATION_BASELINE_REF === IMPLEMENTATION_BASELINE_ID &&
        UI_BASELINE_REF === "product-ui-baseline-v1" &&
        FE_BASELINE_REF ===
          "product-frontend-architecture-baseline-v1" &&
        BE_BASELINE_REF === "product-backend-architecture-baseline-v1" &&
        DATA_FOUNDATION_REF === "product-data-foundation-v1" &&
        INTEGRATION_BASELINE_REF === "product-integration-baseline-v1" &&
        DELIVERY_READINESS_REF ===
          "product-delivery-readiness-baseline-v1" &&
        DELIVERY_FOUNDATION_REF === "product-delivery-foundation-v1" &&
        DELIVERY_FREEZE_REF === "product-delivery-freeze-1" &&
        PI2_FREEZE_REF === "pi-2-frontend-implementation-v1" &&
        PI3_FREEZE_REF === "pi-3-backend-implementation-v1" &&
        PI4_FREEZE_REF === "pi-4-data-implementation-v1" &&
        PI5_FREEZE_REF === "pi-5-integration-implementation-v1" &&
        PI6_FREEZE_REF === "pi-6-delivery-readiness-v1",
      `${IMPLEMENTATION_FOUNDATION_ID} / ${IMPLEMENTATION_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "IMPF-REGISTRY",
      "PI-7.1",
      "Implementation foundation registry established",
      IMPLEMENTATION_PACKAGE_IDS.length ===
        IMPLEMENTATION_INVENTORY_REFS.packages &&
        IMPLEMENTATION_PACKAGE_CATALOGUE.length === 5 &&
        IMPLEMENTATION_LAYER_IDS.length ===
          IMPLEMENTATION_INVENTORY_REFS.layers &&
        IMPLEMENTATION_LAYER_CATALOGUE.length === 6 &&
        IMPLEMENTATION_OWNERSHIP.length ===
          IMPLEMENTATION_INVENTORY_REFS.ownershipRows &&
        IMPLEMENTATION_OWNERSHIP_RULES.length ===
          IMPLEMENTATION_INVENTORY_REFS.ownershipRules &&
        IMPLEMENTATION_DOMAIN_IDS.length ===
          IMPLEMENTATION_INVENTORY_REFS.domains,
      `packages=${IMPLEMENTATION_PACKAGE_CATALOGUE.length} layers=${IMPLEMENTATION_LAYER_CATALOGUE.length} ownership=${IMPLEMENTATION_OWNERSHIP.length}`,
    ),
  );

  const packagesExist = IMPLEMENTATION_PACKAGE_CATALOGUE.every(
    (pkg) =>
      fs.existsSync(path.join(root, pkg.modulePath)) &&
      fs.existsSync(path.join(root, pkg.evidenceScript)),
  );
  const layersExist = IMPLEMENTATION_LAYER_CATALOGUE.every((layer) =>
    fs.existsSync(path.join(root, layer.modulePath)),
  );
  const domainsExist = IMPLEMENTATION_DOMAIN_IDS.every((id) =>
    fs.existsSync(path.join(root, IMPLEMENTATION_DOMAIN_MODULE_PATHS[id])),
  );
  const upstreamExist = IMPLEMENTATION_UPSTREAM_EVIDENCE.every((rel) =>
    fs.existsSync(path.join(root, rel)),
  );
  const docsExist = IMPLEMENTATION_BASELINE_DOCS.every((rel) =>
    fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "IMPF-LAYERS",
      "PI-7.1",
      "Existing layers reused",
      packagesExist &&
        layersExist &&
        domainsExist &&
        upstreamExist &&
        docsExist &&
        IMPLEMENTATION_UPSTREAM_EVIDENCE.length ===
          IMPLEMENTATION_INVENTORY_REFS.upstreamEvidence &&
        IMPLEMENTATION_BASELINE_DOCS.length ===
          IMPLEMENTATION_INVENTORY_REFS.baselineDocs,
      packagesExist && layersExist && upstreamExist && docsExist
        ? `packages=${IMPLEMENTATION_PACKAGE_CATALOGUE.length} layers=${IMPLEMENTATION_LAYER_CATALOGUE.length} upstream=${IMPLEMENTATION_UPSTREAM_EVIDENCE.length} docs=${IMPLEMENTATION_BASELINE_DOCS.length}`
        : "missing paths",
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "IMPF-NO-NEW-DOMAIN",
      "PI-7.1",
      "No new Domain",
      IMPLEMENTATION_DOMAIN_IDS.length === 5 &&
        IMPLEMENTATION_DOMAIN_IDS.join(",") === "M11,M12,M13,M14,M15" &&
        forbidden.length === 0,
      forbidden.length
        ? forbidden.join(",")
        : `domains=${IMPLEMENTATION_DOMAIN_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "IMPF-NO-NEW-ARCH",
      "PD-7",
      "No new architecture",
      IMPLEMENTATION_BASELINE_ID === "product-implementation-baseline-v1" &&
        IMPLEMENTATION_BASELINE_REF === IMPLEMENTATION_BASELINE_ID &&
        IMPLEMENTATION_PACKAGE_IDS.join("→") === "PI-2→PI-3→PI-4→PI-5→PI-6" &&
        !fs.existsSync(path.join(root, "lib/implementation/engines")) &&
        !fs.existsSync(path.join(root, "lib/implementation/new-architecture")) &&
        !fs.existsSync(path.join(root, "lib/implementation-architecture")),
      "implementation-baseline locked; PI-2…PI-6 closed; no parallel architecture tree",
    ),
  );

  const pi7Dirs = [
    path.join(root, "lib/implementation/foundation"),
    path.join(root, "lib/implementation/routing"),
    path.join(root, "lib/implementation/runtime"),
    path.join(root, "lib/implementation/exposure"),
    path.join(root, "lib/implementation/hardening"),
    path.join(root, "lib/implementation/verify"),
  ];
  const pi7Files = pi7Dirs.flatMap((d) => listTsFiles(d));
  const coupleHits = pi7Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration|delivery)|from\s+["'][^"']*lib\/(frontend|backend|data|integration|delivery)/.test(
      text,
    );
  });
  checks.push(
    check(
      "IMPF-NO-COUPLE",
      "PI-7.1",
      "No cross-layer coupling",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi7Files.length}`,
    ),
  );

  checks.push(
    check(
      "IMPF-TREE",
      "PI-7.1",
      "Implementation foundation tree established",
      fs.existsSync(
        path.join(root, "lib/implementation/foundation/index.ts"),
      ) &&
        fs.existsSync(
          path.join(
            root,
            "lib/implementation/verify/implementation.foundation.gate.ts",
          ),
        ),
      "lib/implementation/foundation + verify",
    ),
  );

  checks.push(
    check(
      "IMPF-PI6",
      "PI-6",
      "PI-6 delivery readiness freeze evidence present",
      fs.existsSync(path.join(root, "scripts/verify-pi-6.ts")) &&
        fs.existsSync(path.join(root, "lib/delivery/foundation/index.ts")) &&
        PI6_FREEZE_REF === "pi-6-delivery-readiness-v1",
      PI6_FREEZE_REF,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-7.1",
    foundationId: IMPLEMENTATION_FOUNDATION_ID,
    gateId: IMPLEMENTATION_FOUNDATION_GATE,
    baselineId: IMPLEMENTATION_BASELINE_ID,
    passed,
    checks,
    summary: {
      packages: IMPLEMENTATION_PACKAGE_CATALOGUE.length,
      layers: IMPLEMENTATION_LAYER_CATALOGUE.length,
      ownershipRows: IMPLEMENTATION_OWNERSHIP.length,
      domains: IMPLEMENTATION_DOMAIN_IDS.length,
    },
  };
}

export function assertImplementationFoundationGate(
  report: ImplementationFoundationReport = runImplementationFoundationGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Implementation foundation gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
