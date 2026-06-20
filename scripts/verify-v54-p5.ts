/**
 * V54 Workspace Business Runtime — P5 Business Entry Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import { createWorkspaceBusinessBridge } from "../lib/workspace-business-runtime/bridge/workspace-runtime-bridge";
import { createWorkspaceBusinessContext } from "../lib/workspace-business-runtime/context/workspace-business-context-factory";
import { createWorkspaceBusinessDomain } from "../lib/workspace-business-runtime/domain/workspace-business-domain-factory";
import { createWorkspaceBusinessOrchestration } from "../lib/workspace-business-runtime/orchestration/workspace-business-orchestration-factory";
import { createWorkspaceBusinessEntry } from "../lib/workspace-business-runtime/entry/workspace-business-entry-factory";
import {
  WORKSPACE_BUSINESS_RUNTIME_P5_META,
  WORKSPACE_BUSINESS_RUNTIME_P5_TAG,
} from "../lib/workspace-business-runtime/entry/workspace-business-entry-meta";
import {
  assertBusinessEntryScope,
  assertWorkspaceBusinessEntryShape,
} from "../lib/workspace-business-runtime/entry/workspace-business-entry";
import {
  assertEntryAggregatesOrchestration,
  assertEntryConsumesOrchestrationOnly,
  assertEntryContract,
  assertEntryFactoryContract,
  assertEntryFoundationOnlyScope,
  assertEntryRegistryContract,
  assertEntryStateContract,
  assertEntryValidationContract,
  assertMountedBusinessEntryState,
  validateWorkspaceBusinessEntry,
} from "../lib/workspace-business-runtime/entry/workspace-business-entry-validation";
import {
  registerWorkspaceBusinessEntry,
  resolveWorkspaceBusinessEntry,
} from "../lib/workspace-business-runtime/entry/workspace-business-entry-registry";
import {
  WORKSPACE_BUSINESS_RUNTIME_ENTRY_META,
  WORKSPACE_BUSINESS_RUNTIME_LATEST_META,
} from "../lib/workspace-business-runtime/index-meta";
import { WORKSPACE_BUSINESS_RUNTIME_P4_TAG } from "../lib/workspace-business-runtime/orchestration/workspace-business-orchestration-meta";

const BUSINESS_ROOT = join(process.cwd(), "lib", "workspace-business-runtime");
const ENTRY_ROOT = join(BUSINESS_ROOT, "entry");

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

const P5_AUDIT_OPTIONS = { excludeDirNames: ["validation", "freeze"] as string[] };

function auditEntryFiles(): string[] {
  return walkTsFiles(ENTRY_ROOT, P5_AUDIT_OPTIONS).filter(
    (file) =>
      !file.endsWith("workspace-business-entry-validation.ts") &&
      !file.endsWith("workspace-business-entry-meta.ts"),
  );
}

function auditNoPrisma(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditEntryFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditEntryFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApi(): boolean {
  const pattern = /\/api\/|from\s+["']@\/lib\/saas-product-api|from\s+["']@\/app\/api|fetch\s*\(\s*["'`]\/api/;
  return !auditEntryFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPortal(): boolean {
  const pattern = /saas-product-portal|from\s+["']@\/lib\/saas-product-portal|from\s+["']@\/app\/saas-product/;
  return !auditEntryFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoWorkflowRuntime(): boolean {
  const pattern = /WorkflowRuntime|workflow-runtime|executeWorkflow|WorkflowEngine|workflowEngine/;
  return !auditEntryFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoExecution(): boolean {
  const pattern = /execute\s*\(|run\s*\(|dispatch\s*\(|transition\s*\(/;
  return !auditEntryFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoQuote(): boolean {
  const pattern = /QuoteRuntime|createQuote|calculateQuote|quote-runtime|handleCreateQuote|QuoteEngine/;
  return !auditEntryFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoProject(): boolean {
  const pattern = /ProjectRuntime|createProject|project-runtime|handleCreateProject/;
  return !auditEntryFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoReport(): boolean {
  const pattern = /ReportRuntime|createReport|report-runtime|handleCreateReport/;
  return !auditEntryFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateWorkspaceBusinessEntry();
  assert(validation.valid, `P5 business entry validation: ${validation.summary}`);
  console.log("✓ P5 business entry validation ok");

  assert(existsSync(join(ENTRY_ROOT, "workspace-business-entry.ts")), "entry module");
  assert(assertEntryContract(), "HAS_ENTRY");
  console.log("✓ HAS_ENTRY");

  assert(assertEntryStateContract(), "HAS_ENTRY_STATE");
  console.log("✓ HAS_ENTRY_STATE");

  assert(assertEntryFactoryContract(), "HAS_ENTRY_FACTORY");
  console.log("✓ HAS_ENTRY_FACTORY");

  assert(assertEntryRegistryContract(), "HAS_ENTRY_REGISTRY");
  console.log("✓ HAS_ENTRY_REGISTRY");

  assert(assertEntryValidationContract(), "HAS_ENTRY_VALIDATION");
  console.log("✓ HAS_ENTRY_VALIDATION");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApi(), "NO_API");
  console.log("✓ NO_API");

  assert(auditNoPortal(), "NO_PORTAL");
  console.log("✓ NO_PORTAL");

  assert(auditNoWorkflowRuntime(), "NO_WORKFLOW_RUNTIME");
  console.log("✓ NO_WORKFLOW_RUNTIME");

  assert(auditNoExecution(), "NO_EXECUTION");
  console.log("✓ NO_EXECUTION");

  assert(auditNoQuote(), "NO_QUOTE");
  console.log("✓ NO_QUOTE");

  assert(auditNoProject(), "NO_PROJECT");
  console.log("✓ NO_PROJECT");

  assert(auditNoReport(), "NO_REPORT");
  console.log("✓ NO_REPORT");

  assert(assertEntryConsumesOrchestrationOnly(), "entry orchestration-only consumption");
  assert(assertEntryFoundationOnlyScope(), "entry foundation scope");
  assert(assertMountedBusinessEntryState(), "mounted entry state");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p5" });
  const bridgeView = createWorkspaceBusinessBridge(assemblyContext);
  const context = createWorkspaceBusinessContext(bridgeView);
  const domain = createWorkspaceBusinessDomain(context);
  const orchestration = createWorkspaceBusinessOrchestration(domain);
  const entry = createWorkspaceBusinessEntry(orchestration);

  assert(assertWorkspaceBusinessEntryShape(entry), "entry shape");
  assert(assertBusinessEntryScope(entry.scope), "entry scope");
  assert(assertEntryAggregatesOrchestration(orchestration), "entry aggregates orchestration");
  assert(entry.status === "BLOCKED", "idle entry status");
  assert(entry.entryState === "DISABLED", "idle entry state");

  const registered = registerWorkspaceBusinessEntry(entry);
  const resolved = resolveWorkspaceBusinessEntry(entry.scope.workspaceId);
  assert(registered.workspaceId === entry.scope.workspaceId, "entry registry register");
  assert(resolved?.entryState === "DISABLED", "entry registry resolve");

  assert(WORKSPACE_BUSINESS_RUNTIME_ENTRY_META.tag === WORKSPACE_BUSINESS_RUNTIME_P5_TAG, "entry meta tag");
  assert(WORKSPACE_BUSINESS_RUNTIME_ENTRY_META.phase === "v54-workspace-business-p5", "entry meta phase");
  assert(
    WORKSPACE_BUSINESS_RUNTIME_ENTRY_META.status === "business-entry-foundation",
    "entry meta status",
  );
  assert(
    WORKSPACE_BUSINESS_RUNTIME_LATEST_META.tag === WORKSPACE_BUSINESS_RUNTIME_P4_TAG,
    "historical latest meta preserved",
  );
  console.log("✓ business meta ok");

  console.log(`tag=${WORKSPACE_BUSINESS_RUNTIME_P5_TAG}`);
  console.log("V54 P5 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
