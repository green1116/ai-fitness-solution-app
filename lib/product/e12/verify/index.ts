/**
 * E12 — Product verify helpers (lib-side)
 */

export {
  assertE12P1ReleaseGatePass,
  checkE12P1ReleaseGate,
  E12_P1_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./release.gate";

export {
  assertE12P2ReleaseGatePass,
  checkE12P2ReleaseGate,
  E12_P2_SIGNOFF_VERSION,
} from "./tenant.release.gate";

export {
  assertE12P3ReleaseGatePass,
  checkE12P3ReleaseGate,
  E12_P3_SIGNOFF_VERSION,
} from "./admin.release.gate";

export {
  assertE12P4ReleaseGatePass,
  checkE12P4ReleaseGate,
  E12_P4_SIGNOFF_VERSION,
} from "./billing.release.gate";

export {
  assertE12P5ReleaseGatePass,
  checkE12P5ReleaseGate,
  E12_P5_SIGNOFF_VERSION,
} from "./api.release.gate";

export {
  assertE12P6ReleaseGatePass,
  checkE12P6ReleaseGate,
  E12_P6_SIGNOFF_VERSION,
} from "./deployment.release.gate";

export {
  assertE12P7ReleaseGatePass,
  checkE12P7ReleaseGate,
  E12_P7_SIGNOFF_VERSION,
} from "./commercial.release.gate";

export {
  assertE12P8ReleaseGatePass,
  checkE12P8ReleaseGate,
} from "../signoff/governance.release.gate";

export {
  E12_P8_PRODUCTIZATION_FREEZE_VERSION,
  E12_P8_GOVERNANCE_BASE,
  E12_P8_SIGNOFF_VERSION,
  E12_PRODUCTIZATION_COMPLETE_ID,
} from "../signoff/governance.freeze.lock";

export {
  E12_P1_PRODUCT_FREEZE_VERSION,
  E12_PRODUCT_BASE,
  E12_PRODUCT_FREEZE_VERSION,
  E12_PRODUCT_ID,
  E12_PRODUCT_VERSION,
} from "../core/product.constants";

export {
  E12_P2_TENANT_PRODUCT_FREEZE_VERSION,
  E12_TENANT_PRODUCT_BASE,
  E12_TENANT_PRODUCT_FREEZE_VERSION,
  E12_TENANT_PRODUCT_ID,
  E12_TENANT_PRODUCT_VERSION,
} from "../tenant/tenant.constants";

export {
  E12_P3_ADMIN_CONSOLE_FREEZE_VERSION,
  E12_ADMIN_CONSOLE_BASE,
  E12_ADMIN_CONSOLE_FREEZE_VERSION,
  E12_ADMIN_CONSOLE_ID,
  E12_ADMIN_CONSOLE_VERSION,
} from "../admin/admin.constants";

export {
  E12_P4_BILLING_COMMERCIAL_FREEZE_VERSION,
  E12_BILLING_COMMERCIAL_BASE,
  E12_BILLING_COMMERCIAL_FREEZE_VERSION,
  E12_BILLING_COMMERCIAL_ID,
  E12_BILLING_COMMERCIAL_VERSION,
} from "../billing/billing.constants";

export {
  E12_P5_API_PRODUCT_FREEZE_VERSION,
  E12_API_PRODUCT_BASE,
  E12_API_PRODUCT_FREEZE_VERSION,
  E12_API_PRODUCT_ID,
  E12_API_PRODUCT_VERSION,
} from "../api/api.constants";

export {
  E12_P6_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
  E12_DEPLOYMENT_PACKAGE_BASE,
  E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
  E12_DEPLOYMENT_PACKAGE_ID,
  E12_DEPLOYMENT_PACKAGE_VERSION,
} from "../deployment/deployment.constants";

export {
  E12_P7_COMMERCIAL_CONTROL_FREEZE_VERSION,
  E12_COMMERCIAL_CONTROL_BASE,
  E12_COMMERCIAL_CONTROL_FREEZE_VERSION,
  E12_COMMERCIAL_CONTROL_ID,
  E12_COMMERCIAL_CONTROL_VERSION,
} from "../commercial/commercial.constants";
