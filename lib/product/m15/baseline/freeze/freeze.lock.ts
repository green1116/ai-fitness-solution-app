/**
 * Product M15 — Enterprise Evolution Baseline Freeze lock (read-only)
 * Freezes Foundation → Feedback → Experience → Learning → Optimization → Capability → Governance
 * BASE: enterprise-product-evolution-governance-v1
 * Isolated namespace: lib/product/m15/baseline
 * Does not modify upstream Evolution module sources
 */

import { ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID } from "../../../m14/baseline/freeze/freeze.lock";
import {
  PRODUCT_EVOLUTION_CAPABILITY_BASE,
  PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION,
  PRODUCT_EVOLUTION_CAPABILITY_ID,
  PRODUCT_EVOLUTION_CAPABILITY_VERSION,
} from "../../capability-runtime/capability.constants";
import {
  PRODUCT_EVOLUTION_EXPERIENCE_BASE,
  PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_EXPERIENCE_ID,
  PRODUCT_EVOLUTION_EXPERIENCE_VERSION,
} from "../../experience/experience.constants";
import {
  PRODUCT_EVOLUTION_FEEDBACK_BASE,
  PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FEEDBACK_ID,
  PRODUCT_EVOLUTION_FEEDBACK_VERSION,
} from "../../feedback/feedback.constants";
import {
  PRODUCT_EVOLUTION_FOUNDATION_BASE,
  PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FOUNDATION_ID,
  PRODUCT_EVOLUTION_FOUNDATION_VERSION,
} from "../../foundation/evolution.constants";
import {
  PRODUCT_EVOLUTION_GOVERNANCE_BASE,
  PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_GOVERNANCE_ID,
  PRODUCT_EVOLUTION_GOVERNANCE_VERSION,
} from "../../governance-runtime/governance.constants";
import {
  PRODUCT_EVOLUTION_LEARNING_BASE,
  PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION,
  PRODUCT_EVOLUTION_LEARNING_ID,
  PRODUCT_EVOLUTION_LEARNING_VERSION,
} from "../../learning-runtime/learning.constants";
import {
  PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
  PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_OPTIMIZATION_ID,
  PRODUCT_EVOLUTION_OPTIMIZATION_VERSION,
} from "../../optimization-runtime/optimization.constants";

export const PRODUCT_EVOLUTION_SIGNOFF_VERSION =
  "product-evolution-baseline-signoff-1" as const;

export const PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION =
  "product-evolution-baseline-freeze-1" as const;

export const PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE =
  "enterprise-product-evolution-governance-v1" as const;

export const PRODUCT_EVOLUTION_BASELINE_ID =
  "enterprise-product-evolution-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID =
  "enterprise-product-evolution-baseline-v1" as const;

export type ProductEvolutionComponentId =
  | "evolution-foundation"
  | "evolution-feedback"
  | "evolution-experience"
  | "evolution-learning"
  | "evolution-optimization"
  | "evolution-capability"
  | "evolution-governance"
  | "evolution-freeze";

