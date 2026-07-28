/**
 * Product M14 — Enterprise Intelligence Baseline Freeze lock (read-only)
 * Freezes Foundation → Catalog → Dependency → Policy → Compatibility → Governance → Lifecycle
 * BASE: enterprise-product-intelligence-lifecycle-v1
 * Isolated namespace: lib/product/m14/baseline
 * Does not modify upstream Intelligence module sources
 */

import { ENTERPRISE_PRODUCT_OS_BASELINE_ID } from "../../../m13/baseline/freeze/freeze.lock";
import {
  PRODUCT_INTELLIGENCE_CATALOG_BASE,
  PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_CATALOG_ID,
  PRODUCT_INTELLIGENCE_CATALOG_VERSION,
} from "../../catalog-runtime/catalog.constants";
import {
  PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_ID,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION,
} from "../../compatibility-runtime/compatibility.constants";
import {
  PRODUCT_INTELLIGENCE_DEPENDENCY_BASE,
  PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_DEPENDENCY_ID,
  PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION,
} from "../../dependency-runtime/dependency.constants";
import {
  PRODUCT_INTELLIGENCE_FOUNDATION_BASE,
  PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_FOUNDATION_ID,
  PRODUCT_INTELLIGENCE_FOUNDATION_VERSION,
} from "../../foundation/intelligence.constants";
import {
  PRODUCT_INTELLIGENCE_GOVERNANCE_BASE,
  PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_GOVERNANCE_ID,
  PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION,
} from "../../governance/governance.constants";
import {
  PRODUCT_INTELLIGENCE_LIFECYCLE_BASE,
  PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_LIFECYCLE_ID,
  PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION,
} from "../../lifecycle-runtime/lifecycle.constants";
import {
  PRODUCT_INTELLIGENCE_POLICY_BASE,
  PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_POLICY_ID,
  PRODUCT_INTELLIGENCE_POLICY_VERSION,
} from "../../policy-runtime/policy.constants";

export const PRODUCT_INTELLIGENCE_SIGNOFF_VERSION =
  "product-intelligence-baseline-signoff-1" as const;

export const PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION =
  "product-intelligence-baseline-freeze-1" as const;

export const PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE =
  "enterprise-product-intelligence-lifecycle-v1" as const;

export const PRODUCT_INTELLIGENCE_BASELINE_ID =
  "enterprise-product-intelligence-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID =
  "enterprise-product-intelligence-baseline-v1" as const;

export type ProductIntelligenceComponentId =
  | "intelligence-foundation"
  | "intelligence-catalog"
  | "intelligence-dependency"
  | "intelligence-policy"
  | "intelligence-compatibility"
  | "intelligence-governance"
  | "intelligence-lifecycle"
  | "intelligence-freeze";

