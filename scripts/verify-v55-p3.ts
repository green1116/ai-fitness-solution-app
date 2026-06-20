/**
 * V55 Quote Runtime — P3 Quote Domain Foundation verification
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
  WORKSPACE_QUOTE_RUNTIME_DOMAIN_META,
  WORKSPACE_QUOTE_RUNTIME_P3_FREEZE,
  WORKSPACE_QUOTE_RUNTIME_P3_META,
  WORKSPACE_QUOTE_RUNTIME_P3_TAG,
} from "@/lib/quote-runtime";
import {
  assertDomainConsumesContextSnapshotOnly,
  assertDomainFactoryContract,
  assertDomainGuardsContract,
  assertDomainRegistryContract,
  assertDomainStateContract,
  assertDomainTypesContract,
  assertDomainViewContract,
  assertMountedQuoteDomainReadiness,
  validateQuoteRuntimeP3,
} from "@/lib/quote-runtime/validation/quote-runtime-verify-p3";
import {
  createQuoteContextSnapshot,
  createWorkspaceQuoteRuntimeContext,
} from "@/lib/quote-runtime/context";
import {
  createQuoteDomainFactory,
  createQuoteDomainRegistry,
  createQuoteDomainView,
  validateQuoteDomain,
  validateQuoteDomainView,
} from "@/lib/quote-runtime/domain";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");
const DOMAIN_ROOT = join(QUOTE_ROOT, "domain");

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

function auditP3DomainFiles(): string[] {
  return walkTsFiles(DOMAIN_ROOT, { excludeDirNames: ["freeze"] }).filter((file) => !file.endsWith("index.ts"));
}

function auditNoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditP3DomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditP3DomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApi(): boolean {
  const pattern = /\/api\/|from\s+["']@\/lib\/saas-product-api|from\s+["']@\/app\/api|fetch\s*\(\s*["'`]\/api/;
  return !auditP3DomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoWorkflowRuntime(): boolean {
  const pattern = /WorkflowRuntime|workflow-runtime|executeWorkflow|WorkflowEngine|workflowEngine/;
  return !auditP3DomainFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateQuoteRuntimeP3();
  assert(validation.valid, `P3 quote domain validation: ${validation.summary}`);
  console.log("✓ P3 quote domain validation ok");

  assert(existsSync(join(DOMAIN_ROOT, "quote-domain-types.ts")), "quote domain types module");
  assert(assertDomainTypesContract(), "HAS_DOMAIN_TYPES");
  console.log("✓ HAS_DOMAIN_TYPES");

  assert(existsSync(join(DOMAIN_ROOT, "quote-domain-state.ts")), "quote domain state module");
  assert(assertDomainStateContract(), "HAS_DOMAIN_STATE");
  console.log("✓ HAS_DOMAIN_STATE");

  assert(existsSync(join(DOMAIN_ROOT, "quote-domain-guards.ts")), "quote domain guards module");
  assert(assertDomainGuardsContract(), "HAS_DOMAIN_GUARDS");
  console.log("✓ HAS_DOMAIN_GUARDS");

  assert(existsSync(join(DOMAIN_ROOT, "quote-domain-registry.ts")), "quote domain registry module");
  assert(assertDomainRegistryContract(), "HAS_DOMAIN_REGISTRY");
  console.log("✓ HAS_DOMAIN_REGISTRY");

  assert(existsSync(join(DOMAIN_ROOT, "quote-domain-factory.ts")), "quote domain factory module");
  assert(assertDomainFactoryContract(), "HAS_DOMAIN_FACTORY");
  console.log("✓ HAS_DOMAIN_FACTORY");

  assert(existsSync(join(DOMAIN_ROOT, "quote-domain-view.ts")), "quote domain view module");
  assert(assertDomainViewContract(), "HAS_DOMAIN_VIEW");
  console.log("✓ HAS_DOMAIN_VIEW");

  assert(assertDomainConsumesContextSnapshotOnly(), "CONSUMES_CONTEXT_SNAPSHOT_ONLY");
  console.log("✓ CONSUMES_CONTEXT_SNAPSHOT_ONLY");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApi(), "NO_API");
  console.log("✓ NO_API");

  assert(auditNoWorkflowRuntime(), "NO_WORKFLOW_RUNTIME");
  console.log("✓ NO_WORKFLOW_RUNTIME");

  assert(auditNoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  assert(assertMountedQuoteDomainReadiness(), "mounted quote domain readiness");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p3-quote" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createWorkspaceQuoteRuntimeContext(quoteBridge);
  const snapshot = createQuoteContextSnapshot(quoteContext);
  const factory = createQuoteDomainFactory();
  const view = factory.createView(snapshot);
  const registry = createQuoteDomainRegistry();
  registry.register(view);
  const domainValidation = validateQuoteDomain(snapshot);
  const viewValidation = validateQuoteDomainView(view);

  assert(viewValidation.valid, "quote domain view guard validation");
  assert(domainValidation.valid, "quote domain validation");
  assert(view.quoteReadiness === "BLOCKED", "idle quote readiness");
  assert(view.lifecyclePhase === "INTAKE", "idle lifecycle phase");
  assert(view.domainState === "SUSPENDED", "idle domain state");
  assert(registry.has(view.workspaceId), "registry contains domain view");

  assert(WORKSPACE_QUOTE_RUNTIME_DOMAIN_META.tag === WORKSPACE_QUOTE_RUNTIME_P3_TAG, "quote p3 meta tag");
  assert(WORKSPACE_QUOTE_RUNTIME_P3_META.phase === "v55-workspace-quote-p3", "quote p3 meta phase");
  assert(WORKSPACE_QUOTE_RUNTIME_P3_META.status === "quote-domain-foundation", "quote p3 meta status");
  assert(WORKSPACE_QUOTE_RUNTIME_P3_FREEZE.status === "quote-domain-foundation", "quote p3 freeze status");
  console.log("✓ quote p3 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_RUNTIME_P3_TAG}`);
  console.log("V55 P3 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
