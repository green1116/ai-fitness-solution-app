/**
 * PI-5.1 — Integration Foundation verification gate (PD-6.1).
 */
import fs from "node:fs";
import path from "node:path";

import {
  BE_BASELINE_REF,
  DATA_FOUNDATION_REF,
  FE_BASELINE_REF,
  INTEGRATION_ARCHITECTURE_GATE,
  INTEGRATION_ARCHITECTURE_ID,
  INTEGRATION_BASELINE_REF,
  INTEGRATION_FOUNDATION_GATE,
  INTEGRATION_FOUNDATION_ID,
  PI3_FREEZE_REF,
  PI4_FREEZE_REF,
  UI_BASELINE_REF,
} from "../foundation/integration.constants";
import {
  INTEGRATION_BINDING_KINDS,
  INTEGRATION_BINDING_KIND_CATALOGUE,
} from "../foundation/binding-kinds";
import {
  INTEGRATION_POINT_CATALOGUE,
  INTEGRATION_POINT_IDS,
} from "../foundation/integration-points";
import {
  INTEGRATION_INVENTORY_REFS,
  INTEGRATION_UPSTREAM_EVIDENCE,
} from "../foundation/inventory-refs";
import {
  INTEGRATION_OWNERSHIP,
  INTEGRATION_OWNERSHIP_RULES,
} from "../foundation/ownership-matrix";
import {
  INTEGRATION_PIPELINE_CATALOGUE,
  INTEGRATION_PIPELINE_STAGES,
} from "../foundation/pipeline-stages";

