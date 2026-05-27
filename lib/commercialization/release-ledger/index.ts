/**
 * V3.7-H6 Production Release Ledger Foundation
 */

export {
  RELEASE_LEDGER_DTO_VERSION,
  buildReleaseLedgerDto,
  type ReleaseLedgerDto,
} from "./release-ledger.dto";

export {
  RELEASE_LEDGER_VERSION,
  buildReleaseLedger,
  type ReleaseLedger,
  type ReleaseLedgerTrace,
  type ReleaseLedgerReadiness,
  type ReleaseLedgerConfidence,
  type ReleaseLedgerIncident,
  type ReleaseLedgerVerificationLineage,
} from "./release-ledger";

export {
  EVIDENCE_EXPORT_VERSION,
  buildEvidenceExport,
  type EvidenceExport,
} from "./evidence-export";

export const PRODUCTION_RELEASE_LEDGER_VERSION = "3.7-h6-foundation-1" as const;

import { buildReleaseLedgerDto, type ReleaseLedgerDto } from "./release-ledger.dto";
import { buildReleaseLedger, type ReleaseLedger } from "./release-ledger";
import { buildEvidenceExport, type EvidenceExport } from "./evidence-export";

export type ProductionReleaseLedgerFoundation = {
  version: typeof PRODUCTION_RELEASE_LEDGER_VERSION;
  foundationId: string;
  dto: ReleaseLedgerDto;
  ledger: ReleaseLedger;
  evidenceExport: EvidenceExport;
  summary: string;
};

export function buildProductionReleaseLedgerFoundation(input?: {
  deploymentId?: string;
}): ProductionReleaseLedgerFoundation {
  const deploymentId = input?.deploymentId ?? "release-ledger-foundation";
  const foundationId = `PRL-V37H6-${deploymentId.slice(0, 8)}`;
  const dto = buildReleaseLedgerDto({ deploymentId });
  const ledger = buildReleaseLedger({ deploymentId });
  const evidenceExport = buildEvidenceExport({ deploymentId });

  return {
    version: PRODUCTION_RELEASE_LEDGER_VERSION,
    foundationId,
    dto,
    ledger,
    evidenceExport,
    summary: `production-release-ledger id=${foundationId} release=${dto.releaseId} releasable=${dto.releasable} releaseReady=${dto.releaseReady} confidence=${dto.confidenceScore} incident=${dto.incidentLevel} export=${evidenceExport.exportId}`,
  };
}
