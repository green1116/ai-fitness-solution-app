import { CP_PACKAGE_API_PATH } from "@/lib/commercial-products/package/deliverable-package-types";
import type { DeliveryContext, DeliveryPolicy, DeliveryRequest } from "./delivery-orchestrator-types";

function resolveInclude(
  request: DeliveryRequest,
  context: DeliveryContext,
): DeliveryPolicy["include"] {
  const mode = context.mode;

  if (mode === "fast") {
    return {
      summary: request.include?.summary ?? true,
      plan: request.include?.plan ?? false,
      budget: request.include?.budget ?? false,
      zip: request.include?.zip ?? true,
    };
  }

  if (mode === "tender") {
    return {
      summary: request.include?.summary ?? true,
      plan: request.include?.plan ?? true,
      budget: request.include?.budget ?? true,
      zip: request.include?.zip ?? true,
    };
  }

  return {
    summary: request.include?.summary ?? true,
    plan: request.include?.plan ?? true,
    budget: request.include?.budget ?? true,
    zip: request.include?.zip ?? true,
  };
}

export class DeliveryPolicyEngine {
  static evaluate(context: DeliveryContext, request: DeliveryRequest): DeliveryPolicy {
    const include = resolveInclude(request, context);
    const usePlanBridge = !context.hasPlanId;
    const useBudgetBridge = !context.hasBudgetId;
    const auditTrail = context.mode === "tender";

    if (context.mode === "fast") {
      return {
        executionMode: include.zip ? "router" : "direct",
        finalOutput: {
          type: include.zip ? "zip" : "summary",
          source: include.zip ? "deliverable-router-zip" : "summary-pdf",
        },
        include,
        usePlanBridge,
        useBudgetBridge,
        auditTrail: false,
      };
    }

    if (context.mode === "tender") {
      return {
        executionMode: "package",
        finalOutput: {
          type: "zip",
          source: "deliverable-package-tender",
        },
        include,
        usePlanBridge,
        useBudgetBridge,
        auditTrail,
      };
    }

    if (!context.hasPlanId && !context.hasBudgetId) {
      return {
        executionMode: "package",
        finalOutput: {
          type: "zip",
          source: "deliverable-package",
        },
        include,
        usePlanBridge: true,
        useBudgetBridge: true,
        auditTrail: false,
      };
    }

    if (context.hasPlanId) {
      return {
        executionMode: "package",
        finalOutput: {
          type: "zip",
          source: "deliverable-package-partial-plan",
        },
        include,
        usePlanBridge: false,
        useBudgetBridge: !context.hasBudgetId,
        auditTrail: false,
      };
    }

    return {
      executionMode: "package",
      finalOutput: {
        type: "zip",
        source: CP_PACKAGE_API_PATH,
      },
      include,
      usePlanBridge,
      useBudgetBridge,
      auditTrail: false,
    };
  }
}
