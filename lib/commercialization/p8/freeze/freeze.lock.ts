/**
 * Commercialization P8 — Freeze lock (read-only)
 * Freezes Commercialization P1–P7 versions + component lock
 * BASE: enterprise-commercialization-p7-commercial-governance-v1
 */

import {
  COMMERCIALIZATION_P1_SALES_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_BASE,
  COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_ID,
  COMMERCIALIZATION_SALES_FOUNDATION_VERSION,
} from "../../p1/sales/sales.constants";
import {
  COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_BASE,
  COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
  COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION,
} from "../../p2/tier/tier.constants";
import {
  COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_BASE,
  COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_ID,
  COMMERCIALIZATION_PRICING_CONTRACT_VERSION,
} from "../../p3/pricing/pricing.constants";
import {
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION,
  COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION,
} from "../../p4/onboarding/onboarding.constants";
import {
  COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION,
  COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION,
} from "../../p5/delivery/delivery.constants";
import {
  COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION,
} from "../../p6/kpi/kpi.constants";
import {
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION,
  COMMERCIALIZATION_P7_GOVERNANCE_FREEZE_VERSION,
} from "../../p7/governance/governance.constants";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";

export const COMMERCIALIZATION_P8_SIGNOFF_VERSION =
  "commercialization-p8-signoff-1" as const;

export const COMMERCIALIZATION_P8_FREEZE_VERSION =
  "commercialization-p8-commercialization-freeze-1" as const;

export const COMMERCIALIZATION_P8_FREEZE_BASE =
  "enterprise-commercialization-p7-commercial-governance-v1" as const;

export const COMMERCIALIZATION_COMPLETE_ID =
  "enterprise-commercialization-complete-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID =
  "enterprise-commercialization-complete-v1" as const;

export type CommercializationP8ComponentId =
  | "p1-sales"
  | "p2-packaging"
  | "p3-pricing"
  | "p4-onboarding"
  | "p5-delivery"
  | "p6-revenue"
  | "p7-governance"
  | "p8-freeze";

export type CommercializationP8ComponentLock = {
  id: CommercializationP8ComponentId;
  path: string;
  label: string;
  required: true;
};

export type CommercializationP8PhaseVersions = {
  p1: {
    id: typeof COMMERCIALIZATION_SALES_FOUNDATION_ID;
    version: typeof COMMERCIALIZATION_SALES_FOUNDATION_VERSION;
    freeze: typeof COMMERCIALIZATION_P1_SALES_FREEZE_VERSION;
    base: typeof COMMERCIALIZATION_SALES_FOUNDATION_BASE;
  };
  p2: {
    id: typeof COMMERCIALIZATION_PRODUCT_PACKAGING_ID;
    version: typeof COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION;
    freeze: typeof COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION;
    base: typeof COMMERCIALIZATION_PRODUCT_PACKAGING_BASE;
  };
  p3: {
    id: typeof COMMERCIALIZATION_PRICING_CONTRACT_ID;
    version: typeof COMMERCIALIZATION_PRICING_CONTRACT_VERSION;
    freeze: typeof COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION;
    base: typeof COMMERCIALIZATION_PRICING_CONTRACT_BASE;
  };
  p4: {
    id: typeof COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID;
    version: typeof COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION;
    freeze: typeof COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION;
    base: typeof COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE;
  };
  p5: {
    id: typeof COMMERCIALIZATION_DELIVERY_OPERATIONS_ID;
    version: typeof COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION;
    freeze: typeof COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION;
    base: typeof COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE;
  };
  p6: {
    id: typeof COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID;
    version: typeof COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION;
    freeze: typeof COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION;
    base: typeof COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE;
  };
  p7: {
    id: typeof COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID;
    version: typeof COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION;
    freeze: typeof COMMERCIALIZATION_P7_GOVERNANCE_FREEZE_VERSION;
    base: typeof COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE;
  };
};

export type CommercializationP8FreezeLock = {
  version: typeof COMMERCIALIZATION_P8_FREEZE_VERSION;
  base: typeof COMMERCIALIZATION_P8_FREEZE_BASE;
  completeId: typeof COMMERCIALIZATION_COMPLETE_ID;
  completeAlias: typeof ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  signoff: typeof COMMERCIALIZATION_P8_SIGNOFF_VERSION;
  evolutionBaseline: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  phases: CommercializationP8PhaseVersions;
  components: CommercializationP8ComponentLock[];
  readOnly: true;
};

export const COMMERCIALIZATION_P8_COMPONENT_LOCK: CommercializationP8ComponentLock[] =
  [
    {
      id: "p1-sales",
      path: "lib/commercialization/p1/",
      label: "Commercialization P1 Sales Foundation",
      required: true,
    },
    {
      id: "p2-packaging",
      path: "lib/commercialization/p2/",
      label: "Commercialization P2 Product Packaging",
      required: true,
    },
    {
      id: "p3-pricing",
      path: "lib/commercialization/p3/",
      label: "Commercialization P3 Pricing Contract",
      required: true,
    },
    {
      id: "p4-onboarding",
      path: "lib/commercialization/p4/",
      label: "Commercialization P4 Customer Onboarding",
      required: true,
    },
    {
      id: "p5-delivery",
      path: "lib/commercialization/p5/",
      label: "Commercialization P5 Delivery Operations",
      required: true,
    },
    {
      id: "p6-revenue",
      path: "lib/commercialization/p6/",
      label: "Commercialization P6 Revenue Intelligence",
      required: true,
    },
    {
      id: "p7-governance",
      path: "lib/commercialization/p7/",
      label: "Commercialization P7 Commercial Governance",
      required: true,
    },
    {
      id: "p8-freeze",
      path: "lib/commercialization/p8/",
      label: "Commercialization P8 Freeze",
      required: true,
    },
  ];

