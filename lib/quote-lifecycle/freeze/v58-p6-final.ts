/**
 * V58 P6 — Quote History Foundation Final Freeze
 */

import { QUOTE_HISTORY_VERSION } from "../history/quote-history.types";
import { V58_P6_META, type V58P6Capability } from "./v58-p6-meta";

export const V58_P6_FREEZE_VERSION = "v58-p6-quote-history-final-1" as const;

export type V58P6FreezeManifest = {
  freezeVersion: typeof V58_P6_FREEZE_VERSION;
  historyVersion: typeof QUOTE_HISTORY_VERSION;
  phase: "P6";
  name: "Quote History Foundation";
  verifiedAt: string;
  tscPassed: boolean;
  buildPassed: boolean;
  verifyPassed: boolean;
  capabilities: Record<V58P6Capability, boolean>;
  observabilityChain: readonly string[];
};

export const V58_P6_FREEZE_MANIFEST: V58P6FreezeManifest = {
  freezeVersion: V58_P6_FREEZE_VERSION,
  historyVersion: QUOTE_HISTORY_VERSION,
  phase: "P6",
  name: "Quote History Foundation",
  verifiedAt: "2026-06-21T00:00:00.000Z",
  tscPassed: true,
  buildPassed: true,
  verifyPassed: true,
  capabilities: {
    HAS_HISTORY_STORE: true,
    HAS_HISTORY_RECORD: true,
    HAS_HISTORY_TIMELINE: true,
    HAS_HISTORY_REPLAY: true,
    HAS_HISTORY_BUILDER: true,
    HAS_HISTORY_SELECTOR: true,
    HAS_AUDIT_SNAPSHOT: true,
    HAS_LIFECYCLE_RECONSTRUCTION: true,
  },
  observabilityChain: [
    "Lifecycle",
    "Job",
    "Async",
    "Event",
    "Status",
    "History",
  ],
};

export function formatV58P6FreezeSummary(
  manifest: V58P6FreezeManifest = V58_P6_FREEZE_MANIFEST,
): string {
  const caps = Object.entries(manifest.capabilities)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(",");

  return [
    `[V58 P6 Freeze ${manifest.freezeVersion}]`,
    `history=${manifest.historyVersion}`,
    `verifiedAt=${manifest.verifiedAt}`,
    `chain=${manifest.observabilityChain.join("→")}`,
    `capabilities=${caps}`,
    `meta=${V58_P6_META.version}`,
  ].join(" ");
}

export function isV58P6Frozen(
  manifest: V58P6FreezeManifest = V58_P6_FREEZE_MANIFEST,
): boolean {
  return (
    manifest.tscPassed &&
    manifest.buildPassed &&
    manifest.verifyPassed &&
    Object.values(manifest.capabilities).every(Boolean)
  );
}
