/**
 * Product Auth — Governance Freeze lock (read-only)
 * Freezes Identity → Authorization → Session → MFA → SSO → Audit
 * BASE: enterprise-product-audit-traceability-v1
 * Isolated namespace: lib/product/auth
 * Does not modify upstream auth module sources
 */

import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import {
  PRODUCT_AUDIT_TRACEABILITY_BASE,
  PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION,
  PRODUCT_AUDIT_TRACEABILITY_ID,
  PRODUCT_AUDIT_TRACEABILITY_VERSION,
} from "../../audit/security/security.constants";
import {
  PRODUCT_AUTHORIZATION_RBAC_BASE,
  PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION,
  PRODUCT_AUTHORIZATION_RBAC_ID,
  PRODUCT_AUTHORIZATION_RBAC_VERSION,
} from "../../authorization/rbac/rbac.constants";
import {
  PRODUCT_IDENTITY_FOUNDATION_BASE,
  PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION,
  PRODUCT_IDENTITY_FOUNDATION_ID,
  PRODUCT_IDENTITY_FOUNDATION_VERSION,
} from "../../identity/authentication/authentication.constants";
import {
  PRODUCT_MFA_SECURITY_BASE,
  PRODUCT_MFA_SECURITY_FREEZE_VERSION,
  PRODUCT_MFA_SECURITY_ID,
  PRODUCT_MFA_SECURITY_VERSION,
} from "../../mfa/factor/factor.constants";
import {
  PRODUCT_SESSION_CONTROL_BASE,
  PRODUCT_SESSION_CONTROL_FREEZE_VERSION,
  PRODUCT_SESSION_CONTROL_ID,
  PRODUCT_SESSION_CONTROL_VERSION,
} from "../../session/control/control.constants";
import {
  PRODUCT_SSO_FEDERATION_BASE,
  PRODUCT_SSO_FEDERATION_FREEZE_VERSION,
  PRODUCT_SSO_FEDERATION_ID,
  PRODUCT_SSO_FEDERATION_VERSION,
} from "../../sso/federation/federation.constants";

export const PRODUCT_AUTH_SIGNOFF_VERSION =
  "product-auth-signoff-1" as const;

export const PRODUCT_AUTH_FREEZE_VERSION =
  "product-auth-baseline-freeze-1" as const;

export const PRODUCT_AUTH_FREEZE_BASE =
  "enterprise-product-audit-traceability-v1" as const;

export const PRODUCT_AUTH_BASELINE_ID =
  "enterprise-product-auth-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_AUTH_BASELINE_ID =
  "enterprise-product-auth-baseline-v1" as const;

export type ProductAuthComponentId =
  | "identity"
  | "authorization"
  | "session"
  | "mfa"
  | "sso"
  | "audit"
  | "auth-freeze";

