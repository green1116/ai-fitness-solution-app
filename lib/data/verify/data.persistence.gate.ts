/**
 * PI-4.3 — Persistence runtime verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import {
  FORBIDDEN_DOMAIN_PATHS,
  PRODUCT_DOMAIN_IDS,
} from "../../backend/foundation/domain-ownership";
import { DATA_FOUNDATION_ID } from "../foundation/data.constants";
import { PERSISTENCE_MODEL_REGISTRY } from "../foundation/persistence-models";
import {
  REPOSITORY_CATALOGUE,
  REPOSITORY_IDS,
} from "../foundation/repository-catalogue";
import {
  STORAGE_FAMILY_CATALOGUE,
  STORAGE_FAMILY_IDS,
} from "../foundation/storage-families";
import { REPOSITORY_LAYER_ID } from "../repositories/repository.constants";
import { REPOSITORY_ACCESS_BINDINGS } from "../repositories/repository-access-bindings";
import {
  DATA_FOUNDATION_REF,
  PERSISTENCE_RUNTIME_GATE,
  PERSISTENCE_RUNTIME_ID,
  REPOSITORY_LAYER_REF,
} from "../runtime/persistence.constants";
import {
  REPOSITORY_RUNTIME_BINDINGS,
  getRepositoryRuntimeBinding,
} from "../runtime/repository-runtime-bindings";
import {
  STORAGE_RUNTIME_BINDINGS,
  storageAdaptersForFamily,
} from "../runtime/storage-runtime-bindings";
import { resolvePersistenceRuntimePlan } from "../runtime/persistence-runtime-plan";
import { runDataRepositoryGate } from "./data.repository.gate";

export type PersistenceRuntimeCheck = Readonly<{
  id: string;
  source: "PI-4.1" | "PI-4.2" | "PI-4.3" | "PD-5.4";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type PersistenceRuntimeReport = Readonly<{
  layer: "PI-4.3";
  runtimeId: typeof PERSISTENCE_RUNTIME_ID;
  gateId: typeof PERSISTENCE_RUNTIME_GATE;
  passed: boolean;
  checks: readonly PersistenceRuntimeCheck[];
  summary: Readonly<{
    storageAdapters: number;
    repositoryBindings: number;
    storageFamilies: number;
    models: number;
    repositoryPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: PersistenceRuntimeCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): PersistenceRuntimeCheck {
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

export function runDataPersistenceRuntimeGate(
  rootDir?: string,
): PersistenceRuntimeReport {
  const root = resolveRoot(rootDir);
  const checks: PersistenceRuntimeCheck[] = [];

  const repository = runDataRepositoryGate(root);
  checks.push(
    check(
      "PRT-REPO",
      "PI-4.2",
      "PI-4.2 repository layer intact for persistence runtime",
      repository.passed &&
        repository.layerId === REPOSITORY_LAYER_ID &&
        REPOSITORY_LAYER_REF === REPOSITORY_LAYER_ID &&
        DATA_FOUNDATION_REF === DATA_FOUNDATION_ID,
      `repos=${repository.summary.repositories} bindings=${repository.summary.bindings}`,
    ),
  );

  checks.push(
    check(
      "PRT-IDS",
      "PI-4.3",
      "Persistence runtime IDs locked",
      PERSISTENCE_RUNTIME_ID === "product-data-persistence-runtime-v1" &&
        PERSISTENCE_RUNTIME_GATE ===
          "product-data-persistence-runtime-gate" &&
        REPOSITORY_RUNTIME_BINDINGS.length === REPOSITORY_IDS.length,
      `${PERSISTENCE_RUNTIME_ID} / bindings=${REPOSITORY_RUNTIME_BINDINGS.length}`,
    ),
  );

  const matchRepoLayer = REPOSITORY_IDS.every((id) => {
    const access = REPOSITORY_ACCESS_BINDINGS.find(
      (b) => b.repositoryId === id,
    );
    const runtime = getRepositoryRuntimeBinding(id);
    const catalogue = REPOSITORY_CATALOGUE.find((r) => r.repositoryId === id);
    if (!access || !runtime || !catalogue) return false;
    if (
      !(catalogue.storageFamilies as readonly string[]).includes(
        runtime.primaryStorageFamily,
      )
    ) {
      return false;
    }
    try {
      const plan = resolvePersistenceRuntimePlan(id);
      return (
        plan.matchesRepositoryLayer &&
        plan.access.binding.repositoryId === id &&
        plan.models.every((m) => m.repositoryId === id)
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "PRT-MATCH",
      "PI-4.3",
      "Runtime bindings match repository layer",
      matchRepoLayer,
      REPOSITORY_IDS.join(","),
    ),
  );

  const familiesCovered = STORAGE_FAMILY_IDS.every(
    (familyId) => storageAdaptersForFamily(familyId).length > 0,
  );
  const sotAdaptersOk = STORAGE_RUNTIME_BINDINGS.filter(
    (a) => a.isSourceOfTruth,
  ).every(
    (a) =>
      a.modulePath !== null &&
      fs.existsSync(path.join(root, a.modulePath)) &&
      (a.schemaPath === null ||
        fs.existsSync(path.join(root, a.schemaPath))),
  );
  const cacheOk = STORAGE_RUNTIME_BINDINGS.some(
    (a) =>
      a.adapterId === "PRT-CACHE-BE" &&
      !a.isSourceOfTruth &&
      a.modulePath === null,
  );
  checks.push(
    check(
      "PRT-STF",
      "PD-5.4",
      "Existing storage families reused",
      familiesCovered &&
        sotAdaptersOk &&
        cacheOk &&
        STORAGE_FAMILY_IDS.length === 7 &&
        STORAGE_FAMILY_CATALOGUE.length === 7,
      STORAGE_FAMILY_IDS.join(","),
    ),
  );

  const modelsOk = REPOSITORY_IDS.every((id) => {
    const plan = resolvePersistenceRuntimePlan(id);
    return (
      plan.models.length > 0 &&
      plan.models.every((m) =>
        PERSISTENCE_MODEL_REGISTRY.some(
          (reg) =>
            reg.modelId === m.modelId && reg.repositoryId === id,
        ),
      ) &&
      plan.reusesExistingStorage
    );
  });
  checks.push(
    check(
      "PRT-MODELS",
      "PI-4.1",
      "Existing persistence models reused",
      modelsOk && PERSISTENCE_MODEL_REGISTRY.length >= 15,
      `models=${PERSISTENCE_MODEL_REGISTRY.length}`,
    ),
  );

  const forbidden = FORBIDDEN_DOMAIN_PATHS.filter((p) =>
    fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "PRT-NO-NEW-DOMAIN",
      "PI-4.3",
      "No new Domain",
      forbidden.length === 0 && PRODUCT_DOMAIN_IDS.length === 5,
      forbidden.length ? forbidden.join(",") : "M11–M15 only",
    ),
  );

  checks.push(
    check(
      "PRT-NO-NEW-FAM",
      "PI-4.3",
      "No new repository or storage families",
      REPOSITORY_RUNTIME_BINDINGS.length === 9 &&
        STORAGE_RUNTIME_BINDINGS.every((a) =>
          a.storageFamilies.every((f) =>
            (STORAGE_FAMILY_IDS as readonly string[]).includes(f),
          ),
        ) &&
        !fs.existsSync(path.join(root, "lib/data/runtime/engines")) &&
        !fs.existsSync(path.join(root, "prisma/schema-pi43.prisma")),
      `repos=${REPOSITORY_RUNTIME_BINDINGS.length} adapters=${STORAGE_RUNTIME_BINDINGS.length}`,
    ),
  );

  const runtimeFiles = listTsFiles(path.join(root, "lib/data/runtime"));
  const feHits = runtimeFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/frontend|from\s+["'][^"']*lib\/frontend/.test(
      text,
    );
  });
  const backendDeepHits = runtimeFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["'][^"']*lib\/backend\/(services|runtime|api|hardening|verify)/.test(
      text,
    );
  });
  checks.push(
    check(
      "PRT-NO-COUPLE",
      "PI-4.3",
      "No frontend/backend coupling in persistence runtime",
      feHits.length === 0 && backendDeepHits.length === 0,
      feHits.length || backendDeepHits.length
        ? [...feHits, ...backendDeepHits]
            .map((f) => path.relative(root, f))
            .join(",")
        : `scanned=${runtimeFiles.length}`,
    ),
  );

  const spot =
    resolvePersistenceRuntimePlan("REPO-ARTIFACT").primaryAdapter
      .adapterId === "PRT-OBJECT-FS" &&
    resolvePersistenceRuntimePlan("REPO-SESSION").adapters.some(
      (a) => a.adapterId === "PRT-SESSION",
    ) &&
    resolvePersistenceRuntimePlan("REPO-AGENT-RUN").adapters.some(
      (a) => a.adapterId === "PRT-V80-JOB",
    );
  checks.push(
    check(
      "PRT-SPOT",
      "PI-4.3",
      "Golden persistence runtime plans bind preferred existing engines",
      spot,
      "artifact=PRT-OBJECT-FS session=PRT-SESSION agent=PRT-V80-JOB",
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-4.3",
    runtimeId: PERSISTENCE_RUNTIME_ID,
    gateId: PERSISTENCE_RUNTIME_GATE,
    passed,
    checks,
    summary: {
      storageAdapters: STORAGE_RUNTIME_BINDINGS.length,
      repositoryBindings: REPOSITORY_RUNTIME_BINDINGS.length,
      storageFamilies: STORAGE_FAMILY_IDS.length,
      models: PERSISTENCE_MODEL_REGISTRY.length,
      repositoryPassed: repository.passed,
    },
  };
}

export function assertDataPersistenceRuntimeGate(
  report: PersistenceRuntimeReport = runDataPersistenceRuntimeGate(),
): PersistenceRuntimeReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-4.3 Persistence runtime gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
