/**
 * PI-5.5 — Integration Verification / Hardening gate.
 * Consolidates PI-5.1…PI-5.4 and asserts cross-layer hardening invariants.
 */
import fs from "node:fs";
import path from "node:path";

import { INTEGRATION_BINDING_KINDS } from "../foundation/binding-kinds";
import {
  INTEGRATION_ARCHITECTURE_ID,
  INTEGRATION_BASELINE_REF as FOUNDATION_BASELINE_REF,
  INTEGRATION_FOUNDATION_ID,
} from "../foundation/integration.constants";
import {
  INTEGRATION_POINT_CATALOGUE,
  INTEGRATION_POINT_IDS,
} from "../foundation/integration-points";
import { INTEGRATION_PIPELINE_STAGES } from "../foundation/pipeline-stages";
import { INTEGRATION_ROUTING_LAYER_ID } from "../routing/routing.constants";
import { INTEGRATION_WORKFLOW_IDS } from "../routing/workflow-kinds";
import { GOLDEN_PATH_IDS } from "../routing/golden-path-routing";
import { INTEGRATION_DOMAIN_IDS } from "../routing/domain-stage-routing";
import { resolveIntegrationRoutePlan } from "../routing/integration-route-plan";
import { INTEGRATION_RUNTIME_ID } from "../runtime/runtime.constants";
import { SEAM_RUNTIME_BINDINGS } from "../runtime/seam-runtime-bindings";
import { WORKFLOW_RUNTIME_BINDINGS } from "../runtime/workflow-runtime-bindings";
import { resolveIntegrationRuntimePlan } from "../runtime/integration-runtime-plan";
import { INTEGRATION_EXPOSURE_LAYER_ID } from "../exposure/exposure.constants";
import {
  CONTRACT_EXPOSURE_BINDINGS,
  INTEGRATION_CONTRACT_IDS,
} from "../exposure/contract-exposure-bindings";
import { BINDING_KIND_EXPOSURE } from "../exposure/binding-kind-exposure";
import { resolveIntegrationExposurePlan } from "../exposure/integration-exposure-plan";
import {
  INTEGRATION_ARCHITECTURE_REF,
  INTEGRATION_BASELINE_REF,
  INTEGRATION_FOUNDATION_REF,
  INTEGRATION_FREEZE_REF,
  INTEGRATION_HARDENING_BASELINE,
  INTEGRATION_HARDENING_EVIDENCE_SCRIPTS,
  INTEGRATION_HARDENING_GATE,
  INTEGRATION_HARDENING_ID,
  INTEGRATION_HARDENING_INVARIANT_IDS,
  INTEGRATION_HARDENING_MODULES,
  INTEGRATION_HARDENING_PACKAGES,
} from "../hardening/integration.hardening";
import { runIntegrationFoundationGate } from "./integration.foundation.gate";
import { runIntegrationRoutingGate } from "./integration.routing.gate";
import { runIntegrationRuntimeGate } from "./integration.runtime.gate";
import { runIntegrationExposureGate } from "./integration.exposure.gate";

