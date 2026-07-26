/**
 * Product M10 — AI Runtime Governance Freeze lock (read-only)
 * Freezes Foundation → Job → Queue → Scheduler → Resource → Governance → Audit
 * BASE: enterprise-product-ai-runtime-audit-v1
 * Isolated namespace: lib/product/m10/baseline
 * Does not modify upstream runtime module sources
 */

import { ENTERPRISE_PRODUCT_AI_BASELINE_ID } from "../../../m09/baseline/freeze/freeze.lock";
import {
  PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
  PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_FOUNDATION_ID,
  PRODUCT_AI_RUNTIME_FOUNDATION_VERSION,
} from "../../foundation/runtime.constants";
import {
  PRODUCT_AI_JOB_RUNTIME_BASE,
  PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_JOB_RUNTIME_ID,
  PRODUCT_AI_JOB_RUNTIME_VERSION,
} from "../../job-runtime/job.constants";
import {
  PRODUCT_AI_QUEUE_RUNTIME_BASE,
  PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_QUEUE_RUNTIME_ID,
  PRODUCT_AI_QUEUE_RUNTIME_VERSION,
} from "../../queue-runtime/queue.constants";
import {
  PRODUCT_AI_RESOURCE_MANAGER_BASE,
  PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION,
  PRODUCT_AI_RESOURCE_MANAGER_ID,
  PRODUCT_AI_RESOURCE_MANAGER_VERSION,
} from "../../resource-manager/resource.constants";
import {
  PRODUCT_AI_RUNTIME_AUDIT_BASE,
  PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_AUDIT_ID,
  PRODUCT_AI_RUNTIME_AUDIT_VERSION,
} from "../../runtime-audit/audit.constants";
import {
  PRODUCT_AI_RUNTIME_GOVERNANCE_BASE,
  PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
  PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION,
} from "../../runtime-governance/governance.constants";
import {
  PRODUCT_AI_SCHEDULER_BASE,
  PRODUCT_AI_SCHEDULER_FREEZE_VERSION,
  PRODUCT_AI_SCHEDULER_ID,
  PRODUCT_AI_SCHEDULER_VERSION,
} from "../../scheduler/scheduler.constants";

export const PRODUCT_AI_RUNTIME_SIGNOFF_VERSION =
  "product-ai-runtime-baseline-signoff-1" as const;

export const PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION =
  "product-ai-runtime-baseline-freeze-1" as const;

export const PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE =
  "enterprise-product-ai-runtime-audit-v1" as const;

export const PRODUCT_AI_RUNTIME_BASELINE_ID =
  "enterprise-product-ai-runtime-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID =
  "enterprise-product-ai-runtime-baseline-v1" as const;

export type ProductAiRuntimeComponentId =
  | "ai-runtime-foundation"
  | "ai-job-runtime"
  | "ai-queue-runtime"
  | "ai-scheduler"
  | "ai-resource-manager"
  | "ai-runtime-governance"
  | "ai-runtime-audit"
  | "ai-runtime-freeze";