export type ProductAuthComponentLock = {
  id: ProductAuthComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductAuthPhaseVersions = {
  identity: {
    id: typeof PRODUCT_IDENTITY_FOUNDATION_ID;
    version: typeof PRODUCT_IDENTITY_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_IDENTITY_FOUNDATION_BASE;
  };
  authorization: {
    id: typeof PRODUCT_AUTHORIZATION_RBAC_ID;
    version: typeof PRODUCT_AUTHORIZATION_RBAC_VERSION;
    freeze: typeof PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION;
    base: typeof PRODUCT_AUTHORIZATION_RBAC_BASE;
  };
  session: {
    id: typeof PRODUCT_SESSION_CONTROL_ID;
    version: typeof PRODUCT_SESSION_CONTROL_VERSION;
    freeze: typeof PRODUCT_SESSION_CONTROL_FREEZE_VERSION;
    base: typeof PRODUCT_SESSION_CONTROL_BASE;
  };
  mfa: {
    id: typeof PRODUCT_MFA_SECURITY_ID;
    version: typeof PRODUCT_MFA_SECURITY_VERSION;
    freeze: typeof PRODUCT_MFA_SECURITY_FREEZE_VERSION;
    base: typeof PRODUCT_MFA_SECURITY_BASE;
  };
  sso: {
    id: typeof PRODUCT_SSO_FEDERATION_ID;
    version: typeof PRODUCT_SSO_FEDERATION_VERSION;
    freeze: typeof PRODUCT_SSO_FEDERATION_FREEZE_VERSION;
    base: typeof PRODUCT_SSO_FEDERATION_BASE;
  };
  audit: {
    id: typeof PRODUCT_AUDIT_TRACEABILITY_ID;
    version: typeof PRODUCT_AUDIT_TRACEABILITY_VERSION;
    freeze: typeof PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION;
    base: typeof PRODUCT_AUDIT_TRACEABILITY_BASE;
  };
};

export type ProductAuthFreezeLock = {
  version: typeof PRODUCT_AUTH_FREEZE_VERSION;
  base: typeof PRODUCT_AUTH_FREEZE_BASE;
  baselineId: typeof PRODUCT_AUTH_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_AUTH_BASELINE_ID;
  signoff: typeof PRODUCT_AUTH_SIGNOFF_VERSION;
  productCompleteBaseline: typeof ENTERPRISE_PRODUCT_COMPLETE_ID;
  operationsBaseline: typeof ENTERPRISE_OPERATIONS_COMPLETE_ID;
  launchReadinessBaseline: typeof ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID;
  commercializationBaseline: typeof ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  evolutionBaseline: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: typeof E12_PRODUCTIZATION_COMPLETE_ID;
  platformBaseline: "enterprise-platform-v1-complete";
  phases: ProductAuthPhaseVersions;
  components: ProductAuthComponentLock[];
  readOnly: true;
};

export const PRODUCT_AUTH_COMPONENT_LOCK: ProductAuthComponentLock[] = [
  {
    id: "identity",
    path: "lib/product/identity/",
    label: "Product Identity Foundation",
    required: true,
  },
  {
    id: "authorization",
    path: "lib/product/authorization/",
    label: "Product Authorization RBAC",
    required: true,
  },
  {
    id: "session",
    path: "lib/product/session/",
    label: "Product Session Control",
    required: true,
  },
  {
    id: "mfa",
    path: "lib/product/mfa/",
    label: "Product MFA Security",
    required: true,
  },
  {
    id: "sso",
    path: "lib/product/sso/",
    label: "Product SSO Federation",
    required: true,
  },
  {
    id: "audit",
    path: "lib/product/audit/",
    label: "Product Audit Traceability",
    required: true,
  },
  {
    id: "auth-freeze",
    path: "lib/product/auth/",
    label: "Product Auth Governance Freeze",
    required: true,
  },
];

export const PRODUCT_AUTH_PHASE_VERSIONS: ProductAuthPhaseVersions = {
  identity: {
    id: PRODUCT_IDENTITY_FOUNDATION_ID,
    version: PRODUCT_IDENTITY_FOUNDATION_VERSION,
    freeze: PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_IDENTITY_FOUNDATION_BASE,
  },
  authorization: {
    id: PRODUCT_AUTHORIZATION_RBAC_ID,
    version: PRODUCT_AUTHORIZATION_RBAC_VERSION,
    freeze: PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION,
    base: PRODUCT_AUTHORIZATION_RBAC_BASE,
  },
  session: {
    id: PRODUCT_SESSION_CONTROL_ID,
    version: PRODUCT_SESSION_CONTROL_VERSION,
    freeze: PRODUCT_SESSION_CONTROL_FREEZE_VERSION,
    base: PRODUCT_SESSION_CONTROL_BASE,
  },
  mfa: {
    id: PRODUCT_MFA_SECURITY_ID,
    version: PRODUCT_MFA_SECURITY_VERSION,
    freeze: PRODUCT_MFA_SECURITY_FREEZE_VERSION,
    base: PRODUCT_MFA_SECURITY_BASE,
  },
  sso: {
    id: PRODUCT_SSO_FEDERATION_ID,
    version: PRODUCT_SSO_FEDERATION_VERSION,
    freeze: PRODUCT_SSO_FEDERATION_FREEZE_VERSION,
    base: PRODUCT_SSO_FEDERATION_BASE,
  },
  audit: {
    id: PRODUCT_AUDIT_TRACEABILITY_ID,
    version: PRODUCT_AUDIT_TRACEABILITY_VERSION,
    freeze: PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION,
    base: PRODUCT_AUDIT_TRACEABILITY_BASE,
  },
};

export const PRODUCT_AUTH_FREEZE_LOCK: ProductAuthFreezeLock = {
  version: PRODUCT_AUTH_FREEZE_VERSION,
  base: PRODUCT_AUTH_FREEZE_BASE,
  baselineId: PRODUCT_AUTH_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_AUTH_BASELINE_ID,
  signoff: PRODUCT_AUTH_SIGNOFF_VERSION,
  productCompleteBaseline: ENTERPRISE_PRODUCT_COMPLETE_ID,
  operationsBaseline: ENTERPRISE_OPERATIONS_COMPLETE_ID,
  launchReadinessBaseline: ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
  commercializationBaseline: ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  evolutionBaseline: ENTERPRISE_EVOLUTION_COMPLETE_ID,
  launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
  e12Baseline: E12_PRODUCTIZATION_COMPLETE_ID,
  platformBaseline: "enterprise-platform-v1-complete",
  phases: PRODUCT_AUTH_PHASE_VERSIONS,
  components: PRODUCT_AUTH_COMPONENT_LOCK,
  readOnly: true,
};

export function isProductAuthFreezeLockIntact(
  lock: ProductAuthFreezeLock = PRODUCT_AUTH_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.baselineId === "enterprise-product-auth-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-auth-baseline-v1" &&
    lock.base === PRODUCT_AUDIT_TRACEABILITY_ID &&
    lock.phases.identity.id === PRODUCT_IDENTITY_FOUNDATION_ID &&
    lock.phases.authorization.base === PRODUCT_IDENTITY_FOUNDATION_ID &&
    lock.phases.session.base === PRODUCT_AUTHORIZATION_RBAC_ID &&
    lock.phases.mfa.base === PRODUCT_SESSION_CONTROL_ID &&
    lock.phases.sso.base === PRODUCT_MFA_SECURITY_ID &&
    lock.phases.audit.base === PRODUCT_SSO_FEDERATION_ID &&
    lock.phases.audit.id === PRODUCT_AUDIT_TRACEABILITY_ID &&
    lock.components.length === 7
  );
}
