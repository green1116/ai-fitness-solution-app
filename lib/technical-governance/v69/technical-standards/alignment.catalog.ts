/**
 * V69 P4 — Technical standards cross-reference alignment (read-only)
 */
import { CODE_POLICY_CATALOG } from "../code-governance/code.policy.catalog";
import { CODE_GOVERNANCE_OBJECT_CATALOG } from "../code-governance/code.object.catalog";
import { DIRECTORY_BOUNDARY_CATALOG } from "../code-governance/directory.boundary.catalog";

import { CHANGE_STANDARD_CATALOG } from "./change.standard.catalog";
import { DIRECTORY_STANDARD_CATALOG } from "./directory.standard.catalog";
import { INTERFACE_STANDARD_CATALOG } from "./interface.standard.catalog";
import { NAMING_STANDARD_CATALOG } from "./naming.standard.catalog";
import { STANDARD_POLICY_SET_CATALOG } from "./policy.set.catalog";
import { VERSION_STANDARD_CATALOG } from "./version.standard.catalog";

const STANDARD_ID_SETS = {
  naming: new Set(NAMING_STANDARD_CATALOG.map((s) => s.id)),
  version: new Set(VERSION_STANDARD_CATALOG.map((s) => s.id)),
  interface: new Set(INTERFACE_STANDARD_CATALOG.map((s) => s.id)),
  directory: new Set(DIRECTORY_STANDARD_CATALOG.map((s) => s.id)),
  change: new Set(CHANGE_STANDARD_CATALOG.map((s) => s.id)),
};

function isStandardRefValid(domain: string, ref: string): boolean {
  if (domain === "naming") return STANDARD_ID_SETS.naming.has(ref);
  if (domain === "version") return STANDARD_ID_SETS.version.has(ref);
  if (domain === "interface") return STANDARD_ID_SETS.interface.has(ref);
  if (domain === "directory") return STANDARD_ID_SETS.directory.has(ref);
  if (domain === "change" || domain === "governance") return STANDARD_ID_SETS.change.has(ref);
  return false;
}

export function isTechnicalStandardsRefsAligned(): boolean {
  const policyIds = new Set(CODE_POLICY_CATALOG.map((p) => p.id));
  const boundaryIds = new Set(DIRECTORY_BOUNDARY_CATALOG.map((b) => b.id));
  const objectIds = new Set(CODE_GOVERNANCE_OBJECT_CATALOG.map((o) => o.id));

  const policySetAligned = STANDARD_POLICY_SET_CATALOG.every(
    (p) =>
      isStandardRefValid(p.domain, p.standardRef) &&
      (!p.codePolicyRef || policyIds.has(p.codePolicyRef)),
  );

  const directoryAligned = DIRECTORY_STANDARD_CATALOG.every((d) =>
    boundaryIds.has(d.boundaryRef),
  );

  const interfaceAligned = INTERFACE_STANDARD_CATALOG.every(
    (i) => !i.codeObjectRef || objectIds.has(i.codeObjectRef),
  );

  const changeAligned = CHANGE_STANDARD_CATALOG.every(
    (c) => !c.gateRef || policyIds.has(c.gateRef),
  );

  const coverageComplete =
    STANDARD_POLICY_SET_CATALOG.length >= 6 &&
    NAMING_STANDARD_CATALOG.length >= 6 &&
    VERSION_STANDARD_CATALOG.length >= 6 &&
    INTERFACE_STANDARD_CATALOG.length >= 6 &&
    DIRECTORY_STANDARD_CATALOG.length >= 6 &&
    CHANGE_STANDARD_CATALOG.length >= 6 &&
    DIRECTORY_BOUNDARY_CATALOG.every((b) =>
      DIRECTORY_STANDARD_CATALOG.some((d) => d.boundaryRef === b.id),
    );

  return policySetAligned && directoryAligned && interfaceAligned && changeAligned && coverageComplete;
}
