import type { DeliveryPolicy, DeliveryStep } from "./delivery-orchestrator-types";

export class DeliveryDecisionTree {
  static resolve(policy: DeliveryPolicy): DeliveryStep[] {
    const steps: DeliveryStep[] = [
      {
        stepId: "step-context",
        action: "build-context",
        target: policy.executionMode,
        reason: "build delivery context from quote and bridge rules",
      },
    ];

    if (policy.include.summary) {
      steps.push({
        stepId: "step-summary",
        action: "route-summary",
        target: policy.executionMode === "package" ? "package" : "router",
        deliverableType: "summary",
        reason: "summary required by policy",
      });
    }

    if (policy.include.plan) {
      steps.push({
        stepId: "step-plan",
        action: "route-plan",
        target: policy.executionMode === "direct" ? "direct" : policy.executionMode,
        deliverableType: "plan",
        skipBridge: !policy.usePlanBridge,
        reason: policy.usePlanBridge ? "plan via quote bridge" : "plan skip bridge",
      });
    }

    if (policy.include.budget) {
      steps.push({
        stepId: "step-budget",
        action: "route-budget",
        target: policy.executionMode === "direct" ? "direct" : policy.executionMode,
        deliverableType: "budget",
        skipBridge: !policy.useBudgetBridge,
        reason: policy.useBudgetBridge ? "budget via quote bridge" : "budget skip bridge",
      });
    }

    if (policy.executionMode === "package" && policy.include.zip) {
      steps.push({
        stepId: "step-package",
        action: "build-package",
        target: "package",
        deliverableType: "zip",
        reason: "assemble full customer deliverable package",
      });
    } else if (policy.include.zip) {
      steps.push({
        stepId: "step-zip",
        action: "route-budget",
        target: "router",
        deliverableType: "zip",
        reason: "router zip output for fast mode",
      });
    }

    if (policy.auditTrail) {
      steps.push({
        stepId: "step-audit",
        action: "audit-trail",
        target: "package",
        reason: "tender mode audit trail",
      });
    }

    return steps;
  }
}
