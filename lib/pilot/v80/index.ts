/**
 * V80 Pilot P1/P2 — Tender intake & requirement extraction
 */

export type {
  TenderRequirements,
  RequirementItem,
  PageRef,
  TenderBudgetHint,
  TenderScheduleHint,
} from "./intake/requirements.schema";
export { EMPTY_TENDER_REQUIREMENTS } from "./intake/requirements.schema";

export {
  tenderRequirementsSchema,
  mergeTenderRequirements,
  parseTenderRequirements,
  validateTenderRequirementsForApproval,
  assertValidForApproval,
  IntakeValidationError,
  type RequirementValidationIssue,
  type RequirementValidationResult,
} from "./intake/requirements.validation";

export {
  defaultTenderParserPipeline,
  runTenderParserPipeline,
  type TenderParserPipeline,
} from "./intake/parser.pipeline";

export { extractRequirementsFromParsedTender } from "./intake/extract.service";

export {
  mapRequirementsToProjectInput,
  mapRequirementsToQuoteCompanyInfo,
  mapRequirementsToTenderMetadata,
  mapRequirementsToQuoteContent,
} from "./intake/project.mapping";

export { buildIntakeSyncPackage, type IntakeSyncPackage } from "./intake/sync.service";

export {
  patchIntakeRequirements,
  resetIntakeRequirements,
  validateIntakeSession,
} from "./intake/review.service";

export {
  createIntakeSession,
  getIntakeSession,
  updateIntakeSession,
  listIntakeSessionsForOrg,
  clearIntakeStoreForTests,
  type TenderIntakeSession,
  type TenderIntakeStatus,
} from "./intake/intake.store";

export { uploadTenderIntake } from "./intake/upload.service";
export { approveTenderIntake, type ApproveIntakeResult } from "./intake/approve.service";
export { ensureV80WorkspaceForProduction } from "./intake/v80-bridge.service";
export {
  buildIntakeV80PipelineInput,
  buildPostGenerationTenderMetadata,
  getIntakeGenerationProgress,
  runIntakeV80Generation,
  type IntakeV80PipelineInput,
  type IntakeV80GenerationResult,
  type IntakeGenerationProgress,
} from "./intake/generation-bridge.service";
export {
  buildIntakeLinkage,
  getIntakeDeliverySnapshot,
  syncSessionWorkflowStatus,
  type IntakeArtifactItem,
  type IntakeArtifactStatus,
  type IntakeDeliverySnapshot,
  type IntakeGenerationError,
  type IntakeLinkage,
} from "./intake/artifact-delivery.service";
export { retryIntakeGeneration } from "./intake/generation-retry.service";
export {
  assertQaPassedForHandoff,
  assertQaPassedForHandoffAsync,
  getIntakeDisplayStatus,
  runIntakeQaGate,
  runIntakeQaGateAsync,
  IntakeQaError,
  type IntakeQaResult,
  type QaCheckResult,
  type QaReasonCode,
  type ProductionReadinessSummary,
} from "./intake/qa-gate.service";
export {
  appendIntakeAudit,
  listIntakeAudit,
  getIntakeAuditSummary,
  diffRequirements,
  type IntakeAuditEntry,
  type IntakeAuditStep,
} from "./intake/audit-trail.service";
export { getIntakeHistory, type IntakeHistorySnapshot } from "./intake/history.service";
export {
  recoverIntakeSession,
  type RecoverIntakeAction,
  type RecoverIntakeInput,
  type RecoverIntakeResult,
} from "./intake/recovery.service";
export {
  assertDeliveryUnlocked,
  assertSessionMutable,
  freezeIntakeSession,
  getIntakeFreezeSnapshot,
  isIntakeSessionFrozen,
  maybeFreezeIntakeOnReady,
  type DeliveryLockSummary,
  type FreezeIntakeResult,
  type FreezeReasonCode,
  type FrozenStateSnapshot,
} from "./intake/freeze-lock.service";
export {
  assertIntakeSignoffPass,
  buildDeliveryChecklist,
  buildIntakeReleaseManifest,
  buildIntakeRollbackIndex,
  buildIntakeSignoffReport,
  collectIntakeReadinessSummary,
  evaluateReleaseGates,
  getIntakeSignoffSnapshot,
  IntakeSignoffError,
  RELEASE_GATE_CATALOG,
  signOffIntakeSession,
  V80_PILOT_SIGNOFF_VERSION,
  type DeliveryChecklistItem,
  type IntakeReadinessState,
  type IntakeReadinessSummary,
  type IntakeReleaseManifest,
  type IntakeSignoffReport,
  type PilotReleaseGate,
  type RollbackIndexEntry,
  type SignOffIntakeResult,
} from "./intake/signoff.service";
