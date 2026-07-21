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
