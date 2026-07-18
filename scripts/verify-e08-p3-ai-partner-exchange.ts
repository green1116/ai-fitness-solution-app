/**
 * E08-P3 — AI Partner Exchange verification
 * Capability exchange above E08 Multi Organization Network
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildEcosystemFoundation,
  E08_ECOSYSTEM_PLATFORM_ID,
} from "../lib/ecosystem/e08";
import { buildNetworkRegistryManifest } from "../lib/ecosystem/e08/network/network.registry";
import { E08_NETWORK_BASE } from "../lib/ecosystem/e08/network/network.constants";
import {
  E08_EXCHANGE_BASE,
  E08_EXCHANGE_ID,
  E08_EXCHANGE_VERSION,
  EXCHANGE_CATEGORIES,
  EXCHANGE_LISTING_STATUSES,
  EXCHANGE_MATCH_PHASES,
  EXCHANGE_TRACE_EVENT_KINDS,
} from "../lib/ecosystem/e08/exchange/exchange.constants";
import {
  buildExchangeRegistryManifest,
  getListingByCategory,
  getListingById,
  listExchangeableListings,
  listListingsByTag,
  listListingsForNetwork,
  EXCHANGE_CATALOG,
} from "../lib/ecosystem/e08/exchange/exchange.registry";
import {
  exchangePartnerCapability,
  exchangePartnerCapabilityOrThrow,
  matchPartnerExchange,
} from "../lib/ecosystem/e08/exchange/exchange.matcher";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E08_P1_P2 = [
  "lib/ecosystem/e08/core/ecosystem.types.ts",
  "lib/ecosystem/e08/core/ecosystem.constants.ts",
  "lib/ecosystem/e08/core/ecosystem.lifecycle.ts",
  "lib/ecosystem/e08/core/ecosystem.registry.ts",
  "lib/ecosystem/e08/runtime/ecosystem.context.ts",
  "lib/ecosystem/e08/runtime/ecosystem.executor.ts",
  "lib/ecosystem/e08/relationship/relationship.types.ts",
  "lib/ecosystem/e08/relationship/relationship.registry.ts",
  "lib/ecosystem/e08/index.ts",
  "lib/ecosystem/e08/network/network.types.ts",
  "lib/ecosystem/e08/network/network.constants.ts",
  "lib/ecosystem/e08/network/network.registry.ts",
  "lib/ecosystem/e08/network/network.graph.ts",
  "lib/ecosystem/e08/network/network.executor.ts",
  "lib/ecosystem/e08/network/network.trace.ts",
] as const;

const FROZEN_UPSTREAM = [
  "lib/workforce/e07/core/workforce.registry.ts",
  "lib/workforce/e07/runtime/workforce.executor.ts",
  "lib/workforce/e07/index.ts",
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function sha1(rel: string): string {
  return createHash("sha1")
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest("hex");
}

function checkModules() {
  const required = [
    "lib/ecosystem/e08/exchange/exchange.types.ts",
    "lib/ecosystem/e08/exchange/exchange.constants.ts",
    "lib/ecosystem/e08/exchange/exchange.registry.ts",
    "lib/ecosystem/e08/exchange/exchange.catalog.ts",
    "lib/ecosystem/e08/exchange/exchange.matcher.ts",
    "lib/ecosystem/e08/exchange/exchange.trace.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozen(
  label: string,
  files: readonly string[],
  baseline: Record<string, string>,
) {
  for (const rel of files) {
    check(sha1(rel) === baseline[rel], `${label} modified: ${rel}`);
  }
}

function checkBasesIntact() {
  const foundation = buildEcosystemFoundation();
  check(foundation.ready === true, "E08-P1 foundation still ready");
  check(
    foundation.platformId === E08_ECOSYSTEM_PLATFORM_ID,
    "E08-P1 platform id intact",
  );

  const networks = buildNetworkRegistryManifest();
  check(networks.catalogComplete === true, "E08-P2 networks still complete");
  check(
    E08_NETWORK_BASE ===
      "enterprise-e08-p1-enterprise-ecosystem-foundation-v1",
    "E08-P2 base constant",
  );
  check(
    E08_EXCHANGE_BASE === "enterprise-e08-p2-multi-organization-network-v1",
    "E08-P3 base constant",
  );
  console.log("✓ upstream + E08-P1/P2 unmodified / bases intact");
}

function testRegistryAndCatalog() {
  check(EXCHANGE_CATEGORIES.length === 3, "exchange categories");
  check(EXCHANGE_LISTING_STATUSES.length === 3, "listing statuses");
  check(EXCHANGE_MATCH_PHASES.length === 4, "match phases");
  check(EXCHANGE_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(EXCHANGE_CATALOG.length === 3, "listings");

  const manifest = buildExchangeRegistryManifest();
  check(manifest.catalogComplete === true, "exchange catalog complete");
  check(manifest.exchangeId === E08_EXCHANGE_ID, "exchange id");
  check(manifest.version === E08_EXCHANGE_VERSION, "version");
  check(manifest.base === E08_EXCHANGE_BASE, "base e08-p2");
  check(manifest.categories.length === 3, "categories covered");

  check(
    getListingByCategory("supply")?.id === "e08.exchange.supply-capability",
    "by category",
  );
  check(
    getListingById("e08.exchange.distribution-capability")?.networkId ===
      "e08.network.go-to-market",
    "by id",
  );
  check(listExchangeableListings().length === 3, "all exchangeable");
  check(listListingsByTag("compliance").length === 1, "by tag");
  check(
    listListingsForNetwork("e08.network.compliance").length === 1,
    "listings for network",
  );
  console.log("✓ exchange registry + catalog");
}

function testMatcher() {
  const byTag = matchPartnerExchange({ tags: ["channel", "alliance"] });
  check(byTag.success === true, "tag match success");
  check(
    byTag.best?.listingId === "e08.exchange.distribution-capability",
    "tag best match",
  );
  check(byTag.matchCount >= 1, "tag match count");

  const byCategory = matchPartnerExchange({ category: "governance" });
  check(
    byCategory.best?.listingId === "e08.exchange.governance-capability",
    "category match",
  );

  const none = matchPartnerExchange({ tags: ["nonexistent-capability"] });
  check(none.success === false, "no match");
  check(none.matchCount === 0, "empty candidates");

  const supply = getListingById("e08.exchange.supply-capability");
  check(Boolean(supply), "supply listing");

  const run = exchangePartnerCapabilityOrThrow(supply!, {
    input: {
      goal: "星河科技园健身中心AI伙伴能力交换",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e08-p3" },
  });

  check(run.result.success === true, "exchange success");
  check(run.result.status === "result", "status result");
  check(run.result.network?.success === true, "network success");
  check(run.result.network?.completedNodes === 2, "network nodes");
  check(run.result.output.category === "supply", "output category");
  check(
    run.result.output.title === "AI Supply Chain Exchange",
    "output title",
  );

  check(run.trace.eventCount >= 5, "trace events recorded");
  for (const kind of ["query", "match", "exchange", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const listing of EXCHANGE_CATALOG) {
    const bundle = exchangePartnerCapabilityOrThrow(listing, {
      input: {
        goal: `probe:${listing.category}`,
        ready: true,
        riskScore: 10,
      },
    });
    check(bundle.result.success === true, `${listing.id} success`);
    check(
      bundle.result.networkId === listing.networkId,
      `${listing.id} network binding`,
    );
  }

  const blocked = exchangePartnerCapability(supply!, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");
  check(
    blocked.trace.events.some((e) => e.kind === "error"),
    "blocked trace error",
  );

  const retired = exchangePartnerCapability({
    ...supply!,
    listingStatus: "retired",
  });
  check(retired.result.success === false, "retired not success");
  check(retired.result.status === "failed", "retired failed");
  check(
    (retired.result.errorMessage ?? "").includes("not exchangeable"),
    "retired message",
  );

  let threw = false;
  try {
    exchangePartnerCapability({
      ...supply!,
      networkId: "e08.network.missing",
    });
  } catch (error) {
    threw =
      error instanceof Error && error.message.includes("missing E08 network");
  }
  check(threw, "broken listing definition rejected");

  console.log("✓ exchange matcher → E08 organization network bridge");
}

function main() {
  console.log("E08-P3 — AI Partner Exchange Verification\n");

  const frozen = [...FROZEN_E08_P1_P2, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E08-P1/P2", FROZEN_E08_P1_P2, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndCatalog();
  testMatcher();
  checkFrozen("E08-P1/P2", FROZEN_E08_P1_P2, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E08 P3 AI partner exchange");
}

main();
