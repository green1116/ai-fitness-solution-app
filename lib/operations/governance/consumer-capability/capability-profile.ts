import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer } from "../incident-recovery-profile-external-consumer-registry.types";
import type { ConsumerCapabilityProfile } from "./capability-types";

export function buildConsumerCapabilityProfile(
  consumer: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer,
  canonicalVersion: string,
): ConsumerCapabilityProfile {
  const baseFeatures = [
    "canonical-payload-read",
    consumer.consumerVersion === "v2" ? "schema-v2" : "schema-v1",
    "rendering-output",
  ];
  if (consumer.category === "audit") baseFeatures.push("audit-trace");
  if (consumer.category === "recovery") baseFeatures.push("recovery-strategy-bind");
  if (consumer.compatibilityTarget === "strict") baseFeatures.push("full-rendering");
  if (consumer.compatibilityTarget === "compat") baseFeatures.push("partial-rendering");
  if (consumer.compatibilityTarget === "lenient") baseFeatures.push("fallback-rendering");

  const tier: ConsumerCapabilityProfile["compatibilityTier"] =
    consumer.source === "builtin" && consumer.consumerVersion === "v2"
      ? "native"
      : consumer.compatibilityTarget === "strict"
        ? "compatible"
        : consumer.fallbackPolicy !== "none"
          ? "legacy"
          : "restricted";

  return {
    consumerId: consumer.consumerId,
    supportedSchemas: [canonicalVersion, "json-local-v2", "json-local-v1"],
    supportedFeatures: baseFeatures,
    supportedPolicies: [consumer.compatibilityTarget],
    renderingModes: [consumer.compatibilityTarget],
    transportProtocols: consumer.category === "api" ? ["http", "grpc"] : ["internal"],
    negotiationVersion: "r9.2-1",
    fallbackModes: consumer.fallbackPolicy === "none" ? [] : ["fallback-rendering", "minimal-transport"],
    degradationLevel: tier === "native" ? "none" : tier === "compatible" ? "partial" : "restricted",
    compatibilityTier: tier,
    lastValidatedAt: new Date().toISOString(),
  };
}
