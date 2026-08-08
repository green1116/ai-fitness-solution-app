/**
 * V80 Pilot — Tender intake & requirement extraction
 */

export type {
  TenderRequirements,
  RequirementItem,
  RequirementReviewStatus,
  PageRef,
  TenderBudgetHint,
  TenderScheduleHint,
  ConfidenceBand,
  RequirementEvidenceSpan,
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
  setRequirementItemReview,
  bulkSetRequirementItemReview,
  reExtractIntakeRequirements,
  setRequirementEvidenceOverride,
  type PatchIntakeResult,
  type RequirementItemListKey,
} from "./intake/review.service";

export {
  CONFIDENCE_HIGH_THRESHOLD,
  CONFIDENCE_LOW_THRESHOLD,
  confidenceBandFromScore,
  enrichRequirementItemEvidence,
  enrichRequirementsEvidence,
  findEvidenceSpans,
  itemNeedsEvidenceConfirmation,
  listEvidenceGateIssues,
  scoreRequirementConfidence,
} from "./intake/confidence.service";

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
export {
  resolveIntakeApprovePath,
  hasCompleteProductionEntities,
  hasPartialProductionEntities,
  deriveCreateTerminalStatus,
  type IntakeCreateTerminalStatus,
} from "./intake/approve.service";
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
  INTAKE_OPS_STUCK_MS,
  buildIntakeOpsSnapshot,
  detectIntakeStuck,
  deriveIntakeOpsStatus,
  listIntakeOpsBoard,
  listIntakeOpsExceptions,
  normalizeIntakeFailure,
  operatorResumeIntake,
  recommendOpsAction,
  type IntakeFailureCategory,
  type IntakeFailureCode,
  type IntakeOpsRecommendedAction,
  type IntakeOpsSnapshot,
  type IntakeOpsStatus,
  type NormalizedIntakeFailure,
  type OperatorResumeAction,
  type OperatorResumeResult,
} from "./intake/ops.service";
export type {
  ClarificationAnswerInput,
  ClarificationGap,
  ClarificationGapKind,
  ClarificationMergeTarget,
  ClarificationQuestion,
  ClarificationQuestionStatus,
  ClarificationRequirementListKey,
  ClarificationSeverity,
  ClarificationState,
} from "./intake/clarification.schema";
export {
  answerClarificationQuestion,
  assertClarificationsResolved,
  detectRequirementGaps,
  generateClarificationQuestions,
  getClarificationSnapshot,
  listOpenBlockingClarifications,
  mergeClarificationAnswerIntoRequirements,
  runClarificationDetection,
  skipClarificationQuestion,
  type AnswerClarificationResult,
  type RunClarificationResult,
} from "./intake/clarification.service";
export {
  INTAKE_DOC_TYPE_PRIORITY,
  computeDocumentPriority,
  inferIntakeDocumentType,
  type IntakeDocumentEntry,
  type IntakeDocumentType,
  type MultiDocConsolidationState,
  type RequirementConflict,
  type RequirementConflictKind,
  type RequirementConflictResolution,
} from "./intake/multidoc.schema";
export {
  addParsedDocumentToIntake,
  consolidateDocumentRequirements,
  consolidateIntakeSession,
  extractDocumentRequirements,
  listIntakeDocuments,
  resolveConsolidationConflict,
  type AddIntakeDocumentResult,
  type ConsolidateIntakeResult,
} from "./intake/multidoc.service";
export type {
  ComplianceFinding,
  ComplianceRiskLevel,
  ComplianceRule,
  ComplianceRuleCategory,
  ComplianceSeverity,
  ComplianceValidationReport,
  IntakeComplianceState,
  KnowledgeDomain,
  KnowledgeReference,
} from "./intake/compliance.schema";
export {
  DEFAULT_COMPLIANCE_RULES,
  DEFAULT_KNOWLEDGE_REFERENCES,
} from "./intake/compliance.catalog";
export {
  acknowledgeComplianceFinding,
  assertCompliancePassed,
  evaluateComplianceRules,
  getComplianceSnapshot,
  listComplianceRules,
  listKnowledgeReferences,
  runIntakeComplianceValidation,
  type RunComplianceResult,
} from "./intake/compliance.service";
export {
  INTAKE_HANDOFF_PACKAGE_VERSION,
  type HandoffApprovalStatus,
  type HandoffAudience,
  type HandoffDocumentSummary,
  type HandoffEvidenceTraceItem,
  type HandoffRequirementSummary,
  type HandoffTraceability,
  type IntakeHandoffPackage,
  type IntakeHandoffState,
} from "./intake/handoff-package.schema";
export {
  buildIntakeHandoffPackage,
  exportIntakeHandoffPackageJson,
  generateIntakeHandoffPackage,
  getIntakeHandoffPackage,
  type BuildHandoffResult,
} from "./intake/handoff-package.service";
export {
  PROJECT_BOOTSTRAP_VERSION,
  type BootstrapKickoffSummary,
  type BootstrapMilestone,
  type BootstrapMilestoneStatus,
  type BootstrapOwner,
  type BootstrapOwnerRole,
  type BootstrapTask,
  type BootstrapTaskStatus,
  type IntakeBootstrapState,
  type ProjectBootstrapPackage,
} from "./intake/bootstrap.schema";
export {
  buildProjectBootstrapPackage,
  getProjectBootstrap,
  seedProjectBootstrap,
  type SeedBootstrapResult,
} from "./intake/bootstrap.service";
export {
  INTAKE_ANALYTICS_VERSION,
  type BootstrapAnalytics,
  type ClarificationAnalytics,
  type ComplianceAnalytics,
  type ConfidenceAnalytics,
  type DocumentSourceAnalytics,
  type DurationMetrics,
  type IntakeAnalyticsKpis,
  type IntakeAnalyticsReport,
  type IntakeStatusCount,
  type TrendPoint,
} from "./intake/analytics.schema";
export {
  aggregateIntakeAnalytics,
  buildIntakeAnalyticsReport,
  exportIntakeAnalyticsJson,
} from "./intake/analytics.service";
export {
  ORG_KNOWLEDGE_VERSION,
  type OrgKnowledgeLibrary,
  type OrgKnowledgeLookupResult,
  type OrgKnowledgePattern,
  type OrgKnowledgePatternKind,
  type OrgKnowledgeRecommendation,
} from "./intake/org-knowledge.schema";
export {
  clearOrgKnowledgeStoreForTests,
  getOrgKnowledgeLibrary,
  saveOrgKnowledgeLibrary,
} from "./intake/org-knowledge.store";
export {
  buildOrgKnowledgeLibrary,
  exportOrgKnowledgeJson,
  getOrgKnowledgeSnapshot,
  lookupOrgKnowledgeRecommendations,
  rebuildOrgKnowledgeLibrary,
} from "./intake/org-knowledge.service";
export {
  ORG_KNOWLEDGE_GOVERNANCE_VERSION,
  KNOWLEDGE_FRESH_DAYS,
  KNOWLEDGE_AGING_DAYS,
  LIBRARY_FRESH_DAYS,
  LIBRARY_STALE_DAYS,
  type GovernedOrgKnowledgeRecommendation,
  type KnowledgeAuthorityLevel,
  type KnowledgeFreshnessBand,
  type KnowledgeGovernanceAction,
  type KnowledgeGovernanceAuditEntry,
  type KnowledgeGovernanceEntry,
  type KnowledgeGovernanceLookupMeta,
  type KnowledgeLifecycleStatus,
  type KnowledgeLineageEntry,
  type KnowledgeTrustBand,
  type OrgKnowledgeGovernanceState,
  type RecommendationTrustIndicator,
} from "./intake/org-knowledge-governance.schema";
export {
  clearOrgKnowledgeGovernanceForTests,
  getOrgKnowledgeGovernance,
  saveOrgKnowledgeGovernance,
} from "./intake/org-knowledge-governance.store";
export {
  applyGovernanceToLookup,
  archiveOrgKnowledgePattern,
  authorityScoreFor,
  computeFreshnessBand,
  demoteOrgKnowledgePattern,
  deprecateOrgKnowledgePattern,
  freshnessScore,
  getOrgKnowledgeGovernanceSnapshot,
  listGovernedPatterns,
  overrideOrgKnowledgeSuggestion,
  promoteOrgKnowledgePattern,
  restoreOrgKnowledgePattern,
  syncOrgKnowledgeGovernance,
  trustBandFor,
  trustScoreFor,
} from "./intake/org-knowledge-governance.service";
export {
  KNOWLEDGE_RECOMMENDATION_VERSION,
  DEFAULT_RANK_WEIGHTS,
  type KnowledgeRecommendationPack,
  type OrgRecommendationEffectiveness,
  type PatternEffectivenessStats,
  type RankedKnowledgeRecommendation,
  type RecommendationCategory,
  type RecommendationFeedbackEvent,
  type RecommendationFeedbackStatus,
  type RecommendationRankWeights,
} from "./intake/knowledge-recommendation.schema";
export {
  clearKnowledgeRecommendationStoreForTests,
  getOrgRecommendationEffectiveness,
  getRecommendationPack,
} from "./intake/knowledge-recommendation.store";
export {
  acceptKnowledgeRecommendation,
  computeRankScore,
  dismissKnowledgeRecommendation,
  ensureKnowledgeRecommendations,
  generateKnowledgeRecommendations,
  getKnowledgeRecommendationPack,
  getRecommendationEffectiveness,
  jaccardSimilarity,
  listRecommendationFeedback,
  tokenizeForSimilarity,
} from "./intake/knowledge-recommendation.service";
export {
  CONTINUOUS_IMPROVEMENT_VERSION,
  type AppliedGovernanceFeedback,
  type ContinuousImprovementReport,
  type ContinuousImprovementState,
  type GovernanceSuggestionAction,
  type ImprovementAggregation,
  type ImprovementTrendPoint,
  type KnowledgeQualityBand,
  type PatternQualityScore,
} from "./intake/continuous-improvement.schema";
export {
  clearContinuousImprovementStoreForTests,
  getContinuousImprovementState,
} from "./intake/continuous-improvement.store";
export {
  applyImprovementGovernanceFeedback,
  buildContinuousImprovementReport,
  exportContinuousImprovementJson,
  getContinuousImprovementSnapshot,
  getPatternConfidenceAdjustment,
  qualityBandFor,
  scorePatternQuality,
  suggestGovernanceAction,
} from "./intake/continuous-improvement.service";
export {
  ORG_BENCHMARK_VERSION,
  type BenchmarkBand,
  type BenchmarkCategoryId,
  type BenchmarkOpportunity,
  type BenchmarkTrendPoint,
  type CategoryBenchmark,
  type MaturityAssessment,
  type MaturityLevel,
  type OrgBenchmarkReport,
  type OrganizationScorecard,
} from "./intake/org-benchmark.schema";
export {
  assessMaturity,
  bandForScore,
  buildOrgBenchmarkReport,
  detectBenchmarkOpportunities,
  exportOrgBenchmarkJson,
  percentileVsTarget,
} from "./intake/org-benchmark.service";
export {
  CROSS_PROJECT_VERSION,
  type CrossProjectExplorerReport,
  type CrossProjectInsight,
  type CrossProjectSimilarityReport,
  type ProjectComparisonView,
  type ProjectFingerprint,
  type ReusableArtifact,
  type SimilarProjectMatch,
} from "./intake/cross-project.schema";
export {
  buildCrossProjectExplorer,
  buildProjectComparison,
  buildProjectFingerprint,
  exportCrossProjectJson,
  findSimilarProjects,
  scoreFingerprintSimilarity,
} from "./intake/cross-project.service";
export {
  ENTERPRISE_DECISION_VERSION,
  type DecisionHealthBand,
  type DecisionRecommendationItem,
  type DeliveryRiskScore,
  type EnterpriseDecisionReport,
  type ExecutiveScorecard,
  type InvestmentPriorityItem,
  type ProjectReadinessScore,
} from "./intake/enterprise-decision.schema";
export {
  buildEnterpriseDecisionReport,
  exportEnterpriseDecisionJson,
  getSessionDecisionSnapshot,
  healthBandFor,
  scoreDeliveryRisk,
  scoreProjectReadiness,
} from "./intake/enterprise-decision.service";
export {
  PRODUCTION_HARDENING_VERSION,
  type HardeningCheckCategory,
  type HardeningCheckResult,
  type HardeningCheckStatus,
  type ProductionHardeningReport,
  type ProductionReadinessBand,
  type RegressionSuiteEntry,
} from "./intake/production-hardening.schema";
export {
  HARDENING_EXPECTED,
  REGRESSION_VERIFY_SCRIPTS,
  exportProductionHardeningJson,
  listRegressionSuiteCatalog,
  runProductionHardeningChecks,
} from "./intake/production-hardening.service";
export {
  PILOT_GA_VERSION,
  PILOT_GA_CODENAME,
  PILOT_GA_RELEASE_DATE,
  type GaApiRouteEntry,
  type GaArchitectureLayer,
  type GaPilotEntry,
  type GaReleaseManifest,
  type GaUiSurfaceEntry,
  type GaVerificationSummary,
} from "./intake/ga-release.schema";
export {
  GA_API_INDEX,
  GA_ARCHITECTURE,
  GA_ARTIFACT_PATHS,
  GA_PILOTS,
  GA_UI_SURFACES,
  GA_VERSION_CONSTANTS,
  buildGaReleaseManifest,
  buildGaVerificationSummary,
  computeGaFingerprint,
  exportGaReleaseManifestJson,
  listGaArtifactPresence,
} from "./intake/ga-release.service";
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
