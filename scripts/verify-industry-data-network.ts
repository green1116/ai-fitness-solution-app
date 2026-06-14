/**
 * V32 Industry Data Network Foundation verification
 */
import {
  buildIndustryDataContext,
  CANONICAL_DATA_QUERY,
  CANONICAL_DATA_SUBJECT_ID,
  INDUSTRY_DATA_NETWORK_TAG,
  INDUSTRY_DATA_NETWORK_VERSION,
  queryDataByEventType,
  queryDataBySignalType,
  queryDataBySubject,
  queryIndustryData,
  validateDataContextRegistry,
  validateDataQueryRegistry,
  validateEventRegistry,
  validateIndustryDataContext,
  validateIndustryDataNetwork,
  validateObservationRegistry,
  validateSignalRegistry,
} from "../lib/industry-data-network";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testSignalRegistry() {
  const result = validateSignalRegistry();
  assert(result.valid, "signal registry valid");
  assert(result.count >= 10, "signal count");
  console.log("✓ signal registry");
  console.log(" ", result.summary);
}

function testEventRegistry() {
  const result = validateEventRegistry();
  assert(result.valid, "event registry valid");
  assert(result.count >= 10, "event count");
  console.log("✓ event registry");
  console.log(" ", result.summary);
}

function testObservationRegistry() {
  const result = validateObservationRegistry();
  assert(result.valid, "observation registry valid");
  assert(result.count >= 8, "observation count");
  console.log("✓ observation registry");
  console.log(" ", result.summary);
}

function testDataContext() {
  const result = validateDataContextRegistry();
  assert(result.valid, "data context registry valid");

  const context = buildIndustryDataContext();
  assert(validateIndustryDataContext(context), "data context valid");
  assert(context.dataReady, "data ready");

  console.log("✓ data context");
  console.log(" ", result.summary);
}

function testDataQuery() {
  const result = validateDataQueryRegistry();
  assert(result.valid, "data query registry valid");

  const canonical = queryIndustryData(CANONICAL_DATA_QUERY);
  const subject = queryDataBySubject(CANONICAL_DATA_SUBJECT_ID);
  const supply = queryDataBySignalType("SUPPLY_ACTIVITY");
  const bids = queryDataByEventType("BID_SUBMITTED");

  assert(canonical.dataReady, "canonical query ready");
  assert(subject.hitCount >= 5, "subject query");
  assert(supply.signals.length >= 2, "supply signal query");
  assert(bids.events.length >= 2, "bid event query");

  console.log("✓ data query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} subject=${subject.hitCount} supply=${supply.signals.length} bids=${bids.events.length}`,
  );
}

function testIndustryDataNetwork() {
  const validation = validateIndustryDataNetwork();
  assert(validation.valid, "industry data network validation");
  assert(INDUSTRY_DATA_NETWORK_VERSION === "v32-industry-data-network-1", "data network version");
  assert(INDUSTRY_DATA_NETWORK_TAG === "v32-industry-data-network-foundation", "data network tag");

  console.log("✓ industry data network validation");
  console.log(
    " ",
    `signal=${validation.signalRegistry.valid} event=${validation.eventRegistry.valid} observation=${validation.observationRegistry.valid} context=${validation.dataContext.valid} query=${validation.dataQuery.valid}`,
  );
}

testSignalRegistry();
testEventRegistry();
testObservationRegistry();
testDataContext();
testDataQuery();
testIndustryDataNetwork();
console.log("Industry Data Network Foundation PASS");
