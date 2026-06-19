import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join, relative } from "path";
import { PERSISTENCE_BACKEND_ENV_KEY } from "@/lib/saas-product-persistence";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { getPersistenceRuntime, resetPersistenceRuntimeForTests } from "../adapter/get-persistence-runtime";
import { handleListWorkflowEvents, handleListWorkflowHistory } from "../handlers/audit-handlers";
import { handleCreateQuote, handleGetQuote } from "../handlers/quote-handlers";
import { handleCreateWorkspace, handleGetWorkspace } from "../handlers/workspace-handlers";
import { handleGetWorkflow } from "../handlers/workflow-handlers";
import { isSaasProductApiError } from "../shared/api-errors";
import type { ApiContext } from "../shared/api-types";
import type { ApiAuditCheckResult, SaasProductApiAuditReport, SaasProductApiAuditSweepResult } from "./audit-types";

const API_ROUTE_ROOT = join(process.cwd(), "app", "api", "saas-product");
const CONTRACTOR_USER_ID = "user-mock-contractor-pm";

const PRISMA_IMPORT_PATTERN = /@\/lib\/prisma/;
const REPOSITORY_IMPORT_PATTERN = /persistenceRepositories/;
const V49_IMPORT_PATTERNS = [/lib\/saas-product\//, /from\s+["']@\/lib\/saas-product["']/] as const;

const EXPECTED_ROUTE_RELATIVE_PATHS = [
  "health/route.ts",
  "me/route.ts",
  "workspaces/route.ts",
  "workspaces/[workspaceId]/route.ts",
  "workspaces/[workspaceId]/quotes/route.ts",
  "quotes/[quoteId]/route.ts",
  "quotes/[quoteId]/workflow/route.ts",
  "workflows/route.ts",
  "workflows/[workflowId]/transition/route.ts",
  "workflows/[workflowId]/history/route.ts",
  "workflows/[workflowId]/events/route.ts",
] as const;

const READ_ONLY_ROUTE_RELATIVE_PATHS = [
  "workflows/[workflowId]/history/route.ts",
  "workflows/[workflowId]/events/route.ts",
] as const;

const REGRESSION_SCRIPTS = [
  "verify:v51-p1",
  "verify:v51-p2",
  "verify:v51-p3",
  "verify:v51-p4",
  "verify:v51-p5",
  "verify:v51-p6",
] as const;

function rel(path: string): string {
  return relative(process.cwd(), path).replace(/\\/g, "/");
}

function walkRouteFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkRouteFiles(fullPath));
      continue;
    }
    if (entry.name === "route.ts") {
      files.push(fullPath);
    }
  }
  return files;
}

function countNonEmptyLines(content: string): number {
  return content.split("\n").filter((line) => line.trim().length > 0).length;
}

function countEndpointHandlers(content: string): number {
  const matches = content.match(/^export async function (GET|POST|PATCH|PUT|DELETE)/gm);
  return matches?.length ?? 0;
}

function passCheck(id: string, title: string, detail: string): ApiAuditCheckResult {
  return { id, title, status: "pass", detail };
}

function failCheck(id: string, title: string, detail: string): ApiAuditCheckResult {
  return { id, title, status: "fail", detail };
}

export function auditRouteBoundary(): ApiAuditCheckResult {
  const violations: string[] = [];
  for (const file of walkRouteFiles(API_ROUTE_ROOT)) {
    const content = readFileSync(file, "utf8");
    if (PRISMA_IMPORT_PATTERN.test(content)) {
      violations.push(`${rel(file)}: prisma import`);
    }
    if (REPOSITORY_IMPORT_PATTERN.test(content)) {
      violations.push(`${rel(file)}: persistenceRepositories import`);
    }
    for (const pattern of V49_IMPORT_PATTERNS) {
      if (pattern.test(content)) {
        violations.push(`${rel(file)}: V49 runtime import`);
      }
    }
  }
  if (violations.length === 0) {
    return passCheck("ROUTE_BOUNDARY_PASS", "Route boundary audit", "ROUTE_BOUNDARY_PASS");
  }
  return failCheck("ROUTE_BOUNDARY_PASS", "Route boundary audit", violations.join("; "));
}

