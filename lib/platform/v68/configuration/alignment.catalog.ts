/**
 * V68 P3 — Configuration alignment catalog & validation (read-only)
 */
import { SERVICE_DEFINITION_CATALOG } from "../service-catalog/service.definition.catalog";

import { CONFIG_ITEM_CATALOG } from "./config.item.catalog";
import { CONFIG_SOURCE_CATALOG } from "./config.source.catalog";
import { CONFIG_VALIDITY_CATALOG } from "./config.validity.contract";
import type { ConfigAlignmentEntry, ConfigAlignmentManifest } from "./governance.types";
import { V68_CONFIGURATION_GOVERNANCE_VERSION } from "./governance.types";

export const CONFIG_ALIGNMENT_CATALOG: ConfigAlignmentEntry[] = CONFIG_ITEM_CATALOG.map(
  (item) => {
    const validity = CONFIG_VALIDITY_CATALOG.find((v) => v.configItemRef === item.id);
    const source = CONFIG_SOURCE_CATALOG.find((s) => s.id === validity?.sourceRef);
    return {
      id: `CFG-ALN-${item.id.replace("CFG-ITEM-", "")}`,
      configItemRef: item.id,
      sourceRef: validity?.sourceRef ?? "",
      validityRef: validity?.id ?? "",
      serviceDefRef: item.serviceDefRef,
      aligned: Boolean(validity && source),
      required: item.required,
      description: `Alignment for ${item.key} → ${source?.path ?? "missing"}`,
    };
  },
);

export function isConfigurationRefsAligned(): boolean {
  const serviceIds = new Set(SERVICE_DEFINITION_CATALOG.map((s) => s.id));
  const itemIds = new Set(CONFIG_ITEM_CATALOG.map((i) => i.id));
  const sourceIds = new Set(CONFIG_SOURCE_CATALOG.map((s) => s.id));

  const itemsAligned = CONFIG_ITEM_CATALOG.every((i) => serviceIds.has(i.serviceDefRef));
  const sourcesAligned = CONFIG_SOURCE_CATALOG.every(
    (s) => !s.serviceDefRef || serviceIds.has(s.serviceDefRef),
  );
  const validityAligned = CONFIG_VALIDITY_CATALOG.every(
    (v) => itemIds.has(v.configItemRef) && sourceIds.has(v.sourceRef),
  );

  return itemsAligned && sourcesAligned && validityAligned;
}

export function buildConfigAlignmentManifest(): ConfigAlignmentManifest {
  const entries = CONFIG_ALIGNMENT_CATALOG;
  const alignedCount = entries.filter((e) => e.aligned).length;
  const manifestComplete =
    entries.length >= 6 && alignedCount === entries.length && isConfigurationRefsAligned();

  return {
    version: V68_CONFIGURATION_GOVERNANCE_VERSION,
    entryCount: entries.length,
    alignedCount,
    manifestComplete,
    entries,
    summary: [
      `config-alignment entries=${entries.length}`,
      `aligned=${alignedCount}`,
      `complete=${manifestComplete}`,
    ].join(" "),
  };
}

export function computeDeclarativeAlignmentScore(): number {
  const manifest = buildConfigAlignmentManifest();
  if (manifest.entryCount === 0) return 0;
  return Math.round((manifest.alignedCount / manifest.entryCount) * 100);
}
