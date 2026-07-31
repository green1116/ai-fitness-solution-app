/**
 * PI-4.5 — Data Verification / Hardening gate.
 * Consolidates PI-4.1…PI-4.4 and asserts cross-layer hardening invariants.
 */
import fs from "node:fs";
import path from "node:path";

import {
  FORBIDDEN_DOMAIN_PATHS,
  PRODUCT_DOMAIN_IDS,
} from "../../backend/foundation/domain-ownership";
import {
  DATA_FOUNDATION_ID,
  PERSISTENCE_ARCHITECTURE_ID,
} from "../foundation/data.constants";
import { DATA_OWNERSHIP, durableDataClasses } from "../foundation/data-ownership";
import { PERSISTENCE_MODEL_REGISTRY } from "../foundation/persistence-models";
import {
  REPOSITORY_CATALOGUE,
  REPOSITORY_IDS,
} from "../foundation/repository-catalogue";
import { STORAGE_FAMILY_IDS } from "../foundation/storage-families";
import { REPOSITORY_LAYER_ID } from "../repositories/repository.constants";
import { REPOSITORY_ACCESS_BINDINGS } from "../repositories/repository-access-bindings";
import { resolveRepositoryAccessPlan } from "../repositories/repository-access-plan";
import { PERSISTENCE_RUNTIME_ID } from "../runtime/persistence.constants";
import { STORAGE_RUNTIME_BINDINGS } from "../runtime/storage-runtime-bindings";
import { REPOSITORY_RUNTIME_BINDINGS } from "../runtime/repository-runtime-bindings";
import { resolvePersistenceRuntimePlan } from "../runtime/persistence-runtime-plan";
import { DATA_EXPOSURE_LAYER_ID } from "../exposure/exposure.constants";
import { DATA_EXPOSURE_BINDINGS } from "../exposure/data-exposure-bindings";
import { resolveDataExposurePlan } from "../exposure/data-exposure-plan";
import {
  DATA_FOUNDATION_REF,
  DATA_HARDENING_BASELINE,
  DATA_HARDENING_EVIDENCE_SCRIPTS,
  DATA_HARDENING_GATE,
  DATA_HARDENING_ID,
  DATA_HARDENING_INVARIANT_IDS,
  DATA_HARDENING_MODULES,
  DATA_HARDENING_PACKAGES,
  PERSISTENCE_ARCHITECTURE_GATE_REF,
  PERSISTENCE_ARCHITECTURE_REF,
} from "../hardening/data.hardening";
import { runDataFoundationGate } from "./data.foundation.gate";
import { runDataRepositoryGate } from "./data.repository.gate";
import { runDataPersistenceRuntimeGate } from "./data.persistence.gate";
import { runDataExposureGate } from "./data.exposure.gate";

