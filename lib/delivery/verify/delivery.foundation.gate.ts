/**
 * PI-6.1 — Delivery Readiness Foundation verification gate (PD-7).
 */
import fs from "node:fs";
import path from "node:path";

import {
  BE_BASELINE_REF,
  DATA_FOUNDATION_REF,
  DELIVERY_BASELINE_REF,
  DELIVERY_FOUNDATION_GATE,
  DELIVERY_FOUNDATION_ID,
  DELIVERY_FREEZE_REF,
  DELIVERY_READINESS_GATE,
  DELIVERY_READINESS_ID,
  FE_BASELINE_REF,
  INTEGRATION_BASELINE_REF,
  INTEGRATION_FOUNDATION_REF,
  PI2_FREEZE_REF,
  PI3_FREEZE_REF,
  PI4_FREEZE_REF,
  PI5_FREEZE_REF,
  UI_BASELINE_REF,
} from "../foundation/delivery.constants";
import {
  DELIVERY_ENVIRONMENT_CATALOGUE,
  DELIVERY_ENVIRONMENT_IDS,
  DELIVERY_GOLDEN_PATH_IDS,
} from "../foundation/environments";
import {
  DELIVERY_BASELINE_DOCS,
  DELIVERY_INVENTORY_REFS,
  DELIVERY_UPSTREAM_EVIDENCE,
} from "../foundation/inventory-refs";
import {
  DELIVERY_DOMAIN_IDS,
  DELIVERY_DOMAIN_MODULE_PATHS,
  DELIVERY_LAYER_CATALOGUE,
  DELIVERY_LAYER_IDS,
} from "../foundation/layer-refs";
import {
  DELIVERY_OWNERSHIP,
  DELIVERY_OWNERSHIP_RULES,
} from "../foundation/ownership-matrix";
import {
  DELIVERY_READINESS_CONCERN_CATALOGUE,
  DELIVERY_READINESS_CONCERN_IDS,
} from "../foundation/readiness-concerns";

