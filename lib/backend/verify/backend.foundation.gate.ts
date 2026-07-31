/**
 * PI-3.1 — Backend Foundation release gate (PD-5.1).
 * Asserts foundation registry + Domain boundaries; no frontend coupling.
 */
import fs from "node:fs";
import path from "node:path";

import {
  API_FAMILY_OWNERSHIP,
  RUNTIME_ADAPTER_PATHS,
} from "../foundation/api-ownership";
import {
  BACKEND_ARCHITECTURE_BASELINE_ID,
  BACKEND_ARCHITECTURE_GATE,
  BACKEND_ARCHITECTURE_ID,
  BACKEND_FOUNDATION_ID,
  BACKEND_LAYER_IDS,
  PRIMARY_COMMAND_TOTAL,
} from "../foundation/backend.constants";
import {
  BACKEND_COMMAND_OWNERSHIP,
  countPrimaryByDomain,
} from "../foundation/command-ownership";
import {
  DOMAIN_OWNERSHIP,
  FORBIDDEN_DOMAIN_PATHS,
  PRODUCT_DOMAIN_IDS,
  totalPrimaryCommands,
} from "../foundation/domain-ownership";
import {
  BACKEND_SERVICE_CATALOGUE,
  BACKEND_SERVICE_IDS,
} from "../foundation/service-catalogue";

