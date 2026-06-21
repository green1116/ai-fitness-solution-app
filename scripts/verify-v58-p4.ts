/**
 * V58 Quote Lifecycle — P4 Quote Event Contract Foundation verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V58_QUOTE_P4_VERIFY_CHECKS,
  WORKSPACE_QUOTE_LIFECYCLE_P4_META,
  WORKSPACE_QUOTE_LIFECYCLE_P4_TAG,
} from "@/lib/quote-lifecycle/freeze/v58-p4-meta";
import { WORKSPACE_QUOTE_LIFECYCLE_P4_FREEZE } from "@/lib/quote-lifecycle/freeze/v58-p4-final";
import { WORKSPACE_QUOTE_LIFECYCLE_P3_TAG } from "@/lib/quote-lifecycle/shared/quote-lifecycle-constants";
import {
  assertHasEventContractP4,
  assertHasEventEnvelopeP4,
  assertHasEventMapperP4,
  assertHasEventTypesP4,
  assertHasEventValidationP4,
  assertHasExecutionEventP4,
  assertHasJobEventP4,
  assertHasLifecycleEventP4,
  assertMountedQuoteEventContract,
  assertP4NoEventBusImpl,
  assertP4NoPrismaAccess,
  assertP4NoQueue,
  assertP4NoRepositoryAccess,
  assertP4NoUILogic,
  assertP4NoV56InternalImport,
  assertP4NoV57Modification,
  assertP4NoWorker,
  validateQuoteLifecycleP4,
} from "@/lib/quote-lifecycle/validation/validate-quote-lifecycle-p4";

const LIFECYCLE_ROOT = join(process.cwd(), "lib", "quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateQuoteLifecycleP4();
  assert(validation.valid, `P4 quote event contract validation: ${validation.summary}`);
  console.log("✓ P4 quote event contract validation ok");

  assert(existsSync(join(LIFECYCLE_ROOT, "events", "quote-event.contract.ts")), "event contract module");
  assert(assertHasEventContractP4(), "HAS_EVENT_CONTRACT");
  console.log("✓ HAS_EVENT_CONTRACT");

  assert(assertHasEventEnvelopeP4(), "HAS_EVENT_ENVELOPE");
  console.log("✓ HAS_EVENT_ENVELOPE");

  assert(assertHasEventTypesP4(), "HAS_EVENT_TYPES");
  console.log("✓ HAS_EVENT_TYPES");

  assert(assertHasEventMapperP4(), "HAS_EVENT_MAPPER");
  console.log("✓ HAS_EVENT_MAPPER");

  assert(assertHasEventValidationP4(), "HAS_EVENT_VALIDATION");
  console.log("✓ HAS_EVENT_VALIDATION");

  assert(assertHasLifecycleEventP4(), "HAS_LIFECYCLE_EVENT");
  console.log("✓ HAS_LIFECYCLE_EVENT");

  assert(assertHasJobEventP4(), "HAS_JOB_EVENT");
  console.log("✓ HAS_JOB_EVENT");

  assert(assertHasExecutionEventP4(), "HAS_EXECUTION_EVENT");
  console.log("✓ HAS_EXECUTION_EVENT");

  assert(assertP4NoPrismaAccess(), "NO_PRISMA_ACCESS");
  console.log("✓ NO_PRISMA_ACCESS");

  assert(assertP4NoRepositoryAccess(), "NO_REPOSITORY_ACCESS");
  console.log("✓ NO_REPOSITORY_ACCESS");

  assert(assertP4NoWorker(), "NO_WORKER");
  console.log("✓ NO_WORKER");

  assert(assertP4NoQueue(), "NO_QUEUE");
  console.log("✓ NO_QUEUE");

  assert(assertP4NoEventBusImpl(), "NO_EVENT_BUS_IMPL");
  console.log("✓ NO_EVENT_BUS_IMPL");

  assert(assertP4NoUILogic(), "NO_UI_LOGIC");
  console.log("✓ NO_UI_LOGIC");

  assert(assertP4NoV57Modification(), "NO_V57_MODIFICATION");
  console.log("✓ NO_V57_MODIFICATION");

  assert(assertP4NoV56InternalImport(), "NO_V56_INTERNAL_IMPORT");
  assert(assertMountedQuoteEventContract(), "event contract mounted");
  console.log("✓ NO_V56_INTERNAL_IMPORT");

  assert(WORKSPACE_QUOTE_LIFECYCLE_P4_META.tag === WORKSPACE_QUOTE_LIFECYCLE_P4_TAG, "p4 meta tag");
  assert(WORKSPACE_QUOTE_LIFECYCLE_P4_META.phase === "v58-quote-lifecycle-p4", "p4 meta phase");
  assert(
    WORKSPACE_QUOTE_LIFECYCLE_P4_META.dependencyTag === WORKSPACE_QUOTE_LIFECYCLE_P3_TAG,
    "p4 dependency tag",
  );
  assert(
    WORKSPACE_QUOTE_LIFECYCLE_P4_FREEZE.status === "quote-event-contract-foundation",
    "p4 freeze status",
  );
  assert(V58_QUOTE_P4_VERIFY_CHECKS.includes("HAS_EVENT_CONTRACT"), "p4 verify checks");
  console.log("✓ quote lifecycle p4 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_LIFECYCLE_P4_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_LIFECYCLE_P3_TAG}`);
  console.log("V58 P4 PASS");
}

main();
