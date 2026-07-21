/**
 * E12-P8 — Productization Governance Freeze Lock (read-only)
 * Locks E12 P1–P7 versions + dependency chain
 * BASE: enterprise-e12-p7-commercial-control-plane-v1
 */

import {
  E12_ADMIN_CONSOLE_BASE,
  E12_ADMIN_CONSOLE_FREEZE_VERSION,
  E12_ADMIN_CONSOLE_ID,
  E12_ADMIN_CONSOLE_VERSION,
  E12_P3_ADMIN_CONSOLE_FREEZE_VERSION,
} from "../admin/admin.constants";
import {
  E12_API_PRODUCT_BASE,
  E12_API_PRODUCT_FREEZE_VERSION,
  E12_API_PRODUCT_ID,
  E12_API_PRODUCT_VERSION,
  E12_P5_API_PRODUCT_FREEZE_VERSION,
} from "../api/api.constants";
import {
  E12_BILLING_COMMERCIAL_BASE,
  E12_BILLING_COMMERCIAL_FREEZE_VERSION,
  E12_BILLING_COMMERCIAL_ID,
  E12_BILLING_COMMERCIAL_VERSION,
  E12_P4_BILLING_COMMERCIAL_FREEZE_VERSION,
} from "../billing/billing.constants";
import {
  E12_COMMERCIAL_CONTROL_BASE,
  E12_COMMERCIAL_CONTROL_FREEZE_VERSION,
  E12_COMMERCIAL_CONTROL_ID,
  E12_COMMERCIAL_CONTROL_VERSION,
  E12_P7_COMMERCIAL_CONTROL_FREEZE_VERSION,
} from "../commercial/commercial.constants";
import {
  E12_P1_PRODUCT_FREEZE_VERSION,
  E12_PRODUCT_BASE,
  E12_PRODUCT_FREEZE_VERSION,
  E12_PRODUCT_ID,
  E12_PRODUCT_VERSION,
} from "../core/product.constants";
import {
  E12_DEPLOYMENT_PACKAGE_BASE,
  E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
  E12_DEPLOYMENT_PACKAGE_ID,
  E12_DEPLOYMENT_PACKAGE_VERSION,
  E12_P6_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
} from "../deployment/deployment.constants";
import {
  E12_P2_TENANT_PRODUCT_FREEZE_VERSION,
  E12_TENANT_PRODUCT_BASE,
  E12_TENANT_PRODUCT_FREEZE_VERSION,
  E12_TENANT_PRODUCT_ID,
  E12_TENANT_PRODUCT_VERSION,
} from "../tenant/tenant.constants";

export const E12_P8_SIGNOFF_VERSION = "e12-p8-signoff-1" as const;
export const E12_P8_PRODUCTIZATION_FREEZE_VERSION =
  "e12-p8-productization-governance-freeze-1" as const;

export const E12_P8_GOVERNANCE_BASE =
  "enterprise-e12-p7-commercial-control-plane-v1" as const;

export const E12_PRODUCTIZATION_COMPLETE_ID =
  "enterprise-e12-productization-complete-v1" as const;

export type E12P8ComponentId =
  | "p1-product-foundation"
  | "p2-tenant-product"
  | "p3-admin-console"
  | "p4-billing"
  | "p5-api-product"
  | "p6-deployment"
  | "p7-commercial-control"
  | "signoff";

export type E12P8ComponentLock = {
  id: E12P8ComponentId;
  path: string;
  label: string;
  required: true;
};

