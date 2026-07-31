/**
 * PI-4.1 — Data Foundation verification gate (PD-5.4).
 */
import fs from "node:fs";
import path from "node:path";

import {
  DOMAIN_OWNERSHIP,
  FORBIDDEN_DOMAIN_PATHS,
  PRODUCT_DOMAIN_IDS,
} from "../../backend/foundation/domain-ownership";
import { BACKEND_ARCHITECTURE_BASELINE_ID } from "../../backend/foundation/backend.constants";
import {
  BACKEND_ARCHITECTURE_BASELINE_REF,
  DATA_FOUNDATION_GATE,
  DATA_FOUNDATION_ID,
  DATA_LAYER_ID,
  PERSISTENCE_ARCHITECTURE_GATE,
  PERSISTENCE_ARCHITECTURE_ID,
  PI3_FREEZE_REF,
} from "../foundation/data.constants";
import {
  DATA_CLASS_IDS,
  DATA_OWNERSHIP,
  durableDataClasses,
} from "../foundation/data-ownership";
import {
  PERSISTENCE_MODEL_REGISTRY,
} from "../foundation/persistence-models";
import {
  REPOSITORY_CATALOGUE,
  REPOSITORY_IDS,
} from "../foundation/repository-catalogue";
import {
  STORAGE_FAMILY_CATALOGUE,
  STORAGE_FAMILY_IDS,
} from "../foundation/storage-families";