export function auditThinRoutes(): ApiAuditCheckResult {
  const violations: string[] = [];
  for (const file of walkRouteFiles(API_ROUTE_ROOT)) {
    const lines = countNonEmptyLines(readFileSync(file, "utf8"));
    if (lines >= 15) {
      violations.push(`${rel(file)}=${lines} lines`);
    }
  }
  if (violations.length === 0) {
    return passCheck("THIN_ROUTE_PASS", "Thin route audit", "THIN_ROUTE_PASS");
  }
  return failCheck("THIN_ROUTE_PASS", "Thin route audit", violations.join("; "));
}

export function auditTenantEnforcement(): ApiAuditCheckResult {
  const violations: string[] = [];
  for (const file of walkRouteFiles(API_ROUTE_ROOT)) {
    const content = readFileSync(file, "utf8");
    const routePath = rel(file);
    if (routePath.endsWith("/health/route.ts")) {
      if (!content.includes("requireTenant: false")) {
        violations.push(`${routePath}: health must use requireTenant: false`);
      }
      continue;
    }
    if (!content.includes("requireTenant: true")) {
      violations.push(`${routePath}: missing requireTenant: true`);
    }
  }
  if (violations.length === 0) {
    return passCheck("TENANT_ENFORCEMENT_PASS", "Tenant enforcement audit", "TENANT_ENFORCEMENT_PASS");
  }
  return failCheck("TENANT_ENFORCEMENT_PASS", "Tenant enforcement audit", violations.join("; "));
}

export function auditReadOnlyRoutes(): ApiAuditCheckResult {
  const violations: string[] = [];
  for (const relativePath of READ_ONLY_ROUTE_RELATIVE_PATHS) {
    const file = join(API_ROUTE_ROOT, ...relativePath.split("/"));
    const content = readFileSync(file, "utf8");
    if (/export async function (POST|PATCH|PUT|DELETE)/.test(content)) {
      violations.push(`${relativePath}: mutation handler detected`);
    }
    if (!content.includes("export async function GET")) {
      violations.push(`${relativePath}: missing GET handler`);
    }
  }
  if (violations.length === 0) {
    return passCheck("READ_ONLY_PASS", "Read-only audit", "READ_ONLY_PASS");
  }
  return failCheck("READ_ONLY_PASS", "Read-only audit", violations.join("; "));
}

export function auditEndpointCoverage(): ApiAuditCheckResult {
  const missing = EXPECTED_ROUTE_RELATIVE_PATHS.filter(
    (relativePath) => !existsSync(join(API_ROUTE_ROOT, ...relativePath.split("/"))),
  );
  if (missing.length === 0) {
    return passCheck("ENDPOINT_COVERAGE_PASS", "Endpoint coverage audit", "ENDPOINT_COVERAGE_PASS");
  }
  return failCheck("ENDPOINT_COVERAGE_PASS", "Endpoint coverage audit", `missing routes: ${missing.join(", ")}`);
}

function buildTenantContext(tenantId: string, userId: string): ApiContext {
  const runtime = getPersistenceRuntime();
  return {
    tenantId,
    userId,
    actor: userId,
    runtime,
    backend: runtime.backend,
  };
}

async function expectNotFound(operation: () => Promise<unknown>): Promise<boolean> {
  try {
    await operation();
    return false;
  } catch (error) {
    return isSaasProductApiError(error) && error.status === 404;
  }
}

