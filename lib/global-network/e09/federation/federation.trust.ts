/**
 * E09-P4 — Federation Trust Engine
 * Evaluate, adjust, and validate trust on FederatedIdentity
 */

import {
  getFederation,
  listFederations,
  setFederationTrustLevel,
} from "./federation.registry";
import { getTrustPaths, type TrustPath } from "./federation.graph";
import type {
  FederatedIdentity,
  FederationScope,
  FederationStatus,
} from "./federation.types";

export type TrustEvaluation = {
  sourceId: string;
  targetId: string;
  valid: boolean;
  /** Best path trust (0 if none) */
  trust: number;
  pathCount: number;
  bestPath?: TrustPath;
  reason: string;
  evaluatedAt: string;
};

export type TrustValidityOptions = {
  minTrustLevel?: number;
  requireActive?: boolean;
  scope?: FederationScope;
};

function nowIso(): string {
  return new Date().toISOString();
}

function clampTrustLevel(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("trustLevel must be a finite number");
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Evaluate effective trust from source federation to target
 * via the trust graph (best pathTrust wins).
 */
export function evaluateTrust(
  sourceId: string,
  targetId: string,
  options?: { maxDepth?: number; minTrust?: number },
): TrustEvaluation {
  const source = sourceId.trim();
  const target = targetId.trim();
  const minTrust = options?.minTrust ?? 0;

  if (!getFederation(source)) {
    return {
      sourceId: source,
      targetId: target,
      valid: false,
      trust: 0,
      pathCount: 0,
      reason: `source federation not found: ${source}`,
      evaluatedAt: nowIso(),
    };
  }
  if (!getFederation(target)) {
    return {
      sourceId: source,
      targetId: target,
      valid: false,
      trust: 0,
      pathCount: 0,
      reason: `target federation not found: ${target}`,
      evaluatedAt: nowIso(),
    };
  }

  const paths = getTrustPaths(source, target, {
    maxDepth: options?.maxDepth,
  });
  const bestPath = paths[0];
  const trust = bestPath?.pathTrust ?? 0;
  const valid = paths.length > 0 && trust >= minTrust;

  return {
    sourceId: source,
    targetId: target,
    valid,
    trust,
    pathCount: paths.length,
    bestPath,
    reason: valid
      ? `trust=${trust} via path length ${bestPath!.nodes.length}`
      : paths.length === 0
        ? "no trust path found"
        : `best trust ${trust} below minimum ${minTrust}`,
    evaluatedAt: nowIso(),
  };
}

/** Adjust a federation's trustLevel by delta (clamped 0–100). */
export function adjustTrustLevel(
  federationId: string,
  delta: number,
): FederatedIdentity {
  if (!Number.isFinite(delta)) {
    throw new Error("delta must be a finite number");
  }
  const entry = getFederation(federationId);
  if (!entry) throw new Error(`federation not found: ${federationId}`);

  return setFederationTrustLevel(
    entry.id,
    clampTrustLevel(entry.trustLevel + delta),
  );
}

/** Whether a federation's trust is valid under the given options. */
export function isTrustValid(
  federationId: string,
  options?: TrustValidityOptions,
): boolean {
  const entry = getFederation(federationId);
  if (!entry) return false;

  const requireActive = options?.requireActive ?? true;
  if (requireActive && entry.status !== "ACTIVE") return false;

  if (options?.scope && entry.scope !== options.scope) return false;

  const minTrustLevel = options?.minTrustLevel ?? 0;
  return entry.trustLevel >= minTrustLevel;
}

export function listTrustedFederations(
  options?: TrustValidityOptions,
): FederatedIdentity[] {
  return listFederations().filter((f) => isTrustValid(f.id, options));
}
