/**
 * V69 P3 — Import allowance catalog (declarative allowed references)
 */
import type { ImportAllowanceEntry, ImportAllowanceManifest } from "./governance.types";
import { V69_CODE_GOVERNANCE_VERSION } from "./governance.types";

export const IMPORT_ALLOWANCE_CATALOG: ImportAllowanceEntry[] = [
  {
    id: "CGOV-IMP-001",
    fromBoundaryRef: "CGOV-BND-001",
    toBoundaryRef: "CGOV-BND-003",
    dependencyEdgeRef: "ADEP-EDGE-001",
    allowanceKind: "runtime",
    allowed: true,
    required: true,
    description: "app → lib runtime import allowed",
  },
  {
    id: "CGOV-IMP-002",
    fromBoundaryRef: "CGOV-BND-002",
    toBoundaryRef: "CGOV-BND-003",
    dependencyEdgeRef: "ADEP-EDGE-002",
    allowanceKind: "runtime",
    allowed: true,
    required: true,
    description: "api → lib runtime import allowed",
  },
  {
    id: "CGOV-IMP-003",
    fromBoundaryRef: "CGOV-BND-002",
    toBoundaryRef: "CGOV-BND-004",
    dependencyEdgeRef: "ADEP-EDGE-003",
    allowanceKind: "runtime",
    allowed: true,
    required: true,
    description: "api → prisma data import allowed",
  },
  {
    id: "CGOV-IMP-004",
    fromBoundaryRef: "CGOV-BND-003",
    toBoundaryRef: "CGOV-BND-004",
    dependencyEdgeRef: "ADEP-EDGE-004",
    allowanceKind: "runtime",
    allowed: true,
    required: true,
    description: "lib → prisma data import allowed",
  },
  {
    id: "CGOV-IMP-005",
    fromBoundaryRef: "CGOV-BND-008",
    toBoundaryRef: "CGOV-BND-001",
    dependencyEdgeRef: "ADEP-EDGE-005",
    allowanceKind: "runtime",
    allowed: true,
    required: true,
    description: "auth → app security envelope import",
  },
  {
    id: "CGOV-IMP-006",
    fromBoundaryRef: "CGOV-BND-003",
    toBoundaryRef: "CGOV-BND-006",
    dependencyEdgeRef: "ADEP-EDGE-006",
    allowanceKind: "read-only",
    allowed: true,
    required: true,
    description: "lib → platform governance read-only import",
  },
  {
    id: "CGOV-IMP-007",
    fromBoundaryRef: "CGOV-BND-003",
    toBoundaryRef: "CGOV-BND-007",
    dependencyEdgeRef: "ADEP-EDGE-007",
    allowanceKind: "read-only",
    allowed: true,
    required: true,
    description: "lib → monitoring read-only import",
  },
  {
    id: "CGOV-IMP-008",
    fromBoundaryRef: "CGOV-BND-006",
    toBoundaryRef: "CGOV-BND-007",
    dependencyEdgeRef: "ADEP-EDGE-008",
    allowanceKind: "type-only",
    allowed: true,
    required: true,
    description: "platform → monitoring type-only import",
  },
];

export function buildImportAllowanceManifest(): ImportAllowanceManifest {
  const allowances = IMPORT_ALLOWANCE_CATALOG;
  const kinds = new Set(allowances.map((a) => a.allowanceKind));
  const catalogComplete = allowances.length >= 6 && kinds.size >= 3;

  return {
    version: V69_CODE_GOVERNANCE_VERSION,
    allowanceCount: allowances.length,
    kindCount: kinds.size,
    catalogComplete,
    allowances,
    summary: [
      `import-allowances count=${allowances.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getImportAllowancesFromBoundary(
  fromBoundaryRef: string,
): ImportAllowanceEntry[] {
  return IMPORT_ALLOWANCE_CATALOG.filter((a) => a.fromBoundaryRef === fromBoundaryRef);
}

export function isImportAllowed(input: {
  fromBoundaryRef: string;
  toBoundaryRef: string;
}): boolean {
  return IMPORT_ALLOWANCE_CATALOG.some(
    (a) =>
      a.fromBoundaryRef === input.fromBoundaryRef &&
      a.toBoundaryRef === input.toBoundaryRef &&
      a.allowed,
  );
}
