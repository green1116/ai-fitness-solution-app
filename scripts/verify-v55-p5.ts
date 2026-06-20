/**
 * V55 Quote Runtime — P5 Quote Assembly Foundation verification
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
  WORKSPACE_QUOTE_RUNTIME_ASSEMBLY_META,
  WORKSPACE_QUOTE_RUNTIME_P5_FREEZE,
  WORKSPACE_QUOTE_RUNTIME_P5_META,
  WORKSPACE_QUOTE_RUNTIME_P5_TAG,
} from "@/lib/quote-runtime";
import {
  assertAssemblyConsumesLifecycleViewOnly,
  assertAssemblyFactoryContract,
  assertAssemblyGuardsContract,
  assertAssemblySnapshotContract,
  assertAssemblyTypesContract,
  assertAssemblyViewContract,
  assertMountedQuoteRuntimeAssemblyReadiness,
  validateQuoteRuntimeP5,
} from "@/lib/quote-runtime/validation/quote-runtime-verify-p5";
import {
  createQuoteContextSnapshot,
  createWorkspaceQuoteRuntimeContext,
} from "@/lib/quote-runtime/context";
import { createQuoteDomainView } from "@/lib/quote-runtime/domain";
import {
  createQuoteLifecycleFactory,
  createQuoteLifecycleView,
} from "@/lib/quote-runtime/lifecycle";
import {
  createWorkspaceQuoteRuntimeAssembly,
  createWorkspaceQuoteRuntimeAssemblyFactory,
  createWorkspaceQuoteRuntimeSnapshot,
  validateWorkspaceQuoteRuntime,
  validateWorkspaceQuoteRuntimeAssembly,
} from "@/lib/quote-runtime/assembly";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");
const ASSEMBLY_ROOT = join(QUOTE_ROOT, "assembly");

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

function auditP5AssemblyFiles(): string[] {
  return walkTsFiles(ASSEMBLY_ROOT, { excludeDirNames: ["freeze"] }).filter(
    (file) => !file.endsWith("index.ts") && !file.endsWith("create-workspace-quote-runtime.ts"),
  );
}

function auditNoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditP5AssemblyFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditP5AssemblyFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApi(): boolean {
  const pattern = /\/api\/|from\s+["']@\/lib\/saas-product-api|from\s+["']@\/app\/api|fetch\s*\(\s*["'`]\/api/;
  return !auditP5AssemblyFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoWorkflowRuntime(): boolean {
  const pattern = /WorkflowRuntime|workflow-runtime|executeWorkflow|WorkflowEngine|workflowEngine/;
  return !auditP5AssemblyFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateQuoteRuntimeP5();
  assert(validation.valid, `P5 quote assembly validation: ${validation.summary}`);
  console.log("✓ P5 quote assembly validation ok");

  assert(existsSync(join(ASSEMBLY_ROOT, "quote-runtime-assembly-types.ts")), "quote assembly types module");
  assert(assertAssemblyTypesContract(), "HAS_ASSEMBLY_TYPES");
  console.log("✓ HAS_ASSEMBLY_TYPES");

  assert(existsSync(join(ASSEMBLY_ROOT, "quote-runtime-assembly-view.ts")), "quote assembly view module");
  assert(assertAssemblyViewContract(), "HAS_ASSEMBLY_VIEW");
  console.log("✓ HAS_ASSEMBLY_VIEW");

  assert(existsSync(join(ASSEMBLY_ROOT, "quote-runtime-assembly-factory.ts")), "quote assembly factory module");
  assert(assertAssemblyFactoryContract(), "HAS_ASSEMBLY_FACTORY");
  console.log("✓ HAS_ASSEMBLY_FACTORY");

  assert(existsSync(join(ASSEMBLY_ROOT, "quote-runtime-assembly-guards.ts")), "quote assembly guards module");
  assert(assertAssemblyGuardsContract(), "HAS_ASSEMBLY_GUARDS");
  console.log("✓ HAS_ASSEMBLY_GUARDS");

  assert(existsSync(join(ASSEMBLY_ROOT, "quote-runtime-snapshot.ts")), "quote runtime snapshot module");
  assert(assertAssemblySnapshotContract(), "HAS_ASSEMBLY_SNAPSHOT");
  console.log("✓ HAS_ASSEMBLY_SNAPSHOT");

  assert(assertAssemblyConsumesLifecycleViewOnly(), "CONSUMES_LIFECYCLE_VIEW_ONLY");
  console.log("✓ CONSUMES_LIFECYCLE_VIEW_ONLY");

  assert(auditNoWorkflowRuntime(), "NO_WORKFLOW_RUNTIME");
  console.log("✓ NO_WORKFLOW_RUNTIME");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApi(), "NO_API");
  console.log("✓ NO_API");

  assert(auditNoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  assert(assertMountedQuoteRuntimeAssemblyReadiness(), "mounted quote runtime assembly readiness");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p5-quote" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createWorkspaceQuoteRuntimeContext(quoteBridge);
  const contextSnapshot = createQuoteContextSnapshot(quoteContext);
  const domainView = createQuoteDomainView(contextSnapshot);
  const lifecycleFactory = createQuoteLifecycleFactory();
  const lifecycleView = lifecycleFactory.createView(domainView);
  const assemblyFactory = createWorkspaceQuoteRuntimeAssemblyFactory();
  const runtimeAssembly = assemblyFactory.createAssembly(lifecycleView);
  const runtimeSnapshot = createWorkspaceQuoteRuntimeSnapshot(runtimeAssembly);
  const runtimeValidation = validateWorkspaceQuoteRuntime(lifecycleView);
  const assemblyGuard = validateWorkspaceQuoteRuntimeAssembly(runtimeAssembly);

  assert(assemblyGuard.valid, "workspace quote runtime assembly guard validation");
  assert(runtimeValidation.valid, "workspace quote runtime validation");
  assert(runtimeAssembly.lifecycleStatus === "PENDING", "idle lifecycle status");
  assert(runtimeAssembly.runtimeState === "SHELL", "idle runtime state");
  assert(runtimeSnapshot.runtimeState === runtimeAssembly.runtimeState, "snapshot runtime parity");

  assert(WORKSPACE_QUOTE_RUNTIME_ASSEMBLY_META.tag === WORKSPACE_QUOTE_RUNTIME_P5_TAG, "quote p5 meta tag");
  assert(WORKSPACE_QUOTE_RUNTIME_P5_META.phase === "v55-workspace-quote-p5", "quote p5 meta phase");
  assert(WORKSPACE_QUOTE_RUNTIME_P5_META.status === "quote-assembly-foundation", "quote p5 meta status");
  assert(WORKSPACE_QUOTE_RUNTIME_P5_FREEZE.status === "quote-assembly-foundation", "quote p5 freeze status");
  console.log("✓ quote p5 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_RUNTIME_P5_TAG}`);
  console.log("V55 P5 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
