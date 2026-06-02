/** RC1 compat entry — @/lib/commercialization/archive */
export { runCommercialV37ArchiveFoundation } from "./_rc1-foundation-compat";

import { runCommercialV37ArchiveFoundation } from "./_rc1-foundation-compat";

type CommercialV37ArchiveFoundationResult = ReturnType<
  typeof runCommercialV37ArchiveFoundation
>;

function v37ArchiveVersionToken(
  result: CommercialV37ArchiveFoundationResult,
): string {
  return result.summary.includes("=")
    ? result.summary.split("=").slice(1).join("=")
    : "3.7-archive-12";
}

function v37ArchiveReadyHook(
  prefix: string,
  result: CommercialV37ArchiveFoundationResult,
): string {
  return `${prefix}=${v37ArchiveVersionToken(result)}`;
}

export function formatArchiveSurfaceReadyHook(
  result: CommercialV37ArchiveFoundationResult,
): string {
  return v37ArchiveReadyHook("archive-surface-ready", result);
}

export function formatHistoricalReferenceReadyHook(
  result: CommercialV37ArchiveFoundationResult,
): string {
  return v37ArchiveReadyHook("historical-reference-ready", result);
}

export function formatImmutableSnapshotReadyHook(
  result: CommercialV37ArchiveFoundationResult,
): string {
  return v37ArchiveReadyHook("immutable-snapshot-ready", result);
}

export function formatReadonlyArchiveReadyHook(
  result: CommercialV37ArchiveFoundationResult,
): string {
  return v37ArchiveReadyHook("readonly-archive-ready", result);
}

export function formatRetirementReadyHook(
  result: CommercialV37ArchiveFoundationResult,
): string {
  return v37ArchiveReadyHook("retirement-ready", result);
}
