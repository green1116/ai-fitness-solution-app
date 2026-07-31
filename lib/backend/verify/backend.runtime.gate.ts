/**
 * PI-3.3 — Domain Ports / Runtime verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { DOMAIN_OWNERSHIP, FORBIDDEN_DOMAIN_PATHS } from "../foundation/domain-ownership";
import { BACKEND_COMMAND_OWNERSHIP } from "../foundation/command-ownership";
import { BACKEND_SERVICE_IDS } from "../foundation/service-catalogue";
import { resolveServiceForAction } from "../services/action-service-routing";
import { runBackendFoundationGate } from "./backend.foundation.gate";
import { runBackendServiceLayerGate } from "./backend.service.gate";
import {
  DOMAIN_PORT_LAYER_ID,
  DOMAIN_PORT_REGISTRY,
  getDomainPortRecord,
  resolveDomainPort,
} from "../runtime/domain-port-registry";
import {
  RUNTIME_ADAPTER_BINDINGS,
  RUNTIME_BINDING_LAYER_ID,
  SERVICE_RUNTIME_SURFACES,
  adaptersForService,
} from "../runtime/runtime-bindings";
import {
  RUNTIME_SURFACE_IDS,
  RUNTIME_SURFACE_OWNERSHIP,
} from "../runtime/runtime-surfaces";
import { resolveRuntimeBindingPlan } from "../runtime/runtime-plan";

export type RuntimeGateCheck = Readonly<{
  id: string;
  source: "PI-3.1" | "PI-3.2" | "PI-3.3" | "PD-5.1";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type RuntimeGateReport = Readonly<{
  layer: "PI-3.3";
  portLayerId: typeof DOMAIN_PORT_LAYER_ID;
  bindingLayerId: typeof RUNTIME_BINDING_LAYER_ID;
  passed: boolean;
  checks: readonly RuntimeGateCheck[];
  summary: Readonly<{
    domainPorts: number;
    runtimeSurfaces: number;
    adapters: number;
    foundationPassed: boolean;
    servicePassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: RuntimeGateCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): RuntimeGateCheck {
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

export function runBackendRuntimeGate(
  rootDir?: string,
): RuntimeGateReport {
  const root = resolveRoot(rootDir);
  const checks: RuntimeGateCheck[] = [];

  const foundation = runBackendFoundationGate(root);
  const services = runBackendServiceLayerGate(root);

  checks.push(
    check(
      "RT-FOUNDATION",
      "PI-3.1",
      "PI-3.1 foundation intact for Domain ports",
      foundation.passed,
      `domains=${foundation.summary.domains} commands=${foundation.summary.commands}`,
    ),
  );

  checks.push(
    check(
      "RT-SERVICE",
      "PI-3.2",
      "PI-3.2 service routing intact for runtime bindings",
      services.passed,
      `routed=${services.summary.routedActions} services=${services.summary.services}`,
    ),
  );

  const portAlign = DOMAIN_PORT_REGISTRY.every((port) => {
    const foundationRow = DOMAIN_OWNERSHIP.find((d) => d.id === port.domainId);
    return (
      foundationRow &&
      foundationRow.path === port.modulePath &&
      foundationRow.baselineId === port.baselineId
    );
  });
  const portFilesOk = DOMAIN_PORT_REGISTRY.every(
    (port) =>
      fs.existsSync(path.join(root, port.modulePath)) &&
      fs.existsSync(path.join(root, port.baselineLockPath)),
  );
  checks.push(
    check(
      "RT-PORTS",
      "PI-3.3",
      "Domain ports match PI-3.1 foundation registry",
      DOMAIN_PORT_REGISTRY.length === 5 &&
        DOMAIN_PORT_LAYER_ID === "product-backend-domain-ports-v1" &&
        portAlign &&
        portFilesOk,
      DOMAIN_PORT_REGISTRY.map((p) => p.domainId).join(","),
    ),
  );

  checks.push(
    check(
      "RT-SURFACES",
      "PD-5.1",
      "DOM-* runtime surfaces owned by M11–M15 only",
      RUNTIME_SURFACE_IDS.length === 13 &&
        RUNTIME_SURFACE_OWNERSHIP.length === 13 &&
        RUNTIME_SURFACE_OWNERSHIP.every((row) =>
          DOMAIN_OWNERSHIP.some((d) => d.id === row.ownerDomain),
        ),
      `surfaces=${RUNTIME_SURFACE_IDS.length}`,
    ),
  );

  const adapterFilesOk = RUNTIME_ADAPTER_BINDINGS.every((a) =>
    fs.existsSync(path.join(root, a.modulePath)),
  );
  const adapterOwnersOk = RUNTIME_ADAPTER_BINDINGS.every((a) =>
    a.ownerDomains.every((id) =>
      DOMAIN_OWNERSHIP.some((d) => d.id === id),
    ),
  );
  checks.push(
    check(
      "RT-ADAPTERS",
      "PI-3.3",
      "Runtime adapter bindings point at existing modules under M ownership",
      RUNTIME_ADAPTER_BINDINGS.length >= 6 &&
        RUNTIME_BINDING_LAYER_ID === "product-backend-runtime-bindings-v1" &&
        adapterFilesOk &&
        adapterOwnersOk,
      RUNTIME_ADAPTER_BINDINGS.map((a) => a.adapterId).join(","),
    ),
  );

  const serviceSurfaceOk = BACKEND_SERVICE_IDS.every((svc) => {
    const surfaces = SERVICE_RUNTIME_SURFACES[svc];
    return surfaces.length > 0;
  });
  checks.push(
    check(
      "RT-SVC-SURFACES",
      "PI-3.2",
      "Runtime bindings match PI-3.2 service routing surfaces",
      serviceSurfaceOk &&
        adaptersForService("SVC-AGENT").some((a) => a.adapterId === "RT-V80-AUTOPILOT") &&
        adaptersForService("SVC-KNOWLEDGE-INTAKE").some(
          (a) => a.adapterId === "RT-V80-TENDER",
        ),
      `services=${BACKEND_SERVICE_IDS.length}`,
    ),
  );

  const planUpload = resolveRuntimeBindingPlan("ACT-03-01");
  const planNav = resolveRuntimeBindingPlan("ACT-01-03");
  const planAgent = resolveRuntimeBindingPlan("ACT-04-04");
  const planGov = resolveRuntimeBindingPlan("ACT-09-06");
  checks.push(
    check(
      "RT-PLAN",
      "PI-3.3",
      "Runtime binding plans resolve ports + adapters for service routes",
      planUpload.primaryPort.domainId === "M11" &&
        planUpload.serviceId === resolveServiceForAction("ACT-03-01") &&
        planUpload.requiresRuntimeAdapter &&
        planUpload.adapters.length > 0 &&
        planNav.requiresRuntimeAdapter === false &&
        planNav.adapters.length === 0 &&
        planAgent.primaryPort.domainId === "M12" &&
        planAgent.adapters.some((a) => a.adapterId === "RT-V80-AUTOPILOT") &&
        planGov.primaryPort.domainId === "M15" &&
        getDomainPortRecord("M15").capabilityKind === "evolution",
      `upload=${planUpload.primaryPort.domainId} navAdapters=${planNav.adapters.length} agent=${planAgent.serviceId} gov=${planGov.primaryPort.domainId}`,
    ),
  );

  const allActionsBind = BACKEND_COMMAND_OWNERSHIP.every((row) => {
    try {
      const plan = resolveRuntimeBindingPlan(row.actionId);
      return (
        plan.primaryPort.domainId === row.primaryDomain &&
        plan.serviceId === resolveServiceForAction(row.actionId)
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "RT-OWNERSHIP",
      "PI-3.3",
      "Existing Domain ownership respected across all Commands",
      allActionsBind && resolveDomainPort("M13").capabilityKind === "os",
      `actions=${BACKEND_COMMAND_OWNERSHIP.length}`,
    ),
  );

  const forbidden = FORBIDDEN_DOMAIN_PATHS.filter((p) =>
    fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "RT-NO-NEW",
      "PI-3.3",
      "No new Domain / API families",
      forbidden.length === 0 &&
        !RUNTIME_ADAPTER_BINDINGS.some((a) => a.modulePath.startsWith("lib/product/m16")),
      forbidden.length ? forbidden.join(",") : "M11–M15 + existing adapters",
    ),
  );

  const runtimeFiles = listTsFiles(path.join(root, "lib/backend/runtime"));
  const feHits = runtimeFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/frontend|from\s+["'][^"']*lib\/frontend/.test(
      text,
    );
  });
  checks.push(
    check(
      "RT-NO-FE",
      "PI-3.3",
      "No frontend coupling in Domain ports / runtime layer",
      feHits.length === 0,
      feHits.length
        ? feHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${runtimeFiles.length}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-3.3",
    portLayerId: DOMAIN_PORT_LAYER_ID,
    bindingLayerId: RUNTIME_BINDING_LAYER_ID,
    passed,
    checks,
    summary: {
      domainPorts: DOMAIN_PORT_REGISTRY.length,
      runtimeSurfaces: RUNTIME_SURFACE_IDS.length,
      adapters: RUNTIME_ADAPTER_BINDINGS.length,
      foundationPassed: foundation.passed,
      servicePassed: services.passed,
    },
  };
}

export function assertBackendRuntimeGate(
  report: RuntimeGateReport = runBackendRuntimeGate(),
): RuntimeGateReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-3.3 Runtime gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