export type ProductAiRuntimeComponentLock = {
  id: ProductAiRuntimeComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductAiRuntimePhaseVersions = {
  foundation: {
    id: typeof PRODUCT_AI_RUNTIME_FOUNDATION_ID;
    version: typeof PRODUCT_AI_RUNTIME_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_AI_RUNTIME_FOUNDATION_BASE;
  };
  jobRuntime: {
    id: typeof PRODUCT_AI_JOB_RUNTIME_ID;
    version: typeof PRODUCT_AI_JOB_RUNTIME_VERSION;
    freeze: typeof PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION;
    base: typeof PRODUCT_AI_JOB_RUNTIME_BASE;
  };
  queueRuntime: {
    id: typeof PRODUCT_AI_QUEUE_RUNTIME_ID;
    version: typeof PRODUCT_AI_QUEUE_RUNTIME_VERSION;
    freeze: typeof PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION;
    base: typeof PRODUCT_AI_QUEUE_RUNTIME_BASE;
  };
  scheduler: {
    id: typeof PRODUCT_AI_SCHEDULER_ID;
    version: typeof PRODUCT_AI_SCHEDULER_VERSION;
    freeze: typeof PRODUCT_AI_SCHEDULER_FREEZE_VERSION;
    base: typeof PRODUCT_AI_SCHEDULER_BASE;
  };
  resourceManager: {
    id: typeof PRODUCT_AI_RESOURCE_MANAGER_ID;
    version: typeof PRODUCT_AI_RESOURCE_MANAGER_VERSION;
    freeze: typeof PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION;
    base: typeof PRODUCT_AI_RESOURCE_MANAGER_BASE;
  };
  runtimeGovernance: {
    id: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_ID;
    version: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION;
    freeze: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION;
    base: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_BASE;
  };
  runtimeAudit: {
    id: typeof PRODUCT_AI_RUNTIME_AUDIT_ID;
    version: typeof PRODUCT_AI_RUNTIME_AUDIT_VERSION;
    freeze: typeof PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION;
    base: typeof PRODUCT_AI_RUNTIME_AUDIT_BASE;
  };
};

export type ProductAiRuntimeFreezeLock = {
  version: typeof PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_AI_RUNTIME_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID;
  signoff: typeof PRODUCT_AI_RUNTIME_SIGNOFF_VERSION;
  aiBaseline: typeof ENTERPRISE_PRODUCT_AI_BASELINE_ID;
  phases: ProductAiRuntimePhaseVersions;
  components: ProductAiRuntimeComponentLock[];
  readOnly: true;
  noNewCapability: true;
};

export const PRODUCT_AI_RUNTIME_COMPONENT_LOCK: ProductAiRuntimeComponentLock[] =
  [
    {
      id: "ai-runtime-foundation",
      path: "lib/product/m10/foundation/",
      label: "Product AI Runtime Foundation",
      required: true,
    },
    {
      id: "ai-job-runtime",
      path: "lib/product/m10/job-runtime/",
      label: "Product AI Job Runtime",
      required: true,
    },
    {
      id: "ai-queue-runtime",
      path: "lib/product/m10/queue-runtime/",
      label: "Product AI Queue Runtime",
      required: true,
    },
    {
      id: "ai-scheduler",
      path: "lib/product/m10/scheduler/",
      label: "Product AI Scheduler",
      required: true,
    },
    {
      id: "ai-resource-manager",
      path: "lib/product/m10/resource-manager/",
      label: "Product AI Resource Manager",
      required: true,
    },
    {
      id: "ai-runtime-governance",
      path: "lib/product/m10/runtime-governance/",
      label: "Product AI Runtime Governance",
      required: true,
    },
    {
      id: "ai-runtime-audit",
      path: "lib/product/m10/runtime-audit/",
      label: "Product AI Runtime Audit",
      required: true,
    },
    {
      id: "ai-runtime-freeze",
      path: "lib/product/m10/baseline/",
      label: "Product AI Runtime Governance Freeze",
      required: true,
    },
  ];

export const PRODUCT_AI_RUNTIME_PHASE_VERSIONS: ProductAiRuntimePhaseVersions =
  {
    foundation: {
      id: PRODUCT_AI_RUNTIME_FOUNDATION_ID,
      version: PRODUCT_AI_RUNTIME_FOUNDATION_VERSION,
      freeze: PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION,
      base: PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
    },
    jobRuntime: {
      id: PRODUCT_AI_JOB_RUNTIME_ID,
      version: PRODUCT_AI_JOB_RUNTIME_VERSION,
      freeze: PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION,
      base: PRODUCT_AI_JOB_RUNTIME_BASE,
    },
    queueRuntime: {
      id: PRODUCT_AI_QUEUE_RUNTIME_ID,
      version: PRODUCT_AI_QUEUE_RUNTIME_VERSION,
      freeze: PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION,
      base: PRODUCT_AI_QUEUE_RUNTIME_BASE,
    },
    scheduler: {
      id: PRODUCT_AI_SCHEDULER_ID,
      version: PRODUCT_AI_SCHEDULER_VERSION,
      freeze: PRODUCT_AI_SCHEDULER_FREEZE_VERSION,
      base: PRODUCT_AI_SCHEDULER_BASE,
    },
    resourceManager: {
      id: PRODUCT_AI_RESOURCE_MANAGER_ID,
      version: PRODUCT_AI_RESOURCE_MANAGER_VERSION,
      freeze: PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION,
      base: PRODUCT_AI_RESOURCE_MANAGER_BASE,
    },
    runtimeGovernance: {
      id: PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
      version: PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION,
      freeze: PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION,
      base: PRODUCT_AI_RUNTIME_GOVERNANCE_BASE,
    },
    runtimeAudit: {
      id: PRODUCT_AI_RUNTIME_AUDIT_ID,
      version: PRODUCT_AI_RUNTIME_AUDIT_VERSION,
      freeze: PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION,
      base: PRODUCT_AI_RUNTIME_AUDIT_BASE,
    },
  };

export const PRODUCT_AI_RUNTIME_FREEZE_LOCK: ProductAiRuntimeFreezeLock = {
  version: PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION,
  base: PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_AI_RUNTIME_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
  signoff: PRODUCT_AI_RUNTIME_SIGNOFF_VERSION,
  aiBaseline: ENTERPRISE_PRODUCT_AI_BASELINE_ID,
  phases: PRODUCT_AI_RUNTIME_PHASE_VERSIONS,
  components: PRODUCT_AI_RUNTIME_COMPONENT_LOCK,
  readOnly: true,
  noNewCapability: true,
};

export function isProductAiRuntimeFreezeLockIntact(
  lock: ProductAiRuntimeFreezeLock = PRODUCT_AI_RUNTIME_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.noNewCapability === true &&
    lock.baselineId === "enterprise-product-ai-runtime-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-ai-runtime-baseline-v1" &&
    lock.base === PRODUCT_AI_RUNTIME_AUDIT_ID &&
    lock.aiBaseline === "enterprise-product-ai-baseline-v1" &&
    lock.phases.foundation.id === PRODUCT_AI_RUNTIME_FOUNDATION_ID &&
    lock.phases.foundation.base === ENTERPRISE_PRODUCT_AI_BASELINE_ID &&
    lock.phases.jobRuntime.base === PRODUCT_AI_RUNTIME_FOUNDATION_ID &&
    lock.phases.queueRuntime.base === PRODUCT_AI_JOB_RUNTIME_ID &&
    lock.phases.scheduler.base === PRODUCT_AI_QUEUE_RUNTIME_ID &&
    lock.phases.resourceManager.base === PRODUCT_AI_SCHEDULER_ID &&
    lock.phases.runtimeGovernance.base === PRODUCT_AI_RESOURCE_MANAGER_ID &&
    lock.phases.runtimeAudit.base === PRODUCT_AI_RUNTIME_GOVERNANCE_ID &&
    lock.phases.runtimeAudit.id === PRODUCT_AI_RUNTIME_AUDIT_ID &&
    lock.components.length === 8
  );
}
