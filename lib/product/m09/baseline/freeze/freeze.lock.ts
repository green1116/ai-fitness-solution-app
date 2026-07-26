/**
 * Product M09 — AI Governance Freeze lock (read-only)
 * Freezes Foundation → Model → Prompt → Workflow → Orchestration → Governance → Audit
 * BASE: enterprise-product-ai-audit-v1
 * Isolated namespace: lib/product/m09/baseline
 * Does not modify upstream AI module sources
 */

import { ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID } from "../../../marketplace-baseline/freeze/freeze.lock";
import {
  PRODUCT_AI_AUDIT_BASE,
  PRODUCT_AI_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_AUDIT_ID,
  PRODUCT_AI_AUDIT_VERSION,
} from "../../audit/audit.constants";
import {
  PRODUCT_AI_FOUNDATION_BASE,
  PRODUCT_AI_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_FOUNDATION_ID,
  PRODUCT_AI_FOUNDATION_VERSION,
} from "../../foundation/ai.constants";
import {
  PRODUCT_AI_GOVERNANCE_BASE,
  PRODUCT_AI_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_GOVERNANCE_ID,
  PRODUCT_AI_GOVERNANCE_VERSION,
} from "../../governance/governance.constants";
import {
  PRODUCT_AI_MODEL_REGISTRY_BASE,
  PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION,
  PRODUCT_AI_MODEL_REGISTRY_ID,
  PRODUCT_AI_MODEL_REGISTRY_VERSION,
} from "../../model/model.constants";
import {
  PRODUCT_AI_ORCHESTRATION_BASE,
  PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION,
  PRODUCT_AI_ORCHESTRATION_ID,
  PRODUCT_AI_ORCHESTRATION_VERSION,
} from "../../orchestration/orchestration.constants";
import {
  PRODUCT_AI_PROMPT_ENGINE_BASE,
  PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_PROMPT_ENGINE_ID,
  PRODUCT_AI_PROMPT_ENGINE_VERSION,
} from "../../prompt-engine/prompt.constants";
import {
  PRODUCT_AI_WORKFLOW_ENGINE_BASE,
  PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_WORKFLOW_ENGINE_ID,
  PRODUCT_AI_WORKFLOW_ENGINE_VERSION,
} from "../../workflow-engine/workflow.constants";

export const PRODUCT_AI_SIGNOFF_VERSION =
  "product-ai-baseline-signoff-1" as const;

export const PRODUCT_AI_BASELINE_FREEZE_VERSION =
  "product-ai-baseline-freeze-1" as const;

export const PRODUCT_AI_BASELINE_FREEZE_BASE =
  "enterprise-product-ai-audit-v1" as const;

export const PRODUCT_AI_BASELINE_ID =
  "enterprise-product-ai-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_AI_BASELINE_ID =
  "enterprise-product-ai-baseline-v1" as const;

export type ProductAiComponentId =
  | "ai-foundation"
  | "ai-model"
  | "ai-prompt-engine"
  | "ai-workflow-engine"
  | "ai-orchestration"
  | "ai-governance"
  | "ai-audit"
  | "ai-freeze";