export async function auditTenantIsolation(): Promise<ApiAuditCheckResult> {
  process.env[PERSISTENCE_BACKEND_ENV_KEY] = "memory";
  resetPersistenceRuntimeForTests();

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const enterpriseCtx = buildTenantContext("tenant-mock-enterprise", getDefaultMockMembershipUserId());
  const workspace = await handleCreateWorkspace(enterpriseCtx, {
    name: `p7-audit-workspace-${Date.now()}`,
  });
  const workspaceId = workspace.data.workspace.id;
  const quoteBundle = await handleCreateQuote(enterpriseCtx, workspaceId, {
    title: `p7-audit-quote-${Date.now()}`,
  });
  const quoteId = quoteBundle.data.quote.id;
  const workflowId = quoteBundle.data.workflow.id;

  const contractorCtx = buildTenantContext("tenant-mock-contractor", CONTRACTOR_USER_ID);
  const checks = {
    workspace: await expectNotFound(() => handleGetWorkspace(contractorCtx, workspaceId)),
    quote: await expectNotFound(() => handleGetQuote(contractorCtx, quoteId)),
    workflow: await expectNotFound(() => handleGetWorkflow(contractorCtx, quoteId)),
    history: await expectNotFound(() => handleListWorkflowHistory(contractorCtx, workflowId)),
    event: await expectNotFound(() => handleListWorkflowEvents(contractorCtx, workflowId)),
  };

  clearRuntimeSession();
  resetPersistenceRuntimeForTests();

  const failures = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failures.length === 0) {
    return passCheck("TENANT_ISOLATION_PASS", "Cross tenant audit", "TENANT_ISOLATION_PASS");
  }
  return failCheck("TENANT_ISOLATION_PASS", "Cross tenant audit", `failed probes: ${failures.join(", ")}`);
}

export function auditRegression(): ApiAuditCheckResult {
  const failures: string[] = [];
  for (const script of REGRESSION_SCRIPTS) {
    try {
      const output = execSync(`npm run ${script}`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        cwd: process.cwd(),
        env: process.env,
      });
      if (!output.includes("PASS")) {
        failures.push(`${script}: missing PASS marker`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${script}: ${message}`);
    }
  }
  if (failures.length === 0) {
    return passCheck("REGRESSION_PASS", "Regression audit", "REGRESSION_PASS");
  }
  return failCheck("REGRESSION_PASS", "Regression audit", failures.join("; "));
}

function collectRouteMetrics(): Pick<SaasProductApiAuditReport, "routeCount" | "endpointCount" | "tenantProtectedCount"> {
  const routeFiles = walkRouteFiles(API_ROUTE_ROOT);
  let endpointCount = 0;
  let tenantProtectedCount = 0;

  for (const file of routeFiles) {
    const content = readFileSync(file, "utf8");
    endpointCount += countEndpointHandlers(content);
    if (!rel(file).endsWith("/health/route.ts")) {
      tenantProtectedCount += countEndpointHandlers(content);
    }
  }

  return {
    routeCount: routeFiles.length,
    endpointCount,
    tenantProtectedCount,
  };
}

export async function runSaasProductApiAuditSweep(options?: {
  includeRegression?: boolean;
}): Promise<SaasProductApiAuditSweepResult> {
  const includeRegression = options?.includeRegression ?? true;
  const checks: ApiAuditCheckResult[] = [
    auditRouteBoundary(),
    auditThinRoutes(),
    auditTenantEnforcement(),
    auditReadOnlyRoutes(),
    auditEndpointCoverage(),
    await auditTenantIsolation(),
  ];

  if (includeRegression) {
    checks.push(auditRegression());
  }

  const findings = checks.filter((check) => check.status !== "pass").map((check) => `${check.id}: ${check.detail}`);
  const passed = findings.length === 0;
  const metrics = collectRouteMetrics();

  const report: SaasProductApiAuditReport = {
    ...metrics,
    auditStatus: passed ? "pass" : "fail",
    findings,
    checks,
    summary: passed ? "SAAS_PRODUCT_API_AUDIT_REPORT PASS" : "SAAS_PRODUCT_API_AUDIT_REPORT FAIL",
  };

  return { report, passed };
}

export const SAAS_PRODUCT_API_AUDIT_REPORT = {
  build: runSaasProductApiAuditSweep,
} as const;