export type IntegrationHardeningCheck = Readonly<{
  id: string;
  source: "PI-5.1" | "PI-5.2" | "PI-5.3" | "PI-5.4" | "PI-5.5" | "PD-6.8";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type IntegrationHardeningReport = Readonly<{
  layer: "PI-5.5";
  hardeningId: typeof INTEGRATION_HARDENING_ID;
  gateId: typeof INTEGRATION_HARDENING_GATE;
  baselineId: typeof INTEGRATION_BASELINE_REF;
  freezeId: typeof INTEGRATION_FREEZE_REF;
  passed: boolean;
  hardened: boolean;
  checks: readonly IntegrationHardeningCheck[];
  summary: Readonly<{
    packages: number;
    invariants: number;
    domains: number;
    points: number;
    workflows: number;
    contracts: number;
    foundationPassed: boolean;
    routingPassed: boolean;
    runtimePassed: boolean;
    exposurePassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: IntegrationHardeningCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): IntegrationHardeningCheck {
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

export function runIntegrationHardeningGate(
  rootDir?: string,
): IntegrationHardeningReport {
  const root = resolveRoot(rootDir);
  const checks: IntegrationHardeningCheck[] = [];

  const foundation = runIntegrationFoundationGate(root);
  const routing = runIntegrationRoutingGate(root);
  const runtime = runIntegrationRuntimeGate(root);
  const exposure = runIntegrationExposureGate(root);

  checks.push(
    check(
      "IHARDEN-PI-5.1",
      "PI-5.1",
      "Foundation intact",
      foundation.passed &&
        foundation.foundationId === INTEGRATION_FOUNDATION_ID &&
        INTEGRATION_FOUNDATION_REF === INTEGRATION_FOUNDATION_ID &&
        foundation.summary.integrationPoints ===
          INTEGRATION_HARDENING_BASELINE.integrationPoints &&
        foundation.summary.pipelineStages ===
          INTEGRATION_HARDENING_BASELINE.pipelineStages,
      `points=${foundation.summary.integrationPoints} stages=${foundation.summary.pipelineStages}`,
    ),
  );

  checks.push(
    check(
      "IHARDEN-PI-5.2",
      "PI-5.2",
      "Routing intact",
      routing.passed &&
        routing.layerId === INTEGRATION_ROUTING_LAYER_ID &&
        routing.summary.workflows ===
          INTEGRATION_HARDENING_BASELINE.workflows &&
        routing.summary.goldenPaths ===
          INTEGRATION_HARDENING_BASELINE.goldenPaths,
      `workflows=${routing.summary.workflows} gps=${routing.summary.goldenPaths}`,
    ),
  );

  checks.push(
    check(
      "IHARDEN-PI-5.3",
      "PI-5.3",
      "Runtime intact",
      runtime.passed &&
        runtime.runtimeId === INTEGRATION_RUNTIME_ID &&
        runtime.summary.seamAdapters ===
          INTEGRATION_HARDENING_BASELINE.seamAdapters &&
        runtime.summary.workflowBindings ===
          INTEGRATION_HARDENING_BASELINE.workflows,
      `seams=${runtime.summary.seamAdapters} workflows=${runtime.summary.workflowBindings}`,
    ),
  );

  checks.push(
    check(
      "IHARDEN-PI-5.4",
      "PI-5.4",
      "Exposure intact",
      exposure.passed &&
        exposure.layerId === INTEGRATION_EXPOSURE_LAYER_ID &&
        exposure.summary.contracts ===
          INTEGRATION_HARDENING_BASELINE.contracts &&
        exposure.summary.exposures ===
          INTEGRATION_HARDENING_BASELINE.kindExposures,
      `exposures=${exposure.summary.exposures} contracts=${exposure.summary.contracts}`,
    ),
  );

  checks.push(
    check(
      "IHARDEN-IDS",
      "PD-6.8",
      "Hardening / baseline / freeze IDs locked",
      INTEGRATION_HARDENING_ID === "product-integration-hardening-v1" &&
        INTEGRATION_HARDENING_GATE === "product-integration-hardening-gate" &&
        INTEGRATION_BASELINE_REF === "product-integration-baseline-v1" &&
        FOUNDATION_BASELINE_REF === INTEGRATION_BASELINE_REF &&
        INTEGRATION_FREEZE_REF === "product-integration-freeze-1" &&
        INTEGRATION_ARCHITECTURE_REF === INTEGRATION_ARCHITECTURE_ID &&
        INTEGRATION_HARDENING_PACKAGES.length === 4,
      `${INTEGRATION_HARDENING_ID} / ${INTEGRATION_BASELINE_REF} / ${INTEGRATION_FREEZE_REF}`,
    ),
  );

  const missingScripts = INTEGRATION_HARDENING_EVIDENCE_SCRIPTS.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  const missingModules = INTEGRATION_HARDENING_MODULES.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "IHARDEN-EVIDENCE",
      "PI-5.5",
      "Hardening evidence scripts and integration modules present",
      missingScripts.length === 0 && missingModules.length === 0,
      missingScripts.length || missingModules.length
        ? `missingScripts=${missingScripts.join(",")} missingModules=${missingModules.join(",")}`
        : `scripts=${INTEGRATION_HARDENING_EVIDENCE_SCRIPTS.length} modules=${INTEGRATION_HARDENING_MODULES.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "IHARDEN-NO-NEW",
      "PI-5.5",
      "No new Domain / integration families",
      forbidden.length === 0 &&
        INTEGRATION_DOMAIN_IDS.length ===
          INTEGRATION_HARDENING_BASELINE.domains &&
        INTEGRATION_POINT_IDS.length ===
          INTEGRATION_HARDENING_BASELINE.integrationPoints &&
        INTEGRATION_WORKFLOW_IDS.length ===
          INTEGRATION_HARDENING_BASELINE.workflows &&
        INTEGRATION_CONTRACT_IDS.length ===
          INTEGRATION_HARDENING_BASELINE.contracts &&
        !fs.existsSync(path.join(root, "lib/integration/new-families")) &&
        !fs.existsSync(path.join(root, "lib/integration/engines")),
      forbidden.length
        ? forbidden.join(",")
        : `domains=${INTEGRATION_DOMAIN_IDS.length} points=${INTEGRATION_POINT_IDS.length} wf=${INTEGRATION_WORKFLOW_IDS.length}`,
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
      "IHARDEN-NO-COUPLE",
      "PI-5.5",
      "No FE/BE/Data coupling across integration tree",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${intFiles.length}`,
    ),
  );

  const crossLayerOk =
    INTEGRATION_PIPELINE_STAGES.length ===
      INTEGRATION_HARDENING_BASELINE.pipelineStages &&
    INTEGRATION_BINDING_KINDS.length ===
      INTEGRATION_HARDENING_BASELINE.bindingKinds &&
    INTEGRATION_POINT_CATALOGUE.length ===
      INTEGRATION_HARDENING_BASELINE.integrationPoints &&
    SEAM_RUNTIME_BINDINGS.length ===
      INTEGRATION_HARDENING_BASELINE.seamAdapters &&
    WORKFLOW_RUNTIME_BINDINGS.length ===
      INTEGRATION_HARDENING_BASELINE.workflows &&
    GOLDEN_PATH_IDS.length === INTEGRATION_HARDENING_BASELINE.goldenPaths &&
    CONTRACT_EXPOSURE_BINDINGS.length ===
      INTEGRATION_HARDENING_BASELINE.contracts &&
    BINDING_KIND_EXPOSURE.length ===
      INTEGRATION_HARDENING_BASELINE.kindExposures &&
    INTEGRATION_BINDING_KINDS.every((kind) => {
      try {
        const domain =
          kind === "NAV" || kind === "PREF" ? null : ("M13" as const);
        const route = resolveIntegrationRoutePlan(kind, domain);
        const rt = resolveIntegrationRuntimePlan(kind, domain);
        const exp = resolveIntegrationExposurePlan(kind, domain);
        return (
          route.matchesFoundation &&
          rt.matchesRouting &&
          exp.matchesRuntime &&
          exp.bindingKind === kind
        );
      } catch {
        return false;
      }
    });

  checks.push(
    check(
      "IHARDEN-CROSS",
      "PI-5.5",
      "Cross-layer Foundation / Routing / Runtime / Exposure inventory locked",
      crossLayerOk,
      `kinds=${INTEGRATION_BINDING_KINDS.length} points=${INTEGRATION_POINT_IDS.length} contracts=${INTEGRATION_CONTRACT_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "IHARDEN-INVARIANTS",
      "PI-5.5",
      "Hardening invariant catalogue complete",
      INTEGRATION_HARDENING_INVARIANT_IDS.length === 8 &&
        INTEGRATION_HARDENING_INVARIANT_IDS.includes("INV-FOUNDATION") &&
        INTEGRATION_HARDENING_INVARIANT_IDS.includes("INV-EXPOSURE") &&
        INTEGRATION_HARDENING_INVARIANT_IDS.includes("INV-NO-COUPLE"),
      INTEGRATION_HARDENING_INVARIANT_IDS.join(","),
    ),
  );

  const childGatesPass =
    foundation.passed &&
    routing.passed &&
    runtime.passed &&
    exposure.passed;
  checks.push(
    check(
      "IHARDEN-GATES",
      "PI-5.5",
      "Hardening gates pass (PI-5.1…PI-5.4 nested)",
      childGatesPass,
      `foundation=${foundation.passed} routing=${routing.passed} runtime=${runtime.passed} exposure=${exposure.passed}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-5.5",
    hardeningId: INTEGRATION_HARDENING_ID,
    gateId: INTEGRATION_HARDENING_GATE,
    baselineId: INTEGRATION_BASELINE_REF,
    freezeId: INTEGRATION_FREEZE_REF,
    passed,
    hardened: passed,
    checks,
    summary: {
      packages: INTEGRATION_HARDENING_PACKAGES.length,
      invariants: INTEGRATION_HARDENING_INVARIANT_IDS.length,
      domains: INTEGRATION_DOMAIN_IDS.length,
      points: INTEGRATION_POINT_IDS.length,
      workflows: INTEGRATION_WORKFLOW_IDS.length,
      contracts: INTEGRATION_CONTRACT_IDS.length,
      foundationPassed: foundation.passed,
      routingPassed: routing.passed,
      runtimePassed: runtime.passed,
      exposurePassed: exposure.passed,
    },
  };
}

export function assertIntegrationHardeningGate(
  report: IntegrationHardeningReport = runIntegrationHardeningGate(),
): IntegrationHardeningReport {
  if (!report.passed || !report.hardened) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-5.5 Integration hardening gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
