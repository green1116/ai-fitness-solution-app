/**
 * Launch L1 — Demo Foundation public exports
 * Isolated namespace: lib/launch/readiness/l1
 */

export {
  ARTIFACT_KINDS,
  CUSTOMER_SEGMENTS,
  DEMO_LOAD_STATUSES,
  L1_MANAGER_STATUSES,
  L1_READINESS_VERDICTS,
  LAUNCH_L1_DEMO_FOUNDATION_BASE,
  LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION,
  LAUNCH_L1_DEMO_FOUNDATION_ID,
  LAUNCH_L1_DEMO_FOUNDATION_VERSION,
  LAUNCH_L1_DEMO_FREEZE_VERSION,
  PROJECT_SCENARIO_KINDS,
  TENANT_STATUSES,
} from "./demo/demo.constants";

export type {
  DemoTenant,
  RegisterTenantInput,
  TenantMetadata,
  TenantStatus,
} from "./tenant/tenant.types";

export {
  clearTenants,
  getTenant,
  listTenants,
  registerTenant,
} from "./tenant/tenant.registry";

export type {
  CreateCustomerProfileInput,
  CustomerMetadata,
  CustomerProfile,
  CustomerSegment,
} from "./customer/customer.types";

export {
  clearCustomerProfiles,
  createCustomerProfile,
  getCustomerProfile,
  listCustomerProfiles,
} from "./customer/customer.profile";

export type {
  CreateProjectScenarioInput,
  DemoProject,
  ProjectMetadata,
  ProjectScenarioKind,
} from "./project/project.types";

export {
  clearProjectScenarios,
  createProjectScenario,
  getProjectScenario,
  listProjectScenarios,
} from "./project/project.scenario";

export type {
  ArtifactKind,
  ArtifactMetadata,
  DemoArtifact,
  RegisterArtifactInput,
} from "./artifact/artifact.types";

export {
  clearArtifacts,
  getArtifact,
  listArtifacts,
  registerArtifact,
} from "./artifact/artifact.registry";

export type {
  DemoBundle,
  DemoLoadStatus,
  DemoMetadata,
  DemoSeed,
  L1ManagerStatus,
  L1ReadinessCheck,
  L1ReadinessResult,
  L1ReadinessVerdict,
  L1RegistryManifest,
  LoadDemoInput,
  SeedDemoInput,
} from "./demo/demo.types";

export {
  clearDemoBundles,
  getDemoBundle,
  listDemoBundles,
  loadDemoBundle,
} from "./demo/demo.loader";

export {
  clearDemoSeeds,
  getDemoSeed,
  listDemoSeeds,
  seedDemoData,
} from "./demo/demo.seed";

export {
  assertL1DemoReadinessReady,
  evaluateL1DemoReadiness,
} from "./demo/demo.readiness";

export {
  clearL1DemoFoundationLayer,
  createL1DemoFoundationManager,
  getL1RegistryManifest,
  type L1DemoFoundationManager,
  type L1DemoFoundationManagerSnapshot,
} from "./demo.manager";

export {
  assertLaunchL1ReleaseGatePass,
  checkLaunchL1ReleaseGate,
  LAUNCH_L1_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/launch.release.gate";