export type BackendFoundationCheck = Readonly<{
  id: string;
  source: "PD-5.1" | "PD-5.2" | "PD-2.5" | "PI-3.1";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type BackendFoundationReport = Readonly<{
  layer: "PI-3.1";
  foundationId: typeof BACKEND_FOUNDATION_ID;
  architectureId: typeof BACKEND_ARCHITECTURE_ID;
  gateId: typeof BACKEND_ARCHITECTURE_GATE;
  passed: boolean;
  checks: readonly BackendFoundationCheck[];
  summary: Readonly<{
    layers: number;
    domains: number;
    commands: number;
    services: number;
    apiFamilies: number;
  }>;
}>;

function check(
  id: string,
  source: BackendFoundationCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): BackendFoundationCheck {
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

export function runBackendFoundationGate(
  rootDir?: string,
): BackendFoundationReport {
  const root = resolveRoot(rootDir);
  const checks: BackendFoundationCheck[] = [];

  checks.push(
    check(
      "BEA-IDS",
      "PD-5.1",
      "Backend architecture / foundation / gate IDs locked",
      BACKEND_ARCHITECTURE_ID === "product-backend-architecture-v1" &&
        BACKEND_ARCHITECTURE_GATE === "product-backend-architecture-gate" &&
        BACKEND_ARCHITECTURE_BASELINE_ID ===
          "product-backend-architecture-baseline-v1" &&
        BACKEND_FOUNDATION_ID === "product-backend-foundation-v1",
      `${BACKEND_FOUNDATION_ID} / ${BACKEND_ARCHITECTURE_GATE}`,
    ),
  );

  checks.push(
    check(
      "BEA-LAYER",
      "PD-5.1",
      "L1…L5 backend layering defined",
      BACKEND_LAYER_IDS.length === 5 &&
        BACKEND_LAYER_IDS[0] === "L5-API-EDGE" &&
        BACKEND_LAYER_IDS[4] === "L1-PERSISTENCE-PORTS",
      BACKEND_LAYER_IDS.join("→"),
    ),
  );

  const missingDomains = DOMAIN_OWNERSHIP.filter(
    (d) => !fs.existsSync(path.join(root, d.path)),
  );
  checks.push(
    check(
      "BEA-DOM-PATHS",
      "PD-5.1",
      "M11–M15 Domain paths present (reuse existing Domains)",
      missingDomains.length === 0 && DOMAIN_OWNERSHIP.length === 5,
      missingDomains.length
        ? missingDomains.map((d) => d.path).join(",")
        : DOMAIN_OWNERSHIP.map((d) => d.id).join(","),
    ),
  );

  const forbiddenPresent = FORBIDDEN_DOMAIN_PATHS.filter((p) =>
    fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "BEA-NO-NEW-DOMAIN",
      "PD-5.1",
      "No new product Domains (M16+ / lib/domains)",
      forbiddenPresent.length === 0,
      forbiddenPresent.length ? forbiddenPresent.join(",") : "none",
    ),
  );

  const countsOk =
    countPrimaryByDomain("M11") === 13 &&
    countPrimaryByDomain("M12") === 3 &&
    countPrimaryByDomain("M13") === 20 &&
    countPrimaryByDomain("M14") === 8 &&
    countPrimaryByDomain("M15") === 3 &&
    BACKEND_COMMAND_OWNERSHIP.length === PRIMARY_COMMAND_TOTAL &&
    totalPrimaryCommands() === PRIMARY_COMMAND_TOTAL;

  const supportOk = BACKEND_COMMAND_OWNERSHIP.every((row) =>
    [row.primaryDomain, ...row.supportingDomains].every((id) =>
      (PRODUCT_DOMAIN_IDS as readonly string[]).includes(id),
    ),
  );

  checks.push(
    check(
      "BEA-DOM-COMMANDS",
      "PD-2.5",
      "47 Primary Commands owned within M11–M15 only",
      countsOk && supportOk,
      `n=${BACKEND_COMMAND_OWNERSHIP.length} M11=${countPrimaryByDomain("M11")} M12=${countPrimaryByDomain("M12")} M13=${countPrimaryByDomain("M13")} M14=${countPrimaryByDomain("M14")} M15=${countPrimaryByDomain("M15")}`,
    ),
  );

  checks.push(
    check(
      "BEA-SVC",
      "PD-5.2",
      "Application SVC-* catalogue present; services ≠ Domains",
      BACKEND_SERVICE_IDS.length === 8 &&
        BACKEND_SERVICE_CATALOGUE.length === 8 &&
        BACKEND_SERVICE_CATALOGUE.every((s) =>
          (PRODUCT_DOMAIN_IDS as readonly string[]).includes(s.primaryDomain),
        ) &&
        !BACKEND_SERVICE_IDS.some((id) => id.startsWith("M1")),
      `services=${BACKEND_SERVICE_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "BEA-API",
      "PD-5.1",
      "API family ownership references existing families only",
      API_FAMILY_OWNERSHIP.length >= 8 &&
        API_FAMILY_OWNERSHIP.every((f) => f.family.startsWith("/api/")),
      `families=${API_FAMILY_OWNERSHIP.length}`,
    ),
  );

  const adaptersPresent = RUNTIME_ADAPTER_PATHS.filter((a) =>
    fs.existsSync(path.join(root, a.path)),
  );
  checks.push(
    check(
      "BEA-L2-RUNTIME",
      "PD-5.1",
      "Existing L2 runtime adapter paths declared and present",
      adaptersPresent.length === RUNTIME_ADAPTER_PATHS.length,
      adaptersPresent.map((a) => a.path).join(",") || "missing",
    ),
  );

  const backendDir = path.join(root, "lib/backend");
  const backendFiles = listTsFiles(backendDir);
  const frontendImports = backendFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/frontend|from\s+["']\.\.\/frontend|from\s+["']\.\.\/\.\.\/frontend/.test(
      text,
    );
  });
  checks.push(
    check(
      "BEA-NO-FE-COUPLING",
      "PI-3.1",
      "Backend foundation does not import frontend modules",
      frontendImports.length === 0,
      frontendImports.length
        ? frontendImports.map((f) => path.relative(root, f)).join(",")
        : `scanned=${backendFiles.length}`,
    ),
  );

  const cqKinds = new Set(
    BACKEND_COMMAND_OWNERSHIP.map((row) => row.executionKind),
  );
  checks.push(
    check(
      "BEA-CQ",
      "PD-5.1",
      "Command / Query / NavPref classification present",
      cqKinds.has("Command") &&
        cqKinds.has("Query") &&
        cqKinds.has("NavPref") &&
        BACKEND_COMMAND_OWNERSHIP.every((row) =>
          row.executionKind === "Query"
            ? true
            : row.executionKind === "Command" || row.executionKind === "NavPref",
        ),
      [...cqKinds].sort().join(","),
    ),
  );

  checks.push(
    check(
      "BEA-FOUNDATION-TREE",
      "PI-3.1",
      "lib/backend foundation tree established",
      fs.existsSync(path.join(backendDir, "foundation/index.ts")) &&
        fs.existsSync(path.join(backendDir, "verify/backend.foundation.gate.ts")),
      "lib/backend/foundation + verify",
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-3.1",
    foundationId: BACKEND_FOUNDATION_ID,
    architectureId: BACKEND_ARCHITECTURE_ID,
    gateId: BACKEND_ARCHITECTURE_GATE,
    passed,
    checks,
    summary: {
      layers: BACKEND_LAYER_IDS.length,
      domains: DOMAIN_OWNERSHIP.length,
      commands: BACKEND_COMMAND_OWNERSHIP.length,
      services: BACKEND_SERVICE_IDS.length,
      apiFamilies: API_FAMILY_OWNERSHIP.length,
    },
  };
}

export function assertBackendFoundationGate(
  report: BackendFoundationReport = runBackendFoundationGate(),
): BackendFoundationReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-3.1 Backend Foundation failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
