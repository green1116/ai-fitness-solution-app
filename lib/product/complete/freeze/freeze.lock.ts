/**
 * Product Complete — Freeze lock (read-only)
 * Freezes Product P1–P12 + establishes enterprise-product-complete-v1
 * BASE: enterprise-product-p12-production-launch-v1
 * Isolated namespace: lib/product/complete
 * Does not modify P1–P12 sources
 */

import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import {
  PRODUCT_P1_CUSTOMER_ONBOARDING_BASE,
  PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  PRODUCT_P1_CUSTOMER_ONBOARDING_ID,
  PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION,
} from "../../p1/onboarding/onboarding.constants";
import {
  PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_ID,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION,
} from "../../p2/organization/organization.constants";
import {
  PRODUCT_P3_AI_PROJECT_CREATION_BASE,
  PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION,
  PRODUCT_P3_AI_PROJECT_CREATION_ID,
  PRODUCT_P3_AI_PROJECT_CREATION_VERSION,
} from "../../p3/project/project.constants";
import {
  PRODUCT_P4_REQUIREMENT_COLLECTION_BASE,
  PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION,
  PRODUCT_P4_REQUIREMENT_COLLECTION_ID,
  PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION,
} from "../../p4/questionnaire/questionnaire.constants";
import {
  PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_ID,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION,
} from "../../p5/proposal/proposal.constants";
import {
  PRODUCT_P6_BUDGET_ROI_BASE,
  PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION,
  PRODUCT_P6_BUDGET_ROI_ID,
  PRODUCT_P6_BUDGET_ROI_VERSION,
} from "../../p6/budget/budget.constants";
import {
  PRODUCT_P7_COLLABORATION_APPROVAL_BASE,
  PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION,
  PRODUCT_P7_COLLABORATION_APPROVAL_ID,
  PRODUCT_P7_COLLABORATION_APPROVAL_VERSION,
} from "../../p7/collaboration/collaboration.constants";
import {
  PRODUCT_P8_TENDER_DELIVERY_BASE,
  PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION,
  PRODUCT_P8_TENDER_DELIVERY_ID,
  PRODUCT_P8_TENDER_DELIVERY_VERSION,
} from "../../p8/tender/tender.constants";
import {
  PRODUCT_P9_CUSTOMER_SUCCESS_BASE,
  PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION,
  PRODUCT_P9_CUSTOMER_SUCCESS_ID,
  PRODUCT_P9_CUSTOMER_SUCCESS_VERSION,
} from "../../p9/customer-health/health.constants";
import {
  PRODUCT_P10_SUBSCRIPTION_BILLING_BASE,
  PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION,
  PRODUCT_P10_SUBSCRIPTION_BILLING_ID,
  PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION,
} from "../../p10/subscription/subscription.constants";
import {
  PRODUCT_P11_COMMERCIAL_RELEASE_BASE,
  PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION,
  PRODUCT_P11_COMMERCIAL_RELEASE_ID,
  PRODUCT_P11_COMMERCIAL_RELEASE_VERSION,
} from "../../p11/release/release.constants";
import {
  PRODUCT_P12_PRODUCTION_LAUNCH_BASE,
  PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION,
  PRODUCT_P12_PRODUCTION_LAUNCH_ID,
  PRODUCT_P12_PRODUCTION_LAUNCH_VERSION,
} from "../../p12/launch/launch.constants";

export const PRODUCT_COMPLETE_SIGNOFF_VERSION =
  "product-complete-signoff-1" as const;

export const PRODUCT_COMPLETE_FREEZE_VERSION =
  "product-complete-freeze-1" as const;

export const PRODUCT_COMPLETE_FREEZE_BASE =
  "enterprise-product-p12-production-launch-v1" as const;

export const PRODUCT_COMPLETE_ID =
  "enterprise-product-complete-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_COMPLETE_ID =
  "enterprise-product-complete-v1" as const;

export type ProductCompleteComponentId =
  | "p1-onboarding"
  | "p2-organization"
  | "p3-project"
  | "p4-requirement"
  | "p5-proposal"
  | "p6-budget"
  | "p7-collaboration"
  | "p8-tender"
  | "p9-customer-success"
  | "p10-subscription"
  | "p11-commercial-release"
  | "p12-production-launch"
  | "complete-freeze";

