/**
 * E05-P1 — Intelligence Foundation public exports
 */

export {
  E05_INTELLIGENCE_BASE,
  E05_INTELLIGENCE_FREEZE_VERSION,
  E05_INTELLIGENCE_PLATFORM_ID,
  E05_INTELLIGENCE_VERSION,
  INTELLIGENCE_DOMAINS,
  INTELLIGENCE_LIFECYCLE_STAGES,
  INTELLIGENCE_STATUSES,
  INSIGHT_KINDS,
} from "./core/intelligence.constants";

export type {
  IntelligenceDefinition,
  IntelligenceDomain,
  IntelligenceFoundationResult,
  IntelligenceLifecycle,
  IntelligenceLifecycleStage,
  IntelligenceRegistryManifest,
  IntelligenceStatus,
  InsightKind,
} from "./core/intelligence.types";

export {
  advanceIntelligenceLifecycle,
  assertIntelligenceFoundationPass,
  buildIntelligenceFoundation,
  buildIntelligenceFoundationLifecycle,
  canAdvanceIntelligenceLifecycle,
  createInitialIntelligenceLifecycle,
} from "./core/intelligence.lifecycle";

export {
  INTELLIGENCE_CATALOG,
  buildIntelligenceRegistryManifest,
  getIntelligenceByDomain,
  getIntelligenceById,
  isIntelligenceDependencyGraphValid,
  listExecutableIntelligenceModules,
} from "./core/intelligence.registry";

export type {
  InsightDefinition,
  InsightRegistryManifest,
} from "./insight/insight.types";

export {
  INSIGHT_CATALOG,
  buildInsightRegistryManifest,
  getInsightById,
  listInsightsByKind,
} from "./insight/insight.registry";

export type {
  IntelligenceExecutionContext,
  IntelligenceInput,
  IntelligenceMetadata,
} from "./runtime/intelligence.context";

export {
  assertValidIntelligenceContext,
  createIntelligenceExecutionContext,
} from "./runtime/intelligence.context";

export type {
  IntelligenceExecuteBundle,
  IntelligenceExecutionResult,
} from "./runtime/intelligence.executor";

export {
  executeIntelligence,
  executeIntelligenceOrThrow,
} from "./runtime/intelligence.executor";
