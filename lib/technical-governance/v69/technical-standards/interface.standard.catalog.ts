/**
 * V69 P4 — Interface standard catalog (declarative)
 */
import type { InterfaceStandardEntry, InterfaceStandardManifest } from "./standards.types";
import { V69_TECHNICAL_STANDARDS_VERSION } from "./standards.types";

export const INTERFACE_STANDARD_CATALOG: InterfaceStandardEntry[] = [
  {
    id: "TSTD-IFC-001",
    interfaceKind: "barrel",
    contract: "index.ts re-exports phase barrel only",
    enforceLevel: "required",
    required: true,
    description: "Unified v69 entry via barrel exports",
  },
  {
    id: "TSTD-IFC-002",
    interfaceKind: "report",
    contract: "build{Phase}Report + assert{Phase}Pass",
    enforceLevel: "required",
    required: true,
    description: "Governance report builder contract",
  },
  {
    id: "TSTD-IFC-003",
    interfaceKind: "verify",
    contract: "checkModuleStructure + testInventories + testReport",
    enforceLevel: "required",
    required: true,
    description: "Verify script structural contract",
  },
  {
    id: "TSTD-IFC-004",
    interfaceKind: "catalog",
    contract: "build{Facet}Manifest returns catalogComplete",
    enforceLevel: "required",
    required: true,
    description: "Catalog manifest builder contract",
  },
  {
    id: "TSTD-IFC-005",
    interfaceKind: "api",
    contract: "run{Phase}(input?) returns report",
    codeObjectRef: "CGOV-OBJ-002",
    enforceLevel: "required",
    required: true,
    description: "Phase entry function contract",
  },
  {
    id: "TSTD-IFC-006",
    interfaceKind: "report",
    contract: "format{Phase}Summary(report): string",
    enforceLevel: "required",
    required: true,
    description: "Human-readable summary formatter",
  },
  {
    id: "TSTD-IFC-007",
    interfaceKind: "catalog",
    contract: "alignment.catalog is{Phase}RefsAligned(): boolean",
    enforceLevel: "required",
    required: true,
    description: "Cross-reference alignment contract",
  },
  {
    id: "TSTD-IFC-008",
    interfaceKind: "api",
    contract: "read-only imports from frozen upstream only",
    codeObjectRef: "CGOV-OBJ-006",
    enforceLevel: "required",
    required: true,
    description: "Frozen upstream import interface rule",
  },
];

export function buildInterfaceStandardManifest(): InterfaceStandardManifest {
  const standards = INTERFACE_STANDARD_CATALOG;
  const kinds = new Set(standards.map((s) => s.interfaceKind));
  const catalogComplete = standards.length >= 6 && kinds.size >= 4;

  return {
    version: V69_TECHNICAL_STANDARDS_VERSION,
    entryCount: standards.length,
    kindCount: kinds.size,
    catalogComplete,
    standards,
    summary: [
      `interface-standards count=${standards.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getInterfaceStandardsByKind(
  kind: InterfaceStandardEntry["interfaceKind"],
): InterfaceStandardEntry[] {
  return INTERFACE_STANDARD_CATALOG.filter((s) => s.interfaceKind === kind);
}
