/**
 * V69 P4 — Change standard catalog (declarative)
 */
import type { ChangeStandardEntry, ChangeStandardManifest } from "./standards.types";
import { V69_TECHNICAL_STANDARDS_VERSION } from "./standards.types";

export const CHANGE_STANDARD_CATALOG: ChangeStandardEntry[] = [
  {
    id: "TSTD-CHG-001",
    changeKind: "frozen",
    procedure: "DO NOT MODIFY frozen V48–V69 prior phases",
    gateRef: "CGOV-POL-001",
    enforceLevel: "required",
    required: true,
    description: "Frozen layer change prohibition",
  },
  {
    id: "TSTD-CHG-002",
    changeKind: "additive",
    procedure: "New phase adds declarative module only under v69/",
    gateRef: "CGOV-POL-002",
    enforceLevel: "required",
    required: true,
    description: "Additive governance phase changes only",
  },
  {
    id: "TSTD-CHG-003",
    changeKind: "verify",
    procedure: "Each phase must pass npm run verify:v69-p* before freeze",
    gateRef: "CGOV-POL-004",
    enforceLevel: "required",
    required: true,
    description: "Verify gate before phase freeze",
  },
  {
    id: "TSTD-CHG-004",
    changeKind: "rollback",
    procedure: "Document rollback index entries per phase",
    gateRef: "CGOV-POL-007",
    enforceLevel: "required",
    required: true,
    description: "Rollback index required per phase",
  },
  {
    id: "TSTD-CHG-005",
    changeKind: "additive",
    procedure: "Chain builder depends on prior phase report only",
    enforceLevel: "required",
    required: true,
    description: "Sequential phase builder dependency",
  },
  {
    id: "TSTD-CHG-006",
    changeKind: "frozen",
    procedure: "Upstream version lock pins frozen artifact versions",
    enforceLevel: "required",
    required: true,
    description: "Version lock on freeze",
  },
  {
    id: "TSTD-CHG-007",
    changeKind: "verify",
    procedure: "tsc --noEmit must pass after phase addition",
    enforceLevel: "recommended",
    required: true,
    description: "TypeScript compile gate",
  },
  {
    id: "TSTD-CHG-008",
    changeKind: "rollback",
    procedure: "Revert index.ts exports to prior phase set on rollback",
    enforceLevel: "required",
    required: true,
    description: "Index export rollback standard",
  },
];

export function buildChangeStandardManifest(): ChangeStandardManifest {
  const standards = CHANGE_STANDARD_CATALOG;
  const kinds = new Set(standards.map((s) => s.changeKind));
  const catalogComplete = standards.length >= 6 && kinds.size >= 3;

  return {
    version: V69_TECHNICAL_STANDARDS_VERSION,
    entryCount: standards.length,
    kindCount: kinds.size,
    catalogComplete,
    standards,
    summary: [
      `change-standards count=${standards.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getChangeStandardsByKind(
  kind: ChangeStandardEntry["changeKind"],
): ChangeStandardEntry[] {
  return CHANGE_STANDARD_CATALOG.filter((s) => s.changeKind === kind);
}
