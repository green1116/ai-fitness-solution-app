/**
 * V67 P7 — Postmortem cross-reference alignment (read-only)
 */
import { INCIDENT_EVENT_CATALOG } from "../event.contract";
import { TRANSITION_RULE_CATALOG } from "../incident/lifecycle.transitions";
import { DASHBOARD_CATALOG } from "../observability/dashboard.catalog";
import { SLO_TYPE_CATALOG } from "../slo/slo.types.catalog";

import { ACTION_ITEM_RULE_CATALOG } from "./action.item.contract";
import { ARCHIVE_INDEX_CATALOG } from "./archive.index";
import { INCIDENT_REPORT_TYPE_CATALOG } from "./report.types.catalog";
import { RCA_CATALOG } from "./rca.catalog";

export function isPostmortemRefsAligned(): boolean {
  const eventIds = new Set(INCIDENT_EVENT_CATALOG.map((e) => e.id));
  const transitionIds = new Set(TRANSITION_RULE_CATALOG.map((t) => t.id));
  const dashboardIds = new Set(DASHBOARD_CATALOG.map((d) => d.id));
  const sloIds = new Set(SLO_TYPE_CATALOG.map((s) => s.id));
  const reportTypeIds = new Set(INCIDENT_REPORT_TYPE_CATALOG.map((t) => t.id));
  const rcaIds = new Set(RCA_CATALOG.map((r) => r.id));

  const reportsAligned = INCIDENT_REPORT_TYPE_CATALOG.every(
    (t) =>
      (!t.eventRef || eventIds.has(t.eventRef)) &&
      (!t.lifecycleTransitionRef || transitionIds.has(t.lifecycleTransitionRef)) &&
      (!t.dashboardRef || dashboardIds.has(t.dashboardRef)),
  );

  const rcaAligned = RCA_CATALOG.every((r) => !r.sloRef || sloIds.has(r.sloRef));
  const actionItemsAligned = ACTION_ITEM_RULE_CATALOG.every((a) => rcaIds.has(a.rcaRef));
  const archiveAligned = ARCHIVE_INDEX_CATALOG.every(
    (a) =>
      reportTypeIds.has(a.reportTypeRef) &&
      (!a.dashboardRef || dashboardIds.has(a.dashboardRef)),
  );

  return reportsAligned && rcaAligned && actionItemsAligned && archiveAligned;
}
