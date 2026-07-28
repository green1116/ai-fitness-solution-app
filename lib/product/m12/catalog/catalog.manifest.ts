/**
 * Product M12 — Agent Catalog manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AGENT_FOUNDATION_ID } from "../foundation/agent.constants";
import {
  clearAgentCatalogBindings,
  listAgentCatalogBindings,
} from "./binding.registry";
import {
  PRODUCT_AGENT_CATALOG_BASE,
  PRODUCT_AGENT_CATALOG_FREEZE_VERSION,
  PRODUCT_AGENT_CATALOG_ID,
  PRODUCT_AGENT_CATALOG_VERSION,
} from "./catalog.constants";
import { getAgentCatalogMetadata } from "./catalog.metadata";
import {
  clearAgentCatalogs,
  listAgentCatalogs,
} from "./catalog.registry";
import type {
  AgentCatalogManifest,
  AgentCatalogReadinessCheck,
  AgentCatalogReadinessResult,
} from "./catalog.types";
import {
  clearAgentCatalogEntries,
  listAgentCatalogEntries,
} from "./entry.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AgentCatalogReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAgentCatalogLayer(): void {
  clearAgentCatalogBindings();
  clearAgentCatalogEntries();
  clearAgentCatalogs();
}

export function buildAgentCatalogManifest(): AgentCatalogManifest {
  const catalogs = listAgentCatalogs();
  const entries = listAgentCatalogEntries();
  const bindings = listAgentCatalogBindings();
  const metadata = getAgentCatalogMetadata();

  const payload = {
    catalogRuntimeId: PRODUCT_AGENT_CATALOG_ID,
    version: PRODUCT_AGENT_CATALOG_VERSION,
    freezeVersion: PRODUCT_AGENT_CATALOG_FREEZE_VERSION,
    base: PRODUCT_AGENT_CATALOG_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    catalogs: catalogs.map((c) => ({
      catalogKey: c.catalogKey,
      kind: c.kind,
      status: c.status,
    })),
    entries: entries.map((e) => ({
      entryKey: e.entryKey,
      sequence: e.sequence,
      status: e.status,
      catalogId: e.catalogId,
      agentKeyRef: e.agentKeyRef,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      invocationContractKeyRef: b.invocationContractKeyRef,
      status: b.status,
      catalogId: b.catalogId,
    })),
  };

  return {
    catalogRuntimeId: PRODUCT_AGENT_CATALOG_ID,
    version: PRODUCT_AGENT_CATALOG_VERSION,
    freezeVersion: PRODUCT_AGENT_CATALOG_FREEZE_VERSION,
    base: PRODUCT_AGENT_CATALOG_BASE,
    catalogCount: catalogs.length,
    entryCount: entries.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAgentCatalogReadiness(): AgentCatalogReadinessResult {
  const checks: AgentCatalogReadinessCheck[] = [];
  const metadata = getAgentCatalogMetadata();
  const catalogs = listAgentCatalogs();
  const entries = listAgentCatalogEntries();
  const bindings = listAgentCatalogBindings();
  const manifest = buildAgentCatalogManifest();

  checks.push(
    check(
      "AGTCAT-BASE",
      "catalog",
      "agent foundation base aligned",
      PRODUCT_AGENT_CATALOG_BASE === PRODUCT_AGENT_FOUNDATION_ID &&
        PRODUCT_AGENT_FOUNDATION_ID ===
          "enterprise-product-agent-foundation-v1",
      `base=${PRODUCT_AGENT_CATALOG_BASE}`,
    ),
  );

  checks.push(
    check(
      "AGTCAT-META",
      "metadata",
      "Agent catalog metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AGTCAT-CAT",
      "catalog",
      "Active agent catalogs present",
      catalogs.some((c) => c.status === "ACTIVE"),
      `catalogs=${catalogs.length}`,
    ),
  );

  checks.push(
    check(
      "AGTCAT-ENT",
      "entry",
      "Declared catalog entries with soft agent refs",
      entries.some((e) => e.status === "DECLARED" && e.agentKeyRef.length > 0),
      `entries=${entries.length}`,
    ),
  );

  checks.push(
    check(
      "AGTCAT-BIND",
      "binding",
      "Bound catalog entries present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "AGTCAT-MAN",
      "manifest",
      "Agent catalog manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.catalogRuntimeId === PRODUCT_AGENT_CATALOG_ID &&
        manifest.catalogCount >= 1 &&
        manifest.entryCount >= 1 &&
        manifest.bindingCount >= 1,
      `checksum=${manifest.checksum.slice(0, 12)}…`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-agent-catalog readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAgentCatalogReadinessReady(
  result: AgentCatalogReadinessResult,
): asserts result is AgentCatalogReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product agent catalog not ready: ${result.summary}`);
  }
}
