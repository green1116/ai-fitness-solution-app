/**
 * V56 Quote Runtime Integration — P7 End-to-End Execution Flow verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V56_QUOTE_P7_VERIFY_CHECKS,
  WORKSPACE_QUOTE_INTEGRATION_P7_META,
  WORKSPACE_QUOTE_INTEGRATION_P7_TAG,
} from "@/lib/quote-runtime-integration/freeze/v56-p7-meta";
import { WORKSPACE_QUOTE_INTEGRATION_P7_FREEZE } from "@/lib/quote-runtime-integration/freeze/v56-p7-final";
import { WORKSPACE_QUOTE_INTEGRATION_P6_TAG } from "@/lib/quote-runtime-integration/shared/integration-constants";
import { assertWorkflowHasReliability } from "@/lib/quote-runtime-integration/reliability/quote-reliability-validation";
import {
  assertE2eChainComplete,
  assertE2eContextContract,
  assertE2eFlowContract,
  assertE2eResultContract,
  assertHasE2eContext,
  assertHasE2eFlow,
  assertHasE2eResult,
  assertMountedQuoteEndToEndFlow,
  assertP7NoQueue,
  assertP7NoWorker,
  validateQuoteIntegrationP7,
} from "@/lib/quote-runtime-integration/e2e/quote-e2e-validation";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteIntegrationP7();
  assert(validation.valid, `P7 end-to-end execution flow validation: ${validation.summary}`);
  console.log("✓ P7 end-to-end execution flow validation ok");

  assert(existsSync(join(INTEGRATION_ROOT, "e2e", "quote-e2e-flow.ts")), "e2e flow module");
  assert(assertE2eFlowContract(), "HAS_E2E_FLOW");
  assert(assertHasE2eFlow(), "e2e flow contract");
  console.log("✓ HAS_E2E_FLOW");

  assert(existsSync(join(INTEGRATION_ROOT, "e2e", "quote-e2e-context.ts")), "e2e context module");
  assert(assertE2eContextContract(), "HAS_E2E_CONTEXT");
  assert(assertHasE2eContext(), "e2e context contract");
  console.log("✓ HAS_E2E_CONTEXT");

  assert(existsSync(join(INTEGRATION_ROOT, "e2e", "quote-e2e-result.ts")), "e2e result module");
  assert(assertE2eResultContract(), "HAS_E2E_RESULT");
  assert(assertHasE2eResult(), "e2e result contract");
  console.log("✓ HAS_E2E_RESULT");

  assert(await assertMountedQuoteEndToEndFlow(), "E2E_CHAIN_COMPLETE");
  console.log("✓ E2E_CHAIN_COMPLETE");

  assert(assertWorkflowHasReliability(), "WORKFLOW_HAS_RELIABILITY");
  console.log("✓ WORKFLOW_HAS_RELIABILITY");

  assert(assertP7NoQueue(), "NO_QUEUE");
  console.log("✓ NO_QUEUE");

  assert(assertP7NoWorker(), "NO_WORKER");
  console.log("✓ NO_WORKER");

  assert(WORKSPACE_QUOTE_INTEGRATION_P7_META.tag === WORKSPACE_QUOTE_INTEGRATION_P7_TAG, "p7 meta tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P7_META.phase === "v56-quote-runtime-p7", "p7 meta phase");
  assert(WORKSPACE_QUOTE_INTEGRATION_P7_META.dependencyTag === WORKSPACE_QUOTE_INTEGRATION_P6_TAG, "p7 dependency tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P7_FREEZE.status === "end-to-end-execution-flow", "p7 freeze status");
  assert(V56_QUOTE_P7_VERIFY_CHECKS.includes("HAS_E2E_FLOW"), "p7 verify checks");
  console.log("✓ quote p7 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_INTEGRATION_P7_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_INTEGRATION_P6_TAG}`);
  console.log("V56 P7 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
