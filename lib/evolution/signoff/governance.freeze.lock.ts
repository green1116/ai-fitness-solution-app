/**
 * Evolution P8 — Evolution Governance Freeze Lock (read-only)
 * Locks Evolution P1–P7 versions + dependency chain
 * BASE: enterprise-evolution-p7-evolution-control-plane-v1
 * INTEGRATE: enterprise-post-launch-operations-complete-v1
 *            enterprise-launch-complete-v1
 *            enterprise-e12-productization-complete-v1
 *            enterprise-platform-v1-complete
 */

import {
  EVOLUTION_P7_CONTROL_FREEZE_VERSION,
  EVOLUTION_CONTROL_PLANE_BASE,
  EVOLUTION_CONTROL_PLANE_FREEZE_VERSION,
  EVOLUTION_CONTROL_PLANE_ID,
  EVOLUTION_CONTROL_PLANE_VERSION,
} from "../control/control.constants";
import {
  EVOLUTION_P3_CUSTOMER_FREEZE_VERSION,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_FREEZE_VERSION,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION,
} from "../customer/customer.constants";
import {
  EVOLUTION_P4_DASHBOARD_FREEZE_VERSION,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_FREEZE_VERSION,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION,
} from "../dashboard/dashboard.constants";
import {
  EVOLUTION_P1_AI_OPS_FREEZE_VERSION,
  EVOLUTION_AI_OPS_OPTIMIZATION_BASE,
  EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION,
  EVOLUTION_AI_OPS_OPTIMIZATION_ID,
  EVOLUTION_AI_OPS_OPTIMIZATION_VERSION,
} from "../evolution.constants";
import {
  EVOLUTION_P5_GLOBAL_FREEZE_VERSION,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_FREEZE_VERSION,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION,
} from "../global/global.constants";
import {
  EVOLUTION_P6_MARKETPLACE_FREEZE_VERSION,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION,
} from "../marketplace/marketplace.constants";
import {
  EVOLUTION_P2_PREDICTIVE_FREEZE_VERSION,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_FREEZE_VERSION,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION,
} from "../predictive/predictive.constants";
import {
  ENTERPRISE_LAUNCH_COMPLETE_ID,
} from "../../launch/signoff/governance.freeze.lock";
import {
  OPERATIONS_GOVERNANCE_COMPLETE_ID,
} from "../../operations/signoff/governance.freeze.lock";

export const EVOLUTION_P8_SIGNOFF_VERSION = "evolution-p8-signoff-1" as const;
export const EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION =
  "evolution-p8-evolution-governance-freeze-1" as const;

export const EVOLUTION_P8_GOVERNANCE_BASE =
  "enterprise-evolution-p7-evolution-control-plane-v1" as const;

export const EVOLUTION_GOVERNANCE_COMPLETE_ID =
  "enterprise-evolution-complete-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_EVOLUTION_COMPLETE_ID =
  "enterprise-evolution-complete-v1" as const;

export type EvolutionP8ComponentId =
  | "p1-optimization"
  | "p2-predictive"
  | "p3-customer"
  | "p4-dashboard"
  | "p5-global"
  | "p6-marketplace"
  | "p7-control-plane"
  | "signoff";

export type EvolutionP8ComponentLock = {
  id: EvolutionP8ComponentId;
  path: string;
  label: string;
  required: true;
};

export type EvolutionP8PhaseVersions = {
  p1: {
    id: typeof EVOLUTION_AI_OPS_OPTIMIZATION_ID;
    version: typeof EVOLUTION_AI_OPS_OPTIMIZATION_VERSION;
    freeze: typeof EVOLUTION_P1_AI_OPS_FREEZE_VERSION;
    base: typeof EVOLUTION_AI_OPS_OPTIMIZATION_BASE;
  };
  p2: {
    id: typeof EVOLUTION_PREDICTIVE_INTELLIGENCE_ID;
    version: typeof EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION;
    freeze: typeof EVOLUTION_P2_PREDICTIVE_FREEZE_VERSION;
    base: typeof EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE;
  };
  p3: {
    id: typeof EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID;
    version: typeof EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION;
    freeze: typeof EVOLUTION_P3_CUSTOMER_FREEZE_VERSION;
    base: typeof EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE;
  };
  p4: {
    id: typeof EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID;
    version: typeof EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION;
    freeze: typeof EVOLUTION_P4_DASHBOARD_FREEZE_VERSION;
    base: typeof EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE;
  };
  p5: {
    id: typeof EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID;
    version: typeof EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION;
    freeze: typeof EVOLUTION_P5_GLOBAL_FREEZE_VERSION;
    base: typeof EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE;
  };
  p6: {
    id: typeof EVOLUTION_MARKETPLACE_ECOSYSTEM_ID;
    version: typeof EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION;
    freeze: typeof EVOLUTION_P6_MARKETPLACE_FREEZE_VERSION;
    base: typeof EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE;
  };
  p7: {
    id: typeof EVOLUTION_CONTROL_PLANE_ID;
    version: typeof EVOLUTION_CONTROL_PLANE_VERSION;
    freeze: typeof EVOLUTION_P7_CONTROL_FREEZE_VERSION;
    base: typeof EVOLUTION_CONTROL_PLANE_BASE;
  };
};

