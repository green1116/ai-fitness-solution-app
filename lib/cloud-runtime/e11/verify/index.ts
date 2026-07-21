/**
 * E11-P1 — Cloud Runtime verify helpers (lib-side)
 */

export {
  assertE11P1ReleaseGatePass,
  checkE11P1ReleaseGate,
  E11_P1_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./release.gate";

export {
  assertE11P2ReleaseGatePass,
  checkE11P2ReleaseGate,
  E11_P2_SIGNOFF_VERSION,
} from "./execution.release.gate";

export {
  assertE11P3ReleaseGatePass,
  checkE11P3ReleaseGate,
  E11_P3_SIGNOFF_VERSION,
} from "./tenant.release.gate";

export {
  assertE11P4ReleaseGatePass,
  checkE11P4ReleaseGate,
  E11_P4_SIGNOFF_VERSION,
} from "./governance.release.gate";

export {
  E11_CLOUD_RUNTIME_BASE,
  E11_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_CLOUD_RUNTIME_ID,
  E11_CLOUD_RUNTIME_VERSION,
  E11_P1_CLOUD_FREEZE_VERSION,
} from "../core/cloud.constants";
