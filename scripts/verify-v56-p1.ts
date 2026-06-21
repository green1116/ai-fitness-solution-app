/**
 * V56 Quote Runtime Integration — P1 Execution Core Bootstrap verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V56_QUOTE_P1_VERIFY_CHECKS,
  WORKSPACE_QUOTE_INTEGRATION_P1_META,
  WORKSPACE_QUOTE_INTEGRATION_P1_TAG,
} from "@/lib/quote-runtime-integration/freeze/v56-p1-meta";
import { WORKSPACE_QUOTE_INTEGRATION_P1_FREEZE } from "@/lib/quote-runtime-integration/freeze/v56-p1-final";
import { WORKSPACE_QUOTE_RUNTIME_FINAL_DEPENDENCY_TAG } from "@/lib/quote-runtime-integration/shared/integration-constants";
import {
  assertExecutionContextContract,
  assertExecutionCoreContract,
  assertExecutionResultContract,
  assertExecutorFactoryContract,
  assertHasExecutionCore,
  assertMountedQuoteExecutionCore,
  assertNoDirectApiBypass,
  assertNoDirectDbAccess,
  assertPortEnforcedExecutionContract,
  assertV55BridgeContract,
  assertV55ReadOnlyDependency,
  validateQuoteIntegrationP1,
} from "@/lib/quote-runtime-integration/validation/quote-integration-verify-p1";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteIntegrationP1();
  assert(validation.valid, `P1 quote integration validation: ${validation.summary}`);
  console.log("✓ P1 quote integration validation ok");

  assert(existsSync(join(INTEGRATION_ROOT, "services", "quote-execution.service.ts")), "execution core module");
  assert(assertExecutionCoreContract(), "HAS_EXECUTION_CORE");
  assert(assertHasExecutionCore(), "execution core mounted");
  console.log("✓ HAS_EXECUTION_CORE");

  assert(existsSync(join(INTEGRATION_ROOT, "bridge", "quote-runtime-bridge.ts")), "v55 bridge module");
  assert(assertV55BridgeContract(), "HAS_V55_BRIDGE");
  console.log("✓ HAS_V55_BRIDGE");

  assert(assertExecutorFactoryContract(), "HAS_EXECUTOR_FACTORY");
  console.log("✓ HAS_EXECUTOR_FACTORY");

  assert(assertExecutionContextContract(), "HAS_EXECUTION_CONTEXT");
  console.log("✓ HAS_EXECUTION_CONTEXT");

  assert(assertExecutionResultContract(), "HAS_EXECUTION_RESULT");
  console.log("✓ HAS_EXECUTION_RESULT");

  assert(assertPortEnforcedExecutionContract(), "PORT_ENFORCED_EXECUTION");
  assert(assertMountedQuoteExecutionCore(), "port enforced execution mounted");
  console.log("✓ PORT_ENFORCED_EXECUTION");

  assert(assertNoDirectDbAccess(), "NO_DIRECT_DB_ACCESS");
  console.log("✓ NO_DIRECT_DB_ACCESS");

  assert(assertNoDirectApiBypass(), "NO_DIRECT_API_BYPASS");
  console.log("✓ NO_DIRECT_API_BYPASS");

  assert(assertV55ReadOnlyDependency(), "V55_READ_ONLY_DEPENDENCY");
  console.log("✓ V55_READ_ONLY_DEPENDENCY");

  assert(WORKSPACE_QUOTE_INTEGRATION_P1_META.tag === WORKSPACE_QUOTE_INTEGRATION_P1_TAG, "p1 meta tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P1_META.phase === "v56-quote-runtime-p1", "p1 meta phase");
  assert(
    WORKSPACE_QUOTE_INTEGRATION_P1_META.dependencyTag === WORKSPACE_QUOTE_RUNTIME_FINAL_DEPENDENCY_TAG,
    "p1 dependency tag",
  );
  assert(WORKSPACE_QUOTE_INTEGRATION_P1_FREEZE.status === "quote-execution-core-bootstrap", "p1 freeze status");
  assert(V56_QUOTE_P1_VERIFY_CHECKS.includes("HAS_EXECUTION_CORE"), "p1 verify checks");
  console.log("✓ quote p1 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_INTEGRATION_P1_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_RUNTIME_FINAL_DEPENDENCY_TAG}`);
  console.log("V56 P1 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
