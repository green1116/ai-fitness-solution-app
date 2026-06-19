import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  PERSISTENCE_REPOSITORY_NAMES,
  PERSISTENCE_TABLES,
  SAAS_PRODUCT_PERSISTENCE_P8_TAG,
  SAAS_PRODUCT_PERSISTENCE_FINAL_TAG,
} from "../shared/persistence-constants";
import {
  V50_FROZEN_RUNTIME_CONTRACTS,
  V50_FROZEN_TYPE_CONTRACTS,
  V50_META,
  V50_PERSISTENCE_LAYER_STACK,
  V50_PERSISTENCE_PHASE_TAGS,
} from "../freeze/v50-final-meta";
import { createPersistenceRuntime } from "../runtime/persistence-adapter";
import { validatePersistenceP5 } from "./validate-persistence-p5";
import { validatePersistenceP7 } from "./validate-persistence-p7";

export interface PersistenceP8PhaseValidations {
  P1: boolean;
  P2: boolean;
  P3: boolean;
  P4: boolean;
  P5: boolean;
  P6: boolean;
  P7: boolean;
}

export interface PersistenceP8AuditResult {
  valid: boolean;
  summary: string;
  phaseValidations: PersistenceP8PhaseValidations;
  auditSweepPassed: boolean;
  adapterReady: boolean;
  metaLocked: boolean;
  documentationReady: boolean;
  frozenContractsLocked: boolean;
}

function validatePersistenceP1Structure(): boolean {
  const migrationPath = join(
    process.cwd(),
    "prisma",
    "migrations",
    "20260618120000_v50_p1_schema",
    "migration.sql",
  );
  const schemaPath = join(process.cwd(), "prisma", "schema.prisma");
  if (!existsSync(migrationPath) || !existsSync(schemaPath)) return false;
  const schema = readFileSync(schemaPath, "utf8");
  return (
    PERSISTENCE_TABLES.length === 5 &&
    schema.includes("saas_product_workspace") &&
    schema.includes("saas_product_quote") &&
    schema.includes("saas_product_workflow_instance") &&
    schema.includes("saas_product_workflow_history") &&
    schema.includes("saas_product_workflow_event")
  );
}

function validatePersistenceP2Structure(): boolean {
  const repositoryFiles = [
    "workspace-repository.ts",
    "quote-repository.ts",
    "workflow-repository.ts",
    "workflow-history-repository.ts",
    "workflow-event-repository.ts",
  ];
  const root = join(process.cwd(), "lib", "saas-product-persistence", "repositories");
  return (
    PERSISTENCE_REPOSITORY_NAMES.length === 5 &&
    repositoryFiles.every((file) => existsSync(join(root, file)))
  );
}

function validatePersistenceP3Structure(): boolean {
  return existsSync(
    join(process.cwd(), "lib", "saas-product-persistence", "runtime", "workspace-persistence-runtime.ts"),
  );
}

function validatePersistenceP4Structure(): boolean {
  return existsSync(
    join(process.cwd(), "lib", "saas-product-persistence", "runtime", "quote-workflow-persistence-runtime.ts"),
  );
}

function validatePersistenceP6Structure(): boolean {
  const parityRoot = join(process.cwd(), "lib", "saas-product-persistence", "parity");
  return (
    existsSync(join(parityRoot, "parity-runner.ts")) &&
    existsSync(join(parityRoot, "mismatch-detector.ts")) &&
    existsSync(join(parityRoot, "diff-report.ts"))
  );
}

function validateDocumentationReady(): boolean {
  const docs = [
    "V50-FINAL-FREEZE.md",
    "V50-IMPLEMENTATION-SUMMARY.md",
    "V50-AUDIT-REPORT.md",
    "V50-PARITY-REPORT.md",
    "V50-PRODUCTION-PERSISTENCE-P1.md",
  ];
  return docs.every((file) =>
    existsSync(join(process.cwd(), "docs", "commercialization", file)),
  );
}

export async function validatePersistenceP8Freeze(): Promise<PersistenceP8AuditResult> {
  const p5 = await validatePersistenceP5();
  const p7 = await validatePersistenceP7();

  const phaseValidations: PersistenceP8PhaseValidations = {
    P1: validatePersistenceP1Structure(),
    P2: validatePersistenceP2Structure(),
    P3: validatePersistenceP3Structure(),
    P4: validatePersistenceP4Structure(),
    P5: p5.valid,
    P6: validatePersistenceP6Structure(),
    P7: p7.valid,
  };

  const runtime = createPersistenceRuntime({ backend: "memory" });
  const adapterReady =
    runtime.backend === "memory" &&
    typeof runtime.workspace.create === "function" &&
    typeof runtime.quoteWorkflow.create === "function";

  const metaLocked =
    V50_META.tag === SAAS_PRODUCT_PERSISTENCE_FINAL_TAG &&
    V50_META.status === "frozen" &&
    V50_PERSISTENCE_PHASE_TAGS.length === 8 &&
    V50_PERSISTENCE_LAYER_STACK.length === 8;

  const documentationReady = validateDocumentationReady();
  const frozenContractsLocked =
    V50_FROZEN_RUNTIME_CONTRACTS.length === 8 &&
    V50_FROZEN_TYPE_CONTRACTS.length === 7;

  const allPhasesValid = Object.values(phaseValidations).every(Boolean);
  const valid =
    allPhasesValid &&
    p7.valid &&
    adapterReady &&
    metaLocked &&
    documentationReady &&
    frozenContractsLocked;

  return {
    valid,
    summary: [
      `p8Tag=${SAAS_PRODUCT_PERSISTENCE_P8_TAG}`,
      `finalTag=${SAAS_PRODUCT_PERSISTENCE_FINAL_TAG}`,
      `allPhases=${allPhasesValid}`,
      `auditSweep=${p7.valid}`,
      `adapterReady=${adapterReady}`,
      `metaLocked=${metaLocked}`,
      `documentationReady=${documentationReady}`,
      `frozenContractsLocked=${frozenContractsLocked}`,
      `valid=${valid}`,
    ].join(" "),
    phaseValidations,
    auditSweepPassed: p7.valid,
    adapterReady,
    metaLocked,
    documentationReady,
    frozenContractsLocked,
  };
}

export const validatePersistenceP8Runtime = validatePersistenceP8Freeze;
