/**
 * V67 P4 — SLO objective catalog (declarative)
 */
import type { ObjectiveCatalogEntry, ObjectiveCatalogManifest } from "./governance.types";
import { V67_SLO_GOVERNANCE_VERSION } from "./governance.types";
import { SLI_TYPE_CATALOG } from "./sli.types.catalog";
import { SLO_TYPE_CATALOG } from "./slo.types.catalog";

export const OBJECTIVE_CATALOG: ObjectiveCatalogEntry[] = SLO_TYPE_CATALOG.map((slo) => {
  const sli = SLI_TYPE_CATALOG.find((s) => s.id === slo.sliRef);
  return {
    id: `OBJ-${slo.id.replace("SLOT-", "")}`,
    sloRef: slo.id,
    sliRef: slo.sliRef,
    tier: slo.tier,
    target: slo.objective,
    unit: sli?.unit ?? "unit",
    owner: slo.tier === "critical" ? "platform-oncall" : "deployer-oncall",
    required: slo.required,
    description: slo.description,
  };
});

export function buildObjectiveCatalogManifest(): ObjectiveCatalogManifest {
  const objectives = OBJECTIVE_CATALOG;
  const tiers = new Set(objectives.map((o) => o.tier));
  const catalogComplete =
    objectives.length >= 6 &&
    tiers.size >= 3 &&
    objectives.every((o) => SLO_TYPE_CATALOG.some((s) => s.id === o.sloRef));

  return {
    version: V67_SLO_GOVERNANCE_VERSION,
    entryCount: objectives.length,
    tierCount: tiers.size,
    catalogComplete,
    objectives,
    summary: [
      `objective-catalog entries=${objectives.length}`,
      `tiers=${tiers.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getObjectivesByTier(
  tier: ObjectiveCatalogEntry["tier"],
): ObjectiveCatalogEntry[] {
  return OBJECTIVE_CATALOG.filter((o) => o.tier === tier);
}
