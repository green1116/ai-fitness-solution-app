import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SOURCE_VERSION,
  type GovernanceIncidentRecoveryProfileJsonSourceInput,
  type GovernanceIncidentRecoveryProfileJsonSourceResult,
} from "./incident-recovery-profile-config.json-source.types";
import { loadIncidentRecoveryProfileJsonSource } from "./incident-recovery-profile-config.json-source.loader";
import { parseIncidentRecoveryProfileJsonSource } from "./incident-recovery-profile-config.json-source.parser";
import { validateIncidentRecoveryProfileJsonSource } from "./incident-recovery-profile-config.json-source.validator";
import { mergeIncidentRecoveryProfileJsonSource } from "./incident-recovery-profile-config.json-source.merge";
import { resolveIncidentRecoveryProfileJsonSource } from "./incident-recovery-profile-config.json-source.resolver";
import { buildIncidentRecoveryProfileJsonSourceTrace } from "./incident-recovery-profile-config.json-source.trace";
import { summarizeIncidentRecoveryProfileJsonSource } from "./incident-recovery-profile-config.json-source.summary";

export function buildIncidentRecoveryProfileJsonSourceRuntime(
  input: GovernanceIncidentRecoveryProfileJsonSourceInput,
): GovernanceIncidentRecoveryProfileJsonSourceResult {
  const loaded = loadIncidentRecoveryProfileJsonSource(input.jsonPath);
  const parsed = parseIncidentRecoveryProfileJsonSource(loaded.file.content);
  const validated = validateIncidentRecoveryProfileJsonSource(parsed.parsed);
  const merged = mergeIncidentRecoveryProfileJsonSource({
    schema: validated.valid ? parsed.parsed : null,
    builtinProfiles: input.builtinProfiles,
  });
  const resolved = resolveIncidentRecoveryProfileJsonSource({
    loaded: loaded.loaded,
    valid: validated.valid,
    schema: parsed.parsed,
    builtinDecision: input.builtinDecision,
  });

  const trace = buildIncidentRecoveryProfileJsonSourceTrace({
    load: [`path=${loaded.file.path}`, `exists=${loaded.file.exists}`, `error=${loaded.error ?? "none"}`],
    parse: [`parsed=${parsed.parsed !== null}`, `error=${parsed.error ?? "none"}`],
    validate: [`valid=${validated.valid}`, ...validated.errors],
    merge: [
      `mergedProfiles=${merged.mergedProfiles.length}`,
      `override=${merged.overrideHit}`,
      ...merged.conflicts,
    ],
    resolve: [
      `useJsonSource=${resolved.useJsonSource}`,
      `fallback=${resolved.fallbackToBuiltin}`,
      `strategy=${resolved.decision.strategy}`,
    ],
    fallback: resolved.fallbackToBuiltin ? ["Fallback to builtin profile config."] : [],
  });

  const status: GovernanceIncidentRecoveryProfileJsonSourceResult["status"] =
    !loaded.loaded || !validated.valid ? (parsed.error || loaded.error ? "invalid" : "fallback") : "loaded";
  const core: Omit<GovernanceIncidentRecoveryProfileJsonSourceResult, "summary"> = {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SOURCE_VERSION,
    path: loaded.file.path,
    snapshot: {
      path: loaded.file.path,
      schemaVersion: parsed.parsed?.version ?? "builtin-fallback",
      sourceName: parsed.parsed?.source.name ?? "builtin-fallback",
    },
    loaded,
    validated,
    resolved,
    merged,
    trace,
    status,
    parsedSchema: parsed.parsed,
  };
  return {
    ...core,
    summary: summarizeIncidentRecoveryProfileJsonSource(core),
  };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SOURCE_VERSION };
