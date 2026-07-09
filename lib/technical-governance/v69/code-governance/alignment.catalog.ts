/**
 * V69 P3 — Code governance cross-reference alignment (read-only)
 */
import { ARCHITECTURE_DEFINITION_CATALOG } from "../architecture-catalog/architecture.definition.catalog";
import { DEPENDENCY_ENTRY_CATALOG } from "../architecture-catalog/dependency.entry.catalog";
import { ARCHITECTURE_DEPENDENCY_EDGE_CATALOG } from "../architecture-dependency/dependency.edge.catalog";

import { CODE_GOVERNANCE_OBJECT_CATALOG } from "./code.object.catalog";
import { DIRECTORY_BOUNDARY_CATALOG } from "./directory.boundary.catalog";
import { FILE_OWNERSHIP_CATALOG } from "./file.ownership.catalog";
import { IMPORT_ALLOWANCE_CATALOG } from "./import.allowance.catalog";

export function isCodeGovernanceRefsAligned(): boolean {
  const arcDefIds = new Set(ARCHITECTURE_DEFINITION_CATALOG.map((d) => d.id));
  const depEntryIds = new Set(DEPENDENCY_ENTRY_CATALOG.map((e) => e.id));
  const depEdgeIds = new Set(ARCHITECTURE_DEPENDENCY_EDGE_CATALOG.map((e) => e.id));
  const objectIds = new Set(CODE_GOVERNANCE_OBJECT_CATALOG.map((o) => o.id));
  const boundaryIds = new Set(DIRECTORY_BOUNDARY_CATALOG.map((b) => b.id));

  const objectsAligned = CODE_GOVERNANCE_OBJECT_CATALOG.every(
    (o) => arcDefIds.has(o.arcDefRef) && depEntryIds.has(o.dependencyEntryRef),
  );

  const boundariesAligned = DIRECTORY_BOUNDARY_CATALOG.every(
    (b) =>
      objectIds.has(b.codeObjectRef) &&
      arcDefIds.has(b.arcDefRef) &&
      CODE_GOVERNANCE_OBJECT_CATALOG.some(
        (o) => o.id === b.codeObjectRef && o.arcDefRef === b.arcDefRef,
      ),
  );

  const ownershipAligned = FILE_OWNERSHIP_CATALOG.every((o) => boundaryIds.has(o.boundaryRef));

  const importAligned = IMPORT_ALLOWANCE_CATALOG.every(
    (a) =>
      boundaryIds.has(a.fromBoundaryRef) &&
      boundaryIds.has(a.toBoundaryRef) &&
      (!a.dependencyEdgeRef || depEdgeIds.has(a.dependencyEdgeRef)),
  );

  const coverageComplete =
    CODE_GOVERNANCE_OBJECT_CATALOG.every((o) =>
      DIRECTORY_BOUNDARY_CATALOG.some((b) => b.codeObjectRef === o.id),
    ) &&
    DIRECTORY_BOUNDARY_CATALOG.every((b) =>
      FILE_OWNERSHIP_CATALOG.some((o) => o.boundaryRef === b.id),
    ) &&
    DIRECTORY_BOUNDARY_CATALOG.filter((b) => b.mutable).every((b) =>
      IMPORT_ALLOWANCE_CATALOG.some(
        (a) => a.fromBoundaryRef === b.id || a.toBoundaryRef === b.id,
      ),
    );

  return objectsAligned && boundariesAligned && ownershipAligned && importAligned && coverageComplete;
}
