/**
 * PI-4.4 — Data exposure verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import {
  FORBIDDEN_DOMAIN_PATHS,
  PRODUCT_DOMAIN_IDS,
} from "../../backend/foundation/domain-ownership";
import { DATA_FOUNDATION_ID } from "../foundation/data.constants";
import { PERSISTENCE_MODEL_REGISTRY } from "../foundation/persistence-models";
import { REPOSITORY_IDS } from "../foundation/repository-catalogue";
import {
  STORAGE_FAMILY_IDS,
} from "../foundation/storage-families";
import { REPOSITORY_LAYER_ID } from "../repositories/repository.constants";
import { PERSISTENCE_RUNTIME_ID } from "../runtime/persistence.constants";
import { STORAGE_RUNTIME_BINDINGS } from "../runtime/storage-runtime-bindings";
import {
  DATA_EXPOSURE_GATE,
  DATA_EXPOSURE_LAYER_ID,
  DATA_FOUNDATION_REF,
  PERSISTENCE_RUNTIME_REF,
  REPOSITORY_LAYER_REF,
} from "../exposure/exposure.constants";
import {
  DATA_EXPOSURE_BINDINGS,
  getDataExposureBinding,
} from "../exposure/data-exposure-bindings";
import { resolveDataExposurePlan } from "../exposure/data-exposure-plan";
import { runDataPersistenceRuntimeGate } from "./data.persistence.gate";

export type DataExposureCheck = Readonly<{
  id: string;
  source: "PI-4.1" | "PI-4.2" | "PI-4.3" | "PI-4.4" | "PD-5.4";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type DataExposureReport = Readonly<{
  layer: "PI-4.4";
  layerId: typeof DATA_EXPOSURE_LAYER_ID;
  gateId: typeof DATA_EXPOSURE_GATE;
  passed: boolean;
  checks: readonly DataExposureCheck[];
  summary: Readonly<{
    exposures: number;
    repositories: number;
    storageFamilies: number;
    models: number;
    runtimePassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: DataExposureCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): DataExposureCheck {
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

export function runDataExposureGate(
  rootDir?: string,
): DataExposureReport {
  const root = resolveRoot(rootDir);
  const checks: DataExposureCheck[] = [];

  const runtime = runDataPersistenceRuntimeGate(root);
  checks.push(
    check(
      "EXP-RUNTIME",
      "PI-4.3",
      "PI-4.3 persistence runtime intact for data exposure",
      runtime.passed &&
        runtime.runtimeId === PERSISTENCE_RUNTIME_ID &&
        PERSISTENCE_RUNTIME_REF === PERSISTENCE_RUNTIME_ID &&
        REPOSITORY_LAYER_REF === REPOSITORY_LAYER_ID &&
        DATA_FOUNDATION_REF === DATA_FOUNDATION_ID,
      `adapters=${runtime.summary.storageAdapters} repoBindings=${runtime.summary.repositoryBindings}`,
    ),
  );

  checks.push(
    check(
      "EXP-IDS",
      "PI-4.4",
      "Data exposure layer IDs locked; closed REPO set",
      DATA_EXPOSURE_LAYER_ID === "product-data-exposure-v1" &&
        DATA_EXPOSURE_GATE === "product-data-exposure-gate" &&
        DATA_EXPOSURE_BINDINGS.length === REPOSITORY_IDS.length &&
        DATA_EXPOSURE_BINDINGS.length === 9,
      `layer=${DATA_EXPOSURE_LAYER_ID} exposures=${DATA_EXPOSURE_BINDINGS.length}`,
    ),
  );

  const matchLayers = REPOSITORY_IDS.every((id) => {
    try {
      const plan = resolveDataExposurePlan(id);
      const binding = getDataExposureBinding(id);
      return (
        !!binding &&
        plan.matchesRepository &&
        plan.matchesRuntime &&
        plan.supportsQuery &&
        plan.supportsCommand &&
        plan.runtime.access.binding.primaryModule === binding.exposureModule &&
        plan.runtime.runtimeBinding.primaryStorageFamily ===
          binding.primaryStorageFamily
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "EXP-MATCH",
      "PI-4.4",
      "Exposure bindings match runtime/repository layers",
      matchLayers,
      REPOSITORY_IDS.join(","),
    ),
  );

  const familiesReuse = DATA_EXPOSURE_BINDINGS.every(
    (row) =>
      (STORAGE_FAMILY_IDS as readonly string[]).includes(
        row.primaryStorageFamily,
      ) &&
      resolveDataExposurePlan(row.repositoryId).adapters.every((adapter) =>
        adapter.storageFamilies.every((f) =>
          (STORAGE_FAMILY_IDS as readonly string[]).includes(f),
        ),
      ),
  );
  checks.push(
    check(
      "EXP-STF",
      "PD-5.4",
      "Existing storage/runtime families reused",
      familiesReuse &&
        STORAGE_FAMILY_IDS.length === 7 &&
        STORAGE_RUNTIME_BINDINGS.length === 6,
      `stf=${STORAGE_FAMILY_IDS.length} prt=${STORAGE_RUNTIME_BINDINGS.length}`,
    ),
  );

  const modelsReuse = DATA_EXPOSURE_BINDINGS.every((row) => {
    const plan = resolveDataExposurePlan(row.repositoryId);
    return (
      plan.models.length > 0 &&
      plan.models.every((m) =>
        PERSISTENCE_MODEL_REGISTRY.some(
          (reg) =>
            reg.modelId === m.modelId &&
            reg.repositoryId === row.repositoryId,
        ),
      )
    );
  });
  const modulesExist = DATA_EXPOSURE_BINDINGS.every((row) =>
    fs.existsSync(path.join(root, row.exposureModule)),
  );
  checks.push(
    check(
      "EXP-MODELS",
      "PI-4.1",
      "Existing models reused",
      modelsReuse && modulesExist && PERSISTENCE_MODEL_REGISTRY.length >= 15,
      `models=${PERSISTENCE_MODEL_REGISTRY.length}`,
    ),
  );

  const forbidden = FORBIDDEN_DOMAIN_PATHS.filter((p) =>
    fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "EXP-NO-NEW-DOMAIN",
      "PI-4.4",
      "No new Domain",
      forbidden.length === 0 && PRODUCT_DOMAIN_IDS.length === 5,
      forbidden.length ? forbidden.join(",") : "M11–M15 only",
    ),
  );

  checks.push(
    check(
      "EXP-NO-NEW-FAM",
      "PI-4.4",
      "No new repo/storage families",
      DATA_EXPOSURE_BINDINGS.every((b) =>
        (REPOSITORY_IDS as readonly string[]).includes(b.repositoryId),
      ) &&
        !fs.existsSync(path.join(root, "lib/data/exposure/families")) &&
        !fs.existsSync(path.join(root, "prisma/schema-pi44.prisma")),
      `exposures=${DATA_EXPOSURE_BINDINGS.length} repos=${REPOSITORY_IDS.length}`,
    ),
  );

  const exposureFiles = listTsFiles(path.join(root, "lib/data/exposure"));
  const feHits = exposureFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/frontend|from\s+["'][^"']*lib\/frontend/.test(
      text,
    );
  });
  const backendDeepHits = exposureFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["'][^"']*lib\/backend\/(services|runtime|api|hardening|verify)/.test(
      text,
    );
  });
  checks.push(
    check(
      "EXP-NO-COUPLE",
      "PI-4.4",
      "No frontend/backend coupling in data exposure",
      feHits.length === 0 && backendDeepHits.length === 0,
      feHits.length || backendDeepHits.length
        ? [...feHits, ...backendDeepHits]
            .map((f) => path.relative(root, f))
            .join(",")
        : `scanned=${exposureFiles.length}`,
    ),
  );

  const artifact = resolveDataExposurePlan("REPO-ARTIFACT");
  const session = resolveDataExposurePlan("REPO-SESSION");
  const agent = resolveDataExposurePlan("REPO-AGENT-RUN");
  checks.push(
    check(
      "EXP-SPOT",
      "PD-5.4",
      "Golden exposure plans honor read/write / stream / session modes",
      artifact.modes.includes("artifact-stream") &&
        artifact.adapters.some((a) => a.adapterId === "PRT-OBJECT-FS") &&
        session.modes.includes("session-observe") &&
        agent.modes.includes("job-progress") &&
        agent.adapters.some((a) => a.adapterId === "PRT-V80-JOB"),
      `artifact=${artifact.modes.join("+")} session=${session.binding.exposureModule}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-4.4",
    layerId: DATA_EXPOSURE_LAYER_ID,
    gateId: DATA_EXPOSURE_GATE,
    passed,
    checks,
    summary: {
      exposures: DATA_EXPOSURE_BINDINGS.length,
      repositories: REPOSITORY_IDS.length,
      storageFamilies: STORAGE_FAMILY_IDS.length,
      models: PERSISTENCE_MODEL_REGISTRY.length,
      runtimePassed: runtime.passed,
    },
  };
}

export function assertDataExposureGate(
  report: DataExposureReport = runDataExposureGate(),
): DataExposureReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-4.4 Data exposure gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
