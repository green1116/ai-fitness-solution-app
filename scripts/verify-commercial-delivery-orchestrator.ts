/**
 * V47 Commercial Products — Delivery Orchestrator verification
 */
import {
  DeliveryDecisionTree,
  DeliveryOrchestrator,
  DeliveryPolicyEngine,
  buildDeliveryContext,
  validateDeliveryOrchestrator,
} from "../lib/commercial-products/orchestration";
import { CP_DELIVERY_API_PATH } from "../lib/commercial-products/orchestration/delivery-orchestrator-types";
import { createQuote } from "../lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "../lib/commercial-products/access-layer/pdf/quote-snapshot-registry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const sample = {
    sku: "kickstart-package" as const,
    projectName: "School Gym Project",
    areaSqm: 320,
    headcount: 180,
    budgetCny: 650_000,
    complexity: "medium" as const,
    slaTier: "7d" as const,
  };

  const quote = createQuote(sample);
  registerQuoteSnapshot(quote.snapshot);
  const quoteId = quote.snapshot.quoteId;

  const context = buildDeliveryContext({ quoteId });
  assert(context.quoteId === quoteId, "context builder");
  assert(context.availability.summary === true, "context availability");
  console.log("✓ context builder ok");
  console.log(`  planId=${context.planId} budgetId=${context.budgetId}`);

  const policy = DeliveryPolicyEngine.evaluate(context, { quoteId });
  assert(policy.executionMode === "package", "policy engine package");
  console.log("✓ policy engine ok");
  console.log(`  mode=${policy.executionMode} output=${policy.finalOutput.type}`);

  const steps = DeliveryDecisionTree.resolve(policy);
  assert(steps.length >= 3, "decision tree steps");
  console.log("✓ decision tree ok");
  console.log(`  steps=${steps.length}`);

  const plan = await DeliveryOrchestrator.run({ quoteId });
  assert(plan.metadata.quoteId === quoteId, "orchestrator quoteId");
  assert(plan.steps.length > 0, "orchestrator steps");
  console.log("✓ delivery orchestrator ok");
  console.log(`  executionMode=${plan.executionMode}`);

  assert(CP_DELIVERY_API_PATH === "/api/commercial-products/delivery", "api route path");
  console.log("✓ api route ok");
  console.log(`  path=${CP_DELIVERY_API_PATH}`);

  const validation = await validateDeliveryOrchestrator();
  assert(validation.valid, "delivery orchestrator validation");
  assert(validation.quoteOnlyScenario, "quote only");
  assert(validation.partialPlanScenario, "partial plan");
  assert(validation.fullPackageScenario, "full package");
  assert(validation.fastModeScenario, "fast mode");
  assert(validation.tenderModeScenario, "tender mode");

  console.log("✓ delivery orchestrator validation");
  console.log(`  valid=${validation.valid} summary=${validation.summary}`);
  console.log("DELIVERY ORCHESTRATOR PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
