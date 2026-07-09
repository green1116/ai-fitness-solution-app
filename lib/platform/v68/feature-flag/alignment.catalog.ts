/**
 * V68 P4 — Feature flag reference alignment (read-only)
 */
import { CONFIG_ITEM_CATALOG } from "../configuration/config.item.catalog";
import { SERVICE_DEFINITION_CATALOG } from "../service-catalog/service.definition.catalog";

import { FLAG_DEFINITION_CATALOG } from "./flag.definition.catalog";
import { FLAG_SCOPE_CATALOG } from "./flag.scope.catalog";
import { FLAG_STATE_CATALOG } from "./flag.state.catalog";
import { TOGGLE_RULE_CATALOG } from "./flag.toggle.contract";

export function isFeatureFlagRefsAligned(): boolean {
  const flagIds = new Set(FLAG_DEFINITION_CATALOG.map((f) => f.id));
  const serviceIds = new Set(SERVICE_DEFINITION_CATALOG.map((s) => s.id));
  const configItemIds = new Set(CONFIG_ITEM_CATALOG.map((i) => i.id));

  const defsAligned = FLAG_DEFINITION_CATALOG.every(
    (f) =>
      (!f.serviceDefRef || serviceIds.has(f.serviceDefRef)) &&
      (!f.configItemRef || configItemIds.has(f.configItemRef)),
  );

  const statesAligned = FLAG_STATE_CATALOG.every((s) => flagIds.has(s.flagRef));
  const scopesAligned = FLAG_SCOPE_CATALOG.every((s) => {
    if (!flagIds.has(s.flagRef)) return false;
    if (s.scopeKind === "service") return serviceIds.has(s.targetRef);
    return true;
  });
  const togglesAligned = TOGGLE_RULE_CATALOG.every((r) => flagIds.has(r.flagRef));

  const coverageComplete =
    FLAG_DEFINITION_CATALOG.every((f) => FLAG_STATE_CATALOG.some((s) => s.flagRef === f.id)) &&
    FLAG_DEFINITION_CATALOG.every((f) => FLAG_SCOPE_CATALOG.some((s) => s.flagRef === f.id)) &&
    FLAG_DEFINITION_CATALOG.every((f) => TOGGLE_RULE_CATALOG.some((r) => r.flagRef === f.id));

  return defsAligned && statesAligned && scopesAligned && togglesAligned && coverageComplete;
}
