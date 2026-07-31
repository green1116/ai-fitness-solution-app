/**
 * PI-4.2 — Repository access layer verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import {
  FORBIDDEN_DOMAIN_PATHS,
  PRODUCT_DOMAIN_IDS,
} from "../../backend/foundation/domain-ownership";
import { DATA_FOUNDATION_ID } from "../foundation/data.constants";
import {
  PERSISTENCE_MODEL_REGISTRY,
  modelsForRepository,
} from "../foundation/persistence-models";
import {
  REPOSITORY_CATALOGUE,
  REPOSITORY_IDS,
  type RepositoryId,
} from "../foundation/repository-catalogue";
import { STORAGE_FAMILY_IDS } from "../foundation/storage-families";
import {
  DATA_FOUNDATION_REF,
  REPOSITORY_LAYER_GATE,
  REPOSITORY_LAYER_ID,
} from "../repositories/repository.constants";
import {
  DOMAIN_REPOSITORY_BIAS,
  domainOwnsRepository,
} from "../repositories/domain-repository-routing";
import {
  REPOSITORY_ACCESS_BINDINGS,
  getRepositoryAccessBinding,
} from "../repositories/repository-access-bindings";
import { resolveRepositoryAccessPlan } from "../repositories/repository-access-plan";
import { runDataFoundationGate } from "./data.foundation.gate";

export type RepositoryGateCheck = Readonly<{
  id: string;
  source: "PI-4.1" | "PI-4.2" | "PD-5.4";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type RepositoryGateReport = Readonly<{
  layer: "PI-4.2";
  layerId: typeof REPOSITORY_LAYER_ID;
  gateId: typeof REPOSITORY_LAYER_GATE;
  passed: boolean;
  checks: readonly RepositoryGateCheck[];
  summary: Readonly<{
    repositories: number;
    bindings: number;
    models: number;
    foundationPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: RepositoryGateCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): RepositoryGateCheck {
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

export function runDataRepositoryGate(
  rootDir?: string,
): RepositoryGateReport {
  const root = resolveRoot(rootDir);
  const checks: RepositoryGateCheck[] = [];

  const foundation = runDataFoundationGate(root);
  checks.push(
    check(
      "REPO-FOUNDATION",
      "PI-4.1",
      "PI-4.1 data foundation intact for repository layer",
      foundation.passed &&
        foundation.foundationId === DATA_FOUNDATION_ID &&
        DATA_FOUNDATION_REF === DATA_FOUNDATION_ID,
      `repos=${foundation.summary.repositories} models=${foundation.summary.persistenceModels}`,
    ),
  );

  checks.push(
    check(
      "REPO-IDS",
      "PI-4.2",
      "Repository layer IDs locked; closed REPO set unchanged",
      REPOSITORY_LAYER_ID === "product-data-repository-layer-v1" &&
        REPOSITORY_LAYER_GATE === "product-data-repository-layer-gate" &&
        REPOSITORY_ACCESS_BINDINGS.length === REPOSITORY_IDS.length &&
        REPOSITORY_ACCESS_BINDINGS.length === 9,
      `layer=${REPOSITORY_LAYER_ID} bindings=${REPOSITORY_ACCESS_BINDINGS.length}`,
    ),
  );

  const mappingMatch = REPOSITORY_IDS.every((id) => {
    const catalogue = REPOSITORY_CATALOGUE.find((r) => r.repositoryId === id);
    const binding = getRepositoryAccessBinding(id);
    if (!catalogue || !binding) return false;
    if (binding.repositoryId !== catalogue.repositoryId) return false;
    if (!catalogue.existingModulePaths.includes(binding.primaryModule)) {
      return false;
    }
    return binding.supportingModules.every((mod) =>
      catalogue.existingModulePaths.includes(mod),
    );
  });
  checks.push(
    check(
      "REPO-MAP",
      "PI-4.2",
      "Repository mappings match PI-4.1",
      mappingMatch,
      REPOSITORY_IDS.join(","),
    ),
  );

  const modelsReuse = REPOSITORY_ACCESS_BINDINGS.every((binding) => {
    const foundationModels = modelsForRepository(binding.repositoryId);
    const foundationIds = new Set(foundationModels.map((m) => m.modelId));
    if (binding.modelIds.length === 0) return false;
    if (!binding.modelIds.every((id) => foundationIds.has(id))) return false;
    return binding.modelIds.every((id) =>
      PERSISTENCE_MODEL_REGISTRY.some(
        (m) => m.modelId === id && m.repositoryId === binding.repositoryId,
      ),
    );
  });
  const modulesExist = REPOSITORY_ACCESS_BINDINGS.every((binding) => {
    const paths = [binding.primaryModule, ...binding.supportingModules];
    return paths.every((rel) => fs.existsSync(path.join(root, rel)));
  });
  checks.push(
    check(
      "REPO-MODELS",
      "PI-4.2",
      "Existing models reused via access bindings",
      modelsReuse && modulesExist,
      `bindings=${REPOSITORY_ACCESS_BINDINGS.length} registry=${PERSISTENCE_MODEL_REGISTRY.length}`,
    ),
  );

  const plansOk = REPOSITORY_IDS.every((id) => {
    try {
      const plan = resolveRepositoryAccessPlan(id);
      return (
        plan.layerId === REPOSITORY_LAYER_ID &&
        plan.reusesFoundationModules &&
        plan.ownerDomainMatchesBias &&
        plan.models.length > 0 &&
        plan.capabilities.includes("read") &&
        plan.capabilities.includes("write") &&
        plan.catalogue.storageFamilies.every((f) =>
          (STORAGE_FAMILY_IDS as readonly string[]).includes(f),
        )
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "REPO-PLAN",
      "PD-5.4",
      "Repository access plans resolve for all REPO-*",
      plansOk &&
        domainOwnsRepository("M11", "REPO-KNOWLEDGE") &&
        domainOwnsRepository("M15", "REPO-EVOLUTION") &&
        !domainOwnsRepository("M11", "REPO-SESSION"),
      `plans=${REPOSITORY_IDS.length} biasDomains=${PRODUCT_DOMAIN_IDS.length}`,
    ),
  );

  const biasCoverage = PRODUCT_DOMAIN_IDS.every((domainId) => {
    const bias = DOMAIN_REPOSITORY_BIAS[domainId];
    return (
      bias.length > 0 &&
      bias.every((repoId) =>
        REPOSITORY_CATALOGUE.some(
          (row) =>
            row.repositoryId === repoId && row.ownerDomain === domainId,
        ),
      )
    );
  });
  const allReposCovered = REPOSITORY_IDS.every((id) =>
    PRODUCT_DOMAIN_IDS.some((domainId) =>
      DOMAIN_REPOSITORY_BIAS[domainId].includes(id as RepositoryId),
    ),
  );
  checks.push(
    check(
      "REPO-NO-NEW-FAM",
      "PI-4.2",
      "No new repo families",
      biasCoverage &&
        allReposCovered &&
        REPOSITORY_ACCESS_BINDINGS.every((b) =>
          (REPOSITORY_IDS as readonly string[]).includes(b.repositoryId),
        ) &&
        !fs.existsSync(path.join(root, "lib/data/repositories/impl")),
      `repos=${REPOSITORY_IDS.length} stf=${STORAGE_FAMILY_IDS.length}`,
    ),
  );

  const forbidden = FORBIDDEN_DOMAIN_PATHS.filter((p) =>
    fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "REPO-NO-NEW-DOMAIN",
      "PI-4.2",
      "No new Domain",
      forbidden.length === 0 && PRODUCT_DOMAIN_IDS.length === 5,
      forbidden.length ? forbidden.join(",") : "M11–M15 only",
    ),
  );

  const repoFiles = listTsFiles(path.join(root, "lib/data/repositories"));
  const feHits = repoFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/frontend|from\s+["'][^"']*lib\/frontend/.test(
      text,
    );
  });
  const backendDeepHits = repoFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    // Allowed: domain-ownership types only (same as PI-4.1). Forbid services/runtime/api.
    return /from\s+["'][^"']*lib\/backend\/(services|runtime|api|hardening|verify)/.test(
      text,
    );
  });
  checks.push(
    check(
      "REPO-NO-COUPLE",
      "PI-4.2",
      "No frontend/backend coupling in repository layer",
      feHits.length === 0 && backendDeepHits.length === 0,
      feHits.length || backendDeepHits.length
        ? [...feHits, ...backendDeepHits]
            .map((f) => path.relative(root, f))
            .join(",")
        : `scanned=${repoFiles.length}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-4.2",
    layerId: REPOSITORY_LAYER_ID,
    gateId: REPOSITORY_LAYER_GATE,
    passed,
    checks,
    summary: {
      repositories: REPOSITORY_IDS.length,
      bindings: REPOSITORY_ACCESS_BINDINGS.length,
      models: PERSISTENCE_MODEL_REGISTRY.length,
      foundationPassed: foundation.passed,
    },
  };
}

export function assertDataRepositoryGate(
  report: RepositoryGateReport = runDataRepositoryGate(),
): RepositoryGateReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-4.2 Repository gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