export type DataHardeningCheck = Readonly<{
  id: string;
  source: "PI-4.1" | "PI-4.2" | "PI-4.3" | "PI-4.4" | "PI-4.5" | "PD-5.4";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type DataHardeningReport = Readonly<{
  layer: "PI-4.5";
  hardeningId: typeof DATA_HARDENING_ID;
  gateId: typeof DATA_HARDENING_GATE;
  persistenceArchId: typeof PERSISTENCE_ARCHITECTURE_ID;
  passed: boolean;
  hardened: boolean;
  checks: readonly DataHardeningCheck[];
  summary: Readonly<{
    packages: number;
    invariants: number;
    domains: number;
    repositories: number;
    storageFamilies: number;
    models: number;
    exposures: number;
    foundationPassed: boolean;
    repositoryPassed: boolean;
    runtimePassed: boolean;
    exposurePassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: DataHardeningCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): DataHardeningCheck {
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

export function runDataHardeningGate(
  rootDir?: string,
): DataHardeningReport {
  const root = resolveRoot(rootDir);
  const checks: DataHardeningCheck[] = [];

  const foundation = runDataFoundationGate(root);
  const repository = runDataRepositoryGate(root);
  const runtime = runDataPersistenceRuntimeGate(root);
  const exposure = runDataExposureGate(root);

  checks.push(
    check(
      "DHARDEN-PI-4.1",
      "PI-4.1",
      "Foundation intact",
      foundation.passed &&
        foundation.foundationId === DATA_FOUNDATION_ID &&
        DATA_FOUNDATION_REF === DATA_FOUNDATION_ID &&
        foundation.summary.repositories ===
          DATA_HARDENING_BASELINE.repositories &&
        foundation.summary.persistenceModels ===
          DATA_HARDENING_BASELINE.persistenceModels,
      `repos=${foundation.summary.repositories} models=${foundation.summary.persistenceModels} classes=${foundation.summary.dataClasses}`,
    ),
  );

  checks.push(
    check(
      "DHARDEN-PI-4.2",
      "PI-4.2",
      "Repository layer intact",
      repository.passed &&
        repository.layerId === REPOSITORY_LAYER_ID &&
        repository.summary.bindings === DATA_HARDENING_BASELINE.repositories,
      `bindings=${repository.summary.bindings} models=${repository.summary.models}`,
    ),
  );

  checks.push(
    check(
      "DHARDEN-PI-4.3",
      "PI-4.3",
      "Persistence runtime intact",
      runtime.passed &&
        runtime.runtimeId === PERSISTENCE_RUNTIME_ID &&
        runtime.summary.storageAdapters ===
          DATA_HARDENING_BASELINE.storageAdapters &&
        runtime.summary.repositoryBindings ===
          DATA_HARDENING_BASELINE.repositories,
      `adapters=${runtime.summary.storageAdapters} repoBindings=${runtime.summary.repositoryBindings}`,
    ),
  );

  checks.push(
    check(
      "DHARDEN-PI-4.4",
      "PI-4.4",
      "Exposure layer intact",
      exposure.passed &&
        exposure.layerId === DATA_EXPOSURE_LAYER_ID &&
        exposure.summary.exposures === DATA_HARDENING_BASELINE.exposures,
      `exposures=${exposure.summary.exposures} families=${exposure.summary.storageFamilies}`,
    ),
  );

  checks.push(
    check(
      "DHARDEN-IDS",
      "PD-5.4",
      "Hardening / persistence architecture IDs locked",
      DATA_HARDENING_ID === "product-data-hardening-v1" &&
        DATA_HARDENING_GATE === "product-data-hardening-gate" &&
        PERSISTENCE_ARCHITECTURE_REF === PERSISTENCE_ARCHITECTURE_ID &&
        PERSISTENCE_ARCHITECTURE_GATE_REF ===
          "product-backend-persistence-architecture-gate" &&
        DATA_HARDENING_PACKAGES.length === 4,
      `${DATA_HARDENING_ID} / ${PERSISTENCE_ARCHITECTURE_ID}`,
    ),
  );

  const missingScripts = DATA_HARDENING_EVIDENCE_SCRIPTS.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  const missingModules = DATA_HARDENING_MODULES.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "DHARDEN-EVIDENCE",
      "PI-4.5",
      "Hardening evidence scripts and data modules present",
      missingScripts.length === 0 && missingModules.length === 0,
      missingScripts.length || missingModules.length
        ? `missingScripts=${missingScripts.join(",")} missingModules=${missingModules.join(",")}`
        : `scripts=${DATA_HARDENING_EVIDENCE_SCRIPTS.length} modules=${DATA_HARDENING_MODULES.length}`,
    ),
  );

  const forbidden = FORBIDDEN_DOMAIN_PATHS.filter((p) =>
    fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "DHARDEN-NO-NEW",
      "PI-4.5",
      "No new Domain / repo / storage families",
      forbidden.length === 0 &&
        PRODUCT_DOMAIN_IDS.length === DATA_HARDENING_BASELINE.domains &&
        REPOSITORY_IDS.length === DATA_HARDENING_BASELINE.repositories &&
        STORAGE_FAMILY_IDS.length === DATA_HARDENING_BASELINE.storageFamilies &&
        DATA_EXPOSURE_BINDINGS.every((b) =>
          (REPOSITORY_IDS as readonly string[]).includes(b.repositoryId),
        ) &&
        !fs.existsSync(path.join(root, "lib/data/domains")) &&
        !fs.existsSync(path.join(root, "prisma/schema-pi45.prisma")),
      forbidden.length
        ? forbidden.join(",")
        : `domains=${PRODUCT_DOMAIN_IDS.length} repos=${REPOSITORY_IDS.length} stf=${STORAGE_FAMILY_IDS.length}`,
    ),
  );

  const dataFiles = listTsFiles(path.join(root, "lib/data"));
  const feHits = dataFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/frontend|from\s+["'][^"']*lib\/frontend/.test(
      text,
    );
  });
  const backendDeepHits = dataFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["'][^"']*lib\/backend\/(services|runtime|api|hardening|verify)/.test(
      text,
    );
  });
  checks.push(
    check(
      "DHARDEN-NO-COUPLE",
      "PI-4.5",
      "No frontend/backend coupling across data tree",
      feHits.length === 0 && backendDeepHits.length === 0,
      feHits.length || backendDeepHits.length
        ? [...feHits, ...backendDeepHits]
            .map((f) => path.relative(root, f))
            .join(",")
        : `scanned=${dataFiles.length}`,
    ),
  );

  const crossLayerOk =
    REPOSITORY_CATALOGUE.length === DATA_HARDENING_BASELINE.repositories &&
    REPOSITORY_ACCESS_BINDINGS.length ===
      DATA_HARDENING_BASELINE.repositories &&
    REPOSITORY_RUNTIME_BINDINGS.length ===
      DATA_HARDENING_BASELINE.repositories &&
    DATA_EXPOSURE_BINDINGS.length === DATA_HARDENING_BASELINE.exposures &&
    PERSISTENCE_MODEL_REGISTRY.length ===
      DATA_HARDENING_BASELINE.persistenceModels &&
    STORAGE_RUNTIME_BINDINGS.length ===
      DATA_HARDENING_BASELINE.storageAdapters &&
    DATA_OWNERSHIP.length === DATA_HARDENING_BASELINE.dataClasses &&
    durableDataClasses().length === DATA_HARDENING_BASELINE.durableClasses &&
    REPOSITORY_IDS.every((id) => {
      try {
        const access = resolveRepositoryAccessPlan(id);
        const prt = resolvePersistenceRuntimePlan(id);
        const exp = resolveDataExposurePlan(id);
        return (
          access.reusesFoundationModules &&
          prt.matchesRepositoryLayer &&
          exp.matchesRepository &&
          exp.matchesRuntime &&
          exp.runtime.repositoryId === id
        );
      } catch {
        return false;
      }
    });

  checks.push(
    check(
      "DHARDEN-CROSS",
      "PI-4.5",
      "Cross-layer Foundation / Repository / Runtime / Exposure inventory locked",
      crossLayerOk,
      `repos=${REPOSITORY_IDS.length} models=${PERSISTENCE_MODEL_REGISTRY.length} exposures=${DATA_EXPOSURE_BINDINGS.length}`,
    ),
  );

  checks.push(
    check(
      "DHARDEN-INVARIANTS",
      "PI-4.5",
      "Hardening invariant catalogue complete",
      DATA_HARDENING_INVARIANT_IDS.length === 8 &&
        DATA_HARDENING_INVARIANT_IDS.includes("INV-FOUNDATION") &&
        DATA_HARDENING_INVARIANT_IDS.includes("INV-EXPOSURE") &&
        DATA_HARDENING_INVARIANT_IDS.includes("INV-NO-COUPLE"),
      DATA_HARDENING_INVARIANT_IDS.join(","),
    ),
  );

  const childGatesPass =
    foundation.passed &&
    repository.passed &&
    runtime.passed &&
    exposure.passed;
  checks.push(
    check(
      "DHARDEN-GATES",
      "PI-4.5",
      "Hardening gates pass (PI-4.1…PI-4.4 nested)",
      childGatesPass,
      `foundation=${foundation.passed} repository=${repository.passed} runtime=${runtime.passed} exposure=${exposure.passed}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-4.5",
    hardeningId: DATA_HARDENING_ID,
    gateId: DATA_HARDENING_GATE,
    persistenceArchId: PERSISTENCE_ARCHITECTURE_ID,
    passed,
    hardened: passed,
    checks,
    summary: {
      packages: DATA_HARDENING_PACKAGES.length,
      invariants: DATA_HARDENING_INVARIANT_IDS.length,
      domains: PRODUCT_DOMAIN_IDS.length,
      repositories: REPOSITORY_IDS.length,
      storageFamilies: STORAGE_FAMILY_IDS.length,
      models: PERSISTENCE_MODEL_REGISTRY.length,
      exposures: DATA_EXPOSURE_BINDINGS.length,
      foundationPassed: foundation.passed,
      repositoryPassed: repository.passed,
      runtimePassed: runtime.passed,
      exposurePassed: exposure.passed,
    },
  };
}

export function assertDataHardeningGate(
  report: DataHardeningReport = runDataHardeningGate(),
): DataHardeningReport {
  if (!report.passed || !report.hardened) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-4.5 Data hardening gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
