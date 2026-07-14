/**
 * E04-P1 — Business Agent Foundation public exports
 */

export {
  E04_BUSINESS_AGENT_BASE,
  E04_BUSINESS_AGENT_FREEZE_VERSION,
  E04_BUSINESS_AGENT_PLATFORM_ID,
  E04_BUSINESS_AGENT_VERSION,
  BUSINESS_AGENT_DOMAINS,
  BUSINESS_AGENT_LIFECYCLE_STAGES,
  BUSINESS_AGENT_STATUSES,
  BUSINESS_CAPABILITY_KINDS,
} from "./core/business-agent.constants";

export type {
  BusinessAgentDefinition,
  BusinessAgentDomain,
  BusinessAgentFoundationResult,
  BusinessAgentLifecycle,
  BusinessAgentLifecycleStage,
  BusinessAgentRegistryManifest,
  BusinessAgentStatus,
  BusinessCapabilityKind,
} from "./core/business-agent.types";

export {
  advanceBusinessLifecycle,
  assertBusinessAgentFoundationPass,
  buildBusinessAgentFoundation,
  buildBusinessAgentFoundationLifecycle,
  canAdvanceBusinessLifecycle,
  createInitialBusinessLifecycle,
} from "./core/business-agent.lifecycle";

export {
  BUSINESS_AGENT_CATALOG,
  buildBusinessAgentRegistryManifest,
  getBusinessAgentByDomain,
  getBusinessAgentById,
  isBusinessAgentDependencyGraphValid,
  listExecutableBusinessAgents,
} from "./core/business-agent.registry";

export type {
  BusinessCapabilityDefinition,
  BusinessCapabilityRegistryManifest,
} from "./capability/capability.types";

export {
  BUSINESS_CAPABILITY_CATALOG,
  buildBusinessCapabilityRegistryManifest,
  getCapabilityById,
  listCapabilitiesByKind,
} from "./capability/capability.registry";

export type {
  BusinessAgentExecutionContext,
  BusinessAgentInput,
  BusinessAgentMetadata,
} from "./runtime/business-agent.context";

export {
  assertValidBusinessAgentContext,
  createBusinessAgentExecutionContext,
} from "./runtime/business-agent.context";

export type {
  BusinessAgentExecuteBundle,
  BusinessAgentExecutionResult,
} from "./runtime/business-agent.executor";

export {
  executeBusinessAgent,
  executeBusinessAgentOrThrow,
} from "./runtime/business-agent.executor";
