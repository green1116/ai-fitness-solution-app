/**
 * V55 Quote Runtime — P2 Quote Context Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { createWorkspaceRuntimeAssemblyContext } from "@/lib/workspace-runtime";
import {
  createWorkspaceBusinessBridge,
  createWorkspaceBusinessContext,
  createWorkspaceBusinessDomain,
  createWorkspaceBusinessEntry,
  createWorkspaceBusinessOrchestration,
} from "@/lib/workspace-business-runtime";
import {
  createQuoteBridgeFromBusinessViews,
  createWorkspaceQuoteRuntime,
  WORKSPACE_QUOTE_RUNTIME_CONTEXT_META,
  WORKSPACE_QUOTE_RUNTIME_P2_META,
  WORKSPACE_QUOTE_RUNTIME_P2_TAG,
} from "@/lib/quote-runtime";
import {
  assertContextConsumesBridgeOnly,
  assertContextFactoryContract,
  assertContextGuardsContract,
  assertContextSnapshotContract,
  assertMountedQuoteContextReadiness,
  validateQuoteRuntimeP2,
} from "@/lib/quote-runtime/validation/quote-runtime-verify-p2";
import {
  createQuoteContextSnapshot,
  createWorkspaceQuoteRuntimeContext,
  validateQuoteRuntimeContext,
} from "@/lib/quote-runtime/context";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");
const CONTEXT_ROOT = join(QUOTE_ROOT, "context");

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

function auditP2ContextFiles(): string[] {
  return walkTsFiles(CONTEXT_ROOT).filter(
    (file) =>
      !file.endsWith("index.ts") &&
      !file.endsWith("quote-runtime-context.ts") &&
      !file.endsWith("quote-readiness.ts"),
  );
}

function auditNoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditP2ContextFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditP2ContextFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApi(): boolean {
  const pattern = /\/api\/|from\s+["']@\/lib\/saas-product-api|from\s+["']@\/app\/api|fetch\s*\(\s*["'`]\/api/;
  return !auditP2ContextFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoWorkflowRuntime(): boolean {
  const pattern = /WorkflowRuntime|workflow-runtime|executeWorkflow|WorkflowEngine|workflowEngine/;
  return !auditP2ContextFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateQuoteRuntimeP2();
  assert(validation.valid, `P2 quote context validation: ${validation.summary}`);
  console.log("✓ P2 quote context validation ok");

  assert(existsSync(join(CONTEXT_ROOT, "quote-context-factory.ts")), "quote context factory module");
  assert(assertContextFactoryContract(), "HAS_CONTEXT_FACTORY");
  console.log("✓ HAS_CONTEXT_FACTORY");

  assert(existsSync(join(CONTEXT_ROOT, "quote-context-guards.ts")), "quote context guards module");
  assert(assertContextGuardsContract(), "HAS_CONTEXT_GUARDS");
  console.log("✓ HAS_CONTEXT_GUARDS");

  assert(existsSync(join(CONTEXT_ROOT, "quote-context-snapshot.ts")), "quote context snapshot module");
  assert(assertContextSnapshotContract(), "HAS_CONTEXT_SNAPSHOT");
  console.log("✓ HAS_CONTEXT_SNAPSHOT");

  assert(assertContextConsumesBridgeOnly(), "CONSUMES_BRIDGE_ONLY");
  console.log("✓ CONSUMES_BRIDGE_ONLY");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApi(), "NO_API");
  console.log("✓ NO_API");

  assert(auditNoWorkflowRuntime(), "NO_WORKFLOW_RUNTIME");
  console.log("✓ NO_WORKFLOW_RUNTIME");

  assert(auditNoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  assert(assertMountedQuoteContextReadiness(), "mounted quote context readiness");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p2-quote" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createWorkspaceQuoteRuntimeContext(quoteBridge);
  const snapshot = createQuoteContextSnapshot(quoteContext);
  const quoteRuntime = createWorkspaceQuoteRuntime({ entry: businessEntry, bridgeView: businessBridge });
  const contextValidation = validateQuoteRuntimeContext(quoteContext);

  assert(contextValidation.valid, "quote context guard validation");
  assert(quoteContext.quoteReadiness === "BLOCKED", "idle quote readiness");
  assert(quoteContext.lifecyclePhase === "INTAKE", "idle lifecycle phase");
  assert(quoteContext.domainState === "SUSPENDED", "idle domain state");
  assert(snapshot.quoteReadiness === quoteContext.quoteReadiness, "snapshot readiness parity");
  assert(quoteRuntime.context.lifecyclePhase === quoteContext.lifecyclePhase, "runtime context lifecycle parity");
  assert(quoteRuntime.context.domainState === quoteContext.domainState, "runtime context domain parity");

  assert(WORKSPACE_QUOTE_RUNTIME_CONTEXT_META.tag === WORKSPACE_QUOTE_RUNTIME_P2_TAG, "quote p2 meta tag");
  assert(WORKSPACE_QUOTE_RUNTIME_P2_META.phase === "v55-workspace-quote-p2", "quote p2 meta phase");
  assert(WORKSPACE_QUOTE_RUNTIME_P2_META.status === "quote-context-foundation", "quote p2 meta status");
  console.log("✓ quote p2 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_RUNTIME_P2_TAG}`);
  console.log("V55 P2 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
