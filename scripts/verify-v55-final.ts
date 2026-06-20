/**
 * V55 Quote Runtime — Final Freeze verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V55_FOUNDATION_FROZEN,
  V55_FOUNDATION_INTEGRITY_LOCKED,
  V55_QUOTE_RUNTIME_FINAL_FREEZE,
  WORKSPACE_QUOTE_RUNTIME_FINAL_META,
  WORKSPACE_QUOTE_RUNTIME_FINAL_TAG,
  WORKSPACE_QUOTE_RUNTIME_FINAL_VERSION,
  WORKSPACE_QUOTE_RUNTIME_P8_TAG,
} from "@/lib/quote-runtime";
import {
  assertV55FoundationFrozen,
  auditQuoteRuntimeNoApiHandler,
  auditQuoteRuntimeNoPersistence,
  auditQuoteRuntimeNoPrismaImport,
  auditQuoteRuntimeNoWorkflowRuntime,
  validateQuoteRuntimeFinal,
} from "@/lib/quote-runtime/validation/quote-runtime-verify-final";
import { assertV55FoundationIntegrityLocked } from "@/lib/quote-runtime/validation/quote-runtime-integrity";
import { assertWorkspaceQuoteSurfaceAlignedForSnapshot } from "@/lib/quote-runtime/validation/quote-runtime-verify-p8";

const QUOTE_ROOT = join(process.cwd(), "lib", "quote-runtime");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteRuntimeFinal();
  assert(validation.valid, `V55 final quote runtime validation: ${validation.summary}`);
  console.log("✓ V55 quote runtime final validation ok");

  assert(existsSync(join(QUOTE_ROOT, "freeze", "v55-final.ts")), "v55-final freeze file");
  assert(existsSync(join(QUOTE_ROOT, "freeze", "v55-final-meta.ts")), "v55-final-meta file");

  assert(assertV55FoundationFrozen(), "V55_FOUNDATION_FROZEN");
  console.log(`✓ ${V55_FOUNDATION_FROZEN}`);

  assert(assertV55FoundationIntegrityLocked(), "V55_FOUNDATION_INTEGRITY_LOCKED");
  console.log(`✓ ${V55_FOUNDATION_INTEGRITY_LOCKED}`);

  assert(assertWorkspaceQuoteSurfaceAlignedForSnapshot("verify-v55-final-quote"), "WORKSPACE_SURFACE_ALIGNED");
  console.log("✓ WORKSPACE_SURFACE_ALIGNED");

  assert(auditQuoteRuntimeNoWorkflowRuntime(), "NO_WORKFLOW_RUNTIME");
  console.log("✓ NO_WORKFLOW_RUNTIME");

  assert(auditQuoteRuntimeNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditQuoteRuntimeNoApiHandler(), "NO_API_HANDLER");
  console.log("✓ NO_API_HANDLER");

  assert(auditQuoteRuntimeNoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  assert(WORKSPACE_QUOTE_RUNTIME_FINAL_META.tag === WORKSPACE_QUOTE_RUNTIME_FINAL_TAG, "final meta tag");
  assert(WORKSPACE_QUOTE_RUNTIME_FINAL_META.version === WORKSPACE_QUOTE_RUNTIME_FINAL_VERSION, "final meta version");
  assert(WORKSPACE_QUOTE_RUNTIME_FINAL_META.state === "FROZEN", "final meta state");
  assert(WORKSPACE_QUOTE_RUNTIME_FINAL_META.frozen === true, "final meta frozen");
  assert(WORKSPACE_QUOTE_RUNTIME_FINAL_META.layers === 8, "final meta layers");
  assert(WORKSPACE_QUOTE_RUNTIME_FINAL_META.foundationFrozen === V55_FOUNDATION_FROZEN, "final foundation frozen token");
  assert(V55_QUOTE_RUNTIME_FINAL_FREEZE.dependencyTag === WORKSPACE_QUOTE_RUNTIME_P8_TAG, "final dependency tag");
  assert(V55_QUOTE_RUNTIME_FINAL_FREEZE.phaseTags.length === 8, "final phase tags");
  console.log("✓ quote final meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_RUNTIME_FINAL_TAG}`);
  console.log(`version=${WORKSPACE_QUOTE_RUNTIME_FINAL_VERSION}`);
  console.log(`state=${WORKSPACE_QUOTE_RUNTIME_FINAL_META.state}`);
  console.log("V55 FINAL FREEZE PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
