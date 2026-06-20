/**
 * V55 Quote Runtime — P7 Quote Verification Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  V55_FOUNDATION_INTEGRITY_LOCKED,
  WORKSPACE_QUOTE_RUNTIME_P7_FREEZE,
  WORKSPACE_QUOTE_RUNTIME_P7_META,
  WORKSPACE_QUOTE_RUNTIME_P7_TAG,
  WORKSPACE_QUOTE_RUNTIME_VERIFICATION_META,
} from "@/lib/quote-runtime";
import {
  assertHasAssemblyLayer,
  assertHasBridgeLayer,
  assertHasContextLayer,
  assertHasDomainLayer,
  assertHasLifecycleLayer,
  assertHasPortLayer,
  assertQuoteRuntimeDependencyChain,
  assertV55FoundationIntegrityLocked,
  validateQuoteRuntimeP7,
} from "@/lib/quote-runtime/validation/quote-runtime-verify-p7";
import { assertBridgeOnlyToContext } from "@/lib/quote-runtime/validation/quote-runtime-dependency-check";
import { buildV55FoundationIntegritySnapshot } from "@/lib/quote-runtime/validation/quote-runtime-integrity";

const VALIDATION_ROOT = join(process.cwd(), "lib", "quote-runtime", "validation");

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

function auditP7VerificationFiles(): string[] {
  return walkTsFiles(VALIDATION_ROOT, { excludeDirNames: ["freeze"] }).filter(
    (file) =>
      !file.endsWith("quote-runtime-verify.ts") &&
      !file.endsWith("quote-runtime-verify-p1.ts") &&
      !file.endsWith("quote-runtime-verify-p2.ts") &&
      !file.endsWith("quote-runtime-verify-p3.ts") &&
      !file.endsWith("quote-runtime-verify-p4.ts") &&
      !file.endsWith("quote-runtime-verify-p5.ts") &&
      !file.endsWith("quote-runtime-verify-p6.ts") &&
      !file.endsWith("quote-runtime-verify-p8.ts") &&
      !file.endsWith("quote-runtime-verify-final.ts") &&
      !file.endsWith("index.ts"),
  );
}

function auditNoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditP7VerificationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditP7VerificationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApiHandler(): boolean {
  const pattern = /\/api\/handlers\/|from\s+["']@\/app\/api|from\s+["']@\/lib\/saas-product-api/;
  return !auditP7VerificationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoWorkflowRuntime(): boolean {
  const pattern = /WorkflowRuntime|workflow-runtime|executeWorkflow|WorkflowEngine|workflowEngine/;
  return !auditP7VerificationFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateQuoteRuntimeP7();
  assert(validation.valid, `P7 quote verification validation: ${validation.summary}`);
  console.log("✓ P7 quote verification validation ok");

  assert(assertHasBridgeLayer(), "HAS_BRIDGE_LAYER");
  console.log("✓ HAS_BRIDGE_LAYER");

  assert(assertHasContextLayer(), "HAS_CONTEXT_LAYER");
  console.log("✓ HAS_CONTEXT_LAYER");

  assert(assertHasDomainLayer(), "HAS_DOMAIN_LAYER");
  console.log("✓ HAS_DOMAIN_LAYER");

  assert(assertHasLifecycleLayer(), "HAS_LIFECYCLE_LAYER");
  console.log("✓ HAS_LIFECYCLE_LAYER");

  assert(assertHasAssemblyLayer(), "HAS_ASSEMBLY_LAYER");
  console.log("✓ HAS_ASSEMBLY_LAYER");

  assert(assertHasPortLayer(), "HAS_PORT_LAYER");
  console.log("✓ HAS_PORT_LAYER");

  assert(assertV55FoundationIntegrityLocked(), "V55_FOUNDATION_INTEGRITY_LOCKED");
  console.log("✓ V55_FOUNDATION_INTEGRITY_LOCKED");

  assert(assertBridgeOnlyToContext(), "BRIDGE_ONLY_TO_CONTEXT");
  assert(assertQuoteRuntimeDependencyChain(), "quote runtime dependency chain");
  console.log("✓ dependency chain ok");

  assert(auditNoWorkflowRuntime(), "NO_WORKFLOW_RUNTIME");
  console.log("✓ NO_WORKFLOW_RUNTIME");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApiHandler(), "NO_API_HANDLER");
  console.log("✓ NO_API_HANDLER");

  assert(auditNoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  const integritySnapshot = buildV55FoundationIntegritySnapshot("verify-p7-quote");
  assert(integritySnapshot.integrityLock === V55_FOUNDATION_INTEGRITY_LOCKED, "integrity lock token");
  assert(integritySnapshot.bridgeLayerLocked, "bridge layer locked");
  assert(integritySnapshot.portLayerLocked, "port layer locked");

  assert(WORKSPACE_QUOTE_RUNTIME_VERIFICATION_META.tag === WORKSPACE_QUOTE_RUNTIME_P7_TAG, "quote p7 meta tag");
  assert(WORKSPACE_QUOTE_RUNTIME_P7_META.phase === "v55-workspace-quote-p7", "quote p7 meta phase");
  assert(WORKSPACE_QUOTE_RUNTIME_P7_META.status === "quote-verification-foundation", "quote p7 meta status");
  assert(WORKSPACE_QUOTE_RUNTIME_P7_FREEZE.integrityLock === V55_FOUNDATION_INTEGRITY_LOCKED, "quote p7 freeze lock");
  console.log("✓ quote p7 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_RUNTIME_P7_TAG}`);
  console.log(`${V55_FOUNDATION_INTEGRITY_LOCKED} PASS`);
  console.log("V55 P7 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
