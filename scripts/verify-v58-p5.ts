/**
 * V58 Quote Lifecycle — P5 Quote Status Sync Foundation verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V58_QUOTE_P5_VERIFY_CHECKS,
  WORKSPACE_QUOTE_LIFECYCLE_P5_META,
  WORKSPACE_QUOTE_LIFECYCLE_P5_TAG,
} from "@/lib/quote-lifecycle/freeze/v58-p5-meta";
import { WORKSPACE_QUOTE_LIFECYCLE_P5_FREEZE } from "@/lib/quote-lifecycle/freeze/v58-p5-final";
import { WORKSPACE_QUOTE_LIFECYCLE_P4_TAG } from "@/lib/quote-lifecycle/shared/quote-lifecycle-constants";
import {
  assertHasStatusBuilderP5,
  assertHasStatusMapperP5,
  assertHasStatusProjectorP5,
  assertHasStatusReducerP5,
  assertHasStatusSelectorP5,
  assertHasStatusSnapshotP5,
  assertHasStatusValidationP5,
  assertMountedQuoteStatusSync,
  assertP5NoEventBusImpl,
  assertP5NoPrismaAccess,
  assertP5NoQueue,
  assertP5NoRepositoryAccess,
  assertP5NoRuntimeLogic,
  assertP5NoUILogic,
  assertP5NoV57Modification,
  assertP5NoWorker,
  validateQuoteLifecycleP5,
} from "@/lib/quote-lifecycle/validation/validate-quote-lifecycle-p5";

const LIFECYCLE_ROOT = join(process.cwd(), "lib", "quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateQuoteLifecycleP5();
  assert(validation.valid, `P5 quote status sync validation: ${validation.summary}`);
  console.log("✓ P5 quote status sync validation ok");

  assert(existsSync(join(LIFECYCLE_ROOT, "status-sync", "quote-status.snapshot.ts")), "status snapshot module");
  assert(assertHasStatusSnapshotP5(), "HAS_STATUS_SNAPSHOT");
  console.log("✓ HAS_STATUS_SNAPSHOT");

  assert(assertHasStatusReducerP5(), "HAS_STATUS_REDUCER");
  console.log("✓ HAS_STATUS_REDUCER");

  assert(assertHasStatusProjectorP5(), "HAS_STATUS_PROJECTOR");
  console.log("✓ HAS_STATUS_PROJECTOR");

  assert(assertHasStatusSelectorP5(), "HAS_STATUS_SELECTOR");
  console.log("✓ HAS_STATUS_SELECTOR");

  assert(assertHasStatusMapperP5(), "HAS_STATUS_MAPPER");
  console.log("✓ HAS_STATUS_MAPPER");

  assert(assertHasStatusBuilderP5(), "HAS_STATUS_BUILDER");
  console.log("✓ HAS_STATUS_BUILDER");

  assert(assertHasStatusValidationP5(), "HAS_STATUS_VALIDATION");
  console.log("✓ HAS_STATUS_VALIDATION");

  assert(assertP5NoPrismaAccess(), "NO_PRISMA_ACCESS");
  console.log("✓ NO_PRISMA_ACCESS");

  assert(assertP5NoRepositoryAccess(), "NO_REPOSITORY_ACCESS");
  console.log("✓ NO_REPOSITORY_ACCESS");

  assert(assertP5NoWorker(), "NO_WORKER");
  console.log("✓ NO_WORKER");

  assert(assertP5NoQueue(), "NO_QUEUE");
  console.log("✓ NO_QUEUE");

  assert(assertP5NoEventBusImpl(), "NO_EVENT_BUS_IMPL");
  console.log("✓ NO_EVENT_BUS_IMPL");

  assert(assertP5NoUILogic(), "NO_UI_LOGIC");
  console.log("✓ NO_UI_LOGIC");

  assert(assertP5NoRuntimeLogic(), "NO_RUNTIME_LOGIC");
  console.log("✓ NO_RUNTIME_LOGIC");

  assert(assertP5NoV57Modification(), "NO_V57_MODIFICATION");
  assert(assertMountedQuoteStatusSync(), "status sync mounted");
  console.log("✓ NO_V57_MODIFICATION");

  assert(WORKSPACE_QUOTE_LIFECYCLE_P5_META.tag === WORKSPACE_QUOTE_LIFECYCLE_P5_TAG, "p5 meta tag");
  assert(WORKSPACE_QUOTE_LIFECYCLE_P5_META.phase === "v58-quote-lifecycle-p5", "p5 meta phase");
  assert(
    WORKSPACE_QUOTE_LIFECYCLE_P5_META.dependencyTag === WORKSPACE_QUOTE_LIFECYCLE_P4_TAG,
    "p5 dependency tag",
  );
  assert(WORKSPACE_QUOTE_LIFECYCLE_P5_FREEZE.status === "quote-status-sync-foundation", "p5 freeze status");
  assert(V58_QUOTE_P5_VERIFY_CHECKS.includes("HAS_STATUS_SNAPSHOT"), "p5 verify checks");
  console.log("✓ quote lifecycle p5 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_LIFECYCLE_P5_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_LIFECYCLE_P4_TAG}`);
  console.log("V58 P5 PASS");
}

main();
