/**
 * V54 Workspace Business Runtime — P2 Business Context Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import { createWorkspaceBusinessBridge } from "../lib/workspace-business-runtime/bridge/workspace-runtime-bridge";
import { createWorkspaceBusinessContext } from "../lib/workspace-business-runtime/context/workspace-business-context-factory";
import {
  WORKSPACE_BUSINESS_RUNTIME_P2_META,
  WORKSPACE_BUSINESS_RUNTIME_P2_TAG,
} from "../lib/workspace-business-runtime/context/workspace-business-context-meta";
import { WORKSPACE_BUSINESS_RUNTIME_P2_FREEZE } from "../lib/workspace-business-runtime/freeze/v54-p2-meta";
import { WORKSPACE_BUSINESS_RUNTIME_CURRENT_META } from "../lib/workspace-business-runtime/index-meta";
import {
  assertBusinessContextContract,
  assertBusinessScopeContract,
  assertContextAggregatesBridgeView,
  assertContextConsumesBridgeOnly,
  assertContextFactoryContract,
  assertContextFoundationOnlyScope,
  assertContextValidationContract,
  assertMountedBusinessContextReadiness,
  validateWorkspaceBusinessContext,
} from "../lib/workspace-business-runtime/context/workspace-business-context-validation";
import {
  assertBusinessScope,
  assertWorkspaceBusinessContextShape,
} from "../lib/workspace-business-runtime/context/workspace-business-context";

const BUSINESS_ROOT = join(process.cwd(), "lib", "workspace-business-runtime");
const CONTEXT_ROOT = join(BUSINESS_ROOT, "context");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function walkTsFiles(dir: string, options?: { excludeDirNames?: string[] }): string[] {
  const excludeDirNames = options?.excludeDirNames ?? [];
  const files: string[] = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && excludeDirNames.includes(entry.name)) {
      continue;
    }
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkTsFiles(fullPath, options));
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files;
}

const P2_AUDIT_OPTIONS = { excludeDirNames: ["validation", "freeze"] as string[] };

function auditContextFiles(): string[] {
  return walkTsFiles(CONTEXT_ROOT, P2_AUDIT_OPTIONS).filter(
    (file) =>
      !file.endsWith("workspace-business-context-validation.ts") &&
      !file.endsWith("workspace-business-context-meta.ts"),
  );
}

function auditNoPrisma(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditContextFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditContextFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApi(): boolean {
  const pattern = /\/api\/|from\s+["']@\/lib\/saas-product-api|from\s+["']@\/app\/api|fetch\s*\(\s*["'`]\/api/;
  return !auditContextFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPortal(): boolean {
  const pattern = /saas-product-portal|from\s+["']@\/lib\/saas-product-portal|from\s+["']@\/app\/saas-product/;
  return !auditContextFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoDomain(): boolean {
  const pattern = /\/domains\/|QuoteDomain|ProjectDomain|ReportDomain|WorkspaceDomain|createQuoteDomain|createProjectDomain/;
  return !auditContextFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoOrchestration(): boolean {
  const pattern = /orchestrat|executeWorkflow|workflowEngine|WorkflowOrchestrat/i;
  return !auditContextFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoEntry(): boolean {
  const pattern = /business-entry\/|createBusinessEntry|resolveBusinessEntryRoute|BusinessEntryRuntime/;
  return !auditContextFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateWorkspaceBusinessContext();
  assert(validation.valid, `P2 business context validation: ${validation.summary}`);
  console.log("✓ P2 business context validation ok");

  assert(existsSync(join(CONTEXT_ROOT, "workspace-business-context.ts")), "context module");
  assert(assertBusinessContextContract(), "HAS_BUSINESS_CONTEXT");
  console.log("✓ HAS_BUSINESS_CONTEXT");

  assert(assertBusinessScopeContract(), "HAS_BUSINESS_SCOPE");
  console.log("✓ HAS_BUSINESS_SCOPE");

  assert(assertContextFactoryContract(), "HAS_CONTEXT_FACTORY");
  console.log("✓ HAS_CONTEXT_FACTORY");

  assert(assertContextValidationContract(), "HAS_CONTEXT_VALIDATION");
  console.log("✓ HAS_CONTEXT_VALIDATION");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApi(), "NO_API");
  console.log("✓ NO_API");

  assert(auditNoPortal(), "NO_PORTAL");
  console.log("✓ NO_PORTAL");

  assert(auditNoDomain(), "NO_DOMAIN");
  console.log("✓ NO_DOMAIN");

  assert(auditNoOrchestration(), "NO_ORCHESTRATION");
  console.log("✓ NO_ORCHESTRATION");

  assert(auditNoEntry(), "NO_ENTRY");
  console.log("✓ NO_ENTRY");

  assert(assertContextConsumesBridgeOnly(), "context bridge-only consumption");
  assert(assertContextFoundationOnlyScope(), "context foundation scope");
  assert(assertMountedBusinessContextReadiness(), "mounted context readiness");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p2" });
  const bridgeView = createWorkspaceBusinessBridge(assemblyContext);
  const context = createWorkspaceBusinessContext(bridgeView);

  assert(assertWorkspaceBusinessContextShape(context), "context shape");
  assert(assertBusinessScope(context.scope), "context scope");
  assert(assertContextAggregatesBridgeView(bridgeView), "context aggregates bridge");
  assert(context.readiness.readiness === "BLOCKED", "idle context readiness");
  assert(context.surfaces.length === 4, "context surfaces");
  assert(context.entries.length === 4, "context entries");

  assert(WORKSPACE_BUSINESS_RUNTIME_CURRENT_META.tag === WORKSPACE_BUSINESS_RUNTIME_P2_TAG, "current meta tag");
  assert(WORKSPACE_BUSINESS_RUNTIME_CURRENT_META.phase === "v54-workspace-business-p2", "current meta phase");
  assert(WORKSPACE_BUSINESS_RUNTIME_P2_FREEZE.status === "business-context-foundation", "business p2 freeze status");
  assert(WORKSPACE_BUSINESS_RUNTIME_P2_META.status === "business-context-foundation", "business p2 meta status");
  console.log("✓ business meta ok");

  console.log(`tag=${WORKSPACE_BUSINESS_RUNTIME_P2_TAG}`);
  console.log("V54 P2 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
