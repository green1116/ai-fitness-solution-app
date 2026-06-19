import { createQuote } from "@/lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry";
import { DeliveryOrchestrator } from "./delivery-orchestrator";
import { buildDeliveryContext } from "./delivery-context-builder";
import { DeliveryPolicyEngine } from "./delivery-policy-engine";
import { DeliveryDecisionTree } from "./delivery-decision-tree";
import type { DeliveryOrchestratorValidation } from "./delivery-orchestrator-types";
import { CP_DELIVERY_API_PATH } from "./delivery-orchestrator-types";

const SAMPLE = {
  sku: "kickstart-package" as const,
  projectName: "School Gym Project",
  areaSqm: 320,
  headcount: 180,
  budgetCny: 650_000,
  complexity: "medium" as const,
  slaTier: "7d" as const,
};

export async function validateDeliveryOrchestrator(): Promise<DeliveryOrchestratorValidation> {
  const quote = createQuote(SAMPLE);
  registerQuoteSnapshot(quote.snapshot);
  const quoteId = quote.snapshot.quoteId;

  let quoteOnlyScenario = false;
  let partialPlanScenario = false;
  let fullPackageScenario = false;
  let fastModeScenario = false;
  let tenderModeScenario = false;

  try {
    const quoteOnlyPlan = await DeliveryOrchestrator.run({ quoteId });
    quoteOnlyScenario =
      quoteOnlyPlan.executionMode === "package" &&
      quoteOnlyPlan.finalOutput.type === "zip" &&
      quoteOnlyPlan.packageTrigger?.ready === true;

    const partialPlanPlan = await DeliveryOrchestrator.run({
      quoteId,
      planId: "attaguy-plan",
    });
    const partialContext = buildDeliveryContext({
      quoteId,
      planId: "attaguy-plan",
    });
    const partialPolicy = DeliveryPolicyEngine.evaluate(partialContext, {
      quoteId,
      planId: "attaguy-plan",
    });
    partialPlanScenario =
      partialPlanPlan.executionMode === "package" &&
      partialPolicy.usePlanBridge === false;

    const fullPlan = await DeliveryOrchestrator.run({
      quoteId,
      mode: "full",
    });
    fullPackageScenario =
      fullPlan.executionMode === "package" &&
      fullPlan.steps.some((step) => step.action === "build-package");

    const fastPlan = await DeliveryOrchestrator.run({
      quoteId,
      mode: "fast",
    });
    fastModeScenario =
      fastPlan.executionMode === "router" &&
      fastPlan.finalOutput.type === "zip" &&
      !fastPlan.steps.some((step) => step.action === "route-plan" && step.deliverableType === "plan");

    const tenderPlan = await DeliveryOrchestrator.run({
      quoteId,
      mode: "tender",
    });
    const tenderContext = buildDeliveryContext({ quoteId, mode: "tender" });
    const tenderPolicy = DeliveryPolicyEngine.evaluate(tenderContext, {
      quoteId,
      mode: "tender",
    });
    const tenderSteps = DeliveryDecisionTree.resolve(tenderPolicy);
    tenderModeScenario =
      tenderPlan.executionMode === "package" &&
      tenderPlan.steps.some((step) => step.action === "audit-trail") &&
      tenderSteps.some((step) => step.action === "audit-trail");
  } catch {
    // flags remain false
  }

  const apiPathRegistered = CP_DELIVERY_API_PATH === "/api/commercial-products/delivery";
  const valid =
    quoteOnlyScenario &&
    partialPlanScenario &&
    fullPackageScenario &&
    fastModeScenario &&
    tenderModeScenario &&
    apiPathRegistered;

  return {
    valid,
    quoteOnlyScenario,
    partialPlanScenario,
    fullPackageScenario,
    fastModeScenario,
    tenderModeScenario,
    apiPathRegistered,
    summary: [
      `quoteOnlyScenario=${quoteOnlyScenario}`,
      `partialPlanScenario=${partialPlanScenario}`,
      `fullPackageScenario=${fullPackageScenario}`,
      `fastModeScenario=${fastModeScenario}`,
      `tenderModeScenario=${tenderModeScenario}`,
      `apiPathRegistered=${apiPathRegistered}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