export type ProductAiComponentLock = {
  id: ProductAiComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductAiPhaseVersions = {
  foundation: {
    id: typeof PRODUCT_AI_FOUNDATION_ID;
    version: typeof PRODUCT_AI_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_AI_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_AI_FOUNDATION_BASE;
  };
  model: {
    id: typeof PRODUCT_AI_MODEL_REGISTRY_ID;
    version: typeof PRODUCT_AI_MODEL_REGISTRY_VERSION;
    freeze: typeof PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION;
    base: typeof PRODUCT_AI_MODEL_REGISTRY_BASE;
  };
  promptEngine: {
    id: typeof PRODUCT_AI_PROMPT_ENGINE_ID;
    version: typeof PRODUCT_AI_PROMPT_ENGINE_VERSION;
    freeze: typeof PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION;
    base: typeof PRODUCT_AI_PROMPT_ENGINE_BASE;
  };
  workflowEngine: {
    id: typeof PRODUCT_AI_WORKFLOW_ENGINE_ID;
    version: typeof PRODUCT_AI_WORKFLOW_ENGINE_VERSION;
    freeze: typeof PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION;
    base: typeof PRODUCT_AI_WORKFLOW_ENGINE_BASE;
  };
  orchestration: {
    id: typeof PRODUCT_AI_ORCHESTRATION_ID;
    version: typeof PRODUCT_AI_ORCHESTRATION_VERSION;
    freeze: typeof PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION;
    base: typeof PRODUCT_AI_ORCHESTRATION_BASE;
  };
  governance: {
    id: typeof PRODUCT_AI_GOVERNANCE_ID;
    version: typeof PRODUCT_AI_GOVERNANCE_VERSION;
    freeze: typeof PRODUCT_AI_GOVERNANCE_FREEZE_VERSION;
    base: typeof PRODUCT_AI_GOVERNANCE_BASE;
  };
  audit: {
    id: typeof PRODUCT_AI_AUDIT_ID;
    version: typeof PRODUCT_AI_AUDIT_VERSION;
    freeze: typeof PRODUCT_AI_AUDIT_FREEZE_VERSION;
    base: typeof PRODUCT_AI_AUDIT_BASE;
  };
};

export type ProductAiFreezeLock = {
  version: typeof PRODUCT_AI_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_AI_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_AI_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_AI_BASELINE_ID;
  signoff: typeof PRODUCT_AI_SIGNOFF_VERSION;
  marketplaceBaseline: typeof ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID;
  phases: ProductAiPhaseVersions;
  components: ProductAiComponentLock[];
  readOnly: true;
  noNewCapability: true;
};

export const PRODUCT_AI_COMPONENT_LOCK: ProductAiComponentLock[] = [
  {
    id: "ai-foundation",
    path: "lib/product/m09/foundation/",
    label: "Product AI Foundation",
    required: true,
  },
  {
    id: "ai-model",
    path: "lib/product/m09/model/",
    label: "Product AI Model Registry",
    required: true,
  },
  {
    id: "ai-prompt-engine",
    path: "lib/product/m09/prompt-engine/",
    label: "Product AI Prompt Engine",
    required: true,
  },
  {
    id: "ai-workflow-engine",
    path: "lib/product/m09/workflow-engine/",
    label: "Product AI Workflow Engine",
    required: true,
  },
  {
    id: "ai-orchestration",
    path: "lib/product/m09/orchestration/",
    label: "Product AI Orchestration",
    required: true,
  },
  {
    id: "ai-governance",
    path: "lib/product/m09/governance/",
    label: "Product AI Governance",
    required: true,
  },
  {
    id: "ai-audit",
    path: "lib/product/m09/audit/",
    label: "Product AI Audit",
    required: true,
  },
  {
    id: "ai-freeze",
    path: "lib/product/m09/baseline/",
    label: "Product AI Governance Freeze",
    required: true,
  },
];

export const PRODUCT_AI_PHASE_VERSIONS: ProductAiPhaseVersions = {
  foundation: {
    id: PRODUCT_AI_FOUNDATION_ID,
    version: PRODUCT_AI_FOUNDATION_VERSION,
    freeze: PRODUCT_AI_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_AI_FOUNDATION_BASE,
  },
  model: {
    id: PRODUCT_AI_MODEL_REGISTRY_ID,
    version: PRODUCT_AI_MODEL_REGISTRY_VERSION,
    freeze: PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION,
    base: PRODUCT_AI_MODEL_REGISTRY_BASE,
  },
  promptEngine: {
    id: PRODUCT_AI_PROMPT_ENGINE_ID,
    version: PRODUCT_AI_PROMPT_ENGINE_VERSION,
    freeze: PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION,
    base: PRODUCT_AI_PROMPT_ENGINE_BASE,
  },
  workflowEngine: {
    id: PRODUCT_AI_WORKFLOW_ENGINE_ID,
    version: PRODUCT_AI_WORKFLOW_ENGINE_VERSION,
    freeze: PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION,
    base: PRODUCT_AI_WORKFLOW_ENGINE_BASE,
  },
  orchestration: {
    id: PRODUCT_AI_ORCHESTRATION_ID,
    version: PRODUCT_AI_ORCHESTRATION_VERSION,
    freeze: PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION,
    base: PRODUCT_AI_ORCHESTRATION_BASE,
  },
  governance: {
    id: PRODUCT_AI_GOVERNANCE_ID,
    version: PRODUCT_AI_GOVERNANCE_VERSION,
    freeze: PRODUCT_AI_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_AI_GOVERNANCE_BASE,
  },
  audit: {
    id: PRODUCT_AI_AUDIT_ID,
    version: PRODUCT_AI_AUDIT_VERSION,
    freeze: PRODUCT_AI_AUDIT_FREEZE_VERSION,
    base: PRODUCT_AI_AUDIT_BASE,
  },
};

export const PRODUCT_AI_FREEZE_LOCK: ProductAiFreezeLock = {
  version: PRODUCT_AI_BASELINE_FREEZE_VERSION,
  base: PRODUCT_AI_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_AI_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_AI_BASELINE_ID,
  signoff: PRODUCT_AI_SIGNOFF_VERSION,
  marketplaceBaseline: ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID,
  phases: PRODUCT_AI_PHASE_VERSIONS,
  components: PRODUCT_AI_COMPONENT_LOCK,
  readOnly: true,
  noNewCapability: true,
};

export function isProductAiFreezeLockIntact(
  lock: ProductAiFreezeLock = PRODUCT_AI_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.noNewCapability === true &&
    lock.baselineId === "enterprise-product-ai-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-ai-baseline-v1" &&
    lock.base === PRODUCT_AI_AUDIT_ID &&
    lock.marketplaceBaseline ===
      "enterprise-product-marketplace-baseline-v1" &&
    lock.phases.foundation.id === PRODUCT_AI_FOUNDATION_ID &&
    lock.phases.foundation.base === ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID &&
    lock.phases.model.base === PRODUCT_AI_FOUNDATION_ID &&
    lock.phases.promptEngine.base === PRODUCT_AI_MODEL_REGISTRY_ID &&
    lock.phases.workflowEngine.base === PRODUCT_AI_PROMPT_ENGINE_ID &&
    lock.phases.orchestration.base === PRODUCT_AI_WORKFLOW_ENGINE_ID &&
    lock.phases.governance.base === PRODUCT_AI_ORCHESTRATION_ID &&
    lock.phases.audit.base === PRODUCT_AI_GOVERNANCE_ID &&
    lock.phases.audit.id === PRODUCT_AI_AUDIT_ID &&
    lock.components.length === 8
  );
}