export type ProductIntelligenceComponentLock = {
  id: ProductIntelligenceComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductIntelligencePhaseVersions = {
  foundation: {
    id: typeof PRODUCT_INTELLIGENCE_FOUNDATION_ID;
    version: typeof PRODUCT_INTELLIGENCE_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_INTELLIGENCE_FOUNDATION_BASE;
  };
  catalog: {
    id: typeof PRODUCT_INTELLIGENCE_CATALOG_ID;
    version: typeof PRODUCT_INTELLIGENCE_CATALOG_VERSION;
    freeze: typeof PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION;
    base: typeof PRODUCT_INTELLIGENCE_CATALOG_BASE;
  };
  dependency: {
    id: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_ID;
    version: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION;
    freeze: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION;
    base: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_BASE;
  };
  policy: {
    id: typeof PRODUCT_INTELLIGENCE_POLICY_ID;
    version: typeof PRODUCT_INTELLIGENCE_POLICY_VERSION;
    freeze: typeof PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION;
    base: typeof PRODUCT_INTELLIGENCE_POLICY_BASE;
  };
  compatibility: {
    id: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_ID;
    version: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION;
    freeze: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION;
    base: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE;
  };
  governance: {
    id: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_ID;
    version: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION;
    freeze: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION;
    base: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_BASE;
  };
  lifecycle: {
    id: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_ID;
    version: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION;
    freeze: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION;
    base: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_BASE;
  };
};

export type ProductIntelligenceFreezeLock = {
  version: typeof PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_INTELLIGENCE_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID;
  signoff: typeof PRODUCT_INTELLIGENCE_SIGNOFF_VERSION;
  osBaseline: typeof ENTERPRISE_PRODUCT_OS_BASELINE_ID;
  phases: ProductIntelligencePhaseVersions;
  components: ProductIntelligenceComponentLock[];
  readOnly: true;
  noNewCapability: true;
};

export const PRODUCT_INTELLIGENCE_COMPONENT_LOCK: ProductIntelligenceComponentLock[] =
  [
    {
      id: "intelligence-foundation",
      path: "lib/product/m14/foundation/",
      label: "Product Enterprise Intelligence Foundation",
      required: true,
    },
    {
      id: "intelligence-catalog",
      path: "lib/product/m14/catalog-runtime/",
      label: "Product Intelligence Catalog",
      required: true,
    },
    {
      id: "intelligence-dependency",
      path: "lib/product/m14/dependency-runtime/",
      label: "Product Intelligence Dependency",
      required: true,
    },
    {
      id: "intelligence-policy",
      path: "lib/product/m14/policy-runtime/",
      label: "Product Intelligence Policy",
      required: true,
    },
    {
      id: "intelligence-compatibility",
      path: "lib/product/m14/compatibility-runtime/",
      label: "Product Intelligence Compatibility",
      required: true,
    },
    {
      id: "intelligence-governance",
      path: "lib/product/m14/governance/",
      label: "Product Intelligence Governance",
      required: true,
    },
    {
      id: "intelligence-lifecycle",
      path: "lib/product/m14/lifecycle-runtime/",
      label: "Product Intelligence Lifecycle",
      required: true,
    },
    {
      id: "intelligence-freeze",
      path: "lib/product/m14/baseline/",
      label: "Product Enterprise Intelligence Baseline Freeze",
      required: true,
    },
  ];

export const PRODUCT_INTELLIGENCE_PHASE_VERSIONS: ProductIntelligencePhaseVersions =
  {
    foundation: {
      id: PRODUCT_INTELLIGENCE_FOUNDATION_ID,
      version: PRODUCT_INTELLIGENCE_FOUNDATION_VERSION,
      freeze: PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
      base: PRODUCT_INTELLIGENCE_FOUNDATION_BASE,
    },
    catalog: {
      id: PRODUCT_INTELLIGENCE_CATALOG_ID,
      version: PRODUCT_INTELLIGENCE_CATALOG_VERSION,
      freeze: PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION,
      base: PRODUCT_INTELLIGENCE_CATALOG_BASE,
    },
    dependency: {
      id: PRODUCT_INTELLIGENCE_DEPENDENCY_ID,
      version: PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION,
      freeze: PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION,
      base: PRODUCT_INTELLIGENCE_DEPENDENCY_BASE,
    },
    policy: {
      id: PRODUCT_INTELLIGENCE_POLICY_ID,
      version: PRODUCT_INTELLIGENCE_POLICY_VERSION,
      freeze: PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION,
      base: PRODUCT_INTELLIGENCE_POLICY_BASE,
    },
    compatibility: {
      id: PRODUCT_INTELLIGENCE_COMPATIBILITY_ID,
      version: PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION,
      freeze: PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
      base: PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE,
    },
    governance: {
      id: PRODUCT_INTELLIGENCE_GOVERNANCE_ID,
      version: PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION,
      freeze: PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
      base: PRODUCT_INTELLIGENCE_GOVERNANCE_BASE,
    },
    lifecycle: {
      id: PRODUCT_INTELLIGENCE_LIFECYCLE_ID,
      version: PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION,
      freeze: PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
      base: PRODUCT_INTELLIGENCE_LIFECYCLE_BASE,
    },
  };

export const PRODUCT_INTELLIGENCE_FREEZE_LOCK: ProductIntelligenceFreezeLock = {
  version: PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION,
  base: PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_INTELLIGENCE_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
  signoff: PRODUCT_INTELLIGENCE_SIGNOFF_VERSION,
  osBaseline: ENTERPRISE_PRODUCT_OS_BASELINE_ID,
  phases: PRODUCT_INTELLIGENCE_PHASE_VERSIONS,
  components: PRODUCT_INTELLIGENCE_COMPONENT_LOCK,
  readOnly: true,
  noNewCapability: true,
};

export function isProductIntelligenceFreezeLockIntact(
  lock: ProductIntelligenceFreezeLock = PRODUCT_INTELLIGENCE_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.noNewCapability === true &&
    lock.baselineId === "enterprise-product-intelligence-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-intelligence-baseline-v1" &&
    lock.base === PRODUCT_INTELLIGENCE_LIFECYCLE_ID &&
    lock.osBaseline === "enterprise-product-os-baseline-v1" &&
    lock.phases.foundation.id === PRODUCT_INTELLIGENCE_FOUNDATION_ID &&
    lock.phases.foundation.base === ENTERPRISE_PRODUCT_OS_BASELINE_ID &&
    lock.phases.catalog.base === PRODUCT_INTELLIGENCE_FOUNDATION_ID &&
    lock.phases.dependency.base === PRODUCT_INTELLIGENCE_CATALOG_ID &&
    lock.phases.policy.base === PRODUCT_INTELLIGENCE_DEPENDENCY_ID &&
    lock.phases.compatibility.base === PRODUCT_INTELLIGENCE_POLICY_ID &&
    lock.phases.governance.base === PRODUCT_INTELLIGENCE_COMPATIBILITY_ID &&
    lock.phases.lifecycle.base === PRODUCT_INTELLIGENCE_GOVERNANCE_ID &&
    lock.phases.lifecycle.id === PRODUCT_INTELLIGENCE_LIFECYCLE_ID &&
    lock.components.length === 8
  );
}