export type ProductEvolutionComponentLock = {
  id: ProductEvolutionComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductEvolutionPhaseVersions = {
  foundation: {
    id: typeof PRODUCT_EVOLUTION_FOUNDATION_ID;
    version: typeof PRODUCT_EVOLUTION_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_EVOLUTION_FOUNDATION_BASE;
  };
  feedback: {
    id: typeof PRODUCT_EVOLUTION_FEEDBACK_ID;
    version: typeof PRODUCT_EVOLUTION_FEEDBACK_VERSION;
    freeze: typeof PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION;
    base: typeof PRODUCT_EVOLUTION_FEEDBACK_BASE;
  };
  experience: {
    id: typeof PRODUCT_EVOLUTION_EXPERIENCE_ID;
    version: typeof PRODUCT_EVOLUTION_EXPERIENCE_VERSION;
    freeze: typeof PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION;
    base: typeof PRODUCT_EVOLUTION_EXPERIENCE_BASE;
  };
  learning: {
    id: typeof PRODUCT_EVOLUTION_LEARNING_ID;
    version: typeof PRODUCT_EVOLUTION_LEARNING_VERSION;
    freeze: typeof PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION;
    base: typeof PRODUCT_EVOLUTION_LEARNING_BASE;
  };
  optimization: {
    id: typeof PRODUCT_EVOLUTION_OPTIMIZATION_ID;
    version: typeof PRODUCT_EVOLUTION_OPTIMIZATION_VERSION;
    freeze: typeof PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION;
    base: typeof PRODUCT_EVOLUTION_OPTIMIZATION_BASE;
  };
  capability: {
    id: typeof PRODUCT_EVOLUTION_CAPABILITY_ID;
    version: typeof PRODUCT_EVOLUTION_CAPABILITY_VERSION;
    freeze: typeof PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION;
    base: typeof PRODUCT_EVOLUTION_CAPABILITY_BASE;
  };
  governance: {
    id: typeof PRODUCT_EVOLUTION_GOVERNANCE_ID;
    version: typeof PRODUCT_EVOLUTION_GOVERNANCE_VERSION;
    freeze: typeof PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION;
    base: typeof PRODUCT_EVOLUTION_GOVERNANCE_BASE;
  };
};

export type ProductEvolutionFreezeLock = {
  version: typeof PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_EVOLUTION_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID;
  signoff: typeof PRODUCT_EVOLUTION_SIGNOFF_VERSION;
  intelligenceBaseline: typeof ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID;
  phases: ProductEvolutionPhaseVersions;
  components: ProductEvolutionComponentLock[];
  readOnly: true;
  noNewCapability: true;
};

export const PRODUCT_EVOLUTION_COMPONENT_LOCK: ProductEvolutionComponentLock[] =
  [
    {
      id: "evolution-foundation",
      path: "lib/product/m15/foundation/",
      label: "Product Enterprise Evolution Foundation",
      required: true,
    },
    {
      id: "evolution-feedback",
      path: "lib/product/m15/feedback/",
      label: "Product Evolution Feedback",
      required: true,
    },
    {
      id: "evolution-experience",
      path: "lib/product/m15/experience/",
      label: "Product Evolution Experience",
      required: true,
    },
    {
      id: "evolution-learning",
      path: "lib/product/m15/learning-runtime/",
      label: "Product Evolution Learning",
      required: true,
    },
    {
      id: "evolution-optimization",
      path: "lib/product/m15/optimization-runtime/",
      label: "Product Evolution Optimization",
      required: true,
    },
    {
      id: "evolution-capability",
      path: "lib/product/m15/capability-runtime/",
      label: "Product Evolution Capability",
      required: true,
    },
    {
      id: "evolution-governance",
      path: "lib/product/m15/governance-runtime/",
      label: "Product Evolution Governance",
      required: true,
    },
    {
      id: "evolution-freeze",
      path: "lib/product/m15/baseline/",
      label: "Product Enterprise Evolution Baseline Freeze",
      required: true,
    },
  ];

export const PRODUCT_EVOLUTION_PHASE_VERSIONS: ProductEvolutionPhaseVersions = {
  foundation: {
    id: PRODUCT_EVOLUTION_FOUNDATION_ID,
    version: PRODUCT_EVOLUTION_FOUNDATION_VERSION,
    freeze: PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_FOUNDATION_BASE,
  },
  feedback: {
    id: PRODUCT_EVOLUTION_FEEDBACK_ID,
    version: PRODUCT_EVOLUTION_FEEDBACK_VERSION,
    freeze: PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_FEEDBACK_BASE,
  },
  experience: {
    id: PRODUCT_EVOLUTION_EXPERIENCE_ID,
    version: PRODUCT_EVOLUTION_EXPERIENCE_VERSION,
    freeze: PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_EXPERIENCE_BASE,
  },
  learning: {
    id: PRODUCT_EVOLUTION_LEARNING_ID,
    version: PRODUCT_EVOLUTION_LEARNING_VERSION,
    freeze: PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_LEARNING_BASE,
  },
  optimization: {
    id: PRODUCT_EVOLUTION_OPTIMIZATION_ID,
    version: PRODUCT_EVOLUTION_OPTIMIZATION_VERSION,
    freeze: PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
  },
  capability: {
    id: PRODUCT_EVOLUTION_CAPABILITY_ID,
    version: PRODUCT_EVOLUTION_CAPABILITY_VERSION,
    freeze: PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_CAPABILITY_BASE,
  },
  governance: {
    id: PRODUCT_EVOLUTION_GOVERNANCE_ID,
    version: PRODUCT_EVOLUTION_GOVERNANCE_VERSION,
    freeze: PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_GOVERNANCE_BASE,
  },
};

export const PRODUCT_EVOLUTION_FREEZE_LOCK: ProductEvolutionFreezeLock = {
  version: PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION,
  base: PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_EVOLUTION_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID,
  signoff: PRODUCT_EVOLUTION_SIGNOFF_VERSION,
  intelligenceBaseline: ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
  phases: PRODUCT_EVOLUTION_PHASE_VERSIONS,
  components: PRODUCT_EVOLUTION_COMPONENT_LOCK,
  readOnly: true,
  noNewCapability: true,
};

export function isProductEvolutionFreezeLockIntact(
  lock: ProductEvolutionFreezeLock = PRODUCT_EVOLUTION_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.noNewCapability === true &&
    lock.baselineId === "enterprise-product-evolution-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-evolution-baseline-v1" &&
    lock.base === PRODUCT_EVOLUTION_GOVERNANCE_ID &&
    lock.intelligenceBaseline ===
      "enterprise-product-intelligence-baseline-v1" &&
    lock.phases.foundation.id === PRODUCT_EVOLUTION_FOUNDATION_ID &&
    lock.phases.foundation.base ===
      ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID &&
    lock.phases.feedback.base === PRODUCT_EVOLUTION_FOUNDATION_ID &&
    lock.phases.experience.base === PRODUCT_EVOLUTION_FEEDBACK_ID &&
    lock.phases.learning.base === PRODUCT_EVOLUTION_EXPERIENCE_ID &&
    lock.phases.optimization.base === PRODUCT_EVOLUTION_LEARNING_ID &&
    lock.phases.capability.base === PRODUCT_EVOLUTION_OPTIMIZATION_ID &&
    lock.phases.governance.base === PRODUCT_EVOLUTION_CAPABILITY_ID &&
    lock.phases.governance.id === PRODUCT_EVOLUTION_GOVERNANCE_ID &&
    lock.components.length === 8
  );
}
