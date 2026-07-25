/**
 * Product P4 — Requirement Collection public exports
 * Isolated namespace: lib/product/p4
 */

export {
  BUDGET_TARGET_STATUSES,
  CONSTRAINT_KINDS,
  EQUIPMENT_PREFERENCE_LEVELS,
  P4_MANAGER_STATUSES,
  P4_READINESS_VERDICTS,
  PRODUCT_P4_COLLECTION_FREEZE_VERSION,
  PRODUCT_P4_REQUIREMENT_COLLECTION_BASE,
  PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION,
  PRODUCT_P4_REQUIREMENT_COLLECTION_ID,
  PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION,
  QUESTIONNAIRE_STATUSES,
  SPACE_ANALYSIS_STATUSES,
  STAKEHOLDER_ROLES,
  SURVEY_STATUSES,
  VALIDATION_VERDICTS,
} from "./questionnaire/questionnaire.constants";

export type {
  CollectionMetadata,
  P4ManagerStatus,
  P4ReadinessCheck,
  P4ReadinessResult,
  P4ReadinessVerdict,
  P4RegistryManifest,
  Questionnaire,
  QuestionnaireStatus,
  RegisterQuestionnaireInput,
  UpdateQuestionnaireStatusInput,
} from "./questionnaire/questionnaire.types";

export {
  clearQuestionnaires,
  getQuestionnaire,
  listQuestionnaires,
  registerQuestionnaire,
  updateQuestionnaireStatus,
} from "./questionnaire/questionnaire.registry";

export type {
  SubmitSurveyInput,
  SurveyMetadata,
  SurveyResponse,
  SurveyStatus,
  UpdateSurveyStatusInput,
} from "./survey/survey.types";

export {
  clearSurveys,
  getSurvey,
  listSurveys,
  submitSurvey,
  updateSurveyStatus,
} from "./survey/survey.registry";

export type {
  RegisterStakeholderInput,
  Stakeholder,
  StakeholderMetadata,
  StakeholderRole,
} from "./stakeholder/stakeholder.types";

export {
  clearStakeholders,
  getStakeholder,
  listStakeholders,
  registerStakeholder,
} from "./stakeholder/stakeholder.registry";

export type {
  CaptureConstraintInput,
  ConstraintKind,
  ConstraintMetadata,
  ProjectConstraint,
} from "./constraint/constraint.types";

export {
  captureConstraint,
  clearConstraints,
  getConstraint,
  listConstraints,
} from "./constraint/constraint.registry";

export type {
  AnalyzeSpaceInput,
  SpaceAnalysis,
  SpaceAnalysisMetadata,
  SpaceAnalysisStatus,
} from "./space-analysis/space.types";

export {
  analyzeSpace,
  clearSpaceAnalyses,
  getSpaceAnalysis,
  listSpaceAnalyses,
} from "./space-analysis/space.registry";

export type {
  EquipmentPreference,
  EquipmentPreferenceLevel,
  EquipmentPreferenceMetadata,
  RecordEquipmentPreferenceInput,
} from "./equipment-preference/equipment.types";

export {
  clearEquipmentPreferences,
  getEquipmentPreference,
  listEquipmentPreferences,
  recordEquipmentPreference,
} from "./equipment-preference/equipment.registry";

export type {
  BudgetTarget,
  BudgetTargetMetadata,
  BudgetTargetStatus,
  SetBudgetTargetInput,
  UpdateBudgetTargetStatusInput,
} from "./budget-target/budget.types";

export {
  clearBudgetTargets,
  getBudgetTarget,
  listBudgetTargets,
  setBudgetTarget,
  updateBudgetTargetStatus,
} from "./budget-target/budget.registry";

export type {
  RequirementValidation,
  ValidateRequirementsInput,
  ValidationMetadata,
  ValidationVerdict,
} from "./requirement-validation/validation.types";

export {
  clearRequirementValidations,
  getRequirementValidation,
  listRequirementValidations,
  validateRequirements,
} from "./requirement-validation/validation.registry";

export {
  assertP4RequirementCollectionReadinessReady,
  evaluateP4RequirementCollectionReadiness,
} from "./requirement-validation/validation.readiness";

export {
  clearP4RequirementCollectionLayer,
  createP4RequirementCollectionManager,
  getP4RegistryManifest,
  type P4RequirementCollectionManager,
  type P4RequirementCollectionManagerSnapshot,
} from "./requirement.manager";

export {
  assertProductP4ReleaseGatePass,
  checkProductP4ReleaseGate,
  PRODUCT_P4_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
