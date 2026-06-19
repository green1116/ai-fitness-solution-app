import type { ReleaseLedgerEntry } from "./release-types";

const ledger: ReleaseLedgerEntry[] = [];

export function appendReleaseLedger(entry: ReleaseLedgerEntry): ReleaseLedgerEntry {
  ledger.unshift(entry);
  return entry;
}

export function listReleaseLedger(): ReleaseLedgerEntry[] {
  return [...ledger];
}

export function clearReleaseLedger(): void {
  ledger.length = 0;
}

export function findLedgerByReleaseId(releaseId: string): ReleaseLedgerEntry | undefined {
  return ledger.find((entry) => entry.releaseId === releaseId);
}
