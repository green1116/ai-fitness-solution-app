/**
 * V58 Quote Lifecycle — P2 Quote Job Engine Foundation verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V58_QUOTE_P2_VERIFY_CHECKS,
  WORKSPACE_QUOTE_LIFECYCLE_P2_META,
  WORKSPACE_QUOTE_LIFECYCLE_P2_TAG,
} from "@/lib/quote-lifecycle/freeze/v58-p2-meta";
import { WORKSPACE_QUOTE_LIFECYCLE_P2_FREEZE } from "@/lib/quote-lifecycle/freeze/v58-p2-final";
import { WORKSPACE_QUOTE_LIFECYCLE_P1_TAG } from "@/lib/quote-lifecycle/shared/quote-lifecycle-constants";
import {
  assertHasJobCommandP2,
  assertHasJobDispatcherP2,
  assertHasJobEngineP2,
  assertHasJobRegistryP2,
  assertHasJobResultP2,
  assertHasJobSchedulerP2,
  assertHasReducerP2,
  assertHasValidationP2,
  assertMountedQuoteJobEngine,
  assertP2NoEventBus,
  assertP2NoPrismaAccess,
  assertP2NoQueueSystem,
  assertP2NoRepositoryAccess,
  assertP2NoRuntimeImport,
  assertP2NoUILogic,
  assertP2NoWorker,
  validateQuoteLifecycleP2,
} from "@/lib/quote-lifecycle/validation/validate-quote-lifecycle-p2";

const LIFECYCLE_ROOT = join(process.cwd(), "lib", "quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateQuoteLifecycleP2();
  assert(validation.valid, `P2 quote job engine validation: ${validation.summary}`);
  console.log("✓ P2 quote job engine validation ok");

  assert(existsSync(join(LIFECYCLE_ROOT, "job-engine", "quote-job-engine.interface.ts")), "job engine module");
  assert(assertHasJobEngineP2(), "HAS_JOB_ENGINE");
  console.log("✓ HAS_JOB_ENGINE");

  assert(assertHasJobDispatcherP2(), "HAS_JOB_DISPATCHER");
  console.log("✓ HAS_JOB_DISPATCHER");

  assert(assertHasJobSchedulerP2(), "HAS_JOB_SCHEDULER");
  console.log("✓ HAS_JOB_SCHEDULER");

  assert(assertHasJobRegistryP2(), "HAS_JOB_REGISTRY");
  console.log("✓ HAS_JOB_REGISTRY");

  assert(assertHasJobCommandP2(), "HAS_JOB_COMMAND");
  console.log("✓ HAS_JOB_COMMAND");

  assert(assertHasJobResultP2(), "HAS_JOB_RESULT");
  console.log("✓ HAS_JOB_RESULT");

  assert(assertHasReducerP2(), "HAS_REDUCER");
  console.log("✓ HAS_REDUCER");

  assert(assertHasValidationP2(), "HAS_VALIDATION");
  console.log("✓ HAS_VALIDATION");

  assert(assertP2NoPrismaAccess(), "NO_PRISMA_ACCESS");
  console.log("✓ NO_PRISMA_ACCESS");

  assert(assertP2NoRepositoryAccess(), "NO_REPOSITORY_ACCESS");
  console.log("✓ NO_REPOSITORY_ACCESS");

  assert(assertP2NoWorker(), "NO_WORKER");
  console.log("✓ NO_WORKER");

  assert(assertP2NoQueueSystem(), "NO_QUEUE_SYSTEM");
  console.log("✓ NO_QUEUE_SYSTEM");

  assert(assertP2NoEventBus(), "NO_EVENT_BUS");
  console.log("✓ NO_EVENT_BUS");

  assert(assertP2NoUILogic(), "NO_UI_LOGIC");
  console.log("✓ NO_UI_LOGIC");

  assert(assertP2NoRuntimeImport(), "NO_RUNTIME_IMPORT");
  assert(assertMountedQuoteJobEngine(), "job engine mounted");
  console.log("✓ NO_RUNTIME_IMPORT");

  assert(WORKSPACE_QUOTE_LIFECYCLE_P2_META.tag === WORKSPACE_QUOTE_LIFECYCLE_P2_TAG, "p2 meta tag");
  assert(WORKSPACE_QUOTE_LIFECYCLE_P2_META.phase === "v58-quote-lifecycle-p2", "p2 meta phase");
  assert(
    WORKSPACE_QUOTE_LIFECYCLE_P2_META.dependencyTag === WORKSPACE_QUOTE_LIFECYCLE_P1_TAG,
    "p2 dependency tag",
  );
  assert(WORKSPACE_QUOTE_LIFECYCLE_P2_FREEZE.status === "quote-job-engine-foundation", "p2 freeze status");
  assert(V58_QUOTE_P2_VERIFY_CHECKS.includes("HAS_JOB_ENGINE"), "p2 verify checks");
  console.log("✓ quote lifecycle p2 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_LIFECYCLE_P2_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_LIFECYCLE_P1_TAG}`);
  console.log("V58 P2 PASS");
}

main();
