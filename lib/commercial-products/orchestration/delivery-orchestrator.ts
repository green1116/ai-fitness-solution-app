import { CP_PACKAGE_API_PATH } from "@/lib/commercial-products/package/deliverable-package-types";
import { buildDeliveryContext } from "./delivery-context-builder";
import { DeliveryDecisionTree } from "./delivery-decision-tree";
import type {
  DeliveryExecutionResult,
  DeliveryPlan,
  DeliveryRequest,
} from "./delivery-orchestrator-types";
import { DeliveryPolicyEngine } from "./delivery-policy-engine";

export class DeliveryOrchestrator {
  static async run(request: DeliveryRequest): Promise<DeliveryPlan> {
    const context = buildDeliveryContext(request);
    const policy = DeliveryPolicyEngine.evaluate(context, request);
    const steps = DeliveryDecisionTree.resolve(policy);

    return {
      steps,
      finalOutput: policy.finalOutput,
      executionMode: policy.executionMode,
      metadata: {
        quoteId: request.quoteId,
        generatedAt: Date.now(),
      },
      packageTrigger:
        policy.executionMode === "package"
          ? {
              ready: true,
              apiPath: CP_PACKAGE_API_PATH,
            }
          : undefined,
    };
  }

  static async execute(request: DeliveryRequest): Promise<DeliveryExecutionResult> {
    const plan = await DeliveryOrchestrator.run(request);
    const snapshotModule = await import(
      "@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry"
    );
    const snapshot = snapshotModule.getQuoteSnapshotById(request.quoteId);

    if (plan.executionMode === "package") {
      const { runDeliverablePackageRuntimeHeavy } = await import(
        "../package/heavy-deliverable-package"
      );
      const result = await runDeliverablePackageRuntimeHeavy({
        quoteId: request.quoteId,
        planId: request.planId,
        budgetId: request.budgetId,
        snapshot,
      });

      return {
        ...plan,
        executed: true,
        packageResult: {
          filename: result.filename,
          mimeType: result.mimeType,
          source: result.source,
          byteLength: result.buffer.byteLength,
        },
      };
    }

    if (plan.executionMode === "router") {
      const { runDeliverablePdfRuntimeHeavy } = await import(
        "../access-layer/runtime/heavy-deliverable-pdf"
      );
      const outputType = plan.finalOutput.type;
      const result = await runDeliverablePdfRuntimeHeavy({
        type: outputType === "zip" ? "zip" : outputType,
        quoteId: request.quoteId,
        planId: request.planId,
        budgetId: request.budgetId,
        snapshot,
      });

      return {
        ...plan,
        executed: true,
        packageResult: {
          filename: result.filename,
          mimeType: result.mimeType,
          source: result.source,
          byteLength: result.buffer.byteLength,
        },
      };
    }

    const { runDeliverablePdfRuntimeHeavy } = await import(
      "../access-layer/runtime/heavy-deliverable-pdf"
    );
    const result = await runDeliverablePdfRuntimeHeavy({
      type: "summary",
      quoteId: request.quoteId,
      planId: request.planId,
      budgetId: request.budgetId,
      snapshot,
    });

    return {
      ...plan,
      executed: true,
      packageResult: {
        filename: result.filename,
        mimeType: result.mimeType,
        source: result.source,
        byteLength: result.buffer.byteLength,
      },
    };
  }
}
