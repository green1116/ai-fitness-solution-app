/**
 * V54 Workspace Business Runtime — P4 Business Orchestration Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import { createWorkspaceBusinessBridge } from "../lib/workspace-business-runtime/bridge/workspace-runtime-bridge";
import { createWorkspaceBusinessContext } from "../lib/workspace-business-runtime/context/workspace-business-context-factory";
import { createWorkspaceBusinessDomain } from "../lib/workspace-business-runtime/domain/workspace-business-domain-factory";
import { createWorkspaceBusinessOrchestration } from "../lib/workspace-business-runtime/orchestration/workspace-business-orchestration-factory";
import {
  WORKSPACE_BUSINESS_RUNTIME_P4_META,
  WORKSPACE_BUSINESS_RUNTIME_P4_TAG,
} from "../lib/workspace-business-runtime/orchestration/workspace-business-orchestration-meta";
import {
  assertBusinessOrchestrationScope,
  assertWorkspaceBusinessOrchestrationShape,
} from "../lib/workspace-business-runtime/orchestration/workspace-business-orchestration";
import {
  assertMountedBusinessOrchestrationState,
  assertOrchestrationAggregatesDomain,
  assertOrchestrationConsumesDomainOnly,
  assertOrchestrationContract,
  assertOrchestrationFactoryContract,
  assertOrchestrationFoundationOnlyScope,
  assertOrchestrationRulesContract,
  assertOrchestrationStateContract,
  assertOrchestrationValidationContract,
  validateWorkspaceBusinessOrchestration,
} from "../lib/workspace-business-runtime/orchestration/workspace-business-orchestration-validation";
import { WORKSPACE_BUSINESS_RUNTIME_P4_FREEZE } from "../lib/workspace-business-runtime/freeze/v54-p4-meta";
import { WORKSPACE_BUSINESS_RUNTIME_LATEST_META } from "../lib/workspace-business-runtime/index-meta";

const BUSINESS_ROOT = join(process.cwd(), "lib", "workspace-business-runtime");
const ORCHESTRATION_ROOT = join(BUSINESS_ROOT, "orchestration");

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

const P4_AUDIT_OPTIONS = { excludeDirNames: ["validation", "freeze"] as string[] };

function auditOrchestrationFiles(): string[] {
  return walkTsFiles(ORCHESTRATION_ROOT, P4_AUDIT_OPTIONS).filter(
    (file) =>
      !file.endsWith("workspace-business-orchestration-validation.ts") &&
      !file.endsWith("workspace-business-orchestration-meta.ts"),
  );
}

function auditNoPrisma(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditOrchestrationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditOrchestrationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApi(): boolean {
  const pattern = /\/api\/|from\s+["']@\/lib\/saas-product-api|from\s+["']@\/app\/api|fetch\s*\(\s*["'`]\/api/;
  return !auditOrchestrationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPortal(): boolean {
  const pattern = /saas-product-portal|from\s+["']@\/lib\/saas-product-portal|from\s+["']@\/app\/saas-product/;
  return !auditOrchestrationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoWorkflowRuntime(): boolean {
  const pattern = /WorkflowRuntime|workflow-runtime|executeWorkflow|WorkflowEngine|workflowEngine/;
  return !auditOrchestrationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoQuote(): boolean {
  const pattern = /QuoteRuntime|createQuote|calculateQuote|quote-runtime|handleCreateQuote|QuoteEngine/;
  return !auditOrchestrationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoProject(): boolean {
  const pattern = /ProjectRuntime|createProject|project-runtime|handleCreateProject/;
  return !auditOrchestrationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoReport(): boolean {
  const pattern = /ReportRuntime|createReport|report-runtime|handleCreateReport/;
  return !auditOrchestrationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoEntry(): boolean {
  const pattern = /business-entry\/|createBusinessEntry|resolveBusinessEntryRoute|BusinessEntryRuntime/;
  return !auditOrchestrationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoExecution(): boolean {
  const pattern = /execute\s*\(|run\s*\(|dispatch\s*\(|transition\s*\(/;
  return !auditOrchestrationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateWorkspaceBusinessOrchestration();
  assert(validation.valid, `P4 business orchestration validation: ${validation.summary}`);
  console.log("✓ P4 business orchestration validation ok");

  assert(existsSync(join(ORCHESTRATION_ROOT, "workspace-business-orchestration.ts")), "orchestration module");
  assert(assertOrchestrationContract(), "HAS_ORCHESTRATION");
  console.log("✓ HAS_ORCHESTRATION");

  assert(assertOrchestrationStateContract(), "HAS_ORCHESTRATION_STATE");
  console.log("✓ HAS_ORCHESTRATION_STATE");

  assert(assertOrchestrationFactoryContract(), "HAS_ORCHESTRATION_FACTORY");
  console.log("✓ HAS_ORCHESTRATION_FACTORY");

  assert(assertOrchestrationRulesContract(), "HAS_ORCHESTRATION_RULES");
  console.log("✓ HAS_ORCHESTRATION_RULES");

  assert(assertOrchestrationValidationContract(), "HAS_ORCHESTRATION_VALIDATION");
  console.log("✓ HAS_ORCHESTRATION_VALIDATION");

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

  assert(auditNoQuote(), "NO_QUOTE");
  console.log("✓ NO_QUOTE");

  assert(auditNoProject(), "NO_PROJECT");
  console.log("✓ NO_PROJECT");

  assert(auditNoReport(), "NO_REPORT");
  console.log("✓ NO_REPORT");

  assert(auditNoEntry(), "NO_ENTRY");
  console.log("✓ NO_ENTRY");

  assert(auditNoExecution(), "NO_EXECUTION");
  console.log("✓ NO_EXECUTION");

  assert(assertOrchestrationConsumesDomainOnly(), "orchestration domain-only consumption");
  assert(assertOrchestrationFoundationOnlyScope(), "orchestration foundation scope");
  assert(assertMountedBusinessOrchestrationState(), "mounted orchestration state");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p4" });
  const bridgeView = createWorkspaceBusinessBridge(assemblyContext);
  const context = createWorkspaceBusinessContext(bridgeView);
  const domain = createWorkspaceBusinessDomain(context);
  const orchestration = createWorkspaceBusinessOrchestration(domain);

  assert(assertWorkspaceBusinessOrchestrationShape(orchestration), "orchestration shape");
  assert(assertBusinessOrchestrationScope(orchestration.scope), "orchestration scope");
  assert(assertOrchestrationAggregatesDomain(domain), "orchestration aggregates domain");
  assert(orchestration.status === "BLOCKED", "idle orchestration status");
  assert(orchestration.domainState === "INITIALIZING", "idle domain state");
  assert(orchestration.orchestrationState === "IDLE", "idle orchestration state");

  assert(WORKSPACE_BUSINESS_RUNTIME_LATEST_META.tag === WORKSPACE_BUSINESS_RUNTIME_P4_TAG, "latest meta tag");
  assert(
    WORKSPACE_BUSINESS_RUNTIME_LATEST_META.phase === "v54-workspace-business-p4",
    "latest meta phase",
  );
  assert(
    WORKSPACE_BUSINESS_RUNTIME_P4_FREEZE.status === "business-orchestration-foundation",
    "business p4 freeze status",
  );
  assert(
    WORKSPACE_BUSINESS_RUNTIME_P4_META.status === "business-orchestration-foundation",
    "business p4 meta status",
  );
  console.log("✓ business meta ok");

  console.log(`tag=${WORKSPACE_BUSINESS_RUNTIME_P4_TAG}`);
  console.log("V54 P4 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
