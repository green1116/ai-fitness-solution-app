/**
 * V55 Quote Runtime — P8 Quote Workspace Alignment Foundation verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  V55_FOUNDATION_INTEGRITY_LOCKED,
  WORKSPACE_QUOTE_RUNTIME_ALIGNMENT_META,
  WORKSPACE_QUOTE_RUNTIME_P8_FREEZE,
  WORKSPACE_QUOTE_RUNTIME_P8_META,
  WORKSPACE_QUOTE_RUNTIME_P8_TAG,
} from "@/lib/quote-runtime";
import {
  assertAlignmentConsumesSnapshotAndSurfaceOnly,
  assertAlignmentFoundationOnlyScope,
  assertMountedWorkspaceQuoteSurfaceAligned,
  assertWorkspaceAlignmentContract,
  assertWorkspaceQuoteSurfaceAlignedForSnapshot,
  assertWorkspaceRegistryContract,
  assertWorkspaceSurfaceContract,
  assertWorkspaceValidationContract,
  validateQuoteRuntimeP8,
} from "@/lib/quote-runtime/validation/quote-runtime-verify-p8";
import { assertV55FoundationIntegrityLocked } from "@/lib/quote-runtime/validation/quote-runtime-integrity";
import {
  createWorkspaceQuoteRegistry,
  createWorkspaceQuoteSurface,
  validateWorkspaceQuoteAlignment,
} from "@/lib/quote-runtime/alignment";
import { buildQuoteRuntimeFoundationSnapshot } from "@/lib/quote-runtime/validation/quote-runtime-snapshot-check";

const ALIGNMENT_ROOT = join(process.cwd(), "lib", "quote-runtime", "alignment");

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

function auditP8AlignmentFiles(): string[] {
  return walkTsFiles(ALIGNMENT_ROOT, { excludeDirNames: ["freeze"] }).filter((file) => !file.endsWith("index.ts"));
}

function auditNoPrismaImport(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !auditP8AlignmentFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !auditP8AlignmentFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoApiHandler(): boolean {
  const pattern = /\/api\/handlers\/|from\s+["']@\/app\/api|from\s+["']@\/lib\/saas-product-api/;
  return !auditP8AlignmentFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

function auditNoWorkflowRuntime(): boolean {
  const pattern = /WorkflowRuntime|workflow-runtime|executeWorkflow|WorkflowEngine|workflowEngine/;
  return !auditP8AlignmentFiles().some((file) => pattern.test(readFileSync(file, "utf8")));
}

async function main() {
  const validation = await validateQuoteRuntimeP8();
  assert(validation.valid, `P8 quote alignment validation: ${validation.summary}`);
  console.log("✓ P8 quote alignment validation ok");

  assert(existsSync(join(ALIGNMENT_ROOT, "quote-workspace-alignment.ts")), "quote workspace alignment module");
  assert(assertWorkspaceAlignmentContract(), "HAS_WORKSPACE_ALIGNMENT");
  console.log("✓ HAS_WORKSPACE_ALIGNMENT");

  assert(existsSync(join(ALIGNMENT_ROOT, "quote-workspace-surface.ts")), "quote workspace surface module");
  assert(assertWorkspaceSurfaceContract(), "HAS_WORKSPACE_SURFACE");
  console.log("✓ HAS_WORKSPACE_SURFACE");

  assert(existsSync(join(ALIGNMENT_ROOT, "quote-workspace-registry.ts")), "quote workspace registry module");
  assert(assertWorkspaceRegistryContract(), "HAS_WORKSPACE_REGISTRY");
  console.log("✓ HAS_WORKSPACE_REGISTRY");

  assert(existsSync(join(ALIGNMENT_ROOT, "quote-workspace-validation.ts")), "quote workspace validation module");
  assert(assertWorkspaceValidationContract(), "HAS_WORKSPACE_VALIDATION");
  console.log("✓ HAS_WORKSPACE_VALIDATION");

  assert(assertWorkspaceQuoteSurfaceAlignedForSnapshot("verify-p8-quote"), "WORKSPACE_SURFACE_ALIGNED");
  console.log("✓ WORKSPACE_SURFACE_ALIGNED");

  assert(assertV55FoundationIntegrityLocked(), "V55_FOUNDATION_INTEGRITY_LOCKED");
  console.log("✓ V55_FOUNDATION_INTEGRITY_LOCKED");

  assert(assertAlignmentConsumesSnapshotAndSurfaceOnly(), "alignment snapshot/surface consumption");
  assert(assertAlignmentFoundationOnlyScope(), "alignment foundation scope");
  assert(assertMountedWorkspaceQuoteSurfaceAligned(), "mounted workspace quote surface aligned");

  assert(auditNoWorkflowRuntime(), "NO_WORKFLOW_RUNTIME");
  console.log("✓ NO_WORKFLOW_RUNTIME");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApiHandler(), "NO_API_HANDLER");
  console.log("✓ NO_API_HANDLER");

  assert(auditNoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  const foundationSnapshot = buildQuoteRuntimeFoundationSnapshot("verify-p8-quote");
  const alignmentValidation = validateWorkspaceQuoteAlignment(foundationSnapshot.runtimeSnapshot);
  const registry = createWorkspaceQuoteRegistry();
  registry.register(createWorkspaceQuoteSurface(foundationSnapshot.runtimeSnapshot));

  assert(alignmentValidation.valid, "workspace quote alignment validation");
  assert(registry.has(foundationSnapshot.workspaceId), "workspace quote registry entry");

  assert(WORKSPACE_QUOTE_RUNTIME_ALIGNMENT_META.tag === WORKSPACE_QUOTE_RUNTIME_P8_TAG, "quote p8 meta tag");
  assert(WORKSPACE_QUOTE_RUNTIME_P8_META.phase === "v55-workspace-quote-p8", "quote p8 meta phase");
  assert(WORKSPACE_QUOTE_RUNTIME_P8_META.status === "quote-workspace-alignment-foundation", "quote p8 meta status");
  assert(WORKSPACE_QUOTE_RUNTIME_P8_FREEZE.status === "quote-workspace-alignment-foundation", "quote p8 freeze status");
  console.log("✓ quote p8 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_RUNTIME_P8_TAG}`);
  console.log(`${V55_FOUNDATION_INTEGRITY_LOCKED} maintained`);
  console.log("V55 P8 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
