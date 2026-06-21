/**
 * V56 Quote Runtime Integration — P6 Runtime Reliability Layer verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V56_QUOTE_P6_VERIFY_CHECKS,
  WORKSPACE_QUOTE_INTEGRATION_P6_META,
  WORKSPACE_QUOTE_INTEGRATION_P6_TAG,
} from "@/lib/quote-runtime-integration/freeze/v56-p6-meta";
import { WORKSPACE_QUOTE_INTEGRATION_P6_FREEZE } from "@/lib/quote-runtime-integration/freeze/v56-p6-final";
import { WORKSPACE_QUOTE_INTEGRATION_P5_TAG } from "@/lib/quote-runtime-integration/shared/integration-constants";
import {
  assertAuditTrailContract,
  assertErrorModelContract,
  assertExecutionLogContract,
  assertHasAuditTrail,
  assertHasErrorModel,
  assertHasExecutionLog,
  assertHasRetryPolicy,
  assertMountedQuoteReliabilityWorkflow,
  assertP6NoBackgroundWorker,
  assertP6NoPrismaImport,
  assertP6NoQueue,
  assertRetryPolicyContract,
  assertWorkflowHasReliability,
  validateQuoteIntegrationP6,
} from "@/lib/quote-runtime-integration/reliability/quote-reliability-validation";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteIntegrationP6();
  assert(validation.valid, `P6 runtime reliability validation: ${validation.summary}`);
  console.log("✓ P6 runtime reliability validation ok");

  assert(existsSync(join(INTEGRATION_ROOT, "reliability", "quote-error.ts")), "error model module");
  assert(assertErrorModelContract(), "HAS_ERROR_MODEL");
  assert(assertHasErrorModel(), "error model contract");
  console.log("✓ HAS_ERROR_MODEL");

  assert(existsSync(join(INTEGRATION_ROOT, "reliability", "quote-retry-policy.ts")), "retry policy module");
  assert(assertRetryPolicyContract(), "HAS_RETRY_POLICY");
  assert(assertHasRetryPolicy(), "retry policy contract");
  console.log("✓ HAS_RETRY_POLICY");

  assert(existsSync(join(INTEGRATION_ROOT, "reliability", "quote-execution-log.ts")), "execution log module");
  assert(assertExecutionLogContract(), "HAS_EXECUTION_LOG");
  assert(assertHasExecutionLog(), "execution log contract");
  console.log("✓ HAS_EXECUTION_LOG");

  assert(existsSync(join(INTEGRATION_ROOT, "reliability", "quote-audit-trail.ts")), "audit trail module");
  assert(assertAuditTrailContract(), "HAS_AUDIT_TRAIL");
  assert(assertHasAuditTrail(), "audit trail contract");
  console.log("✓ HAS_AUDIT_TRAIL");

  assert(assertWorkflowHasReliability(), "WORKFLOW_HAS_RELIABILITY");
  assert(await assertMountedQuoteReliabilityWorkflow(), "workflow reliability mounted");
  console.log("✓ WORKFLOW_HAS_RELIABILITY");

  assert(assertP6NoBackgroundWorker(), "NO_BACKGROUND_WORKER");
  console.log("✓ NO_BACKGROUND_WORKER");

  assert(assertP6NoQueue(), "NO_QUEUE");
  console.log("✓ NO_QUEUE");

  assert(assertP6NoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  assert(WORKSPACE_QUOTE_INTEGRATION_P6_META.tag === WORKSPACE_QUOTE_INTEGRATION_P6_TAG, "p6 meta tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P6_META.phase === "v56-quote-runtime-p6", "p6 meta phase");
  assert(WORKSPACE_QUOTE_INTEGRATION_P6_META.dependencyTag === WORKSPACE_QUOTE_INTEGRATION_P5_TAG, "p6 dependency tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P6_FREEZE.status === "runtime-reliability-layer", "p6 freeze status");
  assert(V56_QUOTE_P6_VERIFY_CHECKS.includes("HAS_ERROR_MODEL"), "p6 verify checks");
  console.log("✓ quote p6 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_INTEGRATION_P6_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_INTEGRATION_P5_TAG}`);
  console.log("V56 P6 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
