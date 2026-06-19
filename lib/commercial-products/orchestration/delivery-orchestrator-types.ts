export const DELIVERY_ORCHESTRATION_VERSION = "v47-commercial-products-p2-step6" as const;
export const CP_DELIVERY_API_PATH = "/api/commercial-products/delivery" as const;

export const DELIVERY_MODE = ["fast", "full", "tender"] as const;
export type DeliveryMode = (typeof DELIVERY_MODE)[number];

export type DeliveryExecutionMode = "direct" | "router" | "package";

export type DeliveryFinalOutputType = "summary" | "plan" | "budget" | "zip";

export interface DeliveryIncludeFlags {
  summary?: boolean;
  plan?: boolean;
  budget?: boolean;
  zip?: boolean;
}

export interface DeliveryRequest {
  quoteId: string;
  planId?: string;
  budgetId?: string;
  mode?: DeliveryMode;
  include?: DeliveryIncludeFlags;
}

export type DeliveryStepAction =
  | "build-context"
  | "route-summary"
  | "route-plan"
  | "route-budget"
  | "build-package"
  | "audit-trail";

export interface DeliveryStep {
  stepId: string;
  action: DeliveryStepAction;
  target: DeliveryExecutionMode;
  deliverableType?: DeliveryFinalOutputType;
  skipBridge?: boolean;
  reason: string;
}

export interface DeliveryPolicy {
  executionMode: DeliveryExecutionMode;
  finalOutput: {
    type: DeliveryFinalOutputType;
    source: string;
  };
  include: {
    summary: boolean;
    plan: boolean;
    budget: boolean;
    zip: boolean;
  };
  usePlanBridge: boolean;
  useBudgetBridge: boolean;
  auditTrail: boolean;
}

export interface DeliveryContext {
  quoteId: string;
  planId: string;
  budgetId: string;
  mode: DeliveryMode;
  hasPlanId: boolean;
  hasBudgetId: boolean;
  hasSnapshot: boolean;
  projectName: string;
  sku?: string;
  availability: {
    summary: boolean;
    plan: boolean;
    budget: boolean;
    package: boolean;
  };
  fallbackRules: {
    planBridge: string;
    budgetBridge: string;
  };
}

export interface DeliveryPlan {
  steps: DeliveryStep[];
  finalOutput: {
    type: DeliveryFinalOutputType;
    source: string;
  };
  executionMode: DeliveryExecutionMode;
  metadata: {
    quoteId: string;
    generatedAt: number;
  };
  packageTrigger?: {
    ready: boolean;
    apiPath: string;
  };
}

export interface DeliveryExecutionResult extends DeliveryPlan {
  executed: boolean;
  packageResult?: {
    filename: string;
    mimeType: string;
    source: string;
    byteLength: number;
  };
}

export interface DeliveryOrchestratorValidation {
  valid: boolean;
  quoteOnlyScenario: boolean;
  partialPlanScenario: boolean;
  fullPackageScenario: boolean;
  fastModeScenario: boolean;
  tenderModeScenario: boolean;
  apiPathRegistered: boolean;
  summary: string;
}