export type EvolutionP8FreezeLock = {
  version: typeof EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION;
  base: typeof EVOLUTION_P8_GOVERNANCE_BASE;
  completeId: typeof EVOLUTION_GOVERNANCE_COMPLETE_ID;
  completeAlias: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  signoff: typeof EVOLUTION_P8_SIGNOFF_VERSION;
  operationsBaseline: typeof OPERATIONS_GOVERNANCE_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  phases: EvolutionP8PhaseVersions;
  components: EvolutionP8ComponentLock[];
};

export const EVOLUTION_P8_EXPECTED_BASE_CHAIN = {
  p1: "enterprise-post-launch-operations-complete-v1",
  p2: "enterprise-evolution-p1-ai-operations-optimization-v1",
  p3: "enterprise-evolution-p2-predictive-intelligence-v1",
  p4: "enterprise-evolution-p3-autonomous-customer-success-v1",
  p5: "enterprise-evolution-p4-enterprise-intelligence-dashboard-v1",
  p6: "enterprise-evolution-p5-global-deployment-network-v1",
  p7: "enterprise-evolution-p6-marketplace-ecosystem-v1",
  governance: "enterprise-evolution-p7-evolution-control-plane-v1",
} as const;

export const EVOLUTION_P8_COMPONENT_LOCK: EvolutionP8ComponentLock[] = [
  {
    id: "p1-optimization",
    path: "lib/evolution/",
    label: "Evolution P1 AI Operations Optimization",
    required: true,
  },
  {
    id: "p2-predictive",
    path: "lib/evolution/predictive/",
    label: "Evolution P2 Predictive Intelligence",
    required: true,
  },
  {
    id: "p3-customer",
    path: "lib/evolution/customer/",
    label: "Evolution P3 Autonomous Customer Success",
    required: true,
  },
  {
    id: "p4-dashboard",
    path: "lib/evolution/dashboard/",
    label: "Evolution P4 Enterprise Intelligence Dashboard",
    required: true,
  },
  {
    id: "p5-global",
    path: "lib/evolution/global/",
    label: "Evolution P5 Global Deployment Network",
    required: true,
  },
  {
    id: "p6-marketplace",
    path: "lib/evolution/marketplace/",
    label: "Evolution P6 Marketplace Ecosystem",
    required: true,
  },
  {
    id: "p7-control-plane",
    path: "lib/evolution/control/",
    label: "Evolution P7 Evolution Control Plane",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/evolution/signoff/",
    label: "Evolution P8 Evolution Governance Freeze",
    required: true,
  },
];

export const EVOLUTION_P8_PHASE_VERSIONS: EvolutionP8PhaseVersions = {
  p1: {
    id: EVOLUTION_AI_OPS_OPTIMIZATION_ID,
    version: EVOLUTION_AI_OPS_OPTIMIZATION_VERSION,
    freeze: EVOLUTION_P1_AI_OPS_FREEZE_VERSION,
    base: EVOLUTION_AI_OPS_OPTIMIZATION_BASE,
  },
  p2: {
    id: EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
    version: EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION,
    freeze: EVOLUTION_P2_PREDICTIVE_FREEZE_VERSION,
    base: EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE,
  },
  p3: {
    id: EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
    version: EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION,
    freeze: EVOLUTION_P3_CUSTOMER_FREEZE_VERSION,
    base: EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE,
  },
  p4: {
    id: EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
    version: EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION,
    freeze: EVOLUTION_P4_DASHBOARD_FREEZE_VERSION,
    base: EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE,
  },
  p5: {
    id: EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
    version: EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION,
    freeze: EVOLUTION_P5_GLOBAL_FREEZE_VERSION,
    base: EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE,
  },
  p6: {
    id: EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
    version: EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION,
    freeze: EVOLUTION_P6_MARKETPLACE_FREEZE_VERSION,
    base: EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE,
  },
  p7: {
    id: EVOLUTION_CONTROL_PLANE_ID,
    version: EVOLUTION_CONTROL_PLANE_VERSION,
    freeze: EVOLUTION_P7_CONTROL_FREEZE_VERSION,
    base: EVOLUTION_CONTROL_PLANE_BASE,
  },
};

export const EVOLUTION_P8_FREEZE_LOCK: EvolutionP8FreezeLock = {
  version: EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION,
  base: EVOLUTION_P8_GOVERNANCE_BASE,
  completeId: EVOLUTION_GOVERNANCE_COMPLETE_ID,
  completeAlias: ENTERPRISE_EVOLUTION_COMPLETE_ID,
  signoff: EVOLUTION_P8_SIGNOFF_VERSION,
  operationsBaseline: OPERATIONS_GOVERNANCE_COMPLETE_ID,
  launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
  e12Baseline: "enterprise-e12-productization-complete-v1",
  platformBaseline: "enterprise-platform-v1-complete",
  phases: EVOLUTION_P8_PHASE_VERSIONS,
  components: EVOLUTION_P8_COMPONENT_LOCK,
};

