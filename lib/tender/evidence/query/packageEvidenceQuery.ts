import type { EvidenceAdapterResult } from "../bridge/buildEvidenceFromPipeline";
import { queryEvidenceRegistry } from "./evidenceQueryService";
import type { EvidenceQueryFilters, EvidenceQueryResult } from "./types";

/**
 * 将 pipeline build 结果包装为 V2.7 EvidenceQueryResult（供各 tender API 复用）
 */
export function packageEvidenceQuery(
  evidence: EvidenceAdapterResult,
  filters?: EvidenceQueryFilters,
): EvidenceQueryResult {
  return queryEvidenceRegistry(
    evidence.registry,
    evidence.matrix,
    evidence.coverage,
    filters,
  );
}
