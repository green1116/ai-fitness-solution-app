/**
 * Product M11 — Knowledge Platform Baseline Freeze lock (read-only)
 * Freezes Foundation → Catalog → Dependency → Policy → Compatibility → Governance → Lifecycle
 * BASE: enterprise-product-knowledge-lifecycle-v1
 * Isolated namespace: lib/product/m11/baseline
 * Does not modify upstream knowledge module sources
 */

import { ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID } from "../../../m10/baseline/freeze/freeze.lock";
import {
  PRODUCT_KNOWLEDGE_CATALOG_BASE,
  PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_CATALOG_ID,
  PRODUCT_KNOWLEDGE_CATALOG_VERSION,
} from "../../catalog/catalog.constants";
import {
  PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION,
} from "../../compatibility-runtime/compatibility.constants";
import {
  PRODUCT_KNOWLEDGE_DEPENDENCY_BASE,
  PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
  PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION,
} from "../../dependency-runtime/dependency.constants";
import {
  PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
  PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_FOUNDATION_ID,
  PRODUCT_KNOWLEDGE_FOUNDATION_VERSION,
} from "../../foundation/knowledge.constants";
import {
  PRODUCT_KNOWLEDGE_GOVERNANCE_BASE,
  PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
  PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION,
} from "../../governance/governance.constants";
import {
  PRODUCT_KNOWLEDGE_LIFECYCLE_BASE,
  PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
  PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION,
} from "../../lifecycle-runtime/lifecycle.constants";
import {
  PRODUCT_KNOWLEDGE_POLICY_BASE,
  PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_POLICY_ID,
  PRODUCT_KNOWLEDGE_POLICY_VERSION,
} from "../../policy-runtime/policy.constants";

export const PRODUCT_KNOWLEDGE_SIGNOFF_VERSION =
  "product-knowledge-baseline-signoff-1" as const;

export const PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION =
  "product-knowledge-baseline-freeze-1" as const;

export const PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE =
  "enterprise-product-knowledge-lifecycle-v1" as const;

export const PRODUCT_KNOWLEDGE_BASELINE_ID =
  "enterprise-product-knowledge-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID =
  "enterprise-product-knowledge-baseline-v1" as const;

export type ProductKnowledgeComponentId =
  | "knowledge-foundation"
  | "knowledge-catalog"
  | "knowledge-dependency"
  | "knowledge-policy"
  | "knowledge-compatibility"
  | "knowledge-governance"
  | "knowledge-lifecycle"
  | "knowledge-freeze";

