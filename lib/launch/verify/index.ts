/**
 * Launch — verify helpers (lib-side)
 */

export {
  assertLaunchP1ReleaseGatePass,
  checkLaunchP1ReleaseGate,
  LAUNCH_P1_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./release.gate";

export {
  assertLaunchP2ReleaseGatePass,
  checkLaunchP2ReleaseGate,
  LAUNCH_P2_SIGNOFF_VERSION,
} from "../onboarding/verify/onboarding.release.gate";

export {
  LAUNCH_P1_PRODUCTION_FREEZE_VERSION,
  LAUNCH_PRODUCTION_FOUNDATION_BASE,
  LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  LAUNCH_PRODUCTION_FOUNDATION_ID,
  LAUNCH_PRODUCTION_FOUNDATION_VERSION,
} from "../launch.constants";

export {
  LAUNCH_P2_ONBOARDING_FREEZE_VERSION,
  LAUNCH_CUSTOMER_ONBOARDING_BASE,
  LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  LAUNCH_CUSTOMER_ONBOARDING_ID,
  LAUNCH_CUSTOMER_ONBOARDING_VERSION,
} from "../onboarding/onboarding.constants";