export type E12P8PhaseVersions = {
  p1: {
    id: typeof E12_PRODUCT_ID;
    version: typeof E12_PRODUCT_VERSION;
    freeze: typeof E12_P1_PRODUCT_FREEZE_VERSION;
    base: typeof E12_PRODUCT_BASE;
  };
  p2: {
    id: typeof E12_TENANT_PRODUCT_ID;
    version: typeof E12_TENANT_PRODUCT_VERSION;
    freeze: typeof E12_P2_TENANT_PRODUCT_FREEZE_VERSION;
    base: typeof E12_TENANT_PRODUCT_BASE;
  };
  p3: {
    id: typeof E12_ADMIN_CONSOLE_ID;
    version: typeof E12_ADMIN_CONSOLE_VERSION;
    freeze: typeof E12_P3_ADMIN_CONSOLE_FREEZE_VERSION;
    base: typeof E12_ADMIN_CONSOLE_BASE;
  };
  p4: {
    id: typeof E12_BILLING_COMMERCIAL_ID;
    version: typeof E12_BILLING_COMMERCIAL_VERSION;
    freeze: typeof E12_P4_BILLING_COMMERCIAL_FREEZE_VERSION;
    base: typeof E12_BILLING_COMMERCIAL_BASE;
  };
  p5: {
    id: typeof E12_API_PRODUCT_ID;
    version: typeof E12_API_PRODUCT_VERSION;
    freeze: typeof E12_P5_API_PRODUCT_FREEZE_VERSION;
    base: typeof E12_API_PRODUCT_BASE;
  };
  p6: {
    id: typeof E12_DEPLOYMENT_PACKAGE_ID;
    version: typeof E12_DEPLOYMENT_PACKAGE_VERSION;
    freeze: typeof E12_P6_DEPLOYMENT_PACKAGE_FREEZE_VERSION;
    base: typeof E12_DEPLOYMENT_PACKAGE_BASE;
  };
  p7: {
    id: typeof E12_COMMERCIAL_CONTROL_ID;
    version: typeof E12_COMMERCIAL_CONTROL_VERSION;
    freeze: typeof E12_P7_COMMERCIAL_CONTROL_FREEZE_VERSION;
    base: typeof E12_COMMERCIAL_CONTROL_BASE;
  };
};

export type E12P8FreezeLock = {
  version: typeof E12_P8_PRODUCTIZATION_FREEZE_VERSION;
  base: typeof E12_P8_GOVERNANCE_BASE;
  completeId: typeof E12_PRODUCTIZATION_COMPLETE_ID;
  signoff: typeof E12_P8_SIGNOFF_VERSION;
  platformBaseline: "enterprise-platform-v1-complete";
  phases: E12P8PhaseVersions;
  components: E12P8ComponentLock[];
};

export const E12_P8_EXPECTED_BASE_CHAIN = {
  p1: "enterprise-platform-v1-complete",
  p2: "enterprise-e12-p1-product-foundation-v1",
  p3: "enterprise-e12-p2-saas-tenant-product-v1",
  p4: "enterprise-e12-p3-enterprise-admin-console-v1",
  p5: "enterprise-e12-p4-billing-commercial-v1",
  p6: "enterprise-e12-p5-api-productization-v1",
  p7: "enterprise-e12-p6-deployment-package-v1",
  governance: "enterprise-e12-p7-commercial-control-plane-v1",
} as const;

export const E12_P8_COMPONENT_LOCK: E12P8ComponentLock[] = [
  {
    id: "p1-product-foundation",
    path: "lib/product/e12/core/",
    label: "E12-P1 Product Foundation",
    required: true,
  },
  {
    id: "p2-tenant-product",
    path: "lib/product/e12/tenant/",
    label: "E12-P2 SaaS Tenant Product",
    required: true,
  },
  {
    id: "p3-admin-console",
    path: "lib/product/e12/admin/",
    label: "E12-P3 Enterprise Admin Console",
    required: true,
  },
  {
    id: "p4-billing",
    path: "lib/product/e12/billing/",
    label: "E12-P4 Billing & Commercial",
    required: true,
  },
  {
    id: "p5-api-product",
    path: "lib/product/e12/api/",
    label: "E12-P5 API Productization",
    required: true,
  },
  {
    id: "p6-deployment",
    path: "lib/product/e12/deployment/",
    label: "E12-P6 Deployment Package",
    required: true,
  },
  {
    id: "p7-commercial-control",
    path: "lib/product/e12/commercial/",
    label: "E12-P7 Commercial Control Plane",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/product/e12/signoff/",
    label: "E12-P8 Productization Governance Freeze",
    required: true,
  },
];

