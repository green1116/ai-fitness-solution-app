/**
 * V69 P7 — Exception catalog (declarative)
 */
import type { ExceptionEntry, ExceptionManifest } from "./compliance.types";
import { V69_ARCHITECTURE_COMPLIANCE_VERSION } from "./compliance.types";

export const EXCEPTION_CATALOG: ExceptionEntry[] = [
  {
    id: "ACMP-EXC-001",
    deviationRef: "ACMP-DEV-001",
    exceptionKind: "temporary_waiver",
    status: "approved",
    expiryPolicy: "next_freeze_cycle",
    required: true,
    description: "Temporary waiver for missing arc def (none active)",
  },
  {
    id: "ACMP-EXC-002",
    deviationRef: "ACMP-DEV-002",
    exceptionKind: "interface_exception",
    status: "rejected",
    expiryPolicy: "n/a",
    required: true,
    description: "Interface mismatch exception rejected",
  },
  {
    id: "ACMP-EXC-003",
    deviationRef: "ACMP-DEV-003",
    exceptionKind: "alignment_drift_waiver",
    status: "approved",
    expiryPolicy: "30_days",
    required: true,
    description: "Domain drift waiver template (none active)",
  },
  {
    id: "ACMP-EXC-004",
    deviationRef: "ACMP-DEV-004",
    exceptionKind: "frozen_layer_exception",
    status: "rejected",
    expiryPolicy: "n/a",
    required: true,
    description: "Frozen layer change exception rejected",
  },
  {
    id: "ACMP-EXC-005",
    deviationRef: "ACMP-DEV-005",
    exceptionKind: "security_gate_waiver",
    status: "rejected",
    expiryPolicy: "n/a",
    required: true,
    description: "Security gate failure waiver rejected",
  },
  {
    id: "ACMP-EXC-006",
    deviationRef: "ACMP-DEV-006",
    exceptionKind: "layout_exception",
    status: "pending",
    expiryPolicy: "review_required",
    required: true,
    description: "Module root layout exception pending review",
  },
  {
    id: "ACMP-EXC-007",
    deviationRef: "ACMP-DEV-007",
    exceptionKind: "verify_contract_waiver",
    status: "approved",
    expiryPolicy: "next_release",
    required: true,
    description: "Verify contract drift waiver template (none active)",
  },
  {
    id: "ACMP-EXC-008",
    deviationRef: "ACMP-DEV-008",
    exceptionKind: "release_deviation_waiver",
    status: "rejected",
    expiryPolicy: "n/a",
    required: true,
    description: "Unapproved release deviation waiver rejected",
  },
];

export function buildExceptionManifest(): ExceptionManifest {
  const exceptions = EXCEPTION_CATALOG;
  const statuses = new Set(exceptions.map((e) => e.status));
  const catalogComplete = exceptions.length >= 6 && statuses.size >= 3;

  return {
    version: V69_ARCHITECTURE_COMPLIANCE_VERSION,
    entryCount: exceptions.length,
    statusCount: statuses.size,
    catalogComplete,
    exceptions,
    summary: [
      `exceptions count=${exceptions.length}`,
      `statuses=${statuses.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getExceptionByDeviationRef(
  deviationRef: string,
): ExceptionEntry | undefined {
  return EXCEPTION_CATALOG.find((e) => e.deviationRef === deviationRef);
}

export function getExceptionsByStatus(
  status: ExceptionEntry["status"],
): ExceptionEntry[] {
  return EXCEPTION_CATALOG.filter((e) => e.status === status);
}

export function computeDeclarativeExceptionActive(input: {
  status: ExceptionEntry["status"];
}): boolean {
  return input.status === "approved";
}
