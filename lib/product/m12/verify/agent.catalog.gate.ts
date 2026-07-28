/**
 * Product M12 — Agent Catalog Release Gate
 * MODULE: Agent Catalog (M12-P2)
 * BASE: enterprise-product-agent-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AGENT_FOUNDATION_ID } from "../foundation/agent.constants";
import { bindAgentCatalogEntry } from "../catalog/binding.registry";
import {
  AGENT_CATALOG_BINDING_STATUSES,
  AGENT_CATALOG_ENTRY_STATUSES,
  AGENT_CATALOG_KINDS,
  AGENT_CATALOG_READINESS_VERDICTS,
  AGENT_CATALOG_STATUSES,
  PRODUCT_AGENT_CATALOG_BASE,
  PRODUCT_AGENT_CATALOG_FREEZE_TAG,
  PRODUCT_AGENT_CATALOG_FREEZE_VERSION,
  PRODUCT_AGENT_CATALOG_ID,
  PRODUCT_AGENT_CATALOG_VERSION,
} from "../catalog/catalog.constants";
import {
  assertAgentCatalogReadinessReady,
  buildAgentCatalogManifest,
  clearAgentCatalogLayer,
  evaluateAgentCatalogReadiness,
} from "../catalog/catalog.manifest";
import {
  getAgentCatalogMetadata,
  isAgentCatalogMetadataIntact,
} from "../catalog/catalog.metadata";
import {
  registerAgentCatalog,
  updateAgentCatalogStatus,
} from "../catalog/catalog.registry";
import {
  registerAgentCatalogEntry,
  updateAgentCatalogEntryStatus,
} from "../catalog/entry.registry";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_AGENT_CATALOG_SIGNOFF_VERSION =
  "product-agent-catalog-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearAgentCatalogLayer();
}

export function checkProductAgentCatalogReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAgentCatalogMetadata();

  checks.push(
    check(
      "AGTCAT-CONSTANTS",
      "catalog",
      "Product agent catalog version constants",
      PRODUCT_AGENT_CATALOG_ID === "enterprise-product-agent-catalog-v1" &&
        PRODUCT_AGENT_CATALOG_VERSION === "product-agent-catalog-1" &&
        PRODUCT_AGENT_CATALOG_BASE === PRODUCT_AGENT_FOUNDATION_ID &&
        PRODUCT_AGENT_CATALOG_FREEZE_VERSION ===
          "product-agent-catalog-freeze-1" &&
        PRODUCT_AGENT_CATALOG_FREEZE_TAG ===
          "product-agent-catalog-freeze-1" &&
        AGENT_CATALOG_KINDS.length === 4 &&
        AGENT_CATALOG_STATUSES.length === 4 &&
        AGENT_CATALOG_ENTRY_STATUSES.length === 4 &&
        AGENT_CATALOG_BINDING_STATUSES.length === 3 &&
        AGENT_CATALOG_READINESS_VERDICTS.length === 3 &&
        isAgentCatalogMetadataIntact(metadata),
      `id=${PRODUCT_AGENT_CATALOG_ID} base=${PRODUCT_AGENT_CATALOG_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AGTCAT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AGTCAT-UPSTREAM",
      "compatibility",
      "Depends on agent foundation chain",
      PRODUCT_AGENT_CATALOG_BASE ===
        "enterprise-product-agent-foundation-v1" &&
        PRODUCT_AGENT_FOUNDATION_ID ===
          "enterprise-product-agent-foundation-v1",
      `foundation=${PRODUCT_AGENT_FOUNDATION_ID}`,
    ),
  );

  try {
    cleanup();

    const catalog = registerAgentCatalog({
      id: "agtcat.gate.cat",
      catalogKey: "DOMAIN_FITNESS_FLEET",
      kind: "DOMAIN",
      title: "Domain fitness agent catalog",
      summary: "Declared domain catalog for agent reuse",
    });
    const active = updateAgentCatalogStatus({
      catalogId: catalog.id,
      status: "ACTIVE",
    });
    const entry = registerAgentCatalogEntry({
      id: "agtcat.gate.entry",
      catalogId: catalog.id,
      entryKey: "PLANNER_SLOT",
      sequence: 1,
      agentKeyRef: "DOMAIN_FITNESS_PLANNER",
      summary: "Soft-ref entry to foundation planner agent",
    });
    const declared = updateAgentCatalogEntryStatus({
      entryId: entry.id,
      status: "DECLARED",
    });
    const binding = bindAgentCatalogEntry({
      id: "agtcat.gate.bind",
      catalogId: catalog.id,
      entryId: entry.id,
      bindingKey: "DOMAIN_FLEET_TO_LOOKUP",
      invocationContractKeyRef: "PLANNER_DOMAIN_LOOKUP",
    });
    const manifest = buildAgentCatalogManifest();
    const readiness = evaluateAgentCatalogReadiness();

    const ok =
      catalog.catalogKey === "DOMAIN_FITNESS_FLEET" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.agentKeyRef === "DOMAIN_FITNESS_PLANNER" &&
      binding.status === "BOUND" &&
      binding.invocationContractKeyRef === "PLANNER_DOMAIN_LOOKUP" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAgentCatalogReadinessReady(readiness);
      checks.push(
        check(
          "AGTCAT-STACK",
          "agent-catalog",
          "Catalog / entry / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AGTCAT-STACK",
          "agent-catalog",
          "Catalog / entry / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product agent catalog not ready",
        ),
      );
    }

    checks.push(
      check(
        "AGTCAT-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "agent-catalog-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product agent catalog probe failed";
    checks.push(
      check(
        "AGTCAT-STACK",
        "agent-catalog",
        "Catalog / entry / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AGTCAT-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
        false,
        detail,
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-agent-catalog-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAgentCatalogReleaseGatePass(
  gate: ReleaseGateResult = checkProductAgentCatalogReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product agent catalog release gate failed: ${gate.summary}`,
    );
  }
}
