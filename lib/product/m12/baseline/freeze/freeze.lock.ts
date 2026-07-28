/**
 * Product M12 — AI Agent Platform Baseline Freeze lock (read-only)
 * Freezes Foundation → Catalog → Dependency → Policy → Compatibility → Governance → Lifecycle
 * BASE: enterprise-product-agent-lifecycle-v1
 * Isolated namespace: lib/product/m12/baseline
 * Does not modify upstream agent module sources
 */

import { ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID } from "../../../m11/baseline/freeze/freeze.lock";
import {
  PRODUCT_AGENT_CATALOG_BASE,
  PRODUCT_AGENT_CATALOG_FREEZE_VERSION,
  PRODUCT_AGENT_CATALOG_ID,
  PRODUCT_AGENT_CATALOG_VERSION,
} from "../../catalog/catalog.constants";
import {
  PRODUCT_AGENT_COMPATIBILITY_BASE,
  PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_AGENT_COMPATIBILITY_ID,
  PRODUCT_AGENT_COMPATIBILITY_VERSION,
} from "../../compatibility-runtime/compatibility.constants";
import {
  PRODUCT_AGENT_DEPENDENCY_BASE,
  PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_AGENT_DEPENDENCY_ID,
  PRODUCT_AGENT_DEPENDENCY_VERSION,
} from "../../dependency-runtime/dependency.constants";
import {
  PRODUCT_AGENT_FOUNDATION_BASE,
  PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AGENT_FOUNDATION_ID,
  PRODUCT_AGENT_FOUNDATION_VERSION,
} from "../../foundation/agent.constants";
import {
  PRODUCT_AGENT_GOVERNANCE_BASE,
  PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AGENT_GOVERNANCE_ID,
  PRODUCT_AGENT_GOVERNANCE_VERSION,
} from "../../governance/governance.constants";
import {
  PRODUCT_AGENT_LIFECYCLE_BASE,
  PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_AGENT_LIFECYCLE_ID,
  PRODUCT_AGENT_LIFECYCLE_VERSION,
} from "../../lifecycle-runtime/lifecycle.constants";
import {
  PRODUCT_AGENT_POLICY_BASE,
  PRODUCT_AGENT_POLICY_FREEZE_VERSION,
  PRODUCT_AGENT_POLICY_ID,
  PRODUCT_AGENT_POLICY_VERSION,
} from "../../policy-runtime/policy.constants";

export const PRODUCT_AGENT_SIGNOFF_VERSION =
  "product-agent-baseline-signoff-1" as const;

export const PRODUCT_AGENT_BASELINE_FREEZE_VERSION =
  "product-agent-baseline-freeze-1" as const;

export const PRODUCT_AGENT_BASELINE_FREEZE_BASE =
  "enterprise-product-agent-lifecycle-v1" as const;

export const PRODUCT_AGENT_BASELINE_ID =
  "enterprise-product-agent-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_AGENT_BASELINE_ID =
  "enterprise-product-agent-baseline-v1" as const;

export type ProductAgentComponentId =
  | "agent-foundation"
  | "agent-catalog"
  | "agent-dependency"
  | "agent-policy"
  | "agent-compatibility"
  | "agent-governance"
  | "agent-lifecycle"
  | "agent-freeze";