export type ProductKnowledgeComponentLock = {
  id: ProductKnowledgeComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductKnowledgePhaseVersions = {
  foundation: {
    id: typeof PRODUCT_KNOWLEDGE_FOUNDATION_ID;
    version: typeof PRODUCT_KNOWLEDGE_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_KNOWLEDGE_FOUNDATION_BASE;
  };
  catalog: {
    id: typeof PRODUCT_KNOWLEDGE_CATALOG_ID;
    version: typeof PRODUCT_KNOWLEDGE_CATALOG_VERSION;
    freeze: typeof PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION;
    base: typeof PRODUCT_KNOWLEDGE_CATALOG_BASE;
  };
  dependency: {
    id: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_ID;
    version: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION;
    freeze: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION;
    base: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_BASE;
  };
  policy: {
    id: typeof PRODUCT_KNOWLEDGE_POLICY_ID;
    version: typeof PRODUCT_KNOWLEDGE_POLICY_VERSION;
    freeze: typeof PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION;
    base: typeof PRODUCT_KNOWLEDGE_POLICY_BASE;
  };
  compatibility: {
    id: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_ID;
    version: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION;
    freeze: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION;
    base: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE;
  };
  governance: {
    id: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_ID;
    version: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION;
    freeze: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION;
    base: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_BASE;
  };
  lifecycle: {
    id: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_ID;
    version: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION;
    freeze: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION;
    base: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_BASE;
  };
};

export type ProductKnowledgeFreezeLock = {
  version: typeof PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_KNOWLEDGE_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID;
  signoff: typeof PRODUCT_KNOWLEDGE_SIGNOFF_VERSION;
  runtimeBaseline: typeof ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID;
  phases: ProductKnowledgePhaseVersions;
  components: ProductKnowledgeComponentLock[];
  readOnly: true;
  noNewCapability: true;
};

export const PRODUCT_KNOWLEDGE_COMPONENT_LOCK: ProductKnowledgeComponentLock[] =
  [
    {
      id: "knowledge-foundation",
      path: "lib/product/m11/foundation/",
      label: "Product Knowledge Platform Foundation",
      required: true,
    },
    {
      id: "knowledge-catalog",
      path: "lib/product/m11/catalog/",
      label: "Product Knowledge Catalog",
      required: true,
    },
    {
      id: "knowledge-dependency",
      path: "lib/product/m11/dependency-runtime/",
      label: "Product Knowledge Dependency",
      required: true,
    },
    {
      id: "knowledge-policy",
      path: "lib/product/m11/policy-runtime/",
      label: "Product Knowledge Policy",
      required: true,
    },
    {
      id: "knowledge-compatibility",
      path: "lib/product/m11/compatibility-runtime/",
      label: "Product Knowledge Compatibility",
      required: true,
    },
    {
      id: "knowledge-governance",
      path: "lib/product/m11/governance/",
      label: "Product Knowledge Governance",
      required: true,
    },
    {
      id: "knowledge-lifecycle",
      path: "lib/product/m11/lifecycle-runtime/",
      label: "Product Knowledge Lifecycle",
      required: true,
    },
    {
      id: "knowledge-freeze",
      path: "lib/product/m11/baseline/",
      label: "Product Knowledge Platform Baseline Freeze",
      required: true,
    },
  ];

export const PRODUCT_KNOWLEDGE_PHASE_VERSIONS: ProductKnowledgePhaseVersions = {
  foundation: {
    id: PRODUCT_KNOWLEDGE_FOUNDATION_ID,
    version: PRODUCT_KNOWLEDGE_FOUNDATION_VERSION,
    freeze: PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
  },
  catalog: {
    id: PRODUCT_KNOWLEDGE_CATALOG_ID,
    version: PRODUCT_KNOWLEDGE_CATALOG_VERSION,
    freeze: PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_CATALOG_BASE,
  },
  dependency: {
    id: PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
    version: PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION,
    freeze: PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_DEPENDENCY_BASE,
  },
  policy: {
    id: PRODUCT_KNOWLEDGE_POLICY_ID,
    version: PRODUCT_KNOWLEDGE_POLICY_VERSION,
    freeze: PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_POLICY_BASE,
  },
  compatibility: {
    id: PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
    version: PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION,
    freeze: PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE,
  },
  governance: {
    id: PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
    version: PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION,
    freeze: PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_GOVERNANCE_BASE,
  },
  lifecycle: {
    id: PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
    version: PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION,
    freeze: PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_LIFECYCLE_BASE,
  },
};

export const PRODUCT_KNOWLEDGE_FREEZE_LOCK: ProductKnowledgeFreezeLock = {
  version: PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION,
  base: PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_KNOWLEDGE_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
  signoff: PRODUCT_KNOWLEDGE_SIGNOFF_VERSION,
  runtimeBaseline: ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
  phases: PRODUCT_KNOWLEDGE_PHASE_VERSIONS,
  components: PRODUCT_KNOWLEDGE_COMPONENT_LOCK,
  readOnly: true,
  noNewCapability: true,
};

export function isProductKnowledgeFreezeLockIntact(
  lock: ProductKnowledgeFreezeLock = PRODUCT_KNOWLEDGE_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.noNewCapability === true &&
    lock.baselineId === "enterprise-product-knowledge-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-knowledge-baseline-v1" &&
    lock.base === PRODUCT_KNOWLEDGE_LIFECYCLE_ID &&
    lock.runtimeBaseline === "enterprise-product-ai-runtime-baseline-v1" &&
    lock.phases.foundation.id === PRODUCT_KNOWLEDGE_FOUNDATION_ID &&
    lock.phases.foundation.base === ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID &&
    lock.phases.catalog.base === PRODUCT_KNOWLEDGE_FOUNDATION_ID &&
    lock.phases.dependency.base === PRODUCT_KNOWLEDGE_CATALOG_ID &&
    lock.phases.policy.base === PRODUCT_KNOWLEDGE_DEPENDENCY_ID &&
    lock.phases.compatibility.base === PRODUCT_KNOWLEDGE_POLICY_ID &&
    lock.phases.governance.base === PRODUCT_KNOWLEDGE_COMPATIBILITY_ID &&
    lock.phases.lifecycle.base === PRODUCT_KNOWLEDGE_GOVERNANCE_ID &&
    lock.phases.lifecycle.id === PRODUCT_KNOWLEDGE_LIFECYCLE_ID &&
    lock.components.length === 8
  );
}
