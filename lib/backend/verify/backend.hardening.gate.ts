/**
 * PI-3.5 — Backend Verification / Hardening gate.
 * Consolidates PI-3.1…PI-3.4 and asserts cross-layer hardening invariants.
 */
import fs from "node:fs";
import path from "node:path";

import {
  API_FAMILY_IDS,
  API_SURFACE_LAYER_ID,
} from "../api/api-families";
import { API_SURFACE_BINDINGS } from "../api/api-surface-bindings";
import { resolveApiExposurePlan } from "../api/api-exposure-plan";
import {
  BACKEND_ARCHITECTURE_BASELINE_ID,
  BACKEND_ARCHITECTURE_GATE,
  BACKEND_FOUNDATION_ID,
  BACKEND_LAYER_IDS,
  PRIMARY_COMMAND_TOTAL,
} from "../foundation/backend.constants";
import { BACKEND_COMMAND_OWNERSHIP } from "../foundation/command-ownership";
import {
  DOMAIN_OWNERSHIP,
  FORBIDDEN_DOMAIN_PATHS,
  PRODUCT_DOMAIN_IDS,
} from "../foundation/domain-ownership";
import { BACKEND_SERVICE_IDS } from "../foundation/service-catalogue";
import { ACTION_SERVICE_ROUTING } from "../services/action-service-routing";
import { DOMAIN_PORT_REGISTRY } from "../runtime/domain-port-registry";
import {
  RUNTIME_ADAPTER_BINDINGS,
  RUNTIME_BINDING_LAYER_ID,
} from "../runtime/runtime-bindings";
import { RUNTIME_SURFACE_IDS } from "../runtime/runtime-surfaces";
import { resolveRuntimeBindingPlan } from "../runtime/runtime-plan";
import {
  BACKEND_ARCHITECTURE_BASELINE_GATE,
  BACKEND_ARCHITECTURE_FREEZE_ID,
  BACKEND_CHILD_ARCHITECTURE_GATES,
  BACKEND_HARDENING_BASELINE,
  BACKEND_HARDENING_BASELINE_REF,
  BACKEND_HARDENING_EVIDENCE_SCRIPTS,
  BACKEND_HARDENING_GATE,
  BACKEND_HARDENING_ID,
  BACKEND_HARDENING_MODULES,
  BACKEND_HARDENING_PACKAGES,
  HARDENING_INVARIANT_IDS,
} from "../hardening/backend.hardening";
import { runBackendFoundationGate } from "./backend.foundation.gate";
import { runBackendServiceLayerGate } from "./backend.service.gate";
import { runBackendRuntimeGate } from "./backend.runtime.gate";
import { runBackendApiSurfaceGate } from "./backend.api.gate";

