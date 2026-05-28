import type { GovernanceIncidentRecoveryProfileJsonSourceSchema } from "./incident-recovery-profile-config.json-source.types";

export function parseIncidentRecoveryProfileJsonSource(content: string): {
  parsed: GovernanceIncidentRecoveryProfileJsonSourceSchema | null;
  error: string | null;
} {
  try {
    const raw = JSON.parse(content) as Partial<GovernanceIncidentRecoveryProfileJsonSourceSchema>;
    if (!raw || typeof raw !== "object") {
      return { parsed: null, error: "Parsed JSON is not an object." };
    }
    return {
      parsed: raw as GovernanceIncidentRecoveryProfileJsonSourceSchema,
      error: null,
    };
  } catch (error) {
    return {
      parsed: null,
      error: error instanceof Error ? error.message : "Unknown JSON parse error.",
    };
  }
}