export type ProductCompleteComponentLock = {
  id: ProductCompleteComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductCompletePhaseVersions = {
  p1: {
    id: typeof PRODUCT_P1_CUSTOMER_ONBOARDING_ID;
    version: typeof PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION;
    freeze: typeof PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION;
    base: typeof PRODUCT_P1_CUSTOMER_ONBOARDING_BASE;
  };
  p2: {
    id: typeof PRODUCT_P2_ORGANIZATION_WORKSPACE_ID;
    version: typeof PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION;
    freeze: typeof PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION;
    base: typeof PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE;
  };
  p3: {
    id: typeof PRODUCT_P3_AI_PROJECT_CREATION_ID;
    version: typeof PRODUCT_P3_AI_PROJECT_CREATION_VERSION;
    freeze: typeof PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION;
    base: typeof PRODUCT_P3_AI_PROJECT_CREATION_BASE;
  };
  p4: {
    id: typeof PRODUCT_P4_REQUIREMENT_COLLECTION_ID;
    version: typeof PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION;
    freeze: typeof PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION;
    base: typeof PRODUCT_P4_REQUIREMENT_COLLECTION_BASE;
  };
  p5: {
    id: typeof PRODUCT_P5_AI_PROPOSAL_GENERATION_ID;
    version: typeof PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION;
    freeze: typeof PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION;
    base: typeof PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE;
  };
  p6: {
    id: typeof PRODUCT_P6_BUDGET_ROI_ID;
    version: typeof PRODUCT_P6_BUDGET_ROI_VERSION;
    freeze: typeof PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION;
    base: typeof PRODUCT_P6_BUDGET_ROI_BASE;
  };
  p7: {
    id: typeof PRODUCT_P7_COLLABORATION_APPROVAL_ID;
    version: typeof PRODUCT_P7_COLLABORATION_APPROVAL_VERSION;
    freeze: typeof PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION;
    base: typeof PRODUCT_P7_COLLABORATION_APPROVAL_BASE;
  };
  p8: {
    id: typeof PRODUCT_P8_TENDER_DELIVERY_ID;
    version: typeof PRODUCT_P8_TENDER_DELIVERY_VERSION;
    freeze: typeof PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION;
    base: typeof PRODUCT_P8_TENDER_DELIVERY_BASE;
  };
  p9: {
    id: typeof PRODUCT_P9_CUSTOMER_SUCCESS_ID;
    version: typeof PRODUCT_P9_CUSTOMER_SUCCESS_VERSION;
    freeze: typeof PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION;
    base: typeof PRODUCT_P9_CUSTOMER_SUCCESS_BASE;
  };
  p10: {
    id: typeof PRODUCT_P10_SUBSCRIPTION_BILLING_ID;
    version: typeof PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION;
    freeze: typeof PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION;
    base: typeof PRODUCT_P10_SUBSCRIPTION_BILLING_BASE;
  };
  p11: {
    id: typeof PRODUCT_P11_COMMERCIAL_RELEASE_ID;
    version: typeof PRODUCT_P11_COMMERCIAL_RELEASE_VERSION;
    freeze: typeof PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION;
    base: typeof PRODUCT_P11_COMMERCIAL_RELEASE_BASE;
  };
  p12: {
    id: typeof PRODUCT_P12_PRODUCTION_LAUNCH_ID;
    version: typeof PRODUCT_P12_PRODUCTION_LAUNCH_VERSION;
    freeze: typeof PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION;
    base: typeof PRODUCT_P12_PRODUCTION_LAUNCH_BASE;
  };
};

export type ProductCompleteFreezeLock = {
  version: typeof PRODUCT_COMPLETE_FREEZE_VERSION;
  base: typeof PRODUCT_COMPLETE_FREEZE_BASE;
  completeId: typeof PRODUCT_COMPLETE_ID;
  completeAlias: typeof ENTERPRISE_PRODUCT_COMPLETE_ID;
  signoff: typeof PRODUCT_COMPLETE_SIGNOFF_VERSION;
  operationsBaseline: typeof ENTERPRISE_OPERATIONS_COMPLETE_ID;
  launchReadinessBaseline: typeof ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID;
  commercializationBaseline: typeof ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  evolutionBaseline: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: typeof E12_PRODUCTIZATION_COMPLETE_ID;
  platformBaseline: "enterprise-platform-v1-complete";
  phases: ProductCompletePhaseVersions;
  components: ProductCompleteComponentLock[];
  readOnly: true;
};

export const PRODUCT_COMPLETE_COMPONENT_LOCK: ProductCompleteComponentLock[] = [
  { id: "p1-onboarding", path: "lib/product/p1/", label: "Product P1 Customer Onboarding", required: true },
  { id: "p2-organization", path: "lib/product/p2/", label: "Product P2 Organization Workspace", required: true },
  { id: "p3-project", path: "lib/product/p3/", label: "Product P3 AI Project Creation", required: true },
  { id: "p4-requirement", path: "lib/product/p4/", label: "Product P4 Requirement Collection", required: true },
  { id: "p5-proposal", path: "lib/product/p5/", label: "Product P5 AI Proposal Generation", required: true },
  { id: "p6-budget", path: "lib/product/p6/", label: "Product P6 Budget & ROI", required: true },
  { id: "p7-collaboration", path: "lib/product/p7/", label: "Product P7 Collaboration & Approval", required: true },
  { id: "p8-tender", path: "lib/product/p8/", label: "Product P8 Tender Delivery", required: true },
  { id: "p9-customer-success", path: "lib/product/p9/", label: "Product P9 Customer Success", required: true },
  { id: "p10-subscription", path: "lib/product/p10/", label: "Product P10 Subscription & Billing", required: true },
  { id: "p11-commercial-release", path: "lib/product/p11/", label: "Product P11 Commercial Release", required: true },
  { id: "p12-production-launch", path: "lib/product/p12/", label: "Product P12 Production Launch", required: true },
  { id: "complete-freeze", path: "lib/product/complete/", label: "Product Complete Freeze", required: true },
];

export const PRODUCT_COMPLETE_PHASE_VERSIONS: ProductCompletePhaseVersions = {
  p1: {
    id: PRODUCT_P1_CUSTOMER_ONBOARDING_ID,
    version: PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION,
    freeze: PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION,
    base: PRODUCT_P1_CUSTOMER_ONBOARDING_BASE,
  },
  p2: {
    id: PRODUCT_P2_ORGANIZATION_WORKSPACE_ID,
    version: PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION,
    freeze: PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION,
    base: PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE,
  },
  p3: {
    id: PRODUCT_P3_AI_PROJECT_CREATION_ID,
    version: PRODUCT_P3_AI_PROJECT_CREATION_VERSION,
    freeze: PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION,
    base: PRODUCT_P3_AI_PROJECT_CREATION_BASE,
  },
  p4: {
    id: PRODUCT_P4_REQUIREMENT_COLLECTION_ID,
    version: PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION,
    freeze: PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION,
    base: PRODUCT_P4_REQUIREMENT_COLLECTION_BASE,
  },
  p5: {
    id: PRODUCT_P5_AI_PROPOSAL_GENERATION_ID,
    version: PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION,
    freeze: PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION,
    base: PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE,
  },
  p6: {
    id: PRODUCT_P6_BUDGET_ROI_ID,
    version: PRODUCT_P6_BUDGET_ROI_VERSION,
    freeze: PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION,
    base: PRODUCT_P6_BUDGET_ROI_BASE,
  },
  p7: {
    id: PRODUCT_P7_COLLABORATION_APPROVAL_ID,
    version: PRODUCT_P7_COLLABORATION_APPROVAL_VERSION,
    freeze: PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION,
    base: PRODUCT_P7_COLLABORATION_APPROVAL_BASE,
  },
  p8: {
    id: PRODUCT_P8_TENDER_DELIVERY_ID,
    version: PRODUCT_P8_TENDER_DELIVERY_VERSION,
    freeze: PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION,
    base: PRODUCT_P8_TENDER_DELIVERY_BASE,
  },
  p9: {
    id: PRODUCT_P9_CUSTOMER_SUCCESS_ID,
    version: PRODUCT_P9_CUSTOMER_SUCCESS_VERSION,
    freeze: PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION,
    base: PRODUCT_P9_CUSTOMER_SUCCESS_BASE,
  },
  p10: {
    id: PRODUCT_P10_SUBSCRIPTION_BILLING_ID,
    version: PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION,
    freeze: PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION,
    base: PRODUCT_P10_SUBSCRIPTION_BILLING_BASE,
  },
  p11: {
    id: PRODUCT_P11_COMMERCIAL_RELEASE_ID,
    version: PRODUCT_P11_COMMERCIAL_RELEASE_VERSION,
    freeze: PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION,
    base: PRODUCT_P11_COMMERCIAL_RELEASE_BASE,
  },
  p12: {
    id: PRODUCT_P12_PRODUCTION_LAUNCH_ID,
    version: PRODUCT_P12_PRODUCTION_LAUNCH_VERSION,
    freeze: PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION,
    base: PRODUCT_P12_PRODUCTION_LAUNCH_BASE,
  },
};

export const PRODUCT_COMPLETE_FREEZE_LOCK: ProductCompleteFreezeLock = {
  version: PRODUCT_COMPLETE_FREEZE_VERSION,
  base: PRODUCT_COMPLETE_FREEZE_BASE,
  completeId: PRODUCT_COMPLETE_ID,
  completeAlias: ENTERPRISE_PRODUCT_COMPLETE_ID,
  signoff: PRODUCT_COMPLETE_SIGNOFF_VERSION,
  operationsBaseline: ENTERPRISE_OPERATIONS_COMPLETE_ID,
  launchReadinessBaseline: ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
  commercializationBaseline: ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  evolutionBaseline: ENTERPRISE_EVOLUTION_COMPLETE_ID,
  launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
  e12Baseline: E12_PRODUCTIZATION_COMPLETE_ID,
  platformBaseline: "enterprise-platform-v1-complete",
  phases: PRODUCT_COMPLETE_PHASE_VERSIONS,
  components: PRODUCT_COMPLETE_COMPONENT_LOCK,
  readOnly: true,
};

export function isProductCompleteFreezeLockIntact(
  lock: ProductCompleteFreezeLock = PRODUCT_COMPLETE_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.completeId === "enterprise-product-complete-v1" &&
    lock.completeAlias === "enterprise-product-complete-v1" &&
    lock.base === PRODUCT_P12_PRODUCTION_LAUNCH_ID &&
    lock.phases.p1.id === PRODUCT_P1_CUSTOMER_ONBOARDING_ID &&
    lock.phases.p12.id === PRODUCT_P12_PRODUCTION_LAUNCH_ID &&
    lock.phases.p2.base === PRODUCT_P1_CUSTOMER_ONBOARDING_ID &&
    lock.phases.p12.base === PRODUCT_P11_COMMERCIAL_RELEASE_ID &&
    lock.components.length === 13
  );
}
