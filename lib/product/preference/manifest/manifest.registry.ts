/**
 * Product Preference — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listPreferenceConsents } from "../consent/consent.registry";
import { getPreference } from "../registry/preference.registry";
import { listPreferenceResolutionRules } from "../resolution/resolution.registry";
import { listPreferenceScopes } from "../scope/scope.registry";
import { listPreferenceValidations } from "../validation/validation.registry";

export type PreferenceReleaseManifest = {
  id: string;
  preferenceId: string;
  preferenceKey: string;
  checksum: string;
  scopeId: string;
  consentId: string;
  resolutionId: string;
  validationId: string;
  createdAt: string;
};

const releases = new Map<string, PreferenceReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: PreferenceReleaseManifest,
): PreferenceReleaseManifest {
  return { ...release };
}

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function createPreferenceReleaseManifest(input: {
  id?: string;
  preferenceId: string;
}): PreferenceReleaseManifest {
  const preferenceId = input.preferenceId.trim();
  if (!preferenceId) throw new Error("manifest.preferenceId is required");

  const preference = getPreference(preferenceId);
  if (!preference) throw new Error(`preference not found: ${preferenceId}`);

  const scopes = listPreferenceScopes({ preferenceId });
  if (scopes.length < 1) throw new Error("scope missing");
  const consents = listPreferenceConsents({ preferenceId });
  if (consents.length < 1) throw new Error("consent missing");
  const rules = listPreferenceResolutionRules({ preferenceId });
  if (rules.length < 1) throw new Error("resolution missing");
  const validations = listPreferenceValidations({ preferenceId });
  const valid = validations.find((v) => v.verdict === "VALID");
  if (!valid) throw new Error("valid validation missing");

  const payload = {
    preferenceKey: preference.preferenceKey,
    kind: preference.kind,
    channelKey: preference.channelKey,
    templateKey: preference.templateKey,
    scopes: scopes
      .map((s) => ({ level: s.level, subjectKey: s.subjectKey }))
      .sort((a, b) =>
        `${a.level}:${a.subjectKey}`.localeCompare(
          `${b.level}:${b.subjectKey}`,
        ),
      ),
    consents: consents
      .map((c) => ({ scopeId: c.scopeId, state: c.state }))
      .sort((a, b) => a.scopeId.localeCompare(b.scopeId)),
    resolution: {
      strategy: rules[0].strategy,
      respectOptOut: rules[0].respectOptOut,
    },
    validation: valid.verdict,
  };

  const id = input.id?.trim() || createId("prefrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: PreferenceReleaseManifest = {
    id,
    preferenceId,
    preferenceKey: preference.preferenceKey,
    checksum: checksumPayload(payload),
    scopeId: scopes[0].id,
    consentId: consents[0].id,
    resolutionId: rules[0].id,
    validationId: valid.id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getPreferenceReleaseManifest(
  id: string,
): PreferenceReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listPreferenceReleaseManifests(): PreferenceReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearPreferenceReleaseManifests(): void {
  releases.clear();
}
