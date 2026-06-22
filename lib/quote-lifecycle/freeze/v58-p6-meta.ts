/**
 * V58 P6 — Quote History Foundation Phase Metadata
 */

export const V58_P6_META_VERSION = "v58-p6-quote-history-meta-1" as const;

export const V58_P6_PHASE = "P6" as const;
export const V58_P6_NAME = "Quote History Foundation" as const;
export const V58_P6_LAYER = "Async Observability Layer" as const;

export type V58P6Capability =
  | "HAS_HISTORY_STORE"
  | "HAS_HISTORY_RECORD"
  | "HAS_HISTORY_TIMELINE"
  | "HAS_HISTORY_REPLAY"
  | "HAS_HISTORY_BUILDER"
  | "HAS_HISTORY_SELECTOR"
  | "HAS_AUDIT_SNAPSHOT"
  | "HAS_LIFECYCLE_RECONSTRUCTION";

export const V58_P6_CAPABILITIES: readonly V58P6Capability[] = [
  "HAS_HISTORY_STORE",
  "HAS_HISTORY_RECORD",
  "HAS_HISTORY_TIMELINE",
  "HAS_HISTORY_REPLAY",
  "HAS_HISTORY_BUILDER",
  "HAS_HISTORY_SELECTOR",
  "HAS_AUDIT_SNAPSHOT",
  "HAS_LIFECYCLE_RECONSTRUCTION",
] as const;

export const V58_P6_FORBIDDEN = [
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
  "NO_WORKER",
  "NO_QUEUE",
  "NO_EVENT_BUS",
  "NO_UI_LOGIC",
  "NO_RUNTIME_LOGIC",
  "NO_V57_MODIFICATION",
] as const;

export type V58P6Meta = {
  version: typeof V58_P6_META_VERSION;
  phase: typeof V58_P6_PHASE;
  name: typeof V58_P6_NAME;
  layer: typeof V58_P6_LAYER;
  capabilities: readonly V58P6Capability[];
  forbidden: readonly (typeof V58_P6_FORBIDDEN)[number][];
  scope: string;
};

export const V58_P6_META: V58P6Meta = {
  version: V58_P6_META_VERSION,
  phase: V58_P6_PHASE,
  name: V58_P6_NAME,
  layer: V58_P6_LAYER,
  capabilities: V58_P6_CAPABILITIES,
  forbidden: V58_P6_FORBIDDEN,
  scope: "Event → Persistent History → Replay Model (domain layer only)",
};

export function formatV58P6MetaSummary(meta: V58P6Meta = V58_P6_META): string {
  return [
    `[V58 ${meta.phase} ${meta.name}]`,
    `layer=${meta.layer}`,
    `capabilities=${meta.capabilities.length}`,
    `scope=${meta.scope}`,
  ].join(" ");
}
