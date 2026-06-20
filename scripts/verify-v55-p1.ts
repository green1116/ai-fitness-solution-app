/**
 * V55 Quote Runtime — P1 Quote Bridge Foundation verification
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
  assertQuoteBridgeViewShape,
  createQuoteBridgeFromBusinessViews,
  createWorkspaceQuoteRuntime,
} from "@/lib/quote-runtime";
import {
  WORKSPACE_QUOTE_RUNTIME_P1_FREEZE,
  WORKSPACE_QUOTE_RUNTIME_P1_META,
  WORKSPACE_QUOTE_RUNTIME_P1_TAG,
  WORKSPACE_QUOTE_RUNTIME_META,
} from "@/lib/quote-runtime";
import {
  assertMountedQuoteBridgeReadiness,
  assertQuoteBridgeConsumesBusinessOnly,
  assertQuoteBridgeContract,
  assertQuoteContextContract,
  assertQuoteRuntimeFoundationOnlyScope,
  validateQuoteRuntimeP1,
} from "@/lib/quote-runtime/validation/quote-runtime-verify";
import {
  assertQuoteRuntimeContextShape,
  createQuoteRuntimeContext,
} from "@/lib/quote-runtime/context/quote-runtime-context";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");

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

const P1_AUDIT_OPTIONS = { excludeDirNames: ["validation", "freeze"] as string[] };

function auditQuoteCoreFiles(): string[] {
  return walkTsFiles(QUOTE_ROOT, P1_AUDIT_OPTIONS).filter(
    (file) => !file.endsWith("quote-runtime-verify.ts"),
  );
}

function auditNoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditQuoteCoreFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditQuoteCoreFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApi(): boolean {
  const pattern = /\/api\/|from\s+["']@\/lib\/saas-product-api|from\s+["']@\/app\/api|fetch\s*\(\s*["'`]\/api/;
  return !auditQuoteCoreFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoWorkflowRuntime(): boolean {
  const pattern = /WorkflowRuntime|workflow-runtime|executeWorkflow|WorkflowEngine|workflowEngine/;
  return !auditQuoteCoreFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateQuoteRuntimeP1();
  assert(validation.valid, `P1 quote runtime validation: ${validation.summary}`);
  console.log("✓ P1 quote runtime validation ok");

  assert(existsSync(join(QUOTE_ROOT, "bridge", "create-quote-bridge.ts")), "quote bridge module");
  assert(assertQuoteBridgeContract(), "HAS_QUOTE_BRIDGE");
  console.log("✓ HAS_QUOTE_BRIDGE");

  assert(assertQuoteContextContract(), "HAS_QUOTE_CONTEXT");
  console.log("✓ HAS_QUOTE_CONTEXT");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApi(), "NO_API");
  console.log("✓ NO_API");

  assert(auditNoWorkflowRuntime(), "NO_WORKFLOW_RUNTIME");
  console.log("✓ NO_WORKFLOW_RUNTIME");

  assert(auditNoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  assert(assertQuoteBridgeConsumesBusinessOnly(), "quote bridge business-only consumption");
  assert(assertQuoteRuntimeFoundationOnlyScope(), "quote runtime foundation scope");
  assert(assertMountedQuoteBridgeReadiness(), "mounted quote bridge readiness");

  const assemblyContext = createWorkspaceRuntimeAssemblyContext({ workspaceId: "verify-p1-quote" });
  const businessBridge = createWorkspaceBusinessBridge(assemblyContext);
  const businessContext = createWorkspaceBusinessContext(businessBridge);
  const businessDomain = createWorkspaceBusinessDomain(businessContext);
  const businessOrchestration = createWorkspaceBusinessOrchestration(businessDomain);
  const businessEntry = createWorkspaceBusinessEntry(businessOrchestration);
  const quoteBridge = createQuoteBridgeFromBusinessViews(businessEntry, businessBridge);
  const quoteContext = createQuoteRuntimeContext(quoteBridge);
  const quoteRuntime = createWorkspaceQuoteRuntime({ entry: businessEntry, bridgeView: businessBridge });

  assert(assertQuoteBridgeViewShape(quoteBridge), "quote bridge shape");
  assert(assertQuoteRuntimeContextShape(quoteContext), "quote context shape");
  assert(quoteBridge.quoteReadiness === "BLOCKED", "idle quote readiness");
  assert(quoteContext.entryState === "DISABLED", "idle entry state");
  assert(quoteRuntime.lifecyclePhase === "INTAKE", "idle lifecycle phase");

  assert(WORKSPACE_QUOTE_RUNTIME_META.tag === WORKSPACE_QUOTE_RUNTIME_P1_TAG, "quote meta tag");
  assert(WORKSPACE_QUOTE_RUNTIME_META.phase === "v55-workspace-quote-p1", "quote meta phase");
  assert(WORKSPACE_QUOTE_RUNTIME_P1_FREEZE.status === "quote-bridge-foundation", "quote p1 freeze status");
  assert(WORKSPACE_QUOTE_RUNTIME_P1_META.status === "quote-bridge-foundation", "quote p1 meta status");
  console.log("✓ quote meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_RUNTIME_P1_TAG}`);
  console.log("V55 P1 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
