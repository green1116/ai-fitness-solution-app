/**
 * Product P3 — AI Project Creation public exports
 * Isolated namespace: lib/product/p3
 */

export {
  BRIEF_STATUSES,
  FACILITY_KINDS,
  GOAL_STATUSES,
  P3_MANAGER_STATUSES,
  P3_READINESS_VERDICTS,
  PRODUCT_P3_AI_PROJECT_CREATION_BASE,
  PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION,
  PRODUCT_P3_AI_PROJECT_CREATION_ID,
  PRODUCT_P3_AI_PROJECT_CREATION_VERSION,
  PRODUCT_P3_PROJECT_FREEZE_VERSION,
  PROJECT_STATUSES,
  PROJECT_TEMPLATE_KINDS,
  REQUIREMENT_PRIORITIES,
  SITE_STATUSES,
} from "./project/project.constants";

export type {
  AiProject,
  CreateProjectInput,
  P3ManagerStatus,
  P3ReadinessCheck,
  P3ReadinessResult,
  P3ReadinessVerdict,
  P3RegistryManifest,
  ProjectMetadata,
  ProjectStatus,
  UpdateProjectStatusInput,
} from "./project/project.types";

export {
  bindProjectTemplate,
  clearProjects,
  createProject,
  getProject,
  listProjects,
  updateProjectStatus,
} from "./project/project.registry";

export type {
  ProjectTemplate,
  ProjectTemplateKind,
  RegisterProjectTemplateInput,
  TemplateMetadata,
} from "./project-template/template.types";

export {
  clearProjectTemplates,
  getProjectTemplate,
  listProjectTemplates,
  registerProjectTemplate,
} from "./project-template/template.registry";

export type {
  BriefMetadata,
  BriefStatus,
  CreateProjectBriefInput,
  ProjectBrief,
  UpdateBriefStatusInput,
} from "./project-brief/brief.types";

export {
  clearProjectBriefs,
  createProjectBrief,
  getProjectBrief,
  listProjectBriefs,
  updateBriefStatus,
} from "./project-brief/brief.registry";

export type {
  ProjectSite,
  RegisterSiteInput,
  SiteMetadata,
  SiteStatus,
} from "./site/site.types";

export {
  clearSites,
  getSite,
  listSites,
  registerSite,
} from "./site/site.registry";

export type {
  FacilityKind,
  FacilityMetadata,
  ProjectFacility,
  RegisterFacilityInput,
} from "./facility/facility.types";

export {
  clearFacilities,
  getFacility,
  listFacilities,
  registerFacility,
} from "./facility/facility.registry";

export type {
  CaptureRequirementInput,
  ProjectRequirement,
  RequirementMetadata,
  RequirementPriority,
} from "./requirement/requirement.types";

export {
  captureRequirement,
  clearRequirements,
  getRequirement,
  listRequirements,
} from "./requirement/requirement.registry";

export type {
  DefineGoalInput,
  GoalMetadata,
  GoalStatus,
  ProjectGoal,
  UpdateGoalStatusInput,
} from "./goal/goal.types";

export {
  clearGoals,
  defineGoal,
  getGoal,
  listGoals,
  updateGoalStatus,
} from "./goal/goal.registry";

export {
  assertP3AiProjectCreationReadinessReady,
  evaluateP3AiProjectCreationReadiness,
} from "./project/project.readiness";

export {
  clearP3AiProjectCreationLayer,
  createP3AiProjectManager,
  getP3RegistryManifest,
  type P3AiProjectManager,
  type P3AiProjectManagerSnapshot,
} from "./project.manager";

export {
  assertProductP3ReleaseGatePass,
  checkProductP3ReleaseGate,
  PRODUCT_P3_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
