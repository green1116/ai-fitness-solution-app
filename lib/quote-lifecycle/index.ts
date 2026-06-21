/**
 * V58 — Quote Lifecycle (Runtime Control Plane)
 *
 * P6: Quote History Foundation
 * P7: Runtime Orchestration Layer
 * P8: Final Freeze & System Baseline Lock
 */

export {
  QUOTE_HISTORY_VERSION,
  type QuoteHistoryVersion,
  type QuoteHistoryRecord,
  type QuoteHistoryEventCategory,
  type QuoteHistoryTimelineEntry,
  type QuoteHistoryTimeline,
  type QuoteLifecycleReplayState,
  type QuoteJobReplayState,
  type QuoteExecutionReplayState,
  type QuoteExecutionReplayResult,
  type QuoteAuditSnapshot,
  type QuoteHistoryStore,
  type QuoteLifecycleReconstruction,
} from "./history/quote-history.types";

export {
  type QuoteDomainEvent,
  categorizeQuoteEvent,
  extractStatusFromPayload,
  extractStepIndexFromPayload,
} from "./history/quote-history.event";

export {
  createQuoteHistoryRecord,
  sortHistoryRecords,
  isDuplicateHistoryRecord,
} from "./history/quote-history.record";

export {
  createQuoteHistoryStore,
  appendHistoryRecord,
  getQuoteHistory,
  clearQuoteHistory,
  getQuoteHistoryCount,
} from "./history/quote-history.store";

export { buildQuoteTimeline } from "./history/quote-history.timeline";

export {
  replayQuoteExecution,
  reconstructLifecycleFromHistory,
  verifyReplayDeterminism,
} from "./history/quote-history.replay";

export {
  mapEventToHistoryRecord,
  mapEventsToHistoryRecords,
} from "./history/quote-history.mapper";

export {
  type QuoteHistorySelectorFilter,
  selectHistoryRecords,
  selectLifecycleRecords,
  selectJobRecords,
  selectExecutionRecords,
  selectRecordsByCausation,
  buildCausationChain,
} from "./history/quote-history.selector";

export {
  type QuoteHistoryValidationResult,
  validateHistoryRecord,
  validateHistoryRecords,
} from "./history/quote-history.validation";

export {
  ingestDomainEvent,
  ingestDomainEvents,
  buildQuoteHistoryPipeline,
  buildAuditSnapshot,
  buildAuditSnapshotFromStore,
} from "./history/quote-history.builder";

export {
  V58_P6_META_VERSION,
  V58_P6_PHASE,
  V58_P6_NAME,
  V58_P6_LAYER,
  V58_P6_CAPABILITIES,
  V58_P6_FORBIDDEN,
  V58_P6_META,
  formatV58P6MetaSummary,
  type V58P6Capability,
  type V58P6Meta,
} from "./freeze/v58-p6-meta";

export {
  V58_P6_FREEZE_VERSION,
  V58_P6_FREEZE_MANIFEST,
  formatV58P6FreezeSummary,
  isV58P6Frozen,
  type V58P6FreezeManifest,
} from "./freeze/v58-p6-final";

export {
  QUOTE_ORCHESTRATOR_VERSION,
  QUOTE_ORCHESTRATION_FLOW_ORDER,
  type QuoteOrchestratorVersion,
  type QuoteOrchestrationContext,
  type QuoteOrchestrationInput,
  type QuoteOrchestrationFlowStep,
  type QuoteLifecycleCoordinationResult,
  type QuoteJobCoordinationResult,
  type QuoteAsyncCoordinationResult,
  type QuoteEventCoordinationResult,
  type QuoteStatusCoordinationResult,
  type QuoteHistoryCoordinationResult,
  type QuoteOrchestrationStepResult,
  type QuoteOrchestrationResult,
  type QuoteOrchestrationFlowResolution,
} from "./orchestration/quote-orchestrator.types";

export {
  type QuoteLifecyclePort,
  type QuoteJobPort,
  type QuoteAsyncPort,
  type QuoteEventPort,
  type QuoteStatusPort,
  type QuoteHistoryPort,
  type QuoteOrchestratorPorts,
  type QuoteOrchestrator,
} from "./orchestration/quote-orchestrator.interface";