export const COMMERCIALIZATION_P8_PHASE_VERSIONS: CommercializationP8PhaseVersions =
  {
    p1: {
      id: COMMERCIALIZATION_SALES_FOUNDATION_ID,
      version: COMMERCIALIZATION_SALES_FOUNDATION_VERSION,
      freeze: COMMERCIALIZATION_P1_SALES_FREEZE_VERSION,
      base: COMMERCIALIZATION_SALES_FOUNDATION_BASE,
    },
    p2: {
      id: COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
      version: COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION,
      freeze: COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION,
      base: COMMERCIALIZATION_PRODUCT_PACKAGING_BASE,
    },
    p3: {
      id: COMMERCIALIZATION_PRICING_CONTRACT_ID,
      version: COMMERCIALIZATION_PRICING_CONTRACT_VERSION,
      freeze: COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION,
      base: COMMERCIALIZATION_PRICING_CONTRACT_BASE,
    },
    p4: {
      id: COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
      version: COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION,
      freeze: COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION,
      base: COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE,
    },
    p5: {
      id: COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
      version: COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION,
      freeze: COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION,
      base: COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE,
    },
    p6: {
      id: COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
      version: COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION,
      freeze: COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION,
      base: COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE,
    },
    p7: {
      id: COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID,
      version: COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION,
      freeze: COMMERCIALIZATION_P7_GOVERNANCE_FREEZE_VERSION,
      base: COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE,
    },
  };

export const COMMERCIALIZATION_P8_FREEZE_LOCK: CommercializationP8FreezeLock = {
  version: COMMERCIALIZATION_P8_FREEZE_VERSION,
  base: COMMERCIALIZATION_P8_FREEZE_BASE,
  completeId: COMMERCIALIZATION_COMPLETE_ID,
  completeAlias: ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  signoff: COMMERCIALIZATION_P8_SIGNOFF_VERSION,
  evolutionBaseline: ENTERPRISE_EVOLUTION_COMPLETE_ID,
  launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
  e12Baseline: "enterprise-e12-productization-complete-v1",
  platformBaseline: "enterprise-platform-v1-complete",
  phases: COMMERCIALIZATION_P8_PHASE_VERSIONS,
  components: COMMERCIALIZATION_P8_COMPONENT_LOCK,
  readOnly: true,
};

export const EXPECTED_COMMERCIALIZATION_P8_FREEZE_LOCK: CommercializationP8FreezeLock =
  COMMERCIALIZATION_P8_FREEZE_LOCK;

export function isCommercializationP8FreezeLockIntact(): boolean {
  const lock = COMMERCIALIZATION_P8_FREEZE_LOCK;
  const phaseKeys = ["p1", "p2", "p3", "p4", "p5", "p6", "p7"] as const;
  const phasesOk = phaseKeys.every((key) => {
    const phase = lock.phases[key];
    return (
      phase.id.length > 0 &&
      phase.version.length > 0 &&
      phase.freeze.length > 0 &&
      phase.base.length > 0
    );
  });

  return (
    lock.readOnly === true &&
    typeof lock.version === "string" &&
    lock.version.length > 0 &&
    typeof lock.base === "string" &&
    lock.base.length > 0 &&
    typeof lock.completeId === "string" &&
    lock.completeId.length > 0 &&
    typeof lock.completeAlias === "string" &&
    lock.completeAlias.length > 0 &&
    typeof lock.signoff === "string" &&
    lock.signoff.length > 0 &&
    lock.evolutionBaseline === "enterprise-evolution-complete-v1" &&
    lock.launchBaseline === "enterprise-launch-complete-v1" &&
    lock.e12Baseline === "enterprise-e12-productization-complete-v1" &&
    lock.platformBaseline === "enterprise-platform-v1-complete" &&
    phasesOk &&
    Array.isArray(lock.components) &&
    lock.components.length >= 8 &&
    lock.components.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.path === "string" &&
        typeof c.label === "string" &&
        c.required === true,
    )
  );
}

export function commercializationP8FreezeLockMatchesExpected(): boolean {
  const lock = COMMERCIALIZATION_P8_FREEZE_LOCK;
  const expected = EXPECTED_COMMERCIALIZATION_P8_FREEZE_LOCK;
  const phaseKeys = ["p1", "p2", "p3", "p4", "p5", "p6", "p7"] as const;

  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.completeId === expected.completeId &&
    lock.completeAlias === expected.completeAlias &&
    lock.signoff === expected.signoff &&
    lock.evolutionBaseline === expected.evolutionBaseline &&
    lock.launchBaseline === expected.launchBaseline &&
    lock.e12Baseline === expected.e12Baseline &&
    lock.platformBaseline === expected.platformBaseline &&
    lock.readOnly === expected.readOnly &&
    phaseKeys.every(
      (key) =>
        lock.phases[key].id === expected.phases[key].id &&
        lock.phases[key].version === expected.phases[key].version &&
        lock.phases[key].freeze === expected.phases[key].freeze &&
        lock.phases[key].base === expected.phases[key].base,
    ) &&
    lock.components.length === expected.components.length &&
    lock.components.every(
      (c, i) =>
        c.id === expected.components[i]?.id &&
        c.path === expected.components[i]?.path,
    )
  );
}

export {
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION,
};
