/**
 * Product M12 — Agent Catalog version metadata
 */

import {
  PRODUCT_AGENT_CATALOG_BASE,
  PRODUCT_AGENT_CATALOG_FREEZE_TAG,
  PRODUCT_AGENT_CATALOG_FREEZE_VERSION,
  PRODUCT_AGENT_CATALOG_ID,
  PRODUCT_AGENT_CATALOG_VERSION,
} from "./catalog.constants";

export type AgentCatalogMetadataRecord = {
  catalogRuntimeId: typeof PRODUCT_AGENT_CATALOG_ID;
  version: typeof PRODUCT_AGENT_CATALOG_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_CATALOG_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AGENT_CATALOG_FREEZE_TAG;
  base: typeof PRODUCT_AGENT_CATALOG_BASE;
  module: "M12-P2";
  domain: "AI Agent Platform";
  layer: "catalog";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AGENT_CATALOG_METADATA: AgentCatalogMetadataRecord = {
  catalogRuntimeId: PRODUCT_AGENT_CATALOG_ID,
  version: PRODUCT_AGENT_CATALOG_VERSION,
  freezeVersion: PRODUCT_AGENT_CATALOG_FREEZE_VERSION,
  freezeTag: PRODUCT_AGENT_CATALOG_FREEZE_TAG,
  base: PRODUCT_AGENT_CATALOG_BASE,
  module: "M12-P2",
  domain: "AI Agent Platform",
  layer: "catalog",
  declarationOnly: true,
  excludes: [
    "database",
    "vector-store",
    "rag-runtime",
    "embedding",
    "external-provider",
    "agent-execution",
    "tool-runtime",
  ],
};

export function getAgentCatalogMetadata(): AgentCatalogMetadataRecord {
  return {
    ...PRODUCT_AGENT_CATALOG_METADATA,
    excludes: [...PRODUCT_AGENT_CATALOG_METADATA.excludes],
  };
}

export function isAgentCatalogMetadataIntact(
  metadata: AgentCatalogMetadataRecord = PRODUCT_AGENT_CATALOG_METADATA,
): boolean {
  return (
    metadata.catalogRuntimeId === "enterprise-product-agent-catalog-v1" &&
    metadata.version === "product-agent-catalog-1" &&
    metadata.freezeVersion === "product-agent-catalog-freeze-1" &&
    metadata.base === "enterprise-product-agent-foundation-v1" &&
    metadata.module === "M12-P2" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