export {
  resolveLifecycleFlow,
  isValidFlowStep,
  getNextFlowStep,
  assertNoBypass,
} from "./orchestration/quote-orchestrator.flow";

export {
  validateOrchestrationContext,
  validateOrchestrationInput,
  type QuoteOrchestrationValidationResult,
} from "./orchestration/quote-orchestrator.validation";

export {
  createDefaultLifecyclePort,
  createDefaultJobPort,
  createDefaultAsyncPort,
  createDefaultEventPort,
  createDefaultStatusPort,
  createHistoryPort,
  resolveOrchestratorPorts,
} from "./orchestration/quote-orchestrator.resolver";

export {
  coordinateLifecycleEngine,
  coordinateJobEngine,
  coordinateAsyncClient,
  coordinateEventFlow,
  coordinateStatusSync,
  coordinateHistory,
  runCoordinationChain,
  type QuoteCoordinationChainResult,
} from "./orchestration/quote-orchestrator.coordinator";

export { dispatchOrchestrationFlow } from "./orchestration/quote-orchestrator.dispatcher";

export {
  createQuoteOrchestrator,
  runQuoteOrchestration,
  verifyOrchestrationDeterminism,
  type QuoteOrchestratorInstance,
} from "./orchestration/quote-orchestrator.engine";

export {
  V58_P7_META_VERSION,
  V58_P7_PHASE,
  V58_P7_NAME,
  V58_P7_LAYER,
  V58_P7_CAPABILITIES,
  V58_P7_FORBIDDEN,
  V58_P7_META,
  formatV58P7MetaSummary,
  type V58P7Capability,
  type V58P7Meta,
} from "./freeze/v58-p7-meta";

export {
  V58_P7_FREEZE_VERSION,
  V58_P7_FREEZE_MANIFEST,
  formatV58P7FreezeSummary,
  isV58P7Frozen,
  type V58P7FreezeManifest,
} from "./freeze/v58-p7-final";

export {
  V58_FINAL_META_VERSION,
  V58_P8_PHASE,
  V58_P8_NAME,
  V58_P8_LAYER,
  V58_FINAL_STATE,
  V58_P8_CAPABILITIES,
  V58_P8_FORBIDDEN,
  V58_P8_FROZEN_PHASES,
  V58_P8_META,
  formatV58P8MetaSummary,
  type V58P8Capability,
  type V58P8Meta,
} from "./freeze/v58-final-meta";

export {
  V58_FINAL_FREEZE_VERSION,
  V58_SYSTEM_ARCHITECTURE_CHAIN,
  V58_SYSTEM_ARCHITECTURE_SNAPSHOT,
  V58_CONTROL_PLANE_DEFINITION,
  type QuoteEventEnvelope,
  V58_EVENT_TYPES,
  V58_EVENT_CONTRACT_RULES,
  V58_EVENT_CONTRACT_LOCK,
  type V58LifecycleStatus,
  V58_LIFECYCLE_STATUSES,
  V58_LIFECYCLE_TRANSITIONS,
  V58_LIFECYCLE_LOCK,
  isLegalV58LifecycleTransition,
  V58_JOB_ENGINE_OPERATIONS,
  V58_JOB_LOCK,
  V58_ASYNC_CLIENT_BOUNDARY,
  type V58StatusSnapshot,
  V58_STATUS_REDUCER_RULES,
  V58_STATUS_PROJECTION_LOCK,
  V58_HISTORY_REPLAY_LOCK,
  V58_ORCHESTRATION_LOCK,
  V58_SYSTEM_GUARANTEES,
  V58_FROZEN_MODULE_REGISTRY,
  V58_P8_CAPABILITY_MAP,
  V58_FINAL_FREEZE_MANIFEST,
  formatV58FinalFreezeSummary,
  isV58FinalFrozen,
  type V58P8FreezeCapability,
  type V58FinalFreezeVersion,
  type V58FinalFreezeManifest,
} from "./freeze/v58-final-frozen";