export type IntegrationFoundationCheck = Readonly<{
  id: string;
  source: "PI-5.1" | "PD-6.1" | "PI-3" | "PI-4";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type IntegrationFoundationReport = Readonly<{
  layer: "PI-5.1";
  foundationId: typeof INTEGRATION_FOUNDATION_ID;
  gateId: typeof INTEGRATION_FOUNDATION_GATE;
  architectureId: typeof INTEGRATION_ARCHITECTURE_ID;
  passed: boolean;
  checks: readonly IntegrationFoundationCheck[];
  summary: Readonly<{
    pipelineStages: number;
    bindingKinds: number;
    integrationPoints: number;
    ownershipRows: number;
    domains: number;
  }>;
}>;

function check(
  id: string,
  source: IntegrationFoundationCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): IntegrationFoundationCheck {
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

export function runIntegrationFoundationGate(
  rootDir?: string,
): IntegrationFoundationReport {
  const root = resolveRoot(rootDir);
  const checks: IntegrationFoundationCheck[] = [];

  checks.push(
    check(
      "INTF-IDS",
      "PD-6.1",
      "Integration foundation / architecture IDs locked",
      INTEGRATION_FOUNDATION_ID === "product-integration-foundation-v1" &&
        INTEGRATION_FOUNDATION_GATE ===
          "product-integration-foundation-gate" &&
        INTEGRATION_ARCHITECTURE_ID ===
          "product-integration-architecture-v1" &&
        INTEGRATION_ARCHITECTURE_GATE ===
          "product-integration-architecture-gate" &&
        INTEGRATION_BASELINE_REF === "product-integration-baseline-v1" &&
        FE_BASELINE_REF ===
          "product-frontend-architecture-baseline-v1" &&
        BE_BASELINE_REF === "product-backend-architecture-baseline-v1" &&
        DATA_FOUNDATION_REF === "product-data-foundation-v1" &&
        UI_BASELINE_REF === "product-ui-baseline-v1" &&
        PI3_FREEZE_REF === "pi-3-backend-implementation-v1" &&
        PI4_FREEZE_REF === "pi-4-data-implementation-v1",
      `${INTEGRATION_FOUNDATION_ID} / ${INTEGRATION_ARCHITECTURE_ID}`,
    ),
  );

  checks.push(
    check(
      "INTF-REGISTRY",
      "PI-5.1",
      "Integration registry established",
      INTEGRATION_PIPELINE_STAGES.length ===
        INTEGRATION_INVENTORY_REFS.pipelineStages &&
        INTEGRATION_PIPELINE_CATALOGUE.length === 5 &&
        INTEGRATION_BINDING_KINDS.length ===
          INTEGRATION_INVENTORY_REFS.bindingKinds &&
        INTEGRATION_BINDING_KIND_CATALOGUE.length === 5 &&
        INTEGRATION_POINT_IDS.length === 11 &&
        INTEGRATION_POINT_CATALOGUE.length === 11 &&
        INTEGRATION_OWNERSHIP.length === 7 &&
        INTEGRATION_OWNERSHIP_RULES.length === 5,
      `stages=${INTEGRATION_PIPELINE_STAGES.length} kinds=${INTEGRATION_BINDING_KINDS.length} points=${INTEGRATION_POINT_CATALOGUE.length} ownership=${INTEGRATION_OWNERSHIP.length}`,
    ),
  );

  const pointsExist = INTEGRATION_POINT_CATALOGUE.every((point) =>
    fs.existsSync(path.join(root, point.modulePath)),
  );
  const upstreamExist = INTEGRATION_UPSTREAM_EVIDENCE.every((rel) =>
    fs.existsSync(path.join(root, rel)),
  );
  const stagesCovered = INTEGRATION_PIPELINE_STAGES.every((stage) =>
    INTEGRATION_POINT_CATALOGUE.some((p) => p.stageId === stage),
  );
  checks.push(
    check(
      "INTF-POINTS",
      "PI-5.1",
      "Existing integration points reused",
      pointsExist &&
        upstreamExist &&
        stagesCovered &&
        !INTEGRATION_POINT_CATALOGUE.some((p) =>
          p.modulePath.startsWith("lib/integration/impl"),
        ),
      pointsExist && upstreamExist
        ? `points=${INTEGRATION_POINT_CATALOGUE.length} upstream=${INTEGRATION_UPSTREAM_EVIDENCE.length}`
        : "missing paths",
    ),
  );

  const domainPoints = INTEGRATION_POINT_CATALOGUE.filter((p) =>
    p.pointId.startsWith("INTP-DOMAIN-M"),
  );
  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "INTF-NO-NEW-DOMAIN",
      "PI-5.1",
      "No new Domain",
      domainPoints.length === INTEGRATION_INVENTORY_REFS.domains &&
        forbidden.length === 0 &&
        INTEGRATION_INVENTORY_REFS.domains === 5,
      forbidden.length
        ? forbidden.join(",")
        : `domainPoints=${domainPoints.length}`,
    ),
  );

  checks.push(
    check(
      "INTF-NO-NEW-ARCH",
      "PD-6.1",
      "No new integration architecture",
      INTEGRATION_ARCHITECTURE_ID ===
        "product-integration-architecture-v1" &&
        INTEGRATION_PIPELINE_STAGES.join("→") ===
          "UI→API→SERVICE→DOMAIN→PERSISTENCE" &&
        !fs.existsSync(path.join(root, "lib/integration/engines")) &&
        !fs.existsSync(path.join(root, "lib/integration/new-pipeline")) &&
        INTEGRATION_INVENTORY_REFS.commands === 47 &&
        INTEGRATION_INVENTORY_REFS.apiFamilies === 11 &&
        INTEGRATION_INVENTORY_REFS.repositories === 9,
      `pipeline=${INTEGRATION_PIPELINE_STAGES.join("→")} inventory locked`,
    ),
  );

  const intFiles = listTsFiles(path.join(root, "lib/integration"));
  const coupleHits = intFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data)|from\s+["'][^"']*lib\/(frontend|backend|data)/.test(
      text,
    );
  });
  checks.push(
    check(
      "INTF-NO-COUPLE",
      "PI-5.1",
      "No frontend/backend/data coupling in integration foundation",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${intFiles.length}`,
    ),
  );

  const treeOk =
    fs.existsSync(path.join(root, "lib/integration/foundation")) &&
    fs.existsSync(
      path.join(root, "lib/integration/verify/integration.foundation.gate.ts"),
    );
  checks.push(
    check(
      "INTF-TREE",
      "PI-5.1",
      "Integration foundation tree established",
      treeOk,
      treeOk ? "lib/integration/foundation + verify" : "missing",
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-5.1",
    foundationId: INTEGRATION_FOUNDATION_ID,
    gateId: INTEGRATION_FOUNDATION_GATE,
    architectureId: INTEGRATION_ARCHITECTURE_ID,
    passed,
    checks,
    summary: {
      pipelineStages: INTEGRATION_PIPELINE_STAGES.length,
      bindingKinds: INTEGRATION_BINDING_KINDS.length,
      integrationPoints: INTEGRATION_POINT_CATALOGUE.length,
      ownershipRows: INTEGRATION_OWNERSHIP.length,
      domains: INTEGRATION_INVENTORY_REFS.domains,
    },
  };
}

export function assertIntegrationFoundationGate(
  report: IntegrationFoundationReport = runIntegrationFoundationGate(),
): IntegrationFoundationReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-5.1 Integration foundation gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
