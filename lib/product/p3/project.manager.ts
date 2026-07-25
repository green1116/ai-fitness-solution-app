/**
 * Product P3 — AI Project Creation Manager
 */

import {
  clearProjectBriefs,
  createProjectBrief,
  getProjectBrief,
  listProjectBriefs,
  updateBriefStatus,
} from "./project-brief/brief.registry";
import type {
  CreateProjectBriefInput,
  ProjectBrief,
  UpdateBriefStatusInput,
} from "./project-brief/brief.types";
import {
  clearProjectTemplates,
  getProjectTemplate,
  listProjectTemplates,
  registerProjectTemplate,
} from "./project-template/template.registry";
import type {
  ProjectTemplate,
  RegisterProjectTemplateInput,
} from "./project-template/template.types";
import {
  clearFacilities,
  getFacility,
  listFacilities,
  registerFacility,
} from "./facility/facility.registry";
import type {
  ProjectFacility,
  RegisterFacilityInput,
} from "./facility/facility.types";
import {
  clearGoals,
  defineGoal,
  getGoal,
  listGoals,
  updateGoalStatus,
} from "./goal/goal.registry";
import type {
  DefineGoalInput,
  ProjectGoal,
  UpdateGoalStatusInput,
} from "./goal/goal.types";
import {
  PRODUCT_P3_AI_PROJECT_CREATION_BASE,
  PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION,
  PRODUCT_P3_AI_PROJECT_CREATION_ID,
  PRODUCT_P3_AI_PROJECT_CREATION_VERSION,
} from "./project/project.constants";
import {
  assertP3AiProjectCreationReadinessReady,
  evaluateP3AiProjectCreationReadiness,
} from "./project/project.readiness";
import {
  bindProjectTemplate,
  clearProjects,
  createProject,
  getProject,
  listProjects,
  updateProjectStatus,
} from "./project/project.registry";
import type {
  AiProject,
  CreateProjectInput,
  P3ManagerStatus,
  P3ReadinessResult,
  P3RegistryManifest,
  UpdateProjectStatusInput,
} from "./project/project.types";
import {
  captureRequirement,
  clearRequirements,
  getRequirement,
  listRequirements,
} from "./requirement/requirement.registry";
import type {
  CaptureRequirementInput,
  ProjectRequirement,
} from "./requirement/requirement.types";
import {
  clearSites,
  getSite,
  listSites,
  registerSite,
} from "./site/site.registry";
import type { ProjectSite, RegisterSiteInput } from "./site/site.types";

export type P3AiProjectManagerSnapshot = {
  managerId: string;
  status: P3ManagerStatus;
  layerId: typeof PRODUCT_P3_AI_PROJECT_CREATION_ID;
  version: typeof PRODUCT_P3_AI_PROJECT_CREATION_VERSION;
  projectCount: number;
  templateCount: number;
  siteCount: number;
  goalCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P3AiProjectManager = {
  initialize: () => P3AiProjectManagerSnapshot;
  start: () => P3AiProjectManagerSnapshot;
  stop: () => P3AiProjectManagerSnapshot;
  status: () => P3AiProjectManagerSnapshot;
  registerTemplate: (input: RegisterProjectTemplateInput) => ProjectTemplate;
  createProject: (input: CreateProjectInput) => AiProject;
  bindTemplate: (projectId: string, templateId: string) => AiProject;
  updateProjectStatus: (input: UpdateProjectStatusInput) => AiProject;
  createBrief: (input: CreateProjectBriefInput) => ProjectBrief;
  updateBriefStatus: (input: UpdateBriefStatusInput) => ProjectBrief;
  registerSite: (input: RegisterSiteInput) => ProjectSite;
  registerFacility: (input: RegisterFacilityInput) => ProjectFacility;
  captureRequirement: (input: CaptureRequirementInput) => ProjectRequirement;
  defineGoal: (input: DefineGoalInput) => ProjectGoal;
  updateGoalStatus: (input: UpdateGoalStatusInput) => ProjectGoal;
  evaluateReadiness: () => P3ReadinessResult;
  manifest: () => P3RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP3RegistryManifest(): P3RegistryManifest {
  return {
    foundationId: PRODUCT_P3_AI_PROJECT_CREATION_ID,
    version: PRODUCT_P3_AI_PROJECT_CREATION_VERSION,
    freezeVersion: PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION,
    base: PRODUCT_P3_AI_PROJECT_CREATION_BASE,
    projectCount: listProjects().length,
    templateCount: listProjectTemplates().length,
    briefCount: listProjectBriefs().length,
    siteCount: listSites().length,
    facilityCount: listFacilities().length,
    requirementCount: listRequirements().length,
    goalCount: listGoals().length,
  };
}

export function clearP3AiProjectCreationLayer(): void {
  clearGoals();
  clearRequirements();
  clearFacilities();
  clearSites();
  clearProjectBriefs();
  clearProjects();
  clearProjectTemplates();
}

export function createP3AiProjectManager(options?: {
  managerId?: string;
}): P3AiProjectManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p3-prj-mgr");
  let state: P3ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P3AiProjectManagerSnapshot {
    const reg = getP3RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P3_AI_PROJECT_CREATION_ID,
      version: PRODUCT_P3_AI_PROJECT_CREATION_VERSION,
      projectCount: reg.projectCount,
      templateCount: reg.templateCount,
      siteCount: reg.siteCount,
      goalCount: reg.goalCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): P3AiProjectManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP3AiProjectCreationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P3AiProjectManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P3AiProjectManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerTemplate: (input) => {
      assertRunning("registerTemplate");
      return registerProjectTemplate(input);
    },
    createProject: (input) => {
      assertRunning("createProject");
      if (input.templateId?.trim()) {
        const tid = input.templateId.trim();
        if (!getProjectTemplate(tid)) {
          throw new Error(`project template not found: ${tid}`);
        }
      }
      return createProject(input);
    },
    bindTemplate: (projectId, templateId) => {
      assertRunning("bindTemplate");
      if (!getProjectTemplate(templateId)) {
        throw new Error(`project template not found: ${templateId}`);
      }
      return bindProjectTemplate(projectId, templateId);
    },
    updateProjectStatus: (input) => {
      assertRunning("updateProjectStatus");
      return updateProjectStatus(input);
    },
    createBrief: (input) => {
      assertRunning("createBrief");
      return createProjectBrief(input);
    },
    updateBriefStatus: (input) => {
      assertRunning("updateBriefStatus");
      return updateBriefStatus(input);
    },
    registerSite: (input) => {
      assertRunning("registerSite");
      return registerSite(input);
    },
    registerFacility: (input) => {
      assertRunning("registerFacility");
      return registerFacility(input);
    },
    captureRequirement: (input) => {
      assertRunning("captureRequirement");
      return captureRequirement(input);
    },
    defineGoal: (input) => {
      assertRunning("defineGoal");
      return defineGoal(input);
    },
    updateGoalStatus: (input) => {
      assertRunning("updateGoalStatus");
      return updateGoalStatus(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP3AiProjectCreationReadiness();
    },
    manifest: getP3RegistryManifest,
  };
}

export {
  assertP3AiProjectCreationReadinessReady,
  getFacility,
  getGoal,
  getProject,
  getProjectBrief,
  getProjectTemplate,
  getRequirement,
  getSite,
  listFacilities,
  listGoals,
  listProjectBriefs,
  listProjectTemplates,
  listProjects,
  listRequirements,
  listSites,
};
