/**
 * Product M13 — Enterprise Operating System Baseline Freeze lock (read-only)
 * Freezes Foundation → Catalog → Dependency → Policy → Compatibility → Governance → Lifecycle
 * BASE: enterprise-product-os-lifecycle-v1
 * Isolated namespace: lib/product/m13/baseline
 * Does not modify upstream OS module sources
 */

import { ENTERPRISE_PRODUCT_AGENT_BASELINE_ID } from "../../../m12/baseline/freeze/freeze.lock";
import {
  PRODUCT_OS_CATALOG_BASE,
  PRODUCT_OS_CATALOG_FREEZE_VERSION,
  PRODUCT_OS_CATALOG_ID,
  PRODUCT_OS_CATALOG_VERSION,
} from "../../catalog-runtime/catalog.constants";
import {
  PRODUCT_OS_COMPATIBILITY_BASE,
  PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_OS_COMPATIBILITY_ID,
  PRODUCT_OS_COMPATIBILITY_VERSION,
} from "../../compatibility-runtime/compatibility.constants";
import {
  PRODUCT_OS_DEPENDENCY_BASE,
  PRODUCT_OS_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_OS_DEPENDENCY_ID,
  PRODUCT_OS_DEPENDENCY_VERSION,
} from "../../dependency-runtime/dependency.constants";
import {
  PRODUCT_OS_FOUNDATION_BASE,
  PRODUCT_OS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_OS_FOUNDATION_ID,
  PRODUCT_OS_FOUNDATION_VERSION,
} from "../../foundation/os.constants";
import {
  PRODUCT_OS_GOVERNANCE_BASE,
  PRODUCT_OS_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_OS_GOVERNANCE_ID,
  PRODUCT_OS_GOVERNANCE_VERSION,
} from "../../governance/governance.constants";
import {
  PRODUCT_OS_LIFECYCLE_BASE,
  PRODUCT_OS_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_OS_LIFECYCLE_ID,
  PRODUCT_OS_LIFECYCLE_VERSION,
} from "../../lifecycle-runtime/lifecycle.constants";
import {
  PRODUCT_OS_POLICY_BASE,
  PRODUCT_OS_POLICY_FREEZE_VERSION,
  PRODUCT_OS_POLICY_ID,
  PRODUCT_OS_POLICY_VERSION,
} from "../../policy-runtime/policy.constants";

export const PRODUCT_OS_SIGNOFF_VERSION =
  "product-os-baseline-signoff-1" as const;

export const PRODUCT_OS_BASELINE_FREEZE_VERSION =
  "product-os-baseline-freeze-1" as const;

export const PRODUCT_OS_BASELINE_FREEZE_BASE =
  "enterprise-product-os-lifecycle-v1" as const;

export const PRODUCT_OS_BASELINE_ID =
  "enterprise-product-os-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_OS_BASELINE_ID =
  "enterprise-product-os-baseline-v1" as const;

export type ProductOsComponentId =
  | "os-foundation"
  | "os-catalog"
  | "os-dependency"
  | "os-policy"
  | "os-compatibility"
  | "os-governance"
  | "os-lifecycle"
  | "os-freeze";

