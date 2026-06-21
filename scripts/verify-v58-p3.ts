/**
 * V58 Quote Lifecycle — P3 Quote Async Runtime Client Foundation verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V58_QUOTE_P3_VERIFY_CHECKS,
  WORKSPACE_QUOTE_LIFECYCLE_P3_META,
  WORKSPACE_QUOTE_LIFECYCLE_P3_TAG,
} from "@/lib/quote-lifecycle/freeze/v58-p3-meta";
import { WORKSPACE_QUOTE_LIFECYCLE_P3_FREEZE } from "@/lib/quote-lifecycle/freeze/v58-p3-final";
import { WORKSPACE_QUOTE_LIFECYCLE_P2_TAG } from "@/lib/quote-lifecycle/shared/quote-lifecycle-constants";
import {
  assertHasAsyncAdapterP3,
  assertHasAsyncClientP3,
  assertHasAsyncGatewayP3,
  assertHasAsyncMapperP3,
  assertHasRuntimeBridgeP3,
  assertHasStubImplementationP3,
  assertMountedQuoteAsyncClient,
  assertP3NoEventBus,
  assertP3NoPrismaAccess,
  assertP3NoQueue,
  assertP3NoRepositoryAccess,
  assertP3NoUILogic,
  assertP3NoV56InternalImport,
  assertP3NoV57Modification,
  assertP3NoWorker,
  validateQuoteLifecycleP3,
} from "@/lib/quote-lifecycle/validation/validate-quote-lifecycle-p3";

const LIFECYCLE_ROOT = join(process.cwd(), "lib", "quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateQuoteLifecycleP3();
  assert(validation.valid, `P3 quote async runtime client validation: ${validation.summary}`);
  console.log("✓ P3 quote async runtime client validation ok");

  assert(existsSync(join(LIFECYCLE_ROOT, "async", "quote-async-client.interface.ts")), "async client module");
  assert(assertHasAsyncClientP3(), "HAS_ASYNC_CLIENT");
  console.log("✓ HAS_ASYNC_CLIENT");

  assert(assertHasAsyncAdapterP3(), "HAS_ASYNC_ADAPTER");
  console.log("✓ HAS_ASYNC_ADAPTER");

  assert(assertHasAsyncGatewayP3(), "HAS_ASYNC_GATEWAY");
  console.log("✓ HAS_ASYNC_GATEWAY");

  assert(assertHasAsyncMapperP3(), "HAS_ASYNC_MAPPER");
  console.log("✓ HAS_ASYNC_MAPPER");

  assert(assertHasRuntimeBridgeP3(), "HAS_RUNTIME_BRIDGE");
  console.log("✓ HAS_RUNTIME_BRIDGE");

  assert(assertHasStubImplementationP3(), "HAS_STUB_IMPLEMENTATION");
  console.log("✓ HAS_STUB_IMPLEMENTATION");

  assert(assertP3NoPrismaAccess(), "NO_PRISMA_ACCESS");
  console.log("✓ NO_PRISMA_ACCESS");

  assert(assertP3NoRepositoryAccess(), "NO_REPOSITORY_ACCESS");
  console.log("✓ NO_REPOSITORY_ACCESS");

  assert(assertP3NoWorker(), "NO_WORKER");
  console.log("✓ NO_WORKER");

  assert(assertP3NoQueue(), "NO_QUEUE");
  console.log("✓ NO_QUEUE");

  assert(assertP3NoEventBus(), "NO_EVENT_BUS");
  console.log("✓ NO_EVENT_BUS");

  assert(assertP3NoUILogic(), "NO_UI_LOGIC");
  console.log("✓ NO_UI_LOGIC");

  assert(assertP3NoV57Modification(), "NO_V57_MODIFICATION");
  console.log("✓ NO_V57_MODIFICATION");

  assert(assertP3NoV56InternalImport(), "NO_V56_INTERNAL_IMPORT");
  assert(assertMountedQuoteAsyncClient(), "async client mounted");
  console.log("✓ NO_V56_INTERNAL_IMPORT");

  assert(WORKSPACE_QUOTE_LIFECYCLE_P3_META.tag === WORKSPACE_QUOTE_LIFECYCLE_P3_TAG, "p3 meta tag");
  assert(WORKSPACE_QUOTE_LIFECYCLE_P3_META.phase === "v58-quote-lifecycle-p3", "p3 meta phase");
  assert(
    WORKSPACE_QUOTE_LIFECYCLE_P3_META.dependencyTag === WORKSPACE_QUOTE_LIFECYCLE_P2_TAG,
    "p3 dependency tag",
  );
  assert(
    WORKSPACE_QUOTE_LIFECYCLE_P3_FREEZE.status === "quote-async-runtime-client-foundation",
    "p3 freeze status",
  );
  assert(V58_QUOTE_P3_VERIFY_CHECKS.includes("HAS_ASYNC_CLIENT"), "p3 verify checks");
  console.log("✓ quote lifecycle p3 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_LIFECYCLE_P3_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_LIFECYCLE_P2_TAG}`);
  console.log("V58 P3 PASS");
}

main();
