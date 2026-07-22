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

export {
  assertLaunchP7ReleaseGatePass,
  checkLaunchP7ReleaseGate,
  LAUNCH_P7_SIGNOFF_VERSION,
} from "../control/verify/control.release.gate";

export {
  LAUNCH_P7_CONTROL_FREEZE_VERSION,
  LAUNCH_CONTROL_PLANE_BASE,
  LAUNCH_CONTROL_PLANE_FREEZE_VERSION,
  LAUNCH_CONTROL_PLANE_ID,
  LAUNCH_CONTROL_PLANE_VERSION,
} from "../control/control.constants";

export {
  assertLaunchP8ReleaseGatePass,
  checkLaunchP8ReleaseGate,
} from "../signoff/governance.release.gate";

export {
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
  ENTERPRISE_LAUNCH_COMPLETE_ID,
  LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION,
  LAUNCH_P8_GOVERNANCE_BASE,
  LAUNCH_P8_SIGNOFF_VERSION,
} from "../signoff/governance.freeze.lock";

export {
  assertLaunchP8FinalVerificationPass,
  runLaunchP8FinalVerification,
} from "../signoff/final.verification";

export {
  assertOperationsP2ReleaseGatePass,
  checkOperationsP2ReleaseGate,
  OPERATIONS_P2_SIGNOFF_VERSION,
} from "../../operations/customer-success/verify/success.release.gate";

export {
  OPERATIONS_P2_CUSTOMER_SUCCESS_FREEZE_VERSION,
  OPERATIONS_CUSTOMER_SUCCESS_BASE,
  OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION,
  OPERATIONS_CUSTOMER_SUCCESS_ID,
  OPERATIONS_CUSTOMER_SUCCESS_VERSION,
} from "../../operations/customer-success/success.constants";

export {
  assertOperationsP3ReleaseGatePass,
  checkOperationsP3ReleaseGate,
  OPERATIONS_P3_SIGNOFF_VERSION,
} from "../../operations/incident/verify/incident.release.gate";

export {
  OPERATIONS_P3_INCIDENT_RESPONSE_FREEZE_VERSION,
  OPERATIONS_INCIDENT_RESPONSE_BASE,
  OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION,
  OPERATIONS_INCIDENT_RESPONSE_ID,
  OPERATIONS_INCIDENT_RESPONSE_VERSION,
} from "../../operations/incident/incident.constants";

export {
  assertOperationsP4ReleaseGatePass,
  checkOperationsP4ReleaseGate,
  OPERATIONS_P4_SIGNOFF_VERSION,
} from "../../operations/release/verify/release.management.gate";

export {
  OPERATIONS_P4_RELEASE_MANAGEMENT_FREEZE_VERSION,
  OPERATIONS_RELEASE_MANAGEMENT_BASE,
  OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION,
  OPERATIONS_RELEASE_MANAGEMENT_ID,
  OPERATIONS_RELEASE_MANAGEMENT_VERSION,
} from "../../operations/release/release.constants";

export {
  assertOperationsP5ReleaseGatePass,
  checkOperationsP5ReleaseGate,
  OPERATIONS_P5_SIGNOFF_VERSION,
} from "../../operations/growth/verify/growth.release.gate";

export {
  OPERATIONS_P5_GROWTH_ANALYTICS_FREEZE_VERSION,
  OPERATIONS_GROWTH_ANALYTICS_BASE,
  OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION,
  OPERATIONS_GROWTH_ANALYTICS_ID,
  OPERATIONS_GROWTH_ANALYTICS_VERSION,
} from "../../operations/growth/growth.constants";

export {
  assertOperationsP6ReleaseGatePass,
  checkOperationsP6ReleaseGate,
  OPERATIONS_P6_SIGNOFF_VERSION,
} from "../../operations/support/verify/enterprise.support.gate";

export {
  OPERATIONS_P6_ENTERPRISE_SUPPORT_FREEZE_VERSION,
  OPERATIONS_ENTERPRISE_SUPPORT_BASE,
  OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION,
  OPERATIONS_ENTERPRISE_SUPPORT_ID,
  OPERATIONS_ENTERPRISE_SUPPORT_VERSION,
} from "../../operations/support/support.constants";

export {
  assertOperationsP7ReleaseGatePass,
  checkOperationsP7ReleaseGate,
  OPERATIONS_P7_SIGNOFF_VERSION,
} from "../../operations/control/verify/operations.control.gate";

