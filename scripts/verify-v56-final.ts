/**
 * V56 Quote Runtime Integration — Final Freeze verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V56_INTEGRATION_FROZEN,
  V56_QUOTE_INTEGRATION_FINAL_VERIFY_CHECKS,
  WORKSPACE_QUOTE_INTEGRATION_FINAL_META,
  WORKSPACE_QUOTE_INTEGRATION_FINAL_FREEZE,
  WORKSPACE_QUOTE_INTEGRATION_FINAL_TAG,
  WORKSPACE_QUOTE_INTEGRATION_FINAL_VERSION,
} from "@/lib/quote-runtime-integration/freeze/v56-final-meta";
import { V56_INTEGRATION_LOCKED } from "@/lib/quote-runtime-integration/freeze/v56-p8-meta";
import { WORKSPACE_QUOTE_INTEGRATION_P8_TAG } from "@/lib/quote-runtime-integration/shared/integration-constants";
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
} from "@/lib/quote-runtime-integration/verification/quote-integration-integrity";
import {
  assertV56IntegrationFrozen,
  validateQuoteIntegrationFinal,
} from "@/lib/quote-runtime-integration/verification/quote-integration-final.verify";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteIntegrationFinal();
  assert(validation.valid, `V56 final quote runtime integration validation: ${validation.summary}`);
  console.log("✓ V56 quote runtime integration final validation ok");

  assert(existsSync(join(INTEGRATION_ROOT, "freeze", "v56-final.ts")), "v56-final freeze file");
  assert(existsSync(join(INTEGRATION_ROOT, "freeze", "v56-final-meta.ts")), "v56-final-meta file");

  assert(assertV56IntegrationFrozen(), "V56_INTEGRATION_FROZEN");
  console.log(`✓ ${V56_INTEGRATION_FROZEN}`);

  assert(await assertV56IntegrationLocked(), "V56_INTEGRATION_LOCKED");
  console.log(`✓ ${V56_INTEGRATION_LOCKED}`);

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

  assert(assertNoDirectPrismaAccess(), "NO_DIRECT_PRISMA_ACCESS");
  console.log("✓ NO_DIRECT_PRISMA_ACCESS");

  assert(assertNoDirectHandlerAccess(), "NO_DIRECT_HANDLER_ACCESS");
  console.log("✓ NO_DIRECT_HANDLER_ACCESS");

  assert(assertP8NoQueue(), "NO_QUEUE");
  console.log("✓ NO_QUEUE");

  assert(assertP8NoWorker(), "NO_WORKER");
  console.log("✓ NO_WORKER");

  assert(WORKSPACE_QUOTE_INTEGRATION_FINAL_META.tag === WORKSPACE_QUOTE_INTEGRATION_FINAL_TAG, "final meta tag");
  assert(
    WORKSPACE_QUOTE_INTEGRATION_FINAL_META.version === WORKSPACE_QUOTE_INTEGRATION_FINAL_VERSION,
    "final meta version",
  );
  assert(WORKSPACE_QUOTE_INTEGRATION_FINAL_META.state === "FROZEN", "final meta state");
  assert(WORKSPACE_QUOTE_INTEGRATION_FINAL_META.frozen === true, "final meta frozen");
  assert(WORKSPACE_QUOTE_INTEGRATION_FINAL_META.layers === 8, "final meta layers");
  assert(
    WORKSPACE_QUOTE_INTEGRATION_FINAL_META.integrationFrozen === V56_INTEGRATION_FROZEN,
    "final integration frozen token",
  );
  assert(WORKSPACE_QUOTE_INTEGRATION_FINAL_FREEZE.dependencyTag === WORKSPACE_QUOTE_INTEGRATION_P8_TAG, "final dependency tag");
  assert(V56_QUOTE_INTEGRATION_FINAL_VERIFY_CHECKS.includes("V56_INTEGRATION_FROZEN"), "final verify checks");
  console.log("✓ quote integration final meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_INTEGRATION_FINAL_TAG}`);
  console.log(`version=${WORKSPACE_QUOTE_INTEGRATION_FINAL_VERSION}`);
  console.log(`state=${WORKSPACE_QUOTE_INTEGRATION_FINAL_META.state}`);
  console.log("V56 FINAL FREEZE PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
