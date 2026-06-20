/**
 * V55 Quote Runtime — P4 Quote Lifecycle Foundation verification
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
  WORKSPACE_QUOTE_RUNTIME_LIFECYCLE_META,
  WORKSPACE_QUOTE_RUNTIME_P4_FREEZE,
  WORKSPACE_QUOTE_RUNTIME_P4_META,
  WORKSPACE_QUOTE_RUNTIME_P4_TAG,
} from "@/lib/quote-runtime";
import {
  assertLifecycleConsumesDomainViewOnly,
  assertLifecycleFactoryContract,
  assertLifecycleGuardsContract,
  assertLifecycleRegistryContract,
  assertLifecycleStateContract,
  assertLifecycleTypesContract,
  assertLifecycleViewContract,
  assertMountedQuoteLifecycleReadiness,
  validateQuoteRuntimeP4,
} from "@/lib/quote-runtime/validation/quote-runtime-verify-p4";
import {
  createQuoteContextSnapshot,
  createWorkspaceQuoteRuntimeContext,
} from "@/lib/quote-runtime/context";
import { createQuoteDomainView } from "@/lib/quote-runtime/domain";
import {
  createQuoteLifecycleFactory,
  createQuoteLifecycleRegistry,
  validateQuoteLifecycle,
  validateQuoteLifecycleView,
} from "@/lib/quote-runtime/lifecycle";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");
const LIFECYCLE_ROOT = join(QUOTE_ROOT, "lifecycle");

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

function auditP4LifecycleFiles(): string[] {
  return walkTsFiles(LIFECYCLE_ROOT, { excludeDirNames: ["freeze"] }).filter(
    (file) =>
      !file.endsWith("index.ts") &&
      !file.endsWith("quote-lifecycle.ts") &&
      !file.endsWith("resolve-quote-lifecycle-phase.ts"),
  );
}

function auditNoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditP4LifecycleFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditP4LifecycleFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApi(): boolean {
  const pattern = /\/api\/|from\s+["']@\/lib\/saas-product-api|from\s+["']@\/app\/api|fetch\s*\(\s*["'`]\/api/;
  return !auditP4LifecycleFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoWorkflowRuntime(): boolean {
  const pattern = /WorkflowRuntime|workflow-runtime|executeWorkflow|WorkflowEngine|workflowEngine/;
  return !auditP4LifecycleFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateQuoteRuntimeP4();
  assert(validation.valid, `P4 quote lifecycle validation: ${validation.summary}`);
  console.log("✓ P4 quote lifecycle validation ok");

  assert(existsSync(join(LIFECYCLE_ROOT, "quote-lifecycle-types.ts")), "quote lifecycle types module");
  assert(assertLifecycleTypesContract(), "HAS_LIFECYCLE_TYPES");
  console.log("✓ HAS_LIFECYCLE_TYPES");

  assert(existsSync(join(LIFECYCLE_ROOT, "quote-lifecycle-state.ts")), "quote lifecycle state module");
  assert(assertLifecycleStateContract(), "HAS_LIFECYCLE_STATE");
  console.log("✓ HAS_LIFECYCLE_STATE");

  assert(existsSync(join(LIFECYCLE_ROOT, "quote-lifecycle-guards.ts")), "quote lifecycle guards module");
  assert(assertLifecycleGuardsContract(), "HAS_LIFECYCLE_GUARDS");
  console.log("✓ HAS_LIFECYCLE_GUARDS");

  assert(existsSync(join(LIFECYCLE_ROOT, "quote-lifecycle-registry.ts")), "quote lifecycle registry module");
  assert(assertLifecycleRegistryContract(), "HAS_LIFECYCLE_REGISTRY");
  console.log("✓ HAS_LIFECYCLE_REGISTRY");

  assert(existsSync(join(LIFECYCLE_ROOT, "quote-lifecycle-factory.ts")), "quote lifecycle factory module");
  assert(assertLifecycleFactoryContract(), "HAS_LIFECYCLE_FACTORY");
  console.log("✓ HAS_LIFECYCLE_FACTORY");

  assert(existsSync(join(LIFECYCLE_ROOT, "quote-lifecycle-view.ts")), "quote lifecycle view module");
  assert(assertLifecycleViewContract(), "HAS_LIFECYCLE_VIEW");
  console.log("✓ HAS_LIFECYCLE_VIEW");

  assert(assertLifecycleConsumesDomainViewOnly(), "CONSUMES_DOMAIN_VIEW_ONLY");
  console.log("✓ CONSUMES_DOMAIN_VIEW_ONLY");

  assert(auditNoWorkflowRuntime(), "NO_WORKFLOW_RUNTIME");
  console.log("✓ NO_WORKFLOW_RUNTIME");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApi(), "NO_API");
  console.log("✓ NO_API");

  assert(auditNoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  assert(assertMountedQuoteLifecycleReadiness(), "mounted quote lifecycle readiness");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p4-quote" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createWorkspaceQuoteRuntimeContext(quoteBridge);
  const snapshot = createQuoteContextSnapshot(quoteContext);
  const domainView = createQuoteDomainView(snapshot);
  const factory = createQuoteLifecycleFactory();
  const lifecycleView = factory.createView(domainView);
  const registry = createQuoteLifecycleRegistry();
  registry.register(lifecycleView);
  const lifecycleValidation = validateQuoteLifecycle(domainView);
  const viewValidation = validateQuoteLifecycleView(lifecycleView);

  assert(viewValidation.valid, "quote lifecycle view guard validation");
  assert(lifecycleValidation.valid, "quote lifecycle validation");
  assert(lifecycleView.lifecyclePhase === "INTAKE", "idle lifecycle phase");
  assert(lifecycleView.lifecycleStatus === "PENDING", "idle lifecycle status");
  assert(registry.has(lifecycleView.workspaceId), "registry contains lifecycle view");

  assert(WORKSPACE_QUOTE_RUNTIME_LIFECYCLE_META.tag === WORKSPACE_QUOTE_RUNTIME_P4_TAG, "quote p4 meta tag");
  assert(WORKSPACE_QUOTE_RUNTIME_P4_META.phase === "v55-workspace-quote-p4", "quote p4 meta phase");
  assert(WORKSPACE_QUOTE_RUNTIME_P4_META.status === "quote-lifecycle-foundation", "quote p4 meta status");
  assert(WORKSPACE_QUOTE_RUNTIME_P4_FREEZE.status === "quote-lifecycle-foundation", "quote p4 freeze status");
  console.log("✓ quote p4 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_RUNTIME_P4_TAG}`);
  console.log("V55 P4 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