export const E12_P8_PHASE_VERSIONS: E12P8PhaseVersions = {
  p1: {
    id: E12_PRODUCT_ID,
    version: E12_PRODUCT_VERSION,
    freeze: E12_P1_PRODUCT_FREEZE_VERSION,
    base: E12_PRODUCT_BASE,
  },
  p2: {
    id: E12_TENANT_PRODUCT_ID,
    version: E12_TENANT_PRODUCT_VERSION,
    freeze: E12_P2_TENANT_PRODUCT_FREEZE_VERSION,
    base: E12_TENANT_PRODUCT_BASE,
  },
  p3: {
    id: E12_ADMIN_CONSOLE_ID,
    version: E12_ADMIN_CONSOLE_VERSION,
    freeze: E12_P3_ADMIN_CONSOLE_FREEZE_VERSION,
    base: E12_ADMIN_CONSOLE_BASE,
  },
  p4: {
    id: E12_BILLING_COMMERCIAL_ID,
    version: E12_BILLING_COMMERCIAL_VERSION,
    freeze: E12_P4_BILLING_COMMERCIAL_FREEZE_VERSION,
    base: E12_BILLING_COMMERCIAL_BASE,
  },
  p5: {
    id: E12_API_PRODUCT_ID,
    version: E12_API_PRODUCT_VERSION,
    freeze: E12_P5_API_PRODUCT_FREEZE_VERSION,
    base: E12_API_PRODUCT_BASE,
  },
  p6: {
    id: E12_DEPLOYMENT_PACKAGE_ID,
    version: E12_DEPLOYMENT_PACKAGE_VERSION,
    freeze: E12_P6_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
    base: E12_DEPLOYMENT_PACKAGE_BASE,
  },
  p7: {
    id: E12_COMMERCIAL_CONTROL_ID,
    version: E12_COMMERCIAL_CONTROL_VERSION,
    freeze: E12_P7_COMMERCIAL_CONTROL_FREEZE_VERSION,
    base: E12_COMMERCIAL_CONTROL_BASE,
  },
};

export const E12_P8_FREEZE_LOCK: E12P8FreezeLock = {
  version: E12_P8_PRODUCTIZATION_FREEZE_VERSION,
  base: E12_P8_GOVERNANCE_BASE,
  completeId: E12_PRODUCTIZATION_COMPLETE_ID,
  signoff: E12_P8_SIGNOFF_VERSION,
  platformBaseline: "enterprise-platform-v1-complete",
  phases: E12_P8_PHASE_VERSIONS,
  components: E12_P8_COMPONENT_LOCK,
};

export const EXPECTED_E12_P8_FREEZE_LOCK: E12P8FreezeLock = E12_P8_FREEZE_LOCK;

export function isE12P8FreezeLockIntact(): boolean {
  const lock = E12_P8_FREEZE_LOCK;
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
    typeof lock.signoff === "string" &&
    lock.signoff.length > 0 &&
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

export function e12P8FreezeLockMatchesExpected(): boolean {
  const lock = E12_P8_FREEZE_LOCK;
  const expected = EXPECTED_E12_P8_FREEZE_LOCK;
  const phaseKeys = ["p1", "p2", "p3", "p4", "p5", "p6", "p7"] as const;

  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.completeId === expected.completeId &&
    lock.signoff === expected.signoff &&
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

export function validateE12P8DependencyChain(): {
  ok: boolean;
  failures: string[];
} {
  const expected = E12_P8_EXPECTED_BASE_CHAIN;
  const phases = E12_P8_FREEZE_LOCK.phases;
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
  if (E12_P8_GOVERNANCE_BASE !== expected.governance) {
    failures.push(`governance base expected=${expected.governance}`);
  }
  if (phases.p1.id !== E12_PRODUCT_ID) {
    failures.push(`p1 id expected=${E12_PRODUCT_ID}`);
  }
  if (phases.p7.id !== E12_COMMERCIAL_CONTROL_ID) {
    failures.push(`p7 id expected=${E12_COMMERCIAL_CONTROL_ID}`);
  }
  if (E12_PRODUCT_FREEZE_VERSION !== "e12-product-freeze-1") {
    failures.push("p1 product freeze mismatch");
  }
  if (E12_ADMIN_CONSOLE_FREEZE_VERSION !== "e12-admin-console-freeze-1") {
    failures.push("p3 admin freeze mismatch");
  }
  if (
    E12_BILLING_COMMERCIAL_FREEZE_VERSION !== "e12-billing-commercial-freeze-1"
  ) {
    failures.push("p4 billing freeze mismatch");
  }
  if (E12_API_PRODUCT_FREEZE_VERSION !== "e12-api-productization-freeze-1") {
    failures.push("p5 api freeze mismatch");
  }
  if (
    E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION !== "e12-deployment-package-freeze-1"
  ) {
    failures.push("p6 deployment freeze mismatch");
  }
  if (
    E12_COMMERCIAL_CONTROL_FREEZE_VERSION !== "e12-commercial-control-freeze-1"
  ) {
    failures.push("p7 commercial freeze mismatch");
  }
  if (E12_TENANT_PRODUCT_FREEZE_VERSION !== "e12-tenant-product-freeze-1") {
    failures.push("p2 tenant freeze mismatch");
  }

  return { ok: failures.length === 0, failures };
}
