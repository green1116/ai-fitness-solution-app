/**
 * PI-5.4 — Integration exposure verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { INTEGRATION_BINDING_KINDS } from "../foundation/binding-kinds";
import { INTEGRATION_POINT_IDS } from "../foundation/integration-points";
import { INTEGRATION_WORKFLOW_IDS } from "../routing/workflow-kinds";
import { INTEGRATION_RUNTIME_ID } from "../runtime/runtime.constants";
import {
  INTEGRATION_CONTRACTS_REF,
  INTEGRATION_EXPOSURE_GATE,
  INTEGRATION_EXPOSURE_LAYER_ID,
  INTEGRATION_ROUTING_REF,
  INTEGRATION_RUNTIME_REF,
} from "../exposure/exposure.constants";
import {
  CONTRACT_EXPOSURE_BINDINGS,
  INTEGRATION_CONTRACT_IDS,
} from "../exposure/contract-exposure-bindings";
import { BINDING_KIND_EXPOSURE } from "../exposure/binding-kind-exposure";
import { resolveIntegrationExposurePlan } from "../exposure/integration-exposure-plan";
import { runIntegrationRuntimeGate } from "./integration.runtime.gate";
import { INTEGRATION_ROUTING_LAYER_ID } from "../routing/routing.constants";

export type IntegrationExposureCheck = Readonly<{
  id: string;
  source: "PI-5.1" | "PI-5.2" | "PI-5.3" | "PI-5.4" | "PD-6.2";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type IntegrationExposureReport = Readonly<{
  layer: "PI-5.4";
  layerId: typeof INTEGRATION_EXPOSURE_LAYER_ID;
  gateId: typeof INTEGRATION_EXPOSURE_GATE;
  passed: boolean;
  checks: readonly IntegrationExposureCheck[];
  summary: Readonly<{
    exposures: number;
    contracts: number;
    workflows: number;
    runtimePassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: IntegrationExposureCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): IntegrationExposureCheck {
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

export function runIntegrationExposureGate(
  rootDir?: string,
): IntegrationExposureReport {
  const root = resolveRoot(rootDir);
  const checks: IntegrationExposureCheck[] = [];

  const runtime = runIntegrationRuntimeGate(root);
  checks.push(
    check(
      "INTE-RUNTIME",
      "PI-5.3",
      "PI-5.3 integration runtime intact for exposure",
      runtime.passed &&
        runtime.runtimeId === INTEGRATION_RUNTIME_ID &&
        INTEGRATION_RUNTIME_REF === INTEGRATION_RUNTIME_ID &&
        INTEGRATION_ROUTING_REF === INTEGRATION_ROUTING_LAYER_ID &&
        INTEGRATION_CONTRACTS_REF === "product-integration-contracts-v1",
      `seams=${runtime.summary.seamAdapters} workflows=${runtime.summary.workflowBindings}`,
    ),
  );

  checks.push(
    check(
      "INTE-IDS",
      "PI-5.4",
      "Integration exposure layer IDs locked; closed contract set",
      INTEGRATION_EXPOSURE_LAYER_ID === "product-integration-exposure-v1" &&
        INTEGRATION_EXPOSURE_GATE === "product-integration-exposure-gate" &&
        INTEGRATION_CONTRACT_IDS.length === 8 &&
        CONTRACT_EXPOSURE_BINDINGS.length === 8 &&
        BINDING_KIND_EXPOSURE.length === INTEGRATION_BINDING_KINDS.length,
      `layer=${INTEGRATION_EXPOSURE_LAYER_ID} contracts=${INTEGRATION_CONTRACT_IDS.length}`,
    ),
  );

  const matchRuntime = INTEGRATION_BINDING_KINDS.every((kind) => {
    try {
      const domain =
        kind === "NAV" || kind === "PREF" ? null : ("M13" as const);
      const plan = resolveIntegrationExposurePlan(kind, domain);
      return (
        plan.matchesRuntime &&
        plan.reusesExistingWorkflows &&
        plan.runtimeId === INTEGRATION_RUNTIME_ID &&
        plan.bindingKind === kind &&
        plan.adapters.length === plan.runtime.adapters.length
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "INTE-MATCH",
      "PI-5.4",
      "Exposure matches runtime bindings",
      matchRuntime,
      `kinds=${INTEGRATION_BINDING_KINDS.length}`,
    ),
  );

  const pointsReuse = CONTRACT_EXPOSURE_BINDINGS.every((c) =>
    c.pointIds.every((id) =>
      (INTEGRATION_POINT_IDS as readonly string[]).includes(id),
    ),
  );
  const bindingPointsReuse = BINDING_KIND_EXPOSURE.every((b) =>
    (INTEGRATION_POINT_IDS as readonly string[]).includes(b.primaryPointId),
  );
  checks.push(
    check(
      "INTE-POINTS",
      "PI-5.1",
      "Existing integration points reused",
      pointsReuse && bindingPointsReuse,
      `contracts=${CONTRACT_EXPOSURE_BINDINGS.length} kindExposures=${BINDING_KIND_EXPOSURE.length}`,
    ),
  );

  const workflowsReuse = BINDING_KIND_EXPOSURE.every((b) =>
    b.workflowBias.every((wf) =>
      (INTEGRATION_WORKFLOW_IDS as readonly string[]).includes(wf),
    ),
  );
  checks.push(
    check(
      "INTE-WORKFLOW",
      "PI-5.2",
      "Existing workflows reused",
      workflowsReuse,
      INTEGRATION_WORKFLOW_IDS.join(","),
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "INTE-NO-NEW-DOMAIN",
      "PI-5.4",
      "No new Domain",
      forbidden.length === 0,
      forbidden.length ? forbidden.join(",") : "M11–M15 only",
    ),
  );

  checks.push(
    check(
      "INTE-NO-NEW-FAM",
      "PD-6.2",
      "No new integration families",
      INTEGRATION_CONTRACT_IDS.length === 8 &&
        !fs.existsSync(path.join(root, "lib/integration/exposure/families")) &&
        !fs.existsSync(path.join(root, "lib/integration/new-contracts")),
      `contracts=${INTEGRATION_CONTRACT_IDS.length} modes locked`,
    ),
  );

  const exposureFiles = listTsFiles(path.join(root, "lib/integration/exposure"));
  const coupleHits = exposureFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data)|from\s+["'][^"']*lib\/(frontend|backend|data)/.test(
      text,
    );
  });
  checks.push(
    check(
      "INTE-NO-COUPLE",
      "PI-5.4",
      "No FE/BE/Data coupling in integration exposure",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${exposureFiles.length}`,
    ),
  );

  const api = resolveIntegrationExposurePlan("API", "M11");
  const nav = resolveIntegrationExposurePlan("NAV");
  const apiNav = resolveIntegrationExposurePlan("API+NAV", "M14");
  checks.push(
    check(
      "INTE-SPOT",
      "PD-6.2",
      "Golden exposure plans surface contracts and modes",
      api.modes.includes("domain-outcome") &&
        api.modes.includes("persist-sot") &&
        api.contracts.some((c) => c.contractId === "C4") &&
        nav.modes.includes("client-nav") &&
        !nav.modes.includes("persist-sot") &&
        apiNav.modes.includes("client-nav") &&
        apiNav.workflows.includes("WF-NAV"),
      `api=${api.modes.join("+")} nav=${nav.primaryDomain}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-5.4",
    layerId: INTEGRATION_EXPOSURE_LAYER_ID,
    gateId: INTEGRATION_EXPOSURE_GATE,
    passed,
    checks,
    summary: {
      exposures: BINDING_KIND_EXPOSURE.length,
      contracts: INTEGRATION_CONTRACT_IDS.length,
      workflows: INTEGRATION_WORKFLOW_IDS.length,
      runtimePassed: runtime.passed,
    },
  };
}

export function assertIntegrationExposureGate(
  report: IntegrationExposureReport = runIntegrationExposureGate(),
): IntegrationExposureReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-5.4 Integration exposure gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
