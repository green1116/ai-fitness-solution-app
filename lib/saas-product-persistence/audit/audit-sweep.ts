import { execSync } from "child_process";
import { readdirSync, readFileSync } from "fs";
import { join, relative } from "path";
import { assertV48LayersUnmodified } from "@/lib/saas-product";
import { SAAS_PRODUCT_META } from "@/lib/saas-product";
import {
  PERSISTENCE_REPOSITORY_NAMES,
  PERSISTENCE_TABLES,
  SAAS_PRODUCT_PERSISTENCE_P5_TAG,
} from "../shared/persistence-constants";
import { createPersistenceRuntime } from "../runtime/persistence-adapter";
import { registerMemoryPersistenceQuote } from "../runtime/persistence-backend";
import type { AuditCheckResult } from "./audit-types";

const PERSISTENCE_ROOT = join(process.cwd(), "lib", "saas-product-persistence");
const RUNTIME_ROOT = join(PERSISTENCE_ROOT, "runtime");
const REPOSITORY_ROOT = join(PERSISTENCE_ROOT, "repositories");

const V48_LAYER_DIRS = [
  "lib/saas-foundation",
  "lib/saas-runtime",
  "lib/saas-lifecycle",
  "lib/saas-commercial-adapter",
  "lib/saas-rbac",
  "lib/saas-subscription",
  "lib/saas-portal",
  "lib/saas-platform",
] as const;

const V49_ROOT = "lib/saas-product";