export type DeliveryFoundationCheck = Readonly<{
  id: string;
  source: "PI-6.1" | "PD-7" | "PD-7.8" | "PI-5";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type DeliveryFoundationReport = Readonly<{
  layer: "PI-6.1";
  foundationId: typeof DELIVERY_FOUNDATION_ID;
  gateId: typeof DELIVERY_FOUNDATION_GATE;
  readinessId: typeof DELIVERY_READINESS_ID;
  passed: boolean;
  checks: readonly DeliveryFoundationCheck[];
  summary: Readonly<{
    readinessConcerns: number;
    layers: number;
    environments: number;
    ownershipRows: number;
    domains: number;
  }>;
}>;

function check(
  id: string,
  source: DeliveryFoundationCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): DeliveryFoundationCheck {
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

export function runDeliveryFoundationGate(
  rootDir?: string,
): DeliveryFoundationReport {
  const root = resolveRoot(rootDir);
  const checks: DeliveryFoundationCheck[] = [];

  checks.push(
    check(
      "DELF-IDS",
      "PD-7.8",
      "Delivery foundation / readiness IDs locked",
      DELIVERY_FOUNDATION_ID === "product-delivery-foundation-v1" &&
        DELIVERY_FOUNDATION_GATE === "product-delivery-foundation-gate" &&
        DELIVERY_READINESS_ID === "product-delivery-readiness-baseline-v1" &&
        DELIVERY_READINESS_GATE ===
          "product-delivery-readiness-baseline-gate" &&
        DELIVERY_BASELINE_REF === DELIVERY_READINESS_ID &&
        DELIVERY_FREEZE_REF === "product-delivery-freeze-1" &&
        UI_BASELINE_REF === "product-ui-baseline-v1" &&
        FE_BASELINE_REF ===
          "product-frontend-architecture-baseline-v1" &&
        BE_BASELINE_REF === "product-backend-architecture-baseline-v1" &&
        DATA_FOUNDATION_REF === "product-data-foundation-v1" &&
        INTEGRATION_BASELINE_REF === "product-integration-baseline-v1" &&
        INTEGRATION_FOUNDATION_REF ===
          "product-integration-foundation-v1" &&
        PI2_FREEZE_REF === "pi-2-frontend-implementation-v1" &&
        PI3_FREEZE_REF === "pi-3-backend-implementation-v1" &&
        PI4_FREEZE_REF === "pi-4-data-implementation-v1" &&
        PI5_FREEZE_REF === "pi-5-integration-implementation-v1",
      `${DELIVERY_FOUNDATION_ID} / ${DELIVERY_READINESS_ID}`,
    ),
  );

  checks.push(
    check(
      "DELF-REGISTRY",
      "PI-6.1",
      "Delivery foundation registry established",
      DELIVERY_READINESS_CONCERN_IDS.length ===
        DELIVERY_INVENTORY_REFS.readinessConcerns &&
        DELIVERY_READINESS_CONCERN_CATALOGUE.length === 7 &&
        DELIVERY_LAYER_IDS.length === DELIVERY_INVENTORY_REFS.layers &&
        DELIVERY_LAYER_CATALOGUE.length === 5 &&
        DELIVERY_ENVIRONMENT_IDS.length ===
          DELIVERY_INVENTORY_REFS.environments &&
        DELIVERY_ENVIRONMENT_CATALOGUE.length === 4 &&
        DELIVERY_GOLDEN_PATH_IDS.length ===
          DELIVERY_INVENTORY_REFS.goldenPaths &&
        DELIVERY_OWNERSHIP.length ===
          DELIVERY_INVENTORY_REFS.ownershipRows &&
        DELIVERY_OWNERSHIP_RULES.length ===
          DELIVERY_INVENTORY_REFS.ownershipRules &&
        DELIVERY_DOMAIN_IDS.length === DELIVERY_INVENTORY_REFS.domains,
      `concerns=${DELIVERY_READINESS_CONCERN_CATALOGUE.length} layers=${DELIVERY_LAYER_CATALOGUE.length} envs=${DELIVERY_ENVIRONMENT_CATALOGUE.length} ownership=${DELIVERY_OWNERSHIP.length}`,
    ),
  );

  const layersExist = DELIVERY_LAYER_CATALOGUE.every((layer) =>
    fs.existsSync(path.join(root, layer.modulePath)),
  );
  const domainsExist = DELIVERY_DOMAIN_IDS.every((id) =>
    fs.existsSync(path.join(root, DELIVERY_DOMAIN_MODULE_PATHS[id])),
  );
  const upstreamExist = DELIVERY_UPSTREAM_EVIDENCE.every((rel) =>
    fs.existsSync(path.join(root, rel)),
  );
  const docsExist = DELIVERY_BASELINE_DOCS.every((rel) =>
    fs.existsSync(path.join(root, rel)),
  );
  const concernDocsExist = DELIVERY_READINESS_CONCERN_CATALOGUE.every((c) =>
    fs.existsSync(path.join(root, c.docPath)),
  );
  checks.push(
    check(
      "DELF-LAYERS",
      "PI-6.1",
      "Existing layers reused",
      layersExist &&
        domainsExist &&
        upstreamExist &&
        docsExist &&
        concernDocsExist &&
        DELIVERY_UPSTREAM_EVIDENCE.length ===
          DELIVERY_INVENTORY_REFS.upstreamEvidence,
      layersExist && domainsExist && upstreamExist && docsExist
        ? `layers=${DELIVERY_LAYER_CATALOGUE.length} upstream=${DELIVERY_UPSTREAM_EVIDENCE.length} docs=${DELIVERY_BASELINE_DOCS.length}`
        : "missing paths",
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "DELF-NO-NEW-DOMAIN",
      "PI-6.1",
      "No new Domain",
      DELIVERY_DOMAIN_IDS.length === 5 &&
        DELIVERY_DOMAIN_IDS.join(",") === "M11,M12,M13,M14,M15" &&
        forbidden.length === 0,
      forbidden.length
        ? forbidden.join(",")
        : `domains=${DELIVERY_DOMAIN_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "DELF-NO-NEW-ARCH",
      "PD-7",
      "No new architecture",
      DELIVERY_READINESS_ID === "product-delivery-readiness-baseline-v1" &&
        DELIVERY_BASELINE_REF === DELIVERY_READINESS_ID &&
        DELIVERY_ENVIRONMENT_IDS.join("|") ===
          "ENV-LOCAL|ENV-DEV|ENV-STAGING|ENV-PROD" &&
        !fs.existsSync(path.join(root, "lib/delivery/engines")) &&
        !fs.existsSync(path.join(root, "lib/delivery/new-architecture")) &&
        !fs.existsSync(path.join(root, "lib/readiness-architecture")),
      "readiness-baseline locked; ENV-* closed; no parallel architecture tree",
    ),
  );

  const pi6Dirs = [
    path.join(root, "lib/delivery/foundation"),
    path.join(root, "lib/delivery/runtime"),
    path.join(root, "lib/delivery/exposure"),
    path.join(root, "lib/delivery/verification"),
    path.join(root, "lib/delivery/hardening"),
    path.join(root, "lib/delivery/verify"),
  ];
  const pi6Files = pi6Dirs.flatMap((d) => listTsFiles(d));
  const coupleHits = pi6Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration)|from\s+["'][^"']*lib\/(frontend|backend|data|integration)/.test(
      text,
    );
  });
  checks.push(
    check(
      "DELF-NO-COUPLE",
      "PI-6.1",
      "No cross-layer coupling",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi6Files.length}`,
    ),
  );

  checks.push(
    check(
      "DELF-TREE",
      "PI-6.1",
      "Delivery foundation tree established",
      fs.existsSync(path.join(root, "lib/delivery/foundation/index.ts")) &&
        fs.existsSync(
          path.join(root, "lib/delivery/verify/delivery.foundation.gate.ts"),
        ),
      "lib/delivery/foundation + verify",
    ),
  );

  checks.push(
    check(
      "DELF-PI5",
      "PI-5",
      "PI-5 integration freeze evidence present",
      fs.existsSync(path.join(root, "scripts/verify-pi-5.ts")) &&
        fs.existsSync(path.join(root, "lib/integration/foundation/index.ts")) &&
        PI5_FREEZE_REF === "pi-5-integration-implementation-v1",
      PI5_FREEZE_REF,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-6.1",
    foundationId: DELIVERY_FOUNDATION_ID,
    gateId: DELIVERY_FOUNDATION_GATE,
    readinessId: DELIVERY_READINESS_ID,
    passed,
    checks,
    summary: {
      readinessConcerns: DELIVERY_READINESS_CONCERN_CATALOGUE.length,
      layers: DELIVERY_LAYER_CATALOGUE.length,
      environments: DELIVERY_ENVIRONMENT_CATALOGUE.length,
      ownershipRows: DELIVERY_OWNERSHIP.length,
      domains: DELIVERY_DOMAIN_IDS.length,
    },
  };
}

export function assertDeliveryFoundationGate(
  report: DeliveryFoundationReport = runDeliveryFoundationGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Delivery foundation gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