export const EXPECTED_EVOLUTION_P8_FREEZE_LOCK: EvolutionP8FreezeLock =
  EVOLUTION_P8_FREEZE_LOCK;

export function isEvolutionP8FreezeLockIntact(): boolean {
  const lock = EVOLUTION_P8_FREEZE_LOCK;
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
    lock.operationsBaseline ===
      "enterprise-post-launch-operations-complete-v1" &&
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

export function evolutionP8FreezeLockMatchesExpected(): boolean {
  const lock = EVOLUTION_P8_FREEZE_LOCK;
  const expected = EXPECTED_EVOLUTION_P8_FREEZE_LOCK;
  const phaseKeys = ["p1", "p2", "p3", "p4", "p5", "p6", "p7"] as const;

  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.completeId === expected.completeId &&
    lock.completeAlias === expected.completeAlias &&
    lock.signoff === expected.signoff &&
    lock.operationsBaseline === expected.operationsBaseline &&
    lock.launchBaseline === expected.launchBaseline &&
    lock.e12Baseline === expected.e12Baseline &&
    lock.platformBaseline === expected.platformBaseline &&
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

export function validateEvolutionP8DependencyChain(): {
  ok: boolean;
  failures: string[];
} {
  const expected = EVOLUTION_P8_EXPECTED_BASE_CHAIN;
  const phases = EVOLUTION_P8_FREEZE_LOCK.phases;
  const failures: string[] = [];

  if (phases.p1.base !== expected.p1) {
    failures.push(`p1 base expected=${expected.p1}`);
  }
  if (phases.p2.base !== expected.p2) {
    failures.push(`p2 base expected=${expected.p2}`);
  }
  if (phases.p3.base !== expected.p3) {
    failures.push(`p3 base expected=${expected.p3}`);
  }
  if (phases.p4.base !== expected.p4) {
    failures.push(`p4 base expected=${expected.p4}`);
  }
  if (phases.p5.base !== expected.p5) {
    failures.push(`p5 base expected=${expected.p5}`);
  }
  if (phases.p6.base !== expected.p6) {
    failures.push(`p6 base expected=${expected.p6}`);
  }
  if (phases.p7.base !== expected.p7) {
    failures.push(`p7 base expected=${expected.p7}`);
  }
  if (EVOLUTION_P8_GOVERNANCE_BASE !== expected.governance) {
    failures.push(`governance base expected=${expected.governance}`);
  }

  if (phases.p1.base !== OPERATIONS_GOVERNANCE_COMPLETE_ID) {
    failures.push(
      "p1 base must equal enterprise-post-launch-operations-complete-v1",
    );
  }
  if (phases.p2.base !== phases.p1.id) {
    failures.push("p2 base must equal p1 id");
  }
  if (phases.p3.base !== phases.p2.id) {
    failures.push("p3 base must equal p2 id");
  }
  if (phases.p4.base !== phases.p3.id) {
    failures.push("p4 base must equal p3 id");
  }
  if (phases.p5.base !== phases.p4.id) {
    failures.push("p5 base must equal p4 id");
  }
  if (phases.p6.base !== phases.p5.id) {
    failures.push("p6 base must equal p5 id");
  }
  if (phases.p7.base !== phases.p6.id) {
    failures.push("p7 base must equal p6 id");
  }
  if (EVOLUTION_P8_GOVERNANCE_BASE !== phases.p7.id) {
    failures.push("governance base must equal p7 id");
  }

  if (
    EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION !==
    "evolution-ai-ops-optimization-freeze-1"
  ) {
    failures.push("p1 optimization freeze mismatch");
  }
  if (
    EVOLUTION_PREDICTIVE_INTELLIGENCE_FREEZE_VERSION !==
    "evolution-predictive-intelligence-freeze-1"
  ) {
    failures.push("p2 predictive freeze mismatch");
  }
  if (
    EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_FREEZE_VERSION !==
    "evolution-autonomous-customer-success-freeze-1"
  ) {
    failures.push("p3 customer freeze mismatch");
  }
  if (
    EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_FREEZE_VERSION !==
    "evolution-enterprise-intelligence-dashboard-freeze-1"
  ) {
    failures.push("p4 dashboard freeze mismatch");
  }
  if (
    EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_FREEZE_VERSION !==
    "evolution-global-deployment-network-freeze-1"
  ) {
    failures.push("p5 global freeze mismatch");
  }
  if (
    EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION !==
    "evolution-marketplace-ecosystem-freeze-1"
  ) {
    failures.push("p6 marketplace freeze mismatch");
  }
  if (
    EVOLUTION_CONTROL_PLANE_FREEZE_VERSION !==
    "evolution-control-plane-freeze-1"
  ) {
    failures.push("p7 control freeze mismatch");
  }

  return { ok: failures.length === 0, failures };
}
