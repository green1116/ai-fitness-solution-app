/**
 * V56 Quote Runtime Integration — P8 Full Integration Verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V56_INTEGRATION_LOCKED,
  V56_QUOTE_P8_VERIFY_CHECKS,
  WORKSPACE_QUOTE_INTEGRATION_P8_META,
  WORKSPACE_QUOTE_INTEGRATION_P8_TAG,
} from "@/lib/quote-runtime-integration/freeze/v56-p8-meta";
import { WORKSPACE_QUOTE_INTEGRATION_P8_FREEZE } from "@/lib/quote-runtime-integration/freeze/v56-p8-final";
import { WORKSPACE_QUOTE_INTEGRATION_P7_TAG } from "@/lib/quote-runtime-integration/shared/integration-constants";
import {
  assertHasApiAdapter,
  assertHasE2eFlow,
  assertHasExecutionCore,
  assertHasPersistenceAdapter,
  assertHasPortBinding,
  assertHasReliabilityLayer,
  assertHasWorkflowLayer,
  assertNoDirectHandlerAccess,
  assertNoDirectPrismaAccess,
  assertP8NoQueue,
  assertP8NoWorker,
  assertV56IntegrationLocked,
  validateQuoteIntegrationP8,
} from "@/lib/quote-runtime-integration/verification/quote-integration-integrity";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteIntegrationP8();
  assert(validation.valid, `P8 full integration verification: ${validation.summary}`);
  console.log("✓ P8 full integration verification ok");

  assert(existsSync(join(INTEGRATION_ROOT, "verification", "quote-integration-integrity.ts")), "integrity module");
  assert(assertHasExecutionCore(), "HAS_EXECUTION_CORE");
  console.log("✓ HAS_EXECUTION_CORE");

  assert(assertHasPortBinding(), "HAS_PORT_BINDING");
  console.log("✓ HAS_PORT_BINDING");

  assert(assertHasPersistenceAdapter(), "HAS_PERSISTENCE_ADAPTER");
  console.log("✓ HAS_PERSISTENCE_ADAPTER");

  assert(assertHasApiAdapter(), "HAS_API_ADAPTER");
  console.log("✓ HAS_API_ADAPTER");

  assert(assertHasWorkflowLayer(), "HAS_WORKFLOW_LAYER");
  console.log("✓ HAS_WORKFLOW_LAYER");

  assert(assertHasReliabilityLayer(), "HAS_RELIABILITY_LAYER");
  console.log("✓ HAS_RELIABILITY_LAYER");

  assert(assertHasE2eFlow(), "HAS_E2E_FLOW");
  console.log("✓ HAS_E2E_FLOW");

  assert(await assertV56IntegrationLocked(), "V56_INTEGRATION_LOCKED");
  console.log(`✓ ${V56_INTEGRATION_LOCKED}`);

  assert(assertNoDirectPrismaAccess(), "NO_DIRECT_PRISMA_ACCESS");
  console.log("✓ NO_DIRECT_PRISMA_ACCESS");

  assert(assertNoDirectHandlerAccess(), "NO_DIRECT_HANDLER_ACCESS");
  console.log("✓ NO_DIRECT_HANDLER_ACCESS");

  assert(assertP8NoQueue(), "NO_QUEUE");
  console.log("✓ NO_QUEUE");

  assert(assertP8NoWorker(), "NO_WORKER");
  console.log("✓ NO_WORKER");

  assert(WORKSPACE_QUOTE_INTEGRATION_P8_META.tag === WORKSPACE_QUOTE_INTEGRATION_P8_TAG, "p8 meta tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P8_META.phase === "v56-quote-runtime-p8", "p8 meta phase");
  assert(WORKSPACE_QUOTE_INTEGRATION_P8_META.dependencyTag === WORKSPACE_QUOTE_INTEGRATION_P7_TAG, "p8 dependency tag");
  assert(
    WORKSPACE_QUOTE_INTEGRATION_P8_FREEZE.status === "full-integration-verification",
    "p8 freeze status",
  );
  assert(
    WORKSPACE_QUOTE_INTEGRATION_P8_META.integrityLocked === V56_INTEGRATION_LOCKED,
    "p8 integrity locked token",
  );
  assert(V56_QUOTE_P8_VERIFY_CHECKS.includes("V56_INTEGRATION_LOCKED"), "p8 verify checks");
  console.log("✓ quote p8 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_INTEGRATION_P8_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_INTEGRATION_P7_TAG}`);
  console.log("V56 P8 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