const PRISMA_IMPORT_PATTERN = /from\s+["']@\/lib\/prisma["']/;
const PRISMA_CLIENT_PATTERN = /new\s+PrismaClient\s*\(/;

const FORBIDDEN_PERSISTENCE_IMPORT_PATTERNS = [
  /from\s+["']@\/lib\/saas-product["']/,
  /from\s+["']@\/lib\/saas-foundation["']/,
  /from\s+["']@\/lib\/saas-runtime["']/,
  /from\s+["']@\/lib\/saas-lifecycle["']/,
  /from\s+["']@\/lib\/saas-commercial-adapter["']/,
  /from\s+["']@\/lib\/saas-rbac["']/,
  /from\s+["']@\/lib\/saas-subscription["']/,
  /from\s+["']@\/lib\/saas-portal["']/,
  /from\s+["']@\/lib\/saas-platform["']/,
  /from\s+["']@\/lib\/commercial-products\//,
] as const;

function rel(path: string): string {
  return relative(process.cwd(), path).replace(/\\/g, "/");
}

function walkTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkTsFiles(fullPath));
      continue;
    }
    if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

function gitDiffNames(tag: string, paths: string[]): string[] {
  try {
    const output = execSync(`git diff ${tag} --name-only -- ${paths.join(" ")}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!output) return [];
    return output.split("\n").map((line) => line.trim()).filter(Boolean);
  } catch {
    return ["<git-diff-unavailable>"];
  }
}

export function auditRuntimePrismaBoundary(): AuditCheckResult {
  const violations: string[] = [];
  for (const file of walkTsFiles(RUNTIME_ROOT)) {
    const content = readFileSync(file, "utf8");
    if (PRISMA_IMPORT_PATTERN.test(content) || PRISMA_CLIENT_PATTERN.test(content)) {
      violations.push(rel(file));
    }
  }
  return {
    id: "runtime-boundary",
    title: "Runtime does not import Prisma directly",
    status: violations.length === 0 ? "pass" : "fail",
    detail: violations.length === 0 ? "runtime/ has no @/lib/prisma imports" : violations.join(", "),
  };
}

export function auditRepositoryPrismaBoundary(): AuditCheckResult {
  const violations: string[] = [];
  const allowedRoots = [REPOSITORY_ROOT, join(PERSISTENCE_ROOT, "validation")];

  for (const file of walkTsFiles(PERSISTENCE_ROOT)) {
    const inRepository = allowedRoots.some((root) => file.startsWith(root));
    const content = readFileSync(file, "utf8");
    if (!PRISMA_IMPORT_PATTERN.test(content) && !PRISMA_CLIENT_PATTERN.test(content)) {
      continue;
    }
    if (!inRepository) {
      violations.push(rel(file));
    }
  }

  return {
    id: "repository-boundary",
    title: "Prisma client confined to repository layer",
    status: violations.length === 0 ? "pass" : "fail",
    detail:
      violations.length === 0
        ? "only repositories/ imports @/lib/prisma"
        : `unexpected prisma imports: ${violations.join(", ")}`,
  };
}

export function auditPersistenceImportBoundary(): AuditCheckResult {
  const violations: string[] = [];
  const auditExcluded = [join(PERSISTENCE_ROOT, "audit")];

  for (const file of walkTsFiles(PERSISTENCE_ROOT)) {
    if (auditExcluded.some((dir) => file.startsWith(dir))) continue;
    const content = readFileSync(file, "utf8");
    for (const pattern of FORBIDDEN_PERSISTENCE_IMPORT_PATTERNS) {
      if (pattern.test(content)) {
        violations.push(rel(file));
        break;
      }
    }
  }

  return {
    id: "persistence-import-boundary",
    title: "Persistence layer does not import frozen V48/V49 runtime",
    status: violations.length === 0 ? "pass" : "fail",
    detail: violations.length === 0 ? "no frozen-layer imports in persistence module" : violations.join(", "),
  };
}

export function auditV49FrozenBoundary(): AuditCheckResult {
  const changed = gitDiffNames("v49-saas-product-final", [V49_ROOT]);
  const frozen = SAAS_PRODUCT_META.frozen === true;
  const pass = changed.length === 0 && frozen;

  return {
    id: "v49-frozen-boundary",
    title: "V49 saas-product layer unmodified since final freeze",
    status: pass ? "pass" : "fail",
    detail: pass
      ? `tag=v49-saas-product-final unchanged, frozen=${frozen}`
      : `changedFiles=${changed.join(", ") || "none"}, frozen=${frozen}`,
  };
}

export function auditV48FrozenBoundary(): AuditCheckResult {
  const v48Present = assertV48LayersUnmodified();
  const changed = gitDiffNames("v48-production-saas-foundation", [...V48_LAYER_DIRS]);
  const pass = v48Present && changed.length === 0;

  return {
    id: "v48-frozen-boundary",
    title: "V48 SaaS foundation layers unmodified since freeze",
    status: pass ? "pass" : "fail",
    detail: pass
      ? "v48-production-saas-foundation unchanged"
      : `layersPresent=${v48Present}, changedFiles=${changed.join(", ") || "none"}`,
  };
}

export async function auditTenantIsolation(): Promise<AuditCheckResult> {
  const tenantA = "p7-audit-tenant-a";
  const tenantB = "p7-audit-tenant-b";
  const runtime = createPersistenceRuntime({ backend: "memory" });

  const workspace = await runtime.workspace.create({
    tenantId: tenantA,
    name: "p7-audit-workspace",
  });

  const crossTenantResolve = await runtime.workspace.resolve(workspace.id, tenantB);
  const tenantList = await runtime.workspace.list(tenantB);
  const leaked = tenantList.some((item) => item.id === workspace.id);

  const pass = crossTenantResolve === null && !leaked;

  return {
    id: "tenant-isolation",
    title: "Tenant A cannot access Tenant B data",
    status: pass ? "pass" : "fail",
    detail: pass
      ? "cross-tenant resolve returned null and list excluded foreign workspace"
      : `crossTenantResolve=${crossTenantResolve?.id ?? "null"}, leaked=${leaked}`,
  };
}

export async function auditPersistenceClosedLoop(): Promise<AuditCheckResult> {
  const tenantId = "p7-audit-loop-tenant";
  const runtime = createPersistenceRuntime({ backend: "memory" });

  const workspace = await runtime.workspace.create({
    tenantId,
    name: "p7-loop-workspace",
  });

  const quote = registerMemoryPersistenceQuote(runtime, {
    workspaceId: workspace.id,
    tenantId,
    title: "p7-loop-quote",
  });

  const created = await runtime.quoteWorkflow.create({
    workspaceId: workspace.id,
    tenantId,
    quoteId: quote.id,
    actor: "p7-audit",
  });

  const approved = await runtime.quoteWorkflow.transition({
    workflowId: created.workflow.id,
    tenantId,
    toState: "APPROVED",
    actor: "p7-audit",
  });

  const listed = await runtime.quoteWorkflow.list(workspace.id, tenantId);

  const pass =
    workspace.id.length > 0 &&
    quote.workspaceId === workspace.id &&
    created.workflow.workflowType === "QUOTE" &&
    created.history.workflowId === created.workflow.id &&
    created.event.workflowId === created.workflow.id &&
    approved.history.toState === "APPROVED" &&
    approved.event.eventType === "STATE_CHANGED" &&
    listed.some((item) => item.id === created.workflow.id);

  return {
    id: "persistence-closed-loop",
    title: "Workspace → Quote → Workflow → History → Event loop",
    status: pass ? "pass" : "fail",
    detail: pass
      ? "memory backend closed loop verified"
      : "closed loop chain incomplete",
  };
}

export function auditCommercialReadiness(): AuditCheckResult {
  const runtime = createPersistenceRuntime({ backend: "memory" });
  const checks = [
    PERSISTENCE_TABLES.length === 5,
    PERSISTENCE_REPOSITORY_NAMES.length === 5,
    runtime.backend === "memory",
    typeof runtime.workspace.create === "function",
    typeof runtime.quoteWorkflow.create === "function",
    SAAS_PRODUCT_PERSISTENCE_P5_TAG === "v50-production-persistence-p5",
  ];
  const pass = checks.every(Boolean);

  return {
    id: "commercial-readiness",
    title: "V50 persistence commercial readiness baseline",
    status: pass ? "pass" : "fail",
    detail: pass
      ? "adapter, repositories, schema catalog, and runtime entry are present"
      : `tables=${PERSISTENCE_TABLES.length}, repositories=${PERSISTENCE_REPOSITORY_NAMES.length}`,
  };
}

export async function runPersistenceAuditSweep(): Promise<import("./audit-types").PersistenceAuditResult> {
  const checks: AuditCheckResult[] = [
    auditRuntimePrismaBoundary(),
    auditRepositoryPrismaBoundary(),
    auditPersistenceImportBoundary(),
    auditV49FrozenBoundary(),
    auditV48FrozenBoundary(),
    await auditTenantIsolation(),
    await auditPersistenceClosedLoop(),
    auditCommercialReadiness(),
  ];

  const passed = checks.every((check) => check.status === "pass");

  return {
    checks,
    passed,
    summary: `auditChecks=${checks.length} passed=${checks.filter((c) => c.status === "pass").length}`,
  };
}
