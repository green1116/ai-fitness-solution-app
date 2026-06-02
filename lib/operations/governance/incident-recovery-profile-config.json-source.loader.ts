import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
  GovernanceIncidentRecoveryProfileJsonSourceFile,
  GovernanceIncidentRecoveryProfileJsonSourceLoadResult,
} from "./incident-recovery-profile-config.json-source.types";

export const DEFAULT_INCIDENT_RECOVERY_PROFILE_JSON_PATH =
  "config/incident-recovery-profile.local.json";

export function loadIncidentRecoveryProfileJsonSource(path?: string): GovernanceIncidentRecoveryProfileJsonSourceLoadResult {
  const targetPath = resolve(process.cwd(), path ?? DEFAULT_INCIDENT_RECOVERY_PROFILE_JSON_PATH);
  const file: GovernanceIncidentRecoveryProfileJsonSourceFile = {
    path: targetPath,
    exists: existsSync(targetPath),
    content: "",
  };
  if (!file.exists) {
    return {
      loaded: false,
      file,
      error: "JSON source file not found.",
    };
  }
  try {
    file.content = readFileSync(targetPath, "utf8");
    return {
      loaded: true,
      file,
      error: null,
    };
  } catch (error) {
    return {
      loaded: false,
      file,
      error: error instanceof Error ? error.message : "Unknown JSON file read error.",
    };
  }
}
