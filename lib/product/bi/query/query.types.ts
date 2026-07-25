/**
 * Product BI — Query types
 */

import type { BI_QUERY_KINDS } from "../integration/integration.constants";

export type BiQueryKind = (typeof BI_QUERY_KINDS)[number];
export type QueryMetadata = Record<string, unknown>;

export type BiQuery = {
  id: string;
  connectorId: string;
  kind: BiQueryKind;
  expression: string;
  matchCount: number;
  detail: string;
  metadata: QueryMetadata;
  queriedAt: string;
};

export type ExecuteBiQueryInput = {
  id?: string;
  connectorId: string;
  kind: BiQueryKind;
  expression: string;
  matchCount: number;
  metadata?: QueryMetadata;
};
