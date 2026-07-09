/**
 * V68 P6 — Reliability policy reference alignment (read-only)
 */
import { FLAG_DEFINITION_CATALOG } from "../feature-flag/flag.definition.catalog";
import { SERVICE_DEFINITION_CATALOG } from "../service-catalog/service.definition.catalog";

import { DEGRADATION_STRATEGY_CATALOG } from "./degradation.strategy.catalog";
import { FAILURE_SEVERITY_CATALOG } from "./failure.severity.catalog";
import { RECOVERY_STRATEGY_CATALOG } from "./recovery.strategy.catalog";
import { RELIABILITY_OBJECTIVE_CATALOG } from "./reliability.objective.catalog";

const VALID_ALERT_SEVERITY_REFS = new Set(["P0", "P1", "P2", "P3", "P4"]);

export function isReliabilityPolicyRefsAligned(): boolean {
  const serviceIds = new Set(SERVICE_DEFINITION_CATALOG.map((s) => s.id));
  const failureIds = new Set(FAILURE_SEVERITY_CATALOG.map((f) => f.id));
  const flagIds = new Set(FLAG_DEFINITION_CATALOG.map((f) => f.id));

  const objectivesAligned = RELIABILITY_OBJECTIVE_CATALOG.every((o) =>
    serviceIds.has(o.serviceDefRef),
  );
  const severitiesAligned = FAILURE_SEVERITY_CATALOG.every((f) =>
    VALID_ALERT_SEVERITY_REFS.has(f.alertSeverityRef),
  );

  const degradationAligned = DEGRADATION_STRATEGY_CATALOG.every(
    (d) =>
      serviceIds.has(d.serviceDefRef) &&
      failureIds.has(d.failureRef) &&
      (!d.flagRef || flagIds.has(d.flagRef)),
  );
  const recoveryAligned = RECOVERY_STRATEGY_CATALOG.every(
    (r) => serviceIds.has(r.serviceDefRef) && failureIds.has(r.failureRef),
  );

  const coverageComplete =
    SERVICE_DEFINITION_CATALOG.filter((s) => s.tier === "critical").every((s) =>
      RELIABILITY_OBJECTIVE_CATALOG.some((o) => o.serviceDefRef === s.id),
    ) &&
    DEGRADATION_STRATEGY_CATALOG.length >= 6 &&
    RECOVERY_STRATEGY_CATALOG.length >= 6;

  return (
    objectivesAligned &&
    severitiesAligned &&
    degradationAligned &&
    recoveryAligned &&
    coverageComplete
  );
}

export function computeDeclarativeRtoBudget(input: {
  failureTier: "sev-0" | "sev-1" | "sev-2" | "sev-3" | "sev-4";
  rtoMinutes: number;
}): boolean {
  const maxRto: Record<typeof input.failureTier, number> = {
    "sev-0": 60,
    "sev-1": 240,
    "sev-2": 480,
    "sev-3": 1440,
    "sev-4": 10080,
  };
  return input.rtoMinutes <= maxRto[input.failureTier];
}
