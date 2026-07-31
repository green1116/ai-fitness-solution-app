/**
 * PI-6.2 — Delivery readiness runtime verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import {
  DELIVERY_FOUNDATION_ID,
  DELIVERY_READINESS_ID,
} from "../foundation/delivery.constants";
import {
  DELIVERY_ENVIRONMENT_IDS,
  DELIVERY_GOLDEN_PATH_IDS,
} from "../foundation/environments";
import {
  DELIVERY_DOMAIN_IDS,
  DELIVERY_LAYER_IDS,
} from "../foundation/layer-refs";
import { DELIVERY_READINESS_CONCERN_IDS } from "../foundation/readiness-concerns";
import {
  CONCERN_RUNTIME_BINDINGS,
  concernMatchesFoundation,
} from "../runtime/concern-runtime-bindings";
import { resolveDeliveryRuntimePlan } from "../runtime/delivery-runtime-plan";
import {
  ENVIRONMENT_RUNTIME_BINDINGS,
  environmentMatchesFoundation,
} from "../runtime/environment-runtime-bindings";
import {
  LAYER_RUNTIME_BINDINGS,
  layerAdapterMatchesFoundation,
} from "../runtime/layer-runtime-bindings";
import {
  DELIVERY_FOUNDATION_REF,
  DELIVERY_READINESS_REF,
  DELIVERY_RUNTIME_GATE,
  DELIVERY_RUNTIME_ID,
} from "../runtime/runtime.constants";
import { runDeliveryFoundationGate } from "./delivery.foundation.gate";

export type DeliveryRuntimeCheck = Readonly<{
  id: string;
  source: "PI-6.1" | "PI-6.2" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type DeliveryRuntimeReport = Readonly<{
  layer: "PI-6.2";
  runtimeId: typeof DELIVERY_RUNTIME_ID;
  gateId: typeof DELIVERY_RUNTIME_GATE;
  passed: boolean;
  checks: readonly DeliveryRuntimeCheck[];
  summary: Readonly<{
    layerAdapters: number;
    concernBindings: number;
    environmentBindings: number;
    foundationPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: DeliveryRuntimeCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): DeliveryRuntimeCheck {
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

export function runDeliveryRuntimeGate(
  rootDir?: string,
): DeliveryRuntimeReport {
  const root = resolveRoot(rootDir);
  const checks: DeliveryRuntimeCheck[] = [];

  const foundation = runDeliveryFoundationGate(root);
  checks.push(
    check(
      "DELR-FOUNDATION",
      "PI-6.1",
      "PI-6.1 delivery foundation intact for readiness runtime",
      foundation.passed &&
        foundation.foundationId === DELIVERY_FOUNDATION_ID &&
        DELIVERY_FOUNDATION_REF === DELIVERY_FOUNDATION_ID &&
        DELIVERY_READINESS_REF === DELIVERY_READINESS_ID,
      `concerns=${foundation.summary.readinessConcerns} layers=${foundation.summary.layers}`,
    ),
  );

  checks.push(
    check(
      "DELR-IDS",
      "PI-6.2",
      "Delivery runtime IDs locked; closed binding sets",
      DELIVERY_RUNTIME_ID === "product-delivery-runtime-v1" &&
        DELIVERY_RUNTIME_GATE === "product-delivery-runtime-gate" &&
        LAYER_RUNTIME_BINDINGS.length === DELIVERY_LAYER_IDS.length &&
        CONCERN_RUNTIME_BINDINGS.length ===
          DELIVERY_READINESS_CONCERN_IDS.length &&
        ENVIRONMENT_RUNTIME_BINDINGS.length ===
          DELIVERY_ENVIRONMENT_IDS.length,
      `runtime=${DELIVERY_RUNTIME_ID} layers=${LAYER_RUNTIME_BINDINGS.length} concerns=${CONCERN_RUNTIME_BINDINGS.length}`,
    ),
  );

  const matchFoundation = DELIVERY_READINESS_CONCERN_IDS.every((concernId) => {
    try {
      const plan = resolveDeliveryRuntimePlan(concernId, "M13");
      return (
        plan.matchesFoundation &&
        plan.reusesExistingLayers &&
        plan.runtimeId === DELIVERY_RUNTIME_ID &&
        plan.foundationId === DELIVERY_FOUNDATION_ID
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "DELR-MATCH",
      "PI-6.2",
      "Runtime bindings match foundation",
      matchFoundation &&
        LAYER_RUNTIME_BINDINGS.every((a) => layerAdapterMatchesFoundation(a)) &&
        CONCERN_RUNTIME_BINDINGS.every((c) => concernMatchesFoundation(c)) &&
        ENVIRONMENT_RUNTIME_BINDINGS.every((e) =>
          environmentMatchesFoundation(e),
        ),
      `concerns=${DELIVERY_READINESS_CONCERN_IDS.length}`,
    ),
  );

  const layersExist = LAYER_RUNTIME_BINDINGS.every((adapter) =>
    fs.existsSync(path.join(root, adapter.modulePath)),
  );
  checks.push(
    check(
      "DELR-LAYERS",
      "PI-6.2",
      "Existing layers reused",
      layersExist &&
        LAYER_RUNTIME_BINDINGS.every((a) =>
          (DELIVERY_LAYER_IDS as readonly string[]).includes(a.layerId),
        ),
      layersExist
        ? `adapters=${LAYER_RUNTIME_BINDINGS.length}`
        : "missing layer paths",
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  const pilot = resolveDeliveryRuntimePlan("PILOT", "M12");
  checks.push(
    check(
      "DELR-NO-NEW-DOMAIN",
      "PI-6.2",
      "No new Domain",
      forbidden.length === 0 &&
        pilot.domains.join(",") === "M11,M12,M13,M14,M15" &&
        DELIVERY_DOMAIN_IDS.length === 5,
      forbidden.length
        ? forbidden.join(",")
        : `domains=${DELIVERY_DOMAIN_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "DELR-NO-NEW-ARCH",
      "PD-7",
      "No new architecture",
      DELIVERY_READINESS_REF === "product-delivery-readiness-baseline-v1" &&
        ENVIRONMENT_RUNTIME_BINDINGS.map((e) => e.envId).join("|") ===
          "ENV-LOCAL|ENV-DEV|ENV-STAGING|ENV-PROD" &&
        !fs.existsSync(path.join(root, "lib/delivery/engines")) &&
        !fs.existsSync(path.join(root, "lib/delivery/new-architecture")),
      "readiness-baseline + ENV-* locked",
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
      "DELR-NO-COUPLE",
      "PI-6.2",
      "No cross-layer coupling",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi6Files.length}`,
    ),
  );

  const release = resolveDeliveryRuntimePlan("RELEASE", "M11");
  const prodEnv = ENVIRONMENT_RUNTIME_BINDINGS.find(
    (e) => e.envId === "ENV-PROD",
  );
  checks.push(
    check(
      "DELR-SPOT",
      "PD-7",
      "Golden runtime plans bind layers / envs / golden paths",
      release.adapters.length === 5 &&
        release.mode === "evaluate" &&
        pilot.concern.requiresGoldenPaths === true &&
        pilot.goldenPaths.length === DELIVERY_GOLDEN_PATH_IDS.length &&
        Boolean(
          prodEnv &&
            prodEnv.prerequisiteConcernIds.includes("RELEASE") &&
            prodEnv.prerequisiteConcernIds.includes("SIGN_OFF"),
        ),
      `releaseAdapters=${release.adapters.length} pilotGps=${pilot.goldenPaths.length} prodPrereqs=${prodEnv?.prerequisiteConcernIds.length ?? 0}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-6.2",
    runtimeId: DELIVERY_RUNTIME_ID,
    gateId: DELIVERY_RUNTIME_GATE,
    passed,
    checks,
    summary: {
      layerAdapters: LAYER_RUNTIME_BINDINGS.length,
      concernBindings: CONCERN_RUNTIME_BINDINGS.length,
      environmentBindings: ENVIRONMENT_RUNTIME_BINDINGS.length,
      foundationPassed: foundation.passed,
    },
  };
}

export function assertDeliveryRuntimeGate(
  report: DeliveryRuntimeReport = runDeliveryRuntimeGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Delivery runtime gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
