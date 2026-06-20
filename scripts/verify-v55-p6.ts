/**
 * V55 Quote Runtime — P6 Quote Port Foundation verification
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
  WORKSPACE_QUOTE_RUNTIME_P6_FREEZE,
  WORKSPACE_QUOTE_RUNTIME_P6_META,
  WORKSPACE_QUOTE_RUNTIME_P6_TAG,
  WORKSPACE_QUOTE_RUNTIME_PORTS_META,
} from "@/lib/quote-runtime";
import {
  assertApiPortContract,
  assertCommercialPortContract,
  assertPersistencePortContract,
  assertPortConsumesAssemblySnapshotOnly,
  assertPortDefinitionInterfaceOnly,
  assertPortNoImplementationLogic,
  assertPortRegistryContract,
  assertPortTypesContract,
  validateQuoteRuntimeP6,
} from "@/lib/quote-runtime/validation/quote-runtime-verify-p6";
import {
  createQuoteContextSnapshot,
  createWorkspaceQuoteRuntimeContext,
} from "@/lib/quote-runtime/context";
import { createQuoteDomainView } from "@/lib/quote-runtime/domain";
import { createQuoteLifecycleView } from "@/lib/quote-runtime/lifecycle";
import {
  createWorkspaceQuoteRuntimeAssembly,
  createWorkspaceQuoteRuntimeSnapshot,
} from "@/lib/quote-runtime/assembly";
import { createQuotePortRegistry, validateQuotePortFoundation, validateQuotePorts } from "@/lib/quote-runtime/ports";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");
const PORTS_ROOT = join(QUOTE_ROOT, "ports");

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

function auditP6PortDefinitionFiles(): string[] {
  return [
    join(PORTS_ROOT, "quote-persistence.port.ts"),
    join(PORTS_ROOT, "quote-api-exposure.port.ts"),
    join(PORTS_ROOT, "quote-commercial.port.ts"),
  ];
}

function auditP6PortFiles(): string[] {
  return walkTsFiles(PORTS_ROOT, { excludeDirNames: ["freeze"] }).filter((file) => !file.endsWith("index.ts"));
}

function auditNoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditP6PortFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistenceAccess(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditP6PortFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApiHandler(): boolean {
  const pattern = /\/api\/handlers\/|from\s+["']@\/app\/api|from\s+["']@\/lib\/saas-product-api/;
  return !auditP6PortFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoWorkflowRuntime(): boolean {
  const pattern = /WorkflowRuntime|workflow-runtime|executeWorkflow|WorkflowEngine|workflowEngine/;
  return !auditP6PortFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateQuoteRuntimeP6();
  assert(validation.valid, `P6 quote port validation: ${validation.summary}`);
  console.log("✓ P6 quote port validation ok");

  assert(existsSync(join(PORTS_ROOT, "quote-persistence.port.ts")), "quote persistence port module");
  assert(assertPersistencePortContract(), "HAS_PERSISTENCE_PORT");
  console.log("✓ HAS_PERSISTENCE_PORT");

  assert(existsSync(join(PORTS_ROOT, "quote-api-exposure.port.ts")), "quote api port module");
  assert(assertApiPortContract(), "HAS_API_PORT");
  console.log("✓ HAS_API_PORT");

  assert(existsSync(join(PORTS_ROOT, "quote-commercial.port.ts")), "quote commercial port module");
  assert(assertCommercialPortContract(), "HAS_COMMERCIAL_PORT");
  console.log("✓ HAS_COMMERCIAL_PORT");

  assert(existsSync(join(PORTS_ROOT, "quote-port-registry.ts")), "quote port registry module");
  assert(assertPortRegistryContract(), "HAS_PORT_REGISTRY");
  console.log("✓ HAS_PORT_REGISTRY");

  assert(existsSync(join(PORTS_ROOT, "quote-port-guards.ts")), "quote port guards module");
  assert(validateQuotePorts().valid, "HAS_PORT_GUARDS");
  console.log("✓ HAS_PORT_GUARDS");

  assert(existsSync(join(PORTS_ROOT, "quote-port-types.ts")), "quote port types module");
  assert(assertPortTypesContract(), "HAS_PORT_TYPES");
  console.log("✓ HAS_PORT_TYPES");

  assert(assertPortConsumesAssemblySnapshotOnly(), "CONSUMES_ASSEMBLY_SNAPSHOT_ONLY");
  console.log("✓ CONSUMES_ASSEMBLY_SNAPSHOT_ONLY");

  assert(assertPortDefinitionInterfaceOnly(), "NO_IMPLEMENTATION_LOGIC");
  assert(assertPortNoImplementationLogic(), "NO_IMPLEMENTATION_LOGIC audit");
  console.log("✓ NO_IMPLEMENTATION_LOGIC");

  assert(auditNoWorkflowRuntime(), "NO_WORKFLOW_RUNTIME");
  console.log("✓ NO_WORKFLOW_RUNTIME");

  assert(auditNoPersistenceAccess(), "NO_PERSISTENCE_ACCESS");
  console.log("✓ NO_PERSISTENCE_ACCESS");

  assert(auditNoApiHandler(), "NO_API_HANDLER");
  console.log("✓ NO_API_HANDLER");

  assert(auditNoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p6-quote" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createWorkspaceQuoteRuntimeContext(quoteBridge);
  const contextSnapshot = createQuoteContextSnapshot(quoteContext);
  const domainView = createQuoteDomainView(contextSnapshot);
  const lifecycleView = createQuoteLifecycleView(domainView);
  const runtimeAssembly = createWorkspaceQuoteRuntimeAssembly(lifecycleView);
  const runtimeSnapshot = createWorkspaceQuoteRuntimeSnapshot(runtimeAssembly);
  const foundationValidation = validateQuotePortFoundation(runtimeSnapshot);

  const portRegistry = createQuotePortRegistry({
    persistence: {
      loadQuoteSnapshot: () => runtimeSnapshot,
      exists: () => true,
    },
    api: {
      getQuoteSurface: () => null,
      getQuoteReadiness: () => runtimeSnapshot.quoteReadiness,
    },
    commercial: {
      getQuoteEligibility: () => "INELIGIBLE",
      getQuoteSurfaceFlags: () => ({
        eligible: false,
        visible: false,
        active: false,
      }),
    },
  });

  assert(foundationValidation.valid, "quote port foundation validation");
  assert(portRegistry.persistence !== undefined, "port registry persistence slot");
  assert(portRegistry.api !== undefined, "port registry api slot");
  assert(portRegistry.commercial !== undefined, "port registry commercial slot");
  assert(
    auditP6PortDefinitionFiles().every((file) => !readFileSync(file, "utf8").includes("export function")),
    "port definition files remain interface-only",
  );

  assert(WORKSPACE_QUOTE_RUNTIME_PORTS_META.tag === WORKSPACE_QUOTE_RUNTIME_P6_TAG, "quote p6 meta tag");
  assert(WORKSPACE_QUOTE_RUNTIME_P6_META.phase === "v55-workspace-quote-p6", "quote p6 meta phase");
  assert(WORKSPACE_QUOTE_RUNTIME_P6_META.status === "quote-port-foundation", "quote p6 meta status");
  assert(WORKSPACE_QUOTE_RUNTIME_P6_FREEZE.status === "quote-port-foundation", "quote p6 freeze status");
  console.log("✓ quote p6 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_RUNTIME_P6_TAG}`);
  console.log("V55 P6 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
