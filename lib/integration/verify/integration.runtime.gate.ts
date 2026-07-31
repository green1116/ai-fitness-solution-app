/**
 * PI-5.3 — Integration runtime verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { INTEGRATION_BINDING_KINDS } from "../foundation/binding-kinds";
import { INTEGRATION_FOUNDATION_ID } from "../foundation/integration.constants";
import {
  INTEGRATION_POINT_CATALOGUE,
  INTEGRATION_POINT_IDS,
} from "../foundation/integration-points";
import { INTEGRATION_ROUTING_LAYER_ID } from "../routing/routing.constants";
import { INTEGRATION_WORKFLOW_IDS } from "../routing/workflow-kinds";
import {
  INTEGRATION_FOUNDATION_REF,
  INTEGRATION_ROUTING_REF,
  INTEGRATION_RUNTIME_GATE,
  INTEGRATION_RUNTIME_ID,
} from "../runtime/runtime.constants";
import {
  SEAM_RUNTIME_BINDINGS,
  seamAdapterMatchesFoundationPoint,
} from "../runtime/seam-runtime-bindings";
import { WORKFLOW_RUNTIME_BINDINGS } from "../runtime/workflow-runtime-bindings";
import { resolveIntegrationRuntimePlan } from "../runtime/integration-runtime-plan";
import { runIntegrationRoutingGate } from "./integration.routing.gate";

export type IntegrationRuntimeCheck = Readonly<{
  id: string;
  source: "PI-5.1" | "PI-5.2" | "PI-5.3" | "PD-6.3";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type IntegrationRuntimeReport = Readonly<{
  layer: "PI-5.3";
  runtimeId: typeof INTEGRATION_RUNTIME_ID;
  gateId: typeof INTEGRATION_RUNTIME_GATE;
  passed: boolean;
  checks: readonly IntegrationRuntimeCheck[];
  summary: Readonly<{
    seamAdapters: number;
    workflowBindings: number;
    bindingKinds: number;
    routingPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: IntegrationRuntimeCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): IntegrationRuntimeCheck {
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

export function runIntegrationRuntimeGate(
  rootDir?: string,
): IntegrationRuntimeReport {
  const root = resolveRoot(rootDir);
  const checks: IntegrationRuntimeCheck[] = [];

  const routing = runIntegrationRoutingGate(root);
  checks.push(
    check(
      "IRTR-ROUTING",
      "PI-5.2",
      "PI-5.2 routing layer intact for integration runtime",
      routing.passed &&
        routing.layerId === INTEGRATION_ROUTING_LAYER_ID &&
        INTEGRATION_ROUTING_REF === INTEGRATION_ROUTING_LAYER_ID &&
        INTEGRATION_FOUNDATION_REF === INTEGRATION_FOUNDATION_ID,
      `workflows=${routing.summary.workflows} kinds=${routing.summary.bindingKinds}`,
    ),
  );

  checks.push(
    check(
      "IRTR-IDS",
      "PI-5.3",
      "Integration runtime IDs locked",
      INTEGRATION_RUNTIME_ID === "product-integration-runtime-v1" &&
        INTEGRATION_RUNTIME_GATE === "product-integration-runtime-gate" &&
        SEAM_RUNTIME_BINDINGS.length === INTEGRATION_POINT_IDS.length &&
        WORKFLOW_RUNTIME_BINDINGS.length === INTEGRATION_WORKFLOW_IDS.length,
      `runtime=${INTEGRATION_RUNTIME_ID} seams=${SEAM_RUNTIME_BINDINGS.length}`,
    ),
  );

  const matchRouting = INTEGRATION_BINDING_KINDS.every((kind) => {
    try {
      const domain =
        kind === "NAV" || kind === "PREF" ? null : ("M13" as const);
      const plan = resolveIntegrationRuntimePlan(kind, domain);
      return (
        plan.matchesRouting &&
        plan.routingLayerId === INTEGRATION_ROUTING_LAYER_ID &&
        plan.route.bindingKind === kind &&
        plan.adapters.length === plan.route.pointIds.length
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "IRTR-MATCH",
      "PI-5.3",
      "Runtime bindings match routing layer",
      matchRouting,
      `kinds=${INTEGRATION_BINDING_KINDS.length}`,
    ),
  );

  const pointsReuse = SEAM_RUNTIME_BINDINGS.every((adapter) => {
    const foundation = INTEGRATION_POINT_CATALOGUE.find(
      (p) => p.pointId === adapter.pointId,
    );
    return (
      seamAdapterMatchesFoundationPoint(adapter) &&
      !!foundation &&
      fs.existsSync(path.join(root, adapter.modulePath))
    );
  });
  checks.push(
    check(
      "IRTR-POINTS",
      "PI-5.1",
      "Existing integration points reused",
      pointsReuse &&
        SEAM_RUNTIME_BINDINGS.length === INTEGRATION_POINT_CATALOGUE.length,
      `adapters=${SEAM_RUNTIME_BINDINGS.length}`,
    ),
  );

  const workflowReuse = WORKFLOW_RUNTIME_BINDINGS.every(
    (wb) =>
      (INTEGRATION_WORKFLOW_IDS as readonly string[]).includes(wb.workflowId) &&
      wb.requiredPointIds.every((id) =>
        (INTEGRATION_POINT_IDS as readonly string[]).includes(id),
      ),
  );
  checks.push(
    check(
      "IRTR-WORKFLOW",
      "PD-6.3",
      "Existing workflow/runtime reused",
      workflowReuse && WORKFLOW_RUNTIME_BINDINGS.length === 6,
      WORKFLOW_RUNTIME_BINDINGS.map((w) => w.workflowId).join(","),
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "IRTR-NO-NEW-DOMAIN",
      "PI-5.3",
      "No new Domain",
      forbidden.length === 0,
      forbidden.length ? forbidden.join(",") : "M11–M15 only",
    ),
  );

  checks.push(
    check(
      "IRTR-NO-NEW-FAM",
      "PI-5.3",
      "No new integration families",
      SEAM_RUNTIME_BINDINGS.every((a) => a.adapterId.startsWith("IRT-")) &&
        !fs.existsSync(path.join(root, "lib/integration/runtime/engines")) &&
        !fs.existsSync(path.join(root, "lib/integration/new-seams")),
      `seams=${SEAM_RUNTIME_BINDINGS.length} workflows=${WORKFLOW_RUNTIME_BINDINGS.length}`,
    ),
  );

  const runtimeFiles = listTsFiles(path.join(root, "lib/integration/runtime"));
  const coupleHits = runtimeFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data)|from\s+["'][^"']*lib\/(frontend|backend|data)/.test(
      text,
    );
  });
  checks.push(
    check(
      "IRTR-NO-COUPLE",
      "PI-5.3",
      "No FE/BE/Data coupling in integration runtime",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${runtimeFiles.length}`,
    ),
  );

  const http = resolveIntegrationRuntimePlan("API", "M11");
  const nav = resolveIntegrationRuntimePlan("NAV");
  const asyncBias = resolveIntegrationRuntimePlan("NEAREST", "M12");
  checks.push(
    check(
      "IRTR-SPOT",
      "PI-5.3",
      "Golden runtime plans bind preferred seam adapters",
      http.adapters.some((a) => a.adapterId === "IRT-DOMAIN-M11") &&
        http.modes.includes("http-query") &&
        nav.primaryAdapter.adapterId === "IRT-FE-ADAPTER" &&
        nav.adapters.length === 1 &&
        asyncBias.modes.includes("http-async") &&
        asyncBias.adapters.some((a) => a.adapterId === "IRT-DOMAIN-M12"),
      `http=${http.adapters.length} nav=${nav.adapters.length} nearest=${asyncBias.modes.join("+")}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-5.3",
    runtimeId: INTEGRATION_RUNTIME_ID,
    gateId: INTEGRATION_RUNTIME_GATE,
    passed,
    checks,
    summary: {
      seamAdapters: SEAM_RUNTIME_BINDINGS.length,
      workflowBindings: WORKFLOW_RUNTIME_BINDINGS.length,
      bindingKinds: INTEGRATION_BINDING_KINDS.length,
      routingPassed: routing.passed,
    },
  };
}

export function assertIntegrationRuntimeGate(
  report: IntegrationRuntimeReport = runIntegrationRuntimeGate(),
): IntegrationRuntimeReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-5.3 Integration runtime gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
