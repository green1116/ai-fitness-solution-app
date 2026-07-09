/**
 * V69 P4 — Technical standards registry / index (read-only)
 */
import { CHANGE_STANDARD_CATALOG } from "./change.standard.catalog";
import { DIRECTORY_STANDARD_CATALOG } from "./directory.standard.catalog";
import { INTERFACE_STANDARD_CATALOG } from "./interface.standard.catalog";
import { NAMING_STANDARD_CATALOG } from "./naming.standard.catalog";
import { STANDARD_POLICY_SET_CATALOG } from "./policy.set.catalog";
import type { TechnicalStandardsRegistry } from "./standards.types";
import { V69_TECHNICAL_STANDARDS_VERSION } from "./standards.types";
import { VERSION_STANDARD_CATALOG } from "./version.standard.catalog";

export const TECHNICAL_STANDARDS_REGISTRY_INDEX = {
  policySet: STANDARD_POLICY_SET_CATALOG.map((p) => p.id),
  naming: NAMING_STANDARD_CATALOG.map((n) => n.id),
  versioning: VERSION_STANDARD_CATALOG.map((v) => v.id),
  interfaces: INTERFACE_STANDARD_CATALOG.map((i) => i.id),
  directories: DIRECTORY_STANDARD_CATALOG.map((d) => d.id),
  changes: CHANGE_STANDARD_CATALOG.map((c) => c.id),
} as const;

export function buildTechnicalStandardsRegistry(): TechnicalStandardsRegistry {
  const policySetIds = TECHNICAL_STANDARDS_REGISTRY_INDEX.policySet;
  const namingIds = TECHNICAL_STANDARDS_REGISTRY_INDEX.naming;
  const versionIds = TECHNICAL_STANDARDS_REGISTRY_INDEX.versioning;
  const interfaceIds = TECHNICAL_STANDARDS_REGISTRY_INDEX.interfaces;
  const directoryIds = TECHNICAL_STANDARDS_REGISTRY_INDEX.directories;
  const changeIds = TECHNICAL_STANDARDS_REGISTRY_INDEX.changes;
  const totalEntries =
    policySetIds.length +
    namingIds.length +
    versionIds.length +
    interfaceIds.length +
    directoryIds.length +
    changeIds.length;

  const registryComplete =
    policySetIds.length >= 6 &&
    namingIds.length >= 6 &&
    versionIds.length >= 6 &&
    interfaceIds.length >= 6 &&
    directoryIds.length >= 6 &&
    changeIds.length >= 6;

  return {
    version: V69_TECHNICAL_STANDARDS_VERSION,
    policySetIds: [...policySetIds],
    namingIds: [...namingIds],
    versionIds: [...versionIds],
    interfaceIds: [...interfaceIds],
    directoryIds: [...directoryIds],
    changeIds: [...changeIds],
    totalEntries,
    registryComplete,
    summary: [
      `technical-standards-registry total=${totalEntries}`,
      `policySet=${policySetIds.length}`,
      `naming=${namingIds.length}`,
      `versioning=${versionIds.length}`,
      `interfaces=${interfaceIds.length}`,
      `directories=${directoryIds.length}`,
      `changes=${changeIds.length}`,
      `complete=${registryComplete}`,
    ].join(" "),
  };
}

export function isTechnicalStandardsRegistryIdKnown(
  kind: keyof typeof TECHNICAL_STANDARDS_REGISTRY_INDEX,
  id: string,
): boolean {
  return (TECHNICAL_STANDARDS_REGISTRY_INDEX[kind] as readonly string[]).includes(id);
}