export type HardeningGateCheck = Readonly<{
  id: string;
  source: "PI-3.1" | "PI-3.2" | "PI-3.3" | "PI-3.4" | "PI-3.5" | "PD-5.8";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type HardeningGateReport = Readonly<{
  layer: "PI-3.5";
  hardeningId: typeof BACKEND_HARDENING_ID;
  gateId: typeof BACKEND_HARDENING_GATE;
  baselineId: typeof BACKEND_ARCHITECTURE_BASELINE_ID;
  freezeId: typeof BACKEND_ARCHITECTURE_FREEZE_ID;
  passed: boolean;
  hardened: boolean;
  checks: readonly HardeningGateCheck[];
  summary: Readonly<{
    packages: number;
    invariants: number;
    domains: number;
    commands: number;
    services: number;
    apiFamilies: number;
    apiBindings: number;
    foundationPassed: boolean;
    servicePassed: boolean;
    runtimePassed: boolean;
    apiPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: HardeningGateCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): HardeningGateCheck {
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

function hasFrontendImport(file: string): boolean {
  const text = fs.readFileSync(file, "utf8");
  return /from\s+["']@\/lib\/frontend|from\s+["'][^"']*lib\/frontend/.test(
    text,
  );
}

export function runBackendHardeningGate(
  rootDir?: string,
): HardeningGateReport {
  const root = resolveRoot(rootDir);
  const checks: HardeningGateCheck[] = [];

  const foundation = runBackendFoundationGate(root);
  const services = runBackendServiceLayerGate(root);
  const runtime = runBackendRuntimeGate(root);
  const api = runBackendApiSurfaceGate(root);

  checks.push(
    check(
      "HARDEN-PI-3.1",
      "PI-3.1",
      "Foundation intact",
      foundation.passed &&
        foundation.foundationId === BACKEND_FOUNDATION_ID &&
        foundation.gateId === BACKEND_ARCHITECTURE_GATE,
      `commands=${foundation.summary.commands} domains=${foundation.summary.domains} layers=${foundation.summary.layers}`,
    ),
  );

  checks.push(
    check(
      "HARDEN-PI-3.2",
      "PI-3.2",
      "Service / command routing intact",
      services.passed &&
        services.summary.routedActions === PRIMARY_COMMAND_TOTAL &&
        services.summary.services === BACKEND_HARDENING_BASELINE.services,
      `routed=${services.summary.routedActions} services=${services.summary.services}`,
    ),
  );

  checks.push(
    check(
      "HARDEN-PI-3.3",
      "PI-3.3",
      "Domain / runtime bindings intact",
      runtime.passed &&
        runtime.summary.domainPorts === BACKEND_HARDENING_BASELINE.domains &&
        runtime.summary.runtimeSurfaces ===
          BACKEND_HARDENING_BASELINE.runtimeSurfaces &&
        runtime.summary.adapters ===
          BACKEND_HARDENING_BASELINE.runtimeAdapters &&
        RUNTIME_BINDING_LAYER_ID === "product-backend-runtime-bindings-v1",
      `ports=${runtime.summary.domainPorts} surfaces=${runtime.summary.runtimeSurfaces} adapters=${runtime.summary.adapters}`,
    ),
  );

  checks.push(
    check(
      "HARDEN-PI-3.4",
      "PI-3.4",
      "API exposure intact",
      api.passed &&
        api.layerId === API_SURFACE_LAYER_ID &&
        api.summary.families === BACKEND_HARDENING_BASELINE.apiFamilies &&
        api.summary.bindings === BACKEND_HARDENING_BASELINE.apiBindings,
      `families=${api.summary.families} bindings=${api.summary.bindings} http=${api.summary.httpBindings}`,
    ),
  );

  checks.push(
    check(
      "HARDEN-IDS",
      "PD-5.8",
      "Hardening / baseline / freeze IDs locked",
      BACKEND_HARDENING_ID === "product-backend-hardening-v1" &&
        BACKEND_HARDENING_GATE === "product-backend-hardening-gate" &&
        BACKEND_HARDENING_BASELINE_REF ===
          "product-backend-architecture-baseline-v1" &&
        BACKEND_ARCHITECTURE_FREEZE_ID ===
          "product-backend-architecture-freeze-1" &&
        BACKEND_ARCHITECTURE_BASELINE_GATE ===
          "product-backend-architecture-baseline-gate" &&
        BACKEND_CHILD_ARCHITECTURE_GATES.length === 7,
      `${BACKEND_HARDENING_ID} / ${BACKEND_ARCHITECTURE_BASELINE_ID} / ${BACKEND_ARCHITECTURE_FREEZE_ID}`,
    ),
  );

  const missingScripts = BACKEND_HARDENING_EVIDENCE_SCRIPTS.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  const missingModules = BACKEND_HARDENING_MODULES.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "HARDEN-EVIDENCE",
      "PI-3.5",
      "Hardening evidence scripts and backend modules present",
      missingScripts.length === 0 &&
        missingModules.length === 0 &&
        BACKEND_HARDENING_PACKAGES.length === 4,
      missingScripts.length || missingModules.length
        ? `missingScripts=${missingScripts.join(",")} missingModules=${missingModules.join(",")}`
        : `scripts=${BACKEND_HARDENING_EVIDENCE_SCRIPTS.length} modules=${BACKEND_HARDENING_MODULES.length}`,
    ),
  );

  const domainPathsOk = DOMAIN_OWNERSHIP.every((d) =>
    fs.existsSync(path.join(root, d.path)),
  );
  const forbidden = FORBIDDEN_DOMAIN_PATHS.filter((p) =>
    fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "HARDEN-NO-NEW",
      "PI-3.5",
      "No new Domain / API families",
      domainPathsOk &&
        forbidden.length === 0 &&
        PRODUCT_DOMAIN_IDS.length === BACKEND_HARDENING_BASELINE.domains &&
        API_FAMILY_IDS.length === BACKEND_HARDENING_BASELINE.apiFamilies &&
        API_SURFACE_BINDINGS.every((b) =>
          b.families.every((f) =>
            (API_FAMILY_IDS as readonly string[]).includes(f),
          ),
        ),
      forbidden.length
        ? forbidden.join(",")
        : `domains=${PRODUCT_DOMAIN_IDS.length} families=${API_FAMILY_IDS.length}`,
    ),
  );

  const backendFiles = listTsFiles(path.join(root, "lib/backend"));
  const feHits = backendFiles.filter((file) => hasFrontendImport(file));
  checks.push(
    check(
      "HARDEN-NO-FE",
      "PI-3.5",
      "No frontend coupling across backend tree",
      feHits.length === 0,
      feHits.length
        ? feHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${backendFiles.length}`,
    ),
  );

  const crossLayerOk =
    BACKEND_COMMAND_OWNERSHIP.length === PRIMARY_COMMAND_TOTAL &&
    ACTION_SERVICE_ROUTING.length === PRIMARY_COMMAND_TOTAL &&
    API_SURFACE_BINDINGS.length === PRIMARY_COMMAND_TOTAL &&
    DOMAIN_PORT_REGISTRY.length === BACKEND_HARDENING_BASELINE.domains &&
    RUNTIME_SURFACE_IDS.length ===
      BACKEND_HARDENING_BASELINE.runtimeSurfaces &&
    RUNTIME_ADAPTER_BINDINGS.length ===
      BACKEND_HARDENING_BASELINE.runtimeAdapters &&
    BACKEND_SERVICE_IDS.length === BACKEND_HARDENING_BASELINE.services &&
    BACKEND_LAYER_IDS.length === BACKEND_HARDENING_BASELINE.layers &&
    BACKEND_COMMAND_OWNERSHIP.every((row) => {
      try {
        const runtimePlan = resolveRuntimeBindingPlan(row.actionId);
        const apiPlan = resolveApiExposurePlan(row.actionId);
        return (
          runtimePlan.primaryPort.domainId === row.primaryDomain &&
          apiPlan.command === row.command &&
          apiPlan.serviceId === runtimePlan.serviceId
        );
      } catch {
        return false;
      }
    });

  checks.push(
    check(
      "HARDEN-CROSS",
      "PI-3.5",
      "Cross-layer Command / Service / Runtime / API inventory locked",
      crossLayerOk,
      `commands=${BACKEND_COMMAND_OWNERSHIP.length} routes=${ACTION_SERVICE_ROUTING.length} api=${API_SURFACE_BINDINGS.length} services=${BACKEND_SERVICE_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "HARDEN-INVARIANTS",
      "PI-3.5",
      "Hardening invariant catalogue complete",
      HARDENING_INVARIANT_IDS.length === 8 &&
        HARDENING_INVARIANT_IDS.includes("INV-FOUNDATION") &&
        HARDENING_INVARIANT_IDS.includes("INV-API") &&
        HARDENING_INVARIANT_IDS.includes("INV-NO-FE"),
      HARDENING_INVARIANT_IDS.join(","),
    ),
  );

  const childGatesPass =
    foundation.passed &&
    services.passed &&
    runtime.passed &&
    api.passed;
  checks.push(
    check(
      "HARDEN-GATES",
      "PI-3.5",
      "Hardening gates pass (PI-3.1…PI-3.4 nested)",
      childGatesPass,
      `foundation=${foundation.passed} service=${services.passed} runtime=${runtime.passed} api=${api.passed}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-3.5",
    hardeningId: BACKEND_HARDENING_ID,
    gateId: BACKEND_HARDENING_GATE,
    baselineId: BACKEND_ARCHITECTURE_BASELINE_ID,
    freezeId: BACKEND_ARCHITECTURE_FREEZE_ID,
    passed,
    hardened: passed,
    checks,
    summary: {
      packages: BACKEND_HARDENING_PACKAGES.length,
      invariants: HARDENING_INVARIANT_IDS.length,
      domains: PRODUCT_DOMAIN_IDS.length,
      commands: BACKEND_COMMAND_OWNERSHIP.length,
      services: BACKEND_SERVICE_IDS.length,
      apiFamilies: API_FAMILY_IDS.length,
      apiBindings: API_SURFACE_BINDINGS.length,
      foundationPassed: foundation.passed,
      servicePassed: services.passed,
      runtimePassed: runtime.passed,
      apiPassed: api.passed,
    },
  };
}

export function assertBackendHardeningGate(
  report: HardeningGateReport = runBackendHardeningGate(),
): HardeningGateReport {
  if (!report.passed || !report.hardened) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-3.5 Backend hardening gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
