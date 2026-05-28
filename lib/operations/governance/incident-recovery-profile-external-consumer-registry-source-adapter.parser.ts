import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer } from "./incident-recovery-profile-external-consumer-registry.types";
import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterParseResult,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSchema,
} from "./incident-recovery-profile-external-consumer-registry-source-adapter.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeConsumer(
  raw: Record<string, unknown>,
): GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer | null {
  const consumerId = typeof raw.consumerId === "string" ? raw.consumerId : "";
  if (!consumerId) return null;
  const category = raw.category;
  const validCategory =
    category === "recovery" ||
    category === "audit" ||
    category === "rendering" ||
    category === "registry" ||
    category === "reporting" ||
    category === "integration" ||
    category === "api" ||
    category === "partner"
      ? category
      : "integration";
  const consumerVersion = raw.consumerVersion === "v1" ? "v1" : "v2";
  const compatibilityTarget = raw.compatibilityTarget;
  const target =
    compatibilityTarget === "strict" ||
    compatibilityTarget === "compat" ||
    compatibilityTarget === "lenient" ||
    compatibilityTarget === "audit"
      ? compatibilityTarget
      : "compat";
  const fallbackPolicy = raw.fallbackPolicy;
  const policy =
    fallbackPolicy === "builtin" || fallbackPolicy === "compat" || fallbackPolicy === "none"
      ? fallbackPolicy
      : "compat";
  return {
    consumerId,
    consumerName: typeof raw.consumerName === "string" ? raw.consumerName : consumerId,
    consumerVersion,
    enabled: raw.enabled !== false,
    priority: typeof raw.priority === "number" ? raw.priority : 50,
    category: validCategory,
    requiredFields: Array.isArray(raw.requiredFields)
      ? raw.requiredFields.filter((f): f is string => typeof f === "string")
      : [],
    optionalFields: Array.isArray(raw.optionalFields)
      ? raw.optionalFields.filter((f): f is string => typeof f === "string")
      : [],
    fallbackPolicy: policy,
    compatibilityTarget: target,
    description: typeof raw.description === "string" ? raw.description : "",
    owner: typeof raw.owner === "string" ? raw.owner : "external",
    source: "external",
  };
}

export function parseIncidentRecoveryProfileExternalConsumerRegistrySource(
  rawPayload: string,
): GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterParseResult {
  if (!rawPayload.trim()) {
    return { parsed: null, error: "Empty source payload." };
  }
  try {
    const json: unknown = JSON.parse(rawPayload);
    if (!isRecord(json)) {
      return { parsed: null, error: "Source payload must be a JSON object." };
    }
    const consumersRaw = Array.isArray(json.consumers) ? json.consumers : [];
    const consumers = consumersRaw
      .filter(isRecord)
      .map(normalizeConsumer)
      .filter((c): c is GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer => c !== null);
    const mergeStrategy = json.mergeStrategy;
    const strategy =
      mergeStrategy === "override" ||
      mergeStrategy === "extend" ||
      mergeStrategy === "fallback" ||
      mergeStrategy === "priorityMerge"
        ? mergeStrategy
        : "extend";
    const source = isRecord(json.source) ? json.source : {};
    const parsed: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSchema = {
      version: typeof json.version === "string" ? json.version : "external-consumer-registry-v1",
      source: {
        name: typeof source.name === "string" ? source.name : "unknown",
        owner: typeof source.owner === "string" ? source.owner : "unknown",
        updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : new Date().toISOString(),
      },
      mergeStrategy: strategy,
      consumers,
    };
    return { parsed, error: null };
  } catch (error) {
    return {
      parsed: null,
      error: error instanceof Error ? error.message : "JSON parse failed.",
    };
  }
}
