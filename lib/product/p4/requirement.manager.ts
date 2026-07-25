/**
 * Product P4 — Requirement Collection Manager
 */

import {
  clearBudgetTargets,
  getBudgetTarget,
  listBudgetTargets,
  setBudgetTarget,
  updateBudgetTargetStatus,
} from "./budget-target/budget.registry";
import type {
  BudgetTarget,
  SetBudgetTargetInput,
  UpdateBudgetTargetStatusInput,
} from "./budget-target/budget.types";
import {
  captureConstraint,
  clearConstraints,
  getConstraint,
  listConstraints,
} from "./constraint/constraint.registry";
import type {
  CaptureConstraintInput,
  ProjectConstraint,
} from "./constraint/constraint.types";
import {
  clearEquipmentPreferences,
  getEquipmentPreference,
  listEquipmentPreferences,
  recordEquipmentPreference,
} from "./equipment-preference/equipment.registry";
import type {
  EquipmentPreference,
  RecordEquipmentPreferenceInput,
} from "./equipment-preference/equipment.types";
import {
  PRODUCT_P4_REQUIREMENT_COLLECTION_BASE,
  PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION,
  PRODUCT_P4_REQUIREMENT_COLLECTION_ID,
  PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION,
} from "./questionnaire/questionnaire.constants";
import {
  clearQuestionnaires,
  getQuestionnaire,
  listQuestionnaires,
  registerQuestionnaire,
  updateQuestionnaireStatus,
} from "./questionnaire/questionnaire.registry";
import type {
  P4ManagerStatus,
  P4ReadinessResult,
  P4RegistryManifest,
  Questionnaire,
  RegisterQuestionnaireInput,
  UpdateQuestionnaireStatusInput,
} from "./questionnaire/questionnaire.types";
import {
  assertP4RequirementCollectionReadinessReady,
  evaluateP4RequirementCollectionReadiness,
} from "./requirement-validation/validation.readiness";
import {
  clearRequirementValidations,
  getRequirementValidation,
  listRequirementValidations,
  validateRequirements,
} from "./requirement-validation/validation.registry";
import type {
  RequirementValidation,
  ValidateRequirementsInput,
} from "./requirement-validation/validation.types";
import {
  analyzeSpace,
  clearSpaceAnalyses,
  getSpaceAnalysis,
  listSpaceAnalyses,
} from "./space-analysis/space.registry";
import type {
  AnalyzeSpaceInput,
  SpaceAnalysis,
} from "./space-analysis/space.types";
import {
  clearStakeholders,
  getStakeholder,
  listStakeholders,
  registerStakeholder,
} from "./stakeholder/stakeholder.registry";
import type {
  RegisterStakeholderInput,
  Stakeholder,
} from "./stakeholder/stakeholder.types";
import {
  clearSurveys,
  getSurvey,
  listSurveys,
  submitSurvey,
  updateSurveyStatus,
} from "./survey/survey.registry";
import type {
  SubmitSurveyInput,
  SurveyResponse,
  UpdateSurveyStatusInput,
} from "./survey/survey.types";

