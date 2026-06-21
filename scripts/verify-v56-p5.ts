/**
 * V56 Quote Runtime Integration — P5 Quote Workflow Orchestration verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V56_QUOTE_P5_VERIFY_CHECKS,
  WORKSPACE_QUOTE_INTEGRATION_P5_META,
  WORKSPACE_QUOTE_INTEGRATION_P5_TAG,
} from "@/lib/quote-runtime-integration/freeze/v56-p5-meta";
import { WORKSPACE_QUOTE_INTEGRATION_P5_FREEZE } from "@/lib/quote-runtime-integration/freeze/v56-p5-final";
import { WORKSPACE_QUOTE_INTEGRATION_P4_TAG } from "@/lib/quote-runtime-integration/shared/integration-constants";
import {
  assertHasWorkflowOrchestrator,
  assertMountedQuoteWorkflowOrchestrator,
  assertP5NoDirectHandlerAccess,
  assertP5NoPrismaImport,
  assertWorkflowContextContract,
  assertWorkflowOrchestratorContract,
  assertWorkflowStateContract,
  assertWorkflowUsesPortsOnly,
  validateQuoteIntegrationP5,
} from "@/lib/quote-runtime-integration/workflow/quote-workflow-validation";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteIntegrationP5();
  assert(validation.valid, `P5 quote workflow orchestration validation: ${validation.summary}`);
  console.log("✓ P5 quote workflow orchestration validation ok");

  assert(
    existsSync(join(INTEGRATION_ROOT, "workflow", "quote-workflow-orchestrator.ts")),
    "workflow orchestrator module",
  );
  assert(assertWorkflowOrchestratorContract(), "HAS_WORKFLOW_ORCHESTRATOR");
  assert(assertHasWorkflowOrchestrator(), "workflow orchestrator contract");
  console.log("✓ HAS_WORKFLOW_ORCHESTRATOR");

  assert(existsSync(join(INTEGRATION_ROOT, "workflow", "quote-workflow-context.ts")), "workflow context module");
  assert(assertWorkflowContextContract(), "HAS_WORKFLOW_CONTEXT");
  console.log("✓ HAS_WORKFLOW_CONTEXT");

  assert(existsSync(join(INTEGRATION_ROOT, "workflow", "quote-workflow-state.ts")), "workflow state module");
  assert(assertWorkflowStateContract(), "HAS_WORKFLOW_STATE");
  console.log("✓ HAS_WORKFLOW_STATE");

  assert(assertWorkflowUsesPortsOnly(), "WORKFLOW_USES_PORTS_ONLY");
  assert(await assertMountedQuoteWorkflowOrchestrator(), "workflow uses ports only mounted");
  console.log("✓ WORKFLOW_USES_PORTS_ONLY");

  assert(assertP5NoPrismaImport(), "NO_PRISMA_IMPORT");
  console.log("✓ NO_PRISMA_IMPORT");

  assert(assertP5NoDirectHandlerAccess(), "NO_DIRECT_HANDLER_ACCESS");
  console.log("✓ NO_DIRECT_HANDLER_ACCESS");

  assert(WORKSPACE_QUOTE_INTEGRATION_P5_META.tag === WORKSPACE_QUOTE_INTEGRATION_P5_TAG, "p5 meta tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P5_META.phase === "v56-quote-runtime-p5", "p5 meta phase");
  assert(WORKSPACE_QUOTE_INTEGRATION_P5_META.dependencyTag === WORKSPACE_QUOTE_INTEGRATION_P4_TAG, "p5 dependency tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P5_FREEZE.status === "quote-workflow-orchestration", "p5 freeze status");
  assert(V56_QUOTE_P5_VERIFY_CHECKS.includes("HAS_WORKFLOW_ORCHESTRATOR"), "p5 verify checks");
  console.log("✓ quote p5 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_INTEGRATION_P5_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_INTEGRATION_P4_TAG}`);
  console.log("V56 P5 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