export type ProductOsComponentLock = {
  id: ProductOsComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductOsPhaseVersions = {
  foundation: {
    id: typeof PRODUCT_OS_FOUNDATION_ID;
    version: typeof PRODUCT_OS_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_OS_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_OS_FOUNDATION_BASE;
  };
  catalog: {
    id: typeof PRODUCT_OS_CATALOG_ID;
    version: typeof PRODUCT_OS_CATALOG_VERSION;
    freeze: typeof PRODUCT_OS_CATALOG_FREEZE_VERSION;
    base: typeof PRODUCT_OS_CATALOG_BASE;
  };
  dependency: {
    id: typeof PRODUCT_OS_DEPENDENCY_ID;
    version: typeof PRODUCT_OS_DEPENDENCY_VERSION;
    freeze: typeof PRODUCT_OS_DEPENDENCY_FREEZE_VERSION;
    base: typeof PRODUCT_OS_DEPENDENCY_BASE;
  };
  policy: {
    id: typeof PRODUCT_OS_POLICY_ID;
    version: typeof PRODUCT_OS_POLICY_VERSION;
    freeze: typeof PRODUCT_OS_POLICY_FREEZE_VERSION;
    base: typeof PRODUCT_OS_POLICY_BASE;
  };
  compatibility: {
    id: typeof PRODUCT_OS_COMPATIBILITY_ID;
    version: typeof PRODUCT_OS_COMPATIBILITY_VERSION;
    freeze: typeof PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION;
    base: typeof PRODUCT_OS_COMPATIBILITY_BASE;
  };
  governance: {
    id: typeof PRODUCT_OS_GOVERNANCE_ID;
    version: typeof PRODUCT_OS_GOVERNANCE_VERSION;
    freeze: typeof PRODUCT_OS_GOVERNANCE_FREEZE_VERSION;
    base: typeof PRODUCT_OS_GOVERNANCE_BASE;
  };
  lifecycle: {
    id: typeof PRODUCT_OS_LIFECYCLE_ID;
    version: typeof PRODUCT_OS_LIFECYCLE_VERSION;
    freeze: typeof PRODUCT_OS_LIFECYCLE_FREEZE_VERSION;
    base: typeof PRODUCT_OS_LIFECYCLE_BASE;
  };
};

export type ProductOsFreezeLock = {
  version: typeof PRODUCT_OS_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_OS_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_OS_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_OS_BASELINE_ID;
  signoff: typeof PRODUCT_OS_SIGNOFF_VERSION;
  agentBaseline: typeof ENTERPRISE_PRODUCT_AGENT_BASELINE_ID;
  phases: ProductOsPhaseVersions;
  components: ProductOsComponentLock[];
  readOnly: true;
  noNewCapability: true;
};

export const PRODUCT_OS_COMPONENT_LOCK: ProductOsComponentLock[] = [
  {
    id: "os-foundation",
    path: "lib/product/m13/foundation/",
    label: "Product Enterprise Operating System Foundation",
    required: true,
  },
  {
    id: "os-catalog",
    path: "lib/product/m13/catalog-runtime/",
    label: "Product OS Catalog",
    required: true,
  },
  {
    id: "os-dependency",
    path: "lib/product/m13/dependency-runtime/",
    label: "Product OS Dependency",
    required: true,
  },
  {
    id: "os-policy",
    path: "lib/product/m13/policy-runtime/",
    label: "Product OS Policy",
    required: true,
  },
  {
    id: "os-compatibility",
    path: "lib/product/m13/compatibility-runtime/",
    label: "Product OS Compatibility",
    required: true,
  },
  {
    id: "os-governance",
    path: "lib/product/m13/governance/",
    label: "Product OS Governance",
    required: true,
  },
  {
    id: "os-lifecycle",
    path: "lib/product/m13/lifecycle-runtime/",
    label: "Product OS Lifecycle",
    required: true,
  },
  {
    id: "os-freeze",
    path: "lib/product/m13/baseline/",
    label: "Product Enterprise Operating System Baseline Freeze",
    required: true,
  },
];

export const PRODUCT_OS_PHASE_VERSIONS: ProductOsPhaseVersions = {
  foundation: {
    id: PRODUCT_OS_FOUNDATION_ID,
    version: PRODUCT_OS_FOUNDATION_VERSION,
    freeze: PRODUCT_OS_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_OS_FOUNDATION_BASE,
  },
  catalog: {
    id: PRODUCT_OS_CATALOG_ID,
    version: PRODUCT_OS_CATALOG_VERSION,
    freeze: PRODUCT_OS_CATALOG_FREEZE_VERSION,
    base: PRODUCT_OS_CATALOG_BASE,
  },
  dependency: {
    id: PRODUCT_OS_DEPENDENCY_ID,
    version: PRODUCT_OS_DEPENDENCY_VERSION,
    freeze: PRODUCT_OS_DEPENDENCY_FREEZE_VERSION,
    base: PRODUCT_OS_DEPENDENCY_BASE,
  },
  policy: {
    id: PRODUCT_OS_POLICY_ID,
    version: PRODUCT_OS_POLICY_VERSION,
    freeze: PRODUCT_OS_POLICY_FREEZE_VERSION,
    base: PRODUCT_OS_POLICY_BASE,
  },
  compatibility: {
    id: PRODUCT_OS_COMPATIBILITY_ID,
    version: PRODUCT_OS_COMPATIBILITY_VERSION,
    freeze: PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION,
    base: PRODUCT_OS_COMPATIBILITY_BASE,
  },
  governance: {
    id: PRODUCT_OS_GOVERNANCE_ID,
    version: PRODUCT_OS_GOVERNANCE_VERSION,
    freeze: PRODUCT_OS_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_OS_GOVERNANCE_BASE,
  },
  lifecycle: {
    id: PRODUCT_OS_LIFECYCLE_ID,
    version: PRODUCT_OS_LIFECYCLE_VERSION,
    freeze: PRODUCT_OS_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_OS_LIFECYCLE_BASE,
  },
};

export const PRODUCT_OS_FREEZE_LOCK: ProductOsFreezeLock = {
  version: PRODUCT_OS_BASELINE_FREEZE_VERSION,
  base: PRODUCT_OS_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_OS_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_OS_BASELINE_ID,
  signoff: PRODUCT_OS_SIGNOFF_VERSION,
  agentBaseline: ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
  phases: PRODUCT_OS_PHASE_VERSIONS,
  components: PRODUCT_OS_COMPONENT_LOCK,
  readOnly: true,
  noNewCapability: true,
};

export function isProductOsFreezeLockIntact(
  lock: ProductOsFreezeLock = PRODUCT_OS_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.noNewCapability === true &&
    lock.baselineId === "enterprise-product-os-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-os-baseline-v1" &&
    lock.base === PRODUCT_OS_LIFECYCLE_ID &&
    lock.agentBaseline === "enterprise-product-agent-baseline-v1" &&
    lock.phases.foundation.id === PRODUCT_OS_FOUNDATION_ID &&
    lock.phases.foundation.base === ENTERPRISE_PRODUCT_AGENT_BASELINE_ID &&
    lock.phases.catalog.base === PRODUCT_OS_FOUNDATION_ID &&
    lock.phases.dependency.base === PRODUCT_OS_CATALOG_ID &&
    lock.phases.policy.base === PRODUCT_OS_DEPENDENCY_ID &&
    lock.phases.compatibility.base === PRODUCT_OS_POLICY_ID &&
    lock.phases.governance.base === PRODUCT_OS_COMPATIBILITY_ID &&
    lock.phases.lifecycle.base === PRODUCT_OS_GOVERNANCE_ID &&
    lock.phases.lifecycle.id === PRODUCT_OS_LIFECYCLE_ID &&
    lock.components.length === 8
  );
}
