import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterLoadResult,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType,
} from "./incident-recovery-profile-external-consumer-registry-source-adapter.types";

export const DEFAULT_EXTERNAL_CONSUMER_REGISTRY_JSON_PATH =
  "config/external-consumer-registry.local.json";

export function loadIncidentRecoveryProfileExternalConsumerRegistrySource(input: {
  sourceType: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType;
  sourcePath?: string;
  inlinePayload?: string;
}): GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterLoadResult {
  if (input.sourceType === "inline") {
    return {
      loaded: Boolean(input.inlinePayload && input.inlinePayload.length > 0),
      path: "inline",
      rawPayload: input.inlinePayload ?? "",
      error: input.inlinePayload ? null : "Inline source payload missing.",
    };
  }
  if (input.sourceType === "env") {
    const envPayload = process.env.GOVERNANCE_EXTERNAL_CONSUMER_REGISTRY_JSON ?? "";
    return {
      loaded: envPayload.length > 0,
      path: "env:GOVERNANCE_EXTERNAL_CONSUMER_REGISTRY_JSON",
      rawPayload: envPayload,
      error: envPayload.length > 0 ? null : "Environment source payload missing.",
    };
  }
  if (input.sourceType === "db" || input.sourceType === "remote") {
    return {
      loaded: false,
      path: input.sourceType,
      rawPayload: "",
      error: `${input.sourceType} source adapter not enabled; reserved for future integration.`,
    };
  }
  const targetPath = resolve(
    process.cwd(),
    input.sourcePath ?? DEFAULT_EXTERNAL_CONSUMER_REGISTRY_JSON_PATH,
  );
  if (!existsSync(targetPath)) {
    return {
      loaded: false,
      path: targetPath,
      rawPayload: "",
      error: "Source file not found.",
    };
  }
  try {
    return {
      loaded: true,
      path: targetPath,
      rawPayload: readFileSync(targetPath, "utf8"),
      error: null,
    };
  } catch (error) {
    return {
      loaded: false,
      path: targetPath,
      rawPayload: "",
      error: error instanceof Error ? error.message : "Unknown file read error.",
    };
  }
}
