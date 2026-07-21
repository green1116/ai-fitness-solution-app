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

export {
  assertLaunchP3ReleaseGatePass,
  checkLaunchP3ReleaseGate,
  LAUNCH_P3_SIGNOFF_VERSION,
} from "../demo/verify/demo.release.gate";

export {
  LAUNCH_P3_DEMO_FREEZE_VERSION,
  LAUNCH_DEMO_ENVIRONMENT_BASE,
  LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION,
  LAUNCH_DEMO_ENVIRONMENT_ID,
  LAUNCH_DEMO_ENVIRONMENT_VERSION,
} from "../demo/demo.constants";

export {
  assertLaunchP4ReleaseGatePass,
  checkLaunchP4ReleaseGate,
  LAUNCH_P4_SIGNOFF_VERSION,
} from "../security/verify/security.release.gate";

export {
  LAUNCH_P4_SECURITY_FREEZE_VERSION,
  LAUNCH_SECURITY_READINESS_BASE,
  LAUNCH_SECURITY_READINESS_FREEZE_VERSION,
  LAUNCH_SECURITY_READINESS_ID,
  LAUNCH_SECURITY_READINESS_VERSION,
} from "../security/security.constants";

export {
  assertLaunchP5ReleaseGatePass,
  checkLaunchP5ReleaseGate,
  LAUNCH_P5_SIGNOFF_VERSION,
} from "../support/verify/support.release.gate";

export {
  LAUNCH_P5_SUPPORT_FREEZE_VERSION,
  LAUNCH_SLA_SUPPORT_BASE,
  LAUNCH_SLA_SUPPORT_FREEZE_VERSION,
  LAUNCH_SLA_SUPPORT_ID,
  LAUNCH_SLA_SUPPORT_VERSION,
} from "../support/support.constants";

export {
  assertLaunchP6ReleaseGatePass,
  checkLaunchP6ReleaseGate,
  LAUNCH_P6_SIGNOFF_VERSION,
} from "../documentation/verify/documentation.release.gate";

export {
  LAUNCH_P6_DOCUMENTATION_FREEZE_VERSION,
  LAUNCH_DOCUMENTATION_BASE,
  LAUNCH_DOCUMENTATION_FREEZE_VERSION,
  LAUNCH_DOCUMENTATION_ID,
  LAUNCH_DOCUMENTATION_VERSION,
} from "../documentation/documentation.constants";
