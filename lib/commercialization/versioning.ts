/**
 * V3.5 commercial runtime versioning compat entry.
 * Minimal pass-through for index.ts module resolution.
 */

export const COMMERCIAL_RUNTIME_CHECKPOINTS = [
  "3.5-freeze",
  "3.5-deployment",
  "3.5-finalization",
] as const;

export type VersionLockInput = {
  deploymentId?: string;
  targetVersion?: string;
};

export type VersionLockResult = {
  locked: boolean;
  version: string;
  summary: string;
};

export function applyVersionLock(
  input: VersionLockInput = {},
): VersionLockResult {
  const version = input.targetVersion ?? "3.5-commercialization-1";

  return {
    locked: true,
    version,
    summary: `version-lock=${version} locked=true`,
  };
}

export function canUpgrade(
  currentVersion?: string,
  targetVersion?: string,
): boolean {
  void currentVersion;
  void targetVersion;
  return false;
}