export type ProductAgentComponentLock = {
  id: ProductAgentComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductAgentPhaseVersions = {
  foundation: {
    id: typeof PRODUCT_AGENT_FOUNDATION_ID;
    version: typeof PRODUCT_AGENT_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_AGENT_FOUNDATION_BASE;
  };
  catalog: {
    id: typeof PRODUCT_AGENT_CATALOG_ID;
    version: typeof PRODUCT_AGENT_CATALOG_VERSION;
    freeze: typeof PRODUCT_AGENT_CATALOG_FREEZE_VERSION;
    base: typeof PRODUCT_AGENT_CATALOG_BASE;
  };
  dependency: {
    id: typeof PRODUCT_AGENT_DEPENDENCY_ID;
    version: typeof PRODUCT_AGENT_DEPENDENCY_VERSION;
    freeze: typeof PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION;
    base: typeof PRODUCT_AGENT_DEPENDENCY_BASE;
  };
  policy: {
    id: typeof PRODUCT_AGENT_POLICY_ID;
    version: typeof PRODUCT_AGENT_POLICY_VERSION;
    freeze: typeof PRODUCT_AGENT_POLICY_FREEZE_VERSION;
    base: typeof PRODUCT_AGENT_POLICY_BASE;
  };
  compatibility: {
    id: typeof PRODUCT_AGENT_COMPATIBILITY_ID;
    version: typeof PRODUCT_AGENT_COMPATIBILITY_VERSION;
    freeze: typeof PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION;
    base: typeof PRODUCT_AGENT_COMPATIBILITY_BASE;
  };
  governance: {
    id: typeof PRODUCT_AGENT_GOVERNANCE_ID;
    version: typeof PRODUCT_AGENT_GOVERNANCE_VERSION;
    freeze: typeof PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION;
    base: typeof PRODUCT_AGENT_GOVERNANCE_BASE;
  };
  lifecycle: {
    id: typeof PRODUCT_AGENT_LIFECYCLE_ID;
    version: typeof PRODUCT_AGENT_LIFECYCLE_VERSION;
    freeze: typeof PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION;
    base: typeof PRODUCT_AGENT_LIFECYCLE_BASE;
  };
};

export type ProductAgentFreezeLock = {
  version: typeof PRODUCT_AGENT_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_AGENT_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_AGENT_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_AGENT_BASELINE_ID;
  signoff: typeof PRODUCT_AGENT_SIGNOFF_VERSION;
  knowledgeBaseline: typeof ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID;
  phases: ProductAgentPhaseVersions;
  components: ProductAgentComponentLock[];
  readOnly: true;
  noNewCapability: true;
};

export const PRODUCT_AGENT_COMPONENT_LOCK: ProductAgentComponentLock[] = [
  {
    id: "agent-foundation",
    path: "lib/product/m12/foundation/",
    label: "Product AI Agent Platform Foundation",
    required: true,
  },
  {
    id: "agent-catalog",
    path: "lib/product/m12/catalog/",
    label: "Product Agent Catalog",
    required: true,
  },
  {
    id: "agent-dependency",
    path: "lib/product/m12/dependency-runtime/",
    label: "Product Agent Dependency",
    required: true,
  },
  {
    id: "agent-policy",
    path: "lib/product/m12/policy-runtime/",
    label: "Product Agent Policy",
    required: true,
  },
  {
    id: "agent-compatibility",
    path: "lib/product/m12/compatibility-runtime/",
    label: "Product Agent Compatibility",
    required: true,
  },
  {
    id: "agent-governance",
    path: "lib/product/m12/governance/",
    label: "Product Agent Governance",
    required: true,
  },
  {
    id: "agent-lifecycle",
    path: "lib/product/m12/lifecycle-runtime/",
    label: "Product Agent Lifecycle",
    required: true,
  },
  {
    id: "agent-freeze",
    path: "lib/product/m12/baseline/",
    label: "Product AI Agent Platform Baseline Freeze",
    required: true,
  },
];

export const PRODUCT_AGENT_PHASE_VERSIONS: ProductAgentPhaseVersions = {
  foundation: {
    id: PRODUCT_AGENT_FOUNDATION_ID,
    version: PRODUCT_AGENT_FOUNDATION_VERSION,
    freeze: PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_AGENT_FOUNDATION_BASE,
  },
  catalog: {
    id: PRODUCT_AGENT_CATALOG_ID,
    version: PRODUCT_AGENT_CATALOG_VERSION,
    freeze: PRODUCT_AGENT_CATALOG_FREEZE_VERSION,
    base: PRODUCT_AGENT_CATALOG_BASE,
  },
  dependency: {
    id: PRODUCT_AGENT_DEPENDENCY_ID,
    version: PRODUCT_AGENT_DEPENDENCY_VERSION,
    freeze: PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION,
    base: PRODUCT_AGENT_DEPENDENCY_BASE,
  },
  policy: {
    id: PRODUCT_AGENT_POLICY_ID,
    version: PRODUCT_AGENT_POLICY_VERSION,
    freeze: PRODUCT_AGENT_POLICY_FREEZE_VERSION,
    base: PRODUCT_AGENT_POLICY_BASE,
  },
  compatibility: {
    id: PRODUCT_AGENT_COMPATIBILITY_ID,
    version: PRODUCT_AGENT_COMPATIBILITY_VERSION,
    freeze: PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION,
    base: PRODUCT_AGENT_COMPATIBILITY_BASE,
  },
  governance: {
    id: PRODUCT_AGENT_GOVERNANCE_ID,
    version: PRODUCT_AGENT_GOVERNANCE_VERSION,
    freeze: PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_AGENT_GOVERNANCE_BASE,
  },
  lifecycle: {
    id: PRODUCT_AGENT_LIFECYCLE_ID,
    version: PRODUCT_AGENT_LIFECYCLE_VERSION,
    freeze: PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_AGENT_LIFECYCLE_BASE,
  },
};

export const PRODUCT_AGENT_FREEZE_LOCK: ProductAgentFreezeLock = {
  version: PRODUCT_AGENT_BASELINE_FREEZE_VERSION,
  base: PRODUCT_AGENT_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_AGENT_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
  signoff: PRODUCT_AGENT_SIGNOFF_VERSION,
  knowledgeBaseline: ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
  phases: PRODUCT_AGENT_PHASE_VERSIONS,
  components: PRODUCT_AGENT_COMPONENT_LOCK,
  readOnly: true,
  noNewCapability: true,
};

export function isProductAgentFreezeLockIntact(
  lock: ProductAgentFreezeLock = PRODUCT_AGENT_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.noNewCapability === true &&
    lock.baselineId === "enterprise-product-agent-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-agent-baseline-v1" &&
    lock.base === PRODUCT_AGENT_LIFECYCLE_ID &&
    lock.knowledgeBaseline ===
      "enterprise-product-knowledge-baseline-v1" &&
    lock.phases.foundation.id === PRODUCT_AGENT_FOUNDATION_ID &&
    lock.phases.foundation.base === ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID &&
    lock.phases.catalog.base === PRODUCT_AGENT_FOUNDATION_ID &&
    lock.phases.dependency.base === PRODUCT_AGENT_CATALOG_ID &&
    lock.phases.policy.base === PRODUCT_AGENT_DEPENDENCY_ID &&
    lock.phases.compatibility.base === PRODUCT_AGENT_POLICY_ID &&
    lock.phases.governance.base === PRODUCT_AGENT_COMPATIBILITY_ID &&
    lock.phases.lifecycle.base === PRODUCT_AGENT_GOVERNANCE_ID &&
    lock.phases.lifecycle.id === PRODUCT_AGENT_LIFECYCLE_ID &&
    lock.components.length === 8
  );
}
