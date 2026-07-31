/**
 * PI-3.2 — Service / Command layer verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { API_FAMILY_OWNERSHIP } from "../foundation/api-ownership";
import {
  BACKEND_COMMAND_OWNERSHIP,
  getCommandOwnership,
} from "../foundation/command-ownership";
import {
  BACKEND_SERVICE_CATALOGUE,
  BACKEND_SERVICE_IDS,
} from "../foundation/service-catalogue";
import { DOMAIN_OWNERSHIP, FORBIDDEN_DOMAIN_PATHS } from "../foundation/domain-ownership";
import {
  ACTION_SERVICE_ROUTING,
  DOMAIN_SERVICE_BIAS,
  resolveServiceForAction,
  serviceAllowsPrimaryDomain,
} from "../services/action-service-routing";
import {
  GOLDEN_PATH_SERVICE_SEQUENCES,
  SERVICE_LAYER_ID,
  listRoutedActionIds,
  planServiceExecution,
  settleServicePlan,
} from "../services/service-execution";
import { runBackendFoundationGate } from "../verify/backend.foundation.gate";

export type ServiceLayerCheck = Readonly<{
  id: string;
  source: "PD-5.2" | "PI-3.1" | "PI-3.2";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ServiceLayerReport = Readonly<{
  layer: "PI-3.2";
  serviceLayerId: typeof SERVICE_LAYER_ID;
  passed: boolean;
  checks: readonly ServiceLayerCheck[];
  summary: Readonly<{
    services: number;
    routedActions: number;
    goldenPaths: number;
    foundationPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ServiceLayerCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ServiceLayerCheck {
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

export function runBackendServiceLayerGate(
  rootDir?: string,
): ServiceLayerReport {
  const root = resolveRoot(rootDir);
  const checks: ServiceLayerCheck[] = [];

  const foundation = runBackendFoundationGate(root);
  checks.push(
    check(
      "SVC-FOUNDATION",
      "PI-3.1",
      "PI-3.1 Backend Foundation intact",
      foundation.passed,
      `foundationPassed=${foundation.passed} commands=${foundation.summary.commands}`,
    ),
  );

  checks.push(
    check(
      "SVC-CATALOGUE",
      "PD-5.2",
      "Service catalogue matches PD-5.2 (8 SVC-*)",
      BACKEND_SERVICE_IDS.length === 8 &&
        BACKEND_SERVICE_CATALOGUE.length === 8 &&
        SERVICE_LAYER_ID === "product-backend-service-layer-v1",
      BACKEND_SERVICE_IDS.join(","),
    ),
  );

  const ownershipIds = new Set(
    BACKEND_COMMAND_OWNERSHIP.map((r) => r.actionId),
  );
  const routedIds = new Set(ACTION_SERVICE_ROUTING.map((r) => r.actionId));
  const missingRoute = [...ownershipIds].filter((id) => !routedIds.has(id));
  const extraRoute = [...routedIds].filter((id) => !ownershipIds.has(id));
  checks.push(
    check(
      "SVC-ROUTE-COVERAGE",
      "PI-3.2",
      "Every foundation Command maps to exactly one service",
      ACTION_SERVICE_ROUTING.length === 47 &&
        missingRoute.length === 0 &&
        extraRoute.length === 0 &&
        listRoutedActionIds().length === 47,
      missingRoute.length || extraRoute.length
        ? `missing=${missingRoute.join(",")} extra=${extraRoute.join(",")}`
        : `routed=${ACTION_SERVICE_ROUTING.length}`,
    ),
  );

  const biasFailures: string[] = [];
  for (const row of ACTION_SERVICE_ROUTING) {
    const ownership = getCommandOwnership(row.actionId);
    if (!ownership) {
      biasFailures.push(`${row.actionId}:missing-ownership`);
      continue;
    }
    if (!serviceAllowsPrimaryDomain(row.serviceId, ownership.primaryDomain)) {
      biasFailures.push(
        `${row.actionId}:${row.serviceId}!${ownership.primaryDomain}`,
      );
    }
  }
  checks.push(
    check(
      "SVC-OWNERSHIP-BIAS",
      "PD-5.2",
      "Command ownership matches foundation + Domain→service bias",
      biasFailures.length === 0,
      biasFailures.length ? biasFailures.slice(0, 8).join(",") : "bias=ok",
    ),
  );

  // Spot-check plans
  const signIn = planServiceExecution("ACT-01-01");
  const nav = planServiceExecution("ACT-01-03");
  const upload = planServiceExecution("ACT-03-01");
  const list = planServiceExecution("ACT-07-01");
  const gov = planServiceExecution("ACT-09-06");
  checks.push(
    check(
      "SVC-EXEC-PLAN",
      "PI-3.2",
      "Service execution plans honor CQ / NavPref / Domain ports",
      signIn.serviceId === "SVC-ACCESS" &&
        signIn.mutatesDomain &&
        signIn.requiresHttpOrchestration &&
        nav.executionKind === "NavPref" &&
        !nav.requiresHttpOrchestration &&
        upload.primaryDomain === "M11" &&
        upload.serviceId === "SVC-KNOWLEDGE-INTAKE" &&
        upload.primaryPort.modulePath === "lib/product/m11" &&
        list.executionKind === "Query" &&
        !list.mutatesDomain &&
        settleServicePlan(list).emptyAllowed &&
        gov.serviceId === "SVC-EVOLUTION" &&
        gov.primaryDomain === "M15",
      `signin=${signIn.serviceId} navHttp=${nav.requiresHttpOrchestration} upload=${upload.serviceId} listMut=${list.mutatesDomain} gov=${gov.serviceId}`,
    ),
  );

  const gpOk = GOLDEN_PATH_SERVICE_SEQUENCES.every((gp) =>
    gp.services.every((svc) =>
      (BACKEND_SERVICE_IDS as readonly string[]).includes(svc),
    ),
  );
  checks.push(
    check(
      "SVC-GP-SEQ",
      "PD-5.2",
      "Golden Path service sequences use catalogue services only",
      GOLDEN_PATH_SERVICE_SEQUENCES.length === 5 && gpOk,
      GOLDEN_PATH_SERVICE_SEQUENCES.map((g) => g.pathId).join(","),
    ),
  );

  checks.push(
    check(
      "SVC-API-OWN",
      "PI-3.2",
      "Existing API ownership respected (families remain /api/*)",
      API_FAMILY_OWNERSHIP.every((f) => f.family.startsWith("/api/")) &&
        signIn.apiFamilyHint?.startsWith("/api/") === true,
      `families=${API_FAMILY_OWNERSHIP.length} hint=${signIn.apiFamilyHint}`,
    ),
  );

  const forbidden = FORBIDDEN_DOMAIN_PATHS.filter((p) =>
    fs.existsSync(path.join(root, p)),
  );
  const domainsPresent = DOMAIN_OWNERSHIP.every((d) =>
    fs.existsSync(path.join(root, d.path)),
  );
  checks.push(
    check(
      "SVC-NO-NEW-DOMAIN",
      "PI-3.2",
      "No new Domain / API families; M11–M15 reused",
      forbidden.length === 0 &&
        domainsPresent &&
        Object.values(DOMAIN_SERVICE_BIAS).every((list) => list.length >= 1),
      forbidden.length ? forbidden.join(",") : "M11–M15 only",
    ),
  );

  const serviceFiles = listTsFiles(path.join(root, "lib/backend/services"));
  const feHits = serviceFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/frontend|from\s+["'][^"']*lib\/frontend/.test(
      text,
    );
  });
  checks.push(
    check(
      "SVC-NO-FE",
      "PI-3.2",
      "No frontend coupling in service layer",
      feHits.length === 0,
      feHits.length
        ? feHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${serviceFiles.length}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-3.2",
    serviceLayerId: SERVICE_LAYER_ID,
    passed,
    checks,
    summary: {
      services: BACKEND_SERVICE_IDS.length,
      routedActions: ACTION_SERVICE_ROUTING.length,
      goldenPaths: GOLDEN_PATH_SERVICE_SEQUENCES.length,
      foundationPassed: foundation.passed,
    },
  };
}

export function assertBackendServiceLayerGate(
  report: ServiceLayerReport = runBackendServiceLayerGate(),
): ServiceLayerReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-3.2 Service layer failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