export type DataFoundationCheck = Readonly<{
  id: string;
  source: "PI-4.1" | "PD-5.4" | "PI-3";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type DataFoundationReport = Readonly<{
  layer: "PI-4.1";
  foundationId: typeof DATA_FOUNDATION_ID;
  gateId: typeof DATA_FOUNDATION_GATE;
  persistenceArchId: typeof PERSISTENCE_ARCHITECTURE_ID;
  passed: boolean;
  checks: readonly DataFoundationCheck[];
  summary: Readonly<{
    storageFamilies: number;
    dataClasses: number;
    durableClasses: number;
    repositories: number;
    persistenceModels: number;
    domains: number;
  }>;
}>;

function check(
  id: string,
  source: DataFoundationCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): DataFoundationCheck {
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

function schemaDeclaresModel(schemaText: string, modelId: string): boolean {
  return new RegExp(`^model\\s+${modelId}\\b`, "m").test(schemaText);
}

export function runDataFoundationGate(
  rootDir?: string,
): DataFoundationReport {
  const root = resolveRoot(rootDir);
  const checks: DataFoundationCheck[] = [];

  checks.push(
    check(
      "DATA-IDS",
      "PD-5.4",
      "Data foundation / persistence architecture IDs locked",
      DATA_FOUNDATION_ID === "product-data-foundation-v1" &&
        DATA_FOUNDATION_GATE === "product-data-foundation-gate" &&
        PERSISTENCE_ARCHITECTURE_ID ===
          "product-backend-persistence-architecture-v1" &&
        PERSISTENCE_ARCHITECTURE_GATE ===
          "product-backend-persistence-architecture-gate" &&
        DATA_LAYER_ID === "L1-PERSISTENCE-PORTS" &&
        BACKEND_ARCHITECTURE_BASELINE_REF ===
          BACKEND_ARCHITECTURE_BASELINE_ID &&
        PI3_FREEZE_REF === "pi-3-backend-implementation-v1",
      `${DATA_FOUNDATION_ID} / ${PERSISTENCE_ARCHITECTURE_ID}`,
    ),
  );

  checks.push(
    check(
      "DATA-OWN",
      "PI-4.1",
      "Data ownership registry established",
      DATA_CLASS_IDS.length === 9 &&
        DATA_OWNERSHIP.length === 9 &&
        durableDataClasses().length === 8 &&
        DATA_OWNERSHIP.filter((d) => d.primaryDomain === "FRONTEND").length ===
          1 &&
        durableDataClasses().every((row) =>
          PRODUCT_DOMAIN_IDS.includes(
            row.primaryDomain as (typeof PRODUCT_DOMAIN_IDS)[number],
          ),
        ),
      `classes=${DATA_OWNERSHIP.length} durable=${durableDataClasses().length}`,
    ),
  );

  const repoPathsOk = REPOSITORY_CATALOGUE.every((repo) =>
    repo.existingModulePaths.every((rel) =>
      fs.existsSync(path.join(root, rel)),
    ),
  );
  const repoOwnersOk = REPOSITORY_CATALOGUE.every((repo) =>
    DOMAIN_OWNERSHIP.some((d) => d.id === repo.ownerDomain),
  );
  checks.push(
    check(
      "DATA-REPO",
      "PD-5.4",
      "Existing repositories identified",
      REPOSITORY_IDS.length === 9 &&
        REPOSITORY_CATALOGUE.length === 9 &&
        repoPathsOk &&
        repoOwnersOk &&
        !REPOSITORY_CATALOGUE.some((r) =>
          r.existingModulePaths.some((p) => p.startsWith("lib/data/repo-impl")),
        ),
      REPOSITORY_IDS.join(","),
    ),
  );

  const schemaPath = path.join(root, "prisma/schema.prisma");
  const schemaText = fs.existsSync(schemaPath)
    ? fs.readFileSync(schemaPath, "utf8")
    : "";
  const modelsOk = PERSISTENCE_MODEL_REGISTRY.every((model) => {
    if (!fs.existsSync(path.join(root, model.declarationPath))) return false;
    if (model.kind === "prisma" && model.declarationPath.endsWith("schema.prisma")) {
      return schemaDeclaresModel(schemaText, model.modelId);
    }
    return true;
  });
  const modelOwnersOk = PERSISTENCE_MODEL_REGISTRY.every((model) =>
    PRODUCT_DOMAIN_IDS.includes(model.ownerDomain),
  );
  checks.push(
    check(
      "DATA-MODELS",
      "PI-4.1",
      "Existing persistence models reused",
      PERSISTENCE_MODEL_REGISTRY.length >= 15 &&
        modelsOk &&
        modelOwnersOk &&
        PERSISTENCE_MODEL_REGISTRY.every((m) =>
          REPOSITORY_IDS.includes(m.repositoryId),
        ),
      `models=${PERSISTENCE_MODEL_REGISTRY.length} schema=${fs.existsSync(schemaPath)}`,
    ),
  );

  checks.push(
    check(
      "DATA-STF",
      "PD-5.4",
      "Closed storage families only (no new persistence architecture)",
      STORAGE_FAMILY_IDS.length === 7 &&
        STORAGE_FAMILY_CATALOGUE.length === 7 &&
        STORAGE_FAMILY_CATALOGUE.every((f) =>
          f.owningDomains.every((id) =>
            PRODUCT_DOMAIN_IDS.includes(id),
          ),
        ) &&
        STORAGE_FAMILY_CATALOGUE.filter((f) => !f.isSourceOfTruth).length ===
          1,
      STORAGE_FAMILY_IDS.join(","),
    ),
  );

  const forbidden = FORBIDDEN_DOMAIN_PATHS.filter((p) =>
    fs.existsSync(path.join(root, p)),
  );
  const domainPathsOk = DOMAIN_OWNERSHIP.every((d) =>
    fs.existsSync(path.join(root, d.path)),
  );
  checks.push(
    check(
      "DATA-NO-NEW-DOMAIN",
      "PI-4.1",
      "No new Domain",
      forbidden.length === 0 &&
        domainPathsOk &&
        PRODUCT_DOMAIN_IDS.length === 5 &&
        !fs.existsSync(path.join(root, "lib/data/domains")),
      forbidden.length ? forbidden.join(",") : "M11–M15 only",
    ),
  );

  checks.push(
    check(
      "DATA-NO-NEW-PERSIST",
      "PD-5.4",
      "No new persistence architecture",
      PERSISTENCE_ARCHITECTURE_ID ===
        "product-backend-persistence-architecture-v1" &&
        !fs.existsSync(path.join(root, "lib/data/storage-engines")) &&
        !fs.existsSync(path.join(root, "prisma/schema-pi4.prisma")) &&
        REPOSITORY_CATALOGUE.every((r) =>
          r.storageFamilies.every((f) =>
            (STORAGE_FAMILY_IDS as readonly string[]).includes(f),
          ),
        ),
      "reuse PD-5.4 closed families + existing schema",
    ),
  );

  const dataFiles = listTsFiles(path.join(root, "lib/data"));
  const feHits = dataFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/frontend|from\s+["'][^"']*lib\/frontend/.test(
      text,
    );
  });
  checks.push(
    check(
      "DATA-NO-FE",
      "PI-4.1",
      "No frontend coupling in data foundation",
      feHits.length === 0,
      feHits.length
        ? feHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${dataFiles.length}`,
    ),
  );

  const treeOk =
    fs.existsSync(path.join(root, "lib/data/foundation")) &&
    fs.existsSync(path.join(root, "lib/data/verify/data.foundation.gate.ts"));
  checks.push(
    check(
      "DATA-TREE",
      "PI-4.1",
      "Data foundation tree established",
      treeOk,
      treeOk ? "lib/data/foundation + verify" : "missing",
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-4.1",
    foundationId: DATA_FOUNDATION_ID,
    gateId: DATA_FOUNDATION_GATE,
    persistenceArchId: PERSISTENCE_ARCHITECTURE_ID,
    passed,
    checks,
    summary: {
      storageFamilies: STORAGE_FAMILY_IDS.length,
      dataClasses: DATA_OWNERSHIP.length,
      durableClasses: durableDataClasses().length,
      repositories: REPOSITORY_CATALOGUE.length,
      persistenceModels: PERSISTENCE_MODEL_REGISTRY.length,
      domains: PRODUCT_DOMAIN_IDS.length,
    },
  };
}

export function assertDataFoundationGate(
  report: DataFoundationReport = runDataFoundationGate(),
): DataFoundationReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-4.1 Data foundation gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
