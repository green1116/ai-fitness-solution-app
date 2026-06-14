/**
 * V36 Tender Hub Foundation — Phase 1 verification
 */
import {
  buildTenderDiscovery,
  buildTenderFeed,
  buildTenderHub,
  buildTenderRegistryRecords,
  CANONICAL_TENDER_HUB_BUYER_ID,
  CANONICAL_TENDER_QUERY,
  executeTenderQuery,
  findEnterpriseTenders,
  findGovernmentTenders,
  findMatchedTenders,
  findOpenTenders,
  findTenders,
  findTopTenders,
  findTrackedTenders,
  getAllTenderSources,
  getTendersByBuyer,
  TENDER_HUB_TAG,
  TENDER_HUB_VERSION,
  TOP_TENDER_SCORE_THRESHOLD,
  validateTenderHubFoundation,
} from "../lib/tender-hub";
import { validateIndustryTransaction } from "../lib/industry-transaction";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testTenderSources() {
  const sources = getAllTenderSources();
  assert(sources.length === 7, "tender source count");

  console.log("✓ tender sources");
  console.log(" ", `count=${sources.length} types=7/7`);
}

function testTenderRegistry() {
  const result = validateTenderHubFoundation().tenderRegistry;
  assert(result.valid, "tender registry valid");
  assert(result.count >= 12, "tender registry count");

  const tenders = buildTenderRegistryRecords();
  assert(
    tenders.some((tender) => tender.transactionId),
    "transaction-linked tenders",
  );

  console.log("✓ tender registry");
  console.log(" ", result.summary);
}

function testTenderFeedAndDiscovery() {
  const feedResult = validateTenderHubFoundation().tenderFeed;
  const discoveryResult = validateTenderHubFoundation().tenderDiscovery;
  assert(feedResult.valid, "tender feed valid");
  assert(discoveryResult.valid, "tender discovery valid");

  const feed = buildTenderFeed(10);
  const discovery = buildTenderDiscovery();
  assert(feed.feedReady, "tender feed ready");
  assert(discovery.discoveryReady, "tender discovery ready");

  console.log("✓ tender feed & discovery");
  console.log(" ", feedResult.summary);
  console.log(" ", discoveryResult.summary);
}

function testTenderQuery() {
  const result = validateTenderHubFoundation().tenderQuery;
  assert(result.valid, "tender query valid");

  const canonical = executeTenderQuery(CANONICAL_TENDER_QUERY);
  const all = findTenders(10);
  const open = findOpenTenders(10);
  const tracked = findTrackedTenders(3);
  const government = findGovernmentTenders(3);
  const enterprise = findEnterpriseTenders(3);
  const matched = findMatchedTenders(3);
  const top = findTopTenders(5);
  const buyer = getTendersByBuyer(CANONICAL_TENDER_HUB_BUYER_ID);

  assert(canonical.hubReady, "canonical query ready");
  assert(all.hitCount >= 10, "findTenders");
  assert(open.hitCount >= 5, "findOpenTenders");
  assert(tracked.hitCount >= 1, "findTrackedTenders");
  assert(government.hitCount >= 1, "findGovernmentTenders");
  assert(enterprise.hitCount >= 1, "findEnterpriseTenders");
  assert(matched.hitCount >= 1, "findMatchedTenders");
  assert(top.hitCount >= 3, "findTopTenders");
  assert(buyer.length >= 2, "canonical buyer tenders");

  const topTender = top.tenders[0]!;
  assert(topTender.score.totalTenderScore >= TOP_TENDER_SCORE_THRESHOLD, "top threshold");
  assert(
    topTender.score.opportunityScore > 0 &&
      topTender.score.budgetScore > 0 &&
      topTender.score.competitionScore > 0 &&
      topTender.score.matchingScore > 0 &&
      topTender.score.winProbability > 0,
    "tender score dimensions",
  );

  console.log("✓ tender query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} open=${open.hitCount} government=${government.hitCount} top=${top.hitCount} topScore=${topTender.score.totalTenderScore}`,
  );
}

function testTenderHub() {
  const validation = validateTenderHubFoundation();
  assert(validation.valid, "tender hub foundation validation");
  assert(TENDER_HUB_VERSION === "v36-tender-hub-1", "tender hub version");
  assert(TENDER_HUB_TAG === "v36-tender-hub-foundation", "tender hub tag");

  const hub = buildTenderHub();
  assert(hub.hubReady, "tender hub ready");
  assert(hub.sources.length === 7, "tender hub sources");

  const transactionValidation = validateIndustryTransaction();
  assert(transactionValidation.valid, "underlying transaction layer unchanged");

  console.log("✓ tender hub");
  console.log(" ", validation.tenderHub.summary);
  console.log(
    " ",
    `source=${validation.sourceRegistry.valid} registry=${validation.tenderRegistry.valid} feed=${validation.tenderFeed.valid} discovery=${validation.tenderDiscovery.valid} query=${validation.tenderQuery.valid}`,
  );
}

testTenderSources();
testTenderRegistry();
testTenderFeedAndDiscovery();
testTenderQuery();
testTenderHub();
console.log("Tender Hub Foundation PASS");