export {
  OPERATIONS_P7_CONTROL_FREEZE_VERSION,
  OPERATIONS_CONTROL_PLANE_BASE,
  OPERATIONS_CONTROL_PLANE_FREEZE_VERSION,
  OPERATIONS_CONTROL_PLANE_ID,
  OPERATIONS_CONTROL_PLANE_VERSION,
} from "../../operations/control/control.constants";

export {
  assertOperationsP8ReleaseGatePass,
  checkOperationsP8ReleaseGate,
} from "../../operations/signoff/governance.release.gate";

export {
  assertOperationsP8FinalVerificationPass,
  runOperationsP8FinalVerification,
} from "../../operations/signoff/final.verification";

export {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_GOVERNANCE_COMPLETE_ID,
  OPERATIONS_P8_GOVERNANCE_BASE,
  OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION,
  OPERATIONS_P8_SIGNOFF_VERSION,
} from "../../operations/signoff/governance.freeze.lock";

export {
  assertEvolutionP1ReleaseGatePass,
  checkEvolutionP1ReleaseGate,
  EVOLUTION_P1_SIGNOFF_VERSION,
} from "../../evolution/verify/evolution.release.gate";

export {
  EVOLUTION_P1_AI_OPS_FREEZE_VERSION,
  EVOLUTION_AI_OPS_OPTIMIZATION_BASE,
  EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION,
  EVOLUTION_AI_OPS_OPTIMIZATION_ID,
  EVOLUTION_AI_OPS_OPTIMIZATION_VERSION,
} from "../../evolution/evolution.constants";

export {
  assertEvolutionP2ReleaseGatePass,
  checkEvolutionP2ReleaseGate,
  EVOLUTION_P2_SIGNOFF_VERSION,
} from "../../evolution/predictive/verify/predictive.release.gate";

export {
  EVOLUTION_P2_PREDICTIVE_FREEZE_VERSION,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_FREEZE_VERSION,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION,
} from "../../evolution/predictive/predictive.constants";

export {
  assertEvolutionP3ReleaseGatePass,
  checkEvolutionP3ReleaseGate,
  EVOLUTION_P3_SIGNOFF_VERSION,
} from "../../evolution/customer/verify/customer.release.gate";

export {
  EVOLUTION_P3_CUSTOMER_FREEZE_VERSION,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_FREEZE_VERSION,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION,
} from "../../evolution/customer/customer.constants";

export {
  assertEvolutionP4ReleaseGatePass,
  checkEvolutionP4ReleaseGate,
  EVOLUTION_P4_SIGNOFF_VERSION,
} from "../../evolution/dashboard/verify/dashboard.release.gate";

export {
  EVOLUTION_P4_DASHBOARD_FREEZE_VERSION,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_FREEZE_VERSION,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION,
} from "../../evolution/dashboard/dashboard.constants";

export {
  assertEvolutionP5ReleaseGatePass,
  checkEvolutionP5ReleaseGate,
  EVOLUTION_P5_SIGNOFF_VERSION,
} from "../../evolution/global/verify/global.release.gate";

export {
  EVOLUTION_P5_GLOBAL_FREEZE_VERSION,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_FREEZE_VERSION,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION,
} from "../../evolution/global/global.constants";

export {
  assertEvolutionP6ReleaseGatePass,
  checkEvolutionP6ReleaseGate,
  EVOLUTION_P6_SIGNOFF_VERSION,
} from "../../evolution/marketplace/verify/marketplace.release.gate";

export {
  EVOLUTION_P6_MARKETPLACE_FREEZE_VERSION,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION,
} from "../../evolution/marketplace/marketplace.constants";

export {
  assertEvolutionP7ReleaseGatePass,
  checkEvolutionP7ReleaseGate,
  EVOLUTION_P7_SIGNOFF_VERSION,
} from "../../evolution/control/verify/evolution.control.gate";

export {
  EVOLUTION_P7_CONTROL_FREEZE_VERSION,
  EVOLUTION_CONTROL_PLANE_BASE,
  EVOLUTION_CONTROL_PLANE_FREEZE_VERSION,
  EVOLUTION_CONTROL_PLANE_ID,
  EVOLUTION_CONTROL_PLANE_VERSION,
} from "../../evolution/control/control.constants";

export {
  assertEvolutionP8ReleaseGatePass,
  checkEvolutionP8ReleaseGate,
} from "../../evolution/signoff/governance.release.gate";

export {
  EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION,
  EVOLUTION_P8_GOVERNANCE_BASE,
  EVOLUTION_P8_SIGNOFF_VERSION,
  EVOLUTION_GOVERNANCE_COMPLETE_ID,
  ENTERPRISE_EVOLUTION_COMPLETE_ID,
} from "../../evolution/signoff/governance.freeze.lock";
