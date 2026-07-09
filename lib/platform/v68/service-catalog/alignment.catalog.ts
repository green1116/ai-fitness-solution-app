/**
 * V68 P1 — Service catalog cross-reference alignment (read-only)
 */
import { ONCALL_ROTATION_CATALOG } from "@/lib/monitoring/v67/oncall.contract";
import { SERVICE_HEALTH_CATALOG } from "@/lib/monitoring/v67/observability/service.health.catalog";

import { SERVICE_DEFINITION_CATALOG } from "./service.definition.catalog";
import { SERVICE_METADATA_CATALOG } from "./service.metadata.catalog";
import { SERVICE_OWNER_CATALOG } from "./service.owner.catalog";
import { SERVICE_STATUS_CATALOG } from "./service.status.catalog";

export function isMonitoringRefsAligned(): boolean {
  const healthIds = new Set(SERVICE_HEALTH_CATALOG.map((s) => s.id));
  return SERVICE_DEFINITION_CATALOG.every((d) => healthIds.has(d.monitoringRef));
}

export function isOncallRefsAligned(): boolean {
  const oncallIds = new Set(ONCALL_ROTATION_CATALOG.map((o) => o.id));
  return SERVICE_OWNER_CATALOG.every((o) => oncallIds.has(o.oncallRef));
}

export function isServiceCatalogCrossRefsAligned(): boolean {
  const defIds = new Set(SERVICE_DEFINITION_CATALOG.map((d) => d.id));

  const metadataAligned = SERVICE_METADATA_CATALOG.every((m) => defIds.has(m.serviceDefRef));
  const statusAligned = SERVICE_STATUS_CATALOG.every((s) => defIds.has(s.serviceDefRef));
  const ownerAligned = SERVICE_OWNER_CATALOG.every((o) => defIds.has(o.serviceDefRef));

  const coverageComplete =
    SERVICE_DEFINITION_CATALOG.every((d) =>
      SERVICE_METADATA_CATALOG.some((m) => m.serviceDefRef === d.id),
    ) &&
    SERVICE_DEFINITION_CATALOG.every((d) =>
      SERVICE_STATUS_CATALOG.some((s) => s.serviceDefRef === d.id),
    ) &&
    SERVICE_DEFINITION_CATALOG.every((d) =>
      SERVICE_OWNER_CATALOG.some((o) => o.serviceDefRef === d.id),
    );

  return (
    metadataAligned &&
    statusAligned &&
    ownerAligned &&
    coverageComplete &&
    isMonitoringRefsAligned() &&
    isOncallRefsAligned()
  );
}