export type P4RequirementCollectionManagerSnapshot = {
  managerId: string;
  status: P4ManagerStatus;
  layerId: typeof PRODUCT_P4_REQUIREMENT_COLLECTION_ID;
  version: typeof PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION;
  questionnaireCount: number;
  surveyCount: number;
  stakeholderCount: number;
  validationCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P4RequirementCollectionManager = {
  initialize: () => P4RequirementCollectionManagerSnapshot;
  start: () => P4RequirementCollectionManagerSnapshot;
  stop: () => P4RequirementCollectionManagerSnapshot;
  status: () => P4RequirementCollectionManagerSnapshot;
  registerQuestionnaire: (
    input: RegisterQuestionnaireInput,
  ) => Questionnaire;
  updateQuestionnaireStatus: (
    input: UpdateQuestionnaireStatusInput,
  ) => Questionnaire;
  submitSurvey: (input: SubmitSurveyInput) => SurveyResponse;
  updateSurveyStatus: (input: UpdateSurveyStatusInput) => SurveyResponse;
  registerStakeholder: (input: RegisterStakeholderInput) => Stakeholder;
  captureConstraint: (input: CaptureConstraintInput) => ProjectConstraint;
  analyzeSpace: (input: AnalyzeSpaceInput) => SpaceAnalysis;
  recordEquipmentPreference: (
    input: RecordEquipmentPreferenceInput,
  ) => EquipmentPreference;
  setBudgetTarget: (input: SetBudgetTargetInput) => BudgetTarget;
  updateBudgetTargetStatus: (
    input: UpdateBudgetTargetStatusInput,
  ) => BudgetTarget;
  validateRequirements: (
    input: ValidateRequirementsInput,
  ) => RequirementValidation;
  evaluateReadiness: () => P4ReadinessResult;
  manifest: () => P4RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP4RegistryManifest(): P4RegistryManifest {
  return {
    foundationId: PRODUCT_P4_REQUIREMENT_COLLECTION_ID,
    version: PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION,
    freezeVersion: PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION,
    base: PRODUCT_P4_REQUIREMENT_COLLECTION_BASE,
    questionnaireCount: listQuestionnaires().length,
    surveyCount: listSurveys().length,
    stakeholderCount: listStakeholders().length,
    constraintCount: listConstraints().length,
    spaceAnalysisCount: listSpaceAnalyses().length,
    equipmentPreferenceCount: listEquipmentPreferences().length,
    budgetTargetCount: listBudgetTargets().length,
    validationCount: listRequirementValidations().length,
  };
}

export function clearP4RequirementCollectionLayer(): void {
  clearRequirementValidations();
  clearBudgetTargets();
  clearEquipmentPreferences();
  clearSpaceAnalyses();
  clearConstraints();
  clearStakeholders();
  clearSurveys();
  clearQuestionnaires();
}

export function createP4RequirementCollectionManager(options?: {
  managerId?: string;
}): P4RequirementCollectionManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p4-req-mgr");
  let state: P4ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P4RequirementCollectionManagerSnapshot {
    const reg = getP4RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P4_REQUIREMENT_COLLECTION_ID,
      version: PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION,
      questionnaireCount: reg.questionnaireCount,
      surveyCount: reg.surveyCount,
      stakeholderCount: reg.stakeholderCount,
      validationCount: reg.validationCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): P4RequirementCollectionManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP4RequirementCollectionLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P4RequirementCollectionManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P4RequirementCollectionManagerSnapshot {
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
    registerQuestionnaire: (input) => {
      assertRunning("registerQuestionnaire");
      return registerQuestionnaire(input);
    },
    updateQuestionnaireStatus: (input) => {
      assertRunning("updateQuestionnaireStatus");
      return updateQuestionnaireStatus(input);
    },
    submitSurvey: (input) => {
      assertRunning("submitSurvey");
      return submitSurvey(input);
    },
    updateSurveyStatus: (input) => {
      assertRunning("updateSurveyStatus");
      return updateSurveyStatus(input);
    },
    registerStakeholder: (input) => {
      assertRunning("registerStakeholder");
      return registerStakeholder(input);
    },
    captureConstraint: (input) => {
      assertRunning("captureConstraint");
      return captureConstraint(input);
    },
    analyzeSpace: (input) => {
      assertRunning("analyzeSpace");
      return analyzeSpace(input);
    },
    recordEquipmentPreference: (input) => {
      assertRunning("recordEquipmentPreference");
      return recordEquipmentPreference(input);
    },
    setBudgetTarget: (input) => {
      assertRunning("setBudgetTarget");
      return setBudgetTarget(input);
    },
    updateBudgetTargetStatus: (input) => {
      assertRunning("updateBudgetTargetStatus");
      return updateBudgetTargetStatus(input);
    },
    validateRequirements: (input) => {
      assertRunning("validateRequirements");
      return validateRequirements(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP4RequirementCollectionReadiness();
    },
    manifest: getP4RegistryManifest,
  };
}

export {
  assertP4RequirementCollectionReadinessReady,
  getBudgetTarget,
  getConstraint,
  getEquipmentPreference,
  getQuestionnaire,
  getRequirementValidation,
  getSpaceAnalysis,
  getStakeholder,
  getSurvey,
  listBudgetTargets,
  listConstraints,
  listEquipmentPreferences,
  listQuestionnaires,
  listRequirementValidations,
  listSpaceAnalyses,
  listStakeholders,
  listSurveys,
};
