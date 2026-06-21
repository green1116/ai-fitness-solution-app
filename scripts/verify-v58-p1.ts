/**
 * V58 Quote Lifecycle — P1 Quote Lifecycle Model Foundation verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V58_QUOTE_P1_VERIFY_CHECKS,
  WORKSPACE_QUOTE_LIFECYCLE_P1_META,
  WORKSPACE_QUOTE_LIFECYCLE_P1_TAG,
} from "@/lib/quote-lifecycle/freeze/v58-p1-meta";
import { WORKSPACE_QUOTE_LIFECYCLE_P1_FREEZE } from "@/lib/quote-lifecycle/freeze/v58-p1-final";
import { WORKSPACE_QUOTE_PRODUCT_FINAL_DEPENDENCY_TAG } from "@/lib/quote-lifecycle/shared/quote-lifecycle-constants";
import {
  assertHasExecutionTypesP1,
  assertHasJobTypesP1,
  assertHasLifecycleReducerP1,
  assertHasLifecycleStateP1,
  assertHasLifecycleTransitionP1,
  assertHasLifecycleTypesP1,
  assertHasValidationP1,
  assertMountedQuoteLifecycleModel,
  assertP1NoEventBusImpl,
  assertP1NoPrismaAccess,
  assertP1NoRepositoryAccess,
  assertP1NoUILogic,
  assertP1NoWorkerImpl,
  validateQuoteLifecycleP1,
} from "@/lib/quote-lifecycle/validation/validate-quote-lifecycle-p1";

const LIFECYCLE_ROOT = join(process.cwd(), "lib", "quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateQuoteLifecycleP1();
  assert(validation.valid, `P1 quote lifecycle model validation: ${validation.summary}`);
  console.log("✓ P1 quote lifecycle model validation ok");

  assert(existsSync(join(LIFECYCLE_ROOT, "lifecycle", "quote-lifecycle.types.ts")), "lifecycle types module");
  assert(assertHasLifecycleTypesP1(), "HAS_LIFECYCLE_TYPES");
  console.log("✓ HAS_LIFECYCLE_TYPES");

  assert(assertHasLifecycleStateP1(), "HAS_LIFECYCLE_STATE");
  console.log("✓ HAS_LIFECYCLE_STATE");

  assert(assertHasLifecycleReducerP1(), "HAS_LIFECYCLE_REDUCER");
  console.log("✓ HAS_LIFECYCLE_REDUCER");

  assert(assertHasLifecycleTransitionP1(), "HAS_LIFECYCLE_TRANSITION");
  console.log("✓ HAS_LIFECYCLE_TRANSITION");

  assert(assertHasJobTypesP1(), "HAS_JOB_TYPES");
  console.log("✓ HAS_JOB_TYPES");

  assert(assertHasExecutionTypesP1(), "HAS_EXECUTION_TYPES");
  console.log("✓ HAS_EXECUTION_TYPES");

  assert(assertHasValidationP1(), "HAS_VALIDATION");
  console.log("✓ HAS_VALIDATION");

  assert(assertP1NoPrismaAccess(), "NO_PRISMA_ACCESS");
  console.log("✓ NO_PRISMA_ACCESS");

  assert(assertP1NoRepositoryAccess(), "NO_REPOSITORY_ACCESS");
  console.log("✓ NO_REPOSITORY_ACCESS");

  assert(assertP1NoWorkerImpl(), "NO_WORKER_IMPL");
  console.log("✓ NO_WORKER_IMPL");

  assert(assertP1NoEventBusImpl(), "NO_EVENT_BUS_IMPL");
  console.log("✓ NO_EVENT_BUS_IMPL");

  assert(assertP1NoUILogic(), "NO_UI_LOGIC");
  assert(assertMountedQuoteLifecycleModel(), "lifecycle model mounted");
  console.log("✓ NO_UI_LOGIC");

  assert(WORKSPACE_QUOTE_LIFECYCLE_P1_META.tag === WORKSPACE_QUOTE_LIFECYCLE_P1_TAG, "p1 meta tag");
  assert(WORKSPACE_QUOTE_LIFECYCLE_P1_META.phase === "v58-quote-lifecycle-p1", "p1 meta phase");
  assert(
    WORKSPACE_QUOTE_LIFECYCLE_P1_META.dependencyTag === WORKSPACE_QUOTE_PRODUCT_FINAL_DEPENDENCY_TAG,
    "p1 dependency tag",
  );
  assert(WORKSPACE_QUOTE_LIFECYCLE_P1_FREEZE.status === "quote-lifecycle-model-foundation", "p1 freeze status");
  assert(V58_QUOTE_P1_VERIFY_CHECKS.includes("HAS_LIFECYCLE_TYPES"), "p1 verify checks");
  console.log("✓ quote lifecycle p1 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_LIFECYCLE_P1_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_PRODUCT_FINAL_DEPENDENCY_TAG}`);
  console.log("V58 P1 PASS");
}

main();
