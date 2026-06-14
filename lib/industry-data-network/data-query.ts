import { validateDataContextRegistry } from "./data-context";
import { getAllEvents, getEventsBySubject, getEventsByType } from "./event-registry";
import { getAllObservations, getObservationsBySubject } from "./observation-registry";
import { getAllSignals, getSignalsBySubject, getSignalsByType } from "./signal-registry";
import type {
  DataQuery,
  DataQueryResult,
  IndustryDataNetworkValidation,
  RegistryValidation,
} from "./shared/types";
import { CANONICAL_DATA_QUERY, CANONICAL_DATA_SUBJECT_ID } from "./shared/types";
import { validateEventRegistry } from "./event-registry";
import { validateObservationRegistry } from "./observation-registry";
import { validateSignalRegistry } from "./signal-registry";

function matchesKeyword(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

function observationMatchesKeyword(
  observation: ReturnType<typeof getAllObservations>[number],
  keyword: string,
): boolean {
  return (
    matchesKeyword(observation.summary, keyword) ||
    Object.values(observation.metadata).some((value) => matchesKeyword(value, keyword))
  );
}

export function queryIndustryData(input: DataQuery = {}): DataQueryResult {
  let signals = getAllSignals();
  let events = getAllEvents();
  let observations = getAllObservations();

  if (input.subjectId) {
    signals = getSignalsBySubject(input.subjectId);
    events = getEventsBySubject(input.subjectId);
    observations = getObservationsBySubject(input.subjectId);
  }

  if (input.subjectType) {
    signals = signals.filter((signal) => signal.subjectType === input.subjectType);
    events = events.filter((event) => event.subjectType === input.subjectType);
    observations = observations.filter((observation) => observation.subjectType === input.subjectType);
  }

  if (input.signalType) {
    signals = input.subjectId
      ? signals.filter((signal) => signal.signalType === input.signalType)
      : getSignalsByType(input.signalType);
  }

  if (input.eventType) {
    events = input.subjectId
      ? events.filter((event) => event.eventType === input.eventType)
      : getEventsByType(input.eventType);
  }

  if (input.severity) {
    signals = signals.filter((signal) => signal.severity === input.severity);
  }

  if (input.keyword) {
    signals = signals.filter(
      (signal) =>
        matchesKeyword(signal.signalId, input.keyword!) ||
        Object.values(signal.metadata).some((value) => matchesKeyword(value, input.keyword!)),
    );
    events = events.filter(
      (event) =>
        matchesKeyword(event.eventId, input.keyword!) ||
        Object.values(event.metadata).some((value) => matchesKeyword(value, input.keyword!)),
    );
    observations = observations.filter((observation) =>
      observationMatchesKeyword(observation, input.keyword!),
    );
  }

  const queryParts = [
    input.subjectId ?? "all-subjects",
    input.subjectType ?? "all-subject-types",
    input.signalType ?? "all-signal-types",
    input.eventType ?? "all-event-types",
    input.severity ?? "all-severities",
    input.keyword ?? "no-keyword",
  ];

  const hitCount = signals.length + events.length + observations.length;

  return {
    queryId: `industry-data-query-${queryParts.join("-")}`,
    query: input,
    signals,
    events,
    observations,
    hitCount,
    dataReady: hitCount > 0,
  };
}

export function queryDataBySubject(subjectId: string): DataQueryResult {
  return queryIndustryData({ subjectId });
}

export function queryDataBySignalType(
  signalType: NonNullable<DataQuery["signalType"]>,
): DataQueryResult {
  return queryIndustryData({ signalType });
}

export function queryDataByEventType(
  eventType: NonNullable<DataQuery["eventType"]>,
): DataQueryResult {
  return queryIndustryData({ eventType });
}

export function validateDataQueryRegistry(): RegistryValidation {
  const canonical = queryIndustryData(CANONICAL_DATA_QUERY);
  const subjectQuery = queryDataBySubject(CANONICAL_DATA_SUBJECT_ID);
  const supplySignals = queryDataBySignalType("SUPPLY_ACTIVITY");
  const bidEvents = queryDataByEventType("BID_SUBMITTED");
  const keywordQuery = queryIndustryData({ keyword: "East China" });

  const valid =
    canonical.dataReady &&
    canonical.signals.length >= 1 &&
    subjectQuery.hitCount >= 5 &&
    subjectQuery.observations.length >= 1 &&
    supplySignals.signals.length >= 2 &&
    bidEvents.events.length >= 2 &&
    keywordQuery.hitCount >= 1;

  return {
    valid,
    count: canonical.hitCount,
    summary: `data-query canonical=${canonical.hitCount} subject=${subjectQuery.hitCount} supply=${supplySignals.signals.length} bid=${bidEvents.events.length} valid=${valid}`,
  };
}

export function validateIndustryDataNetwork(): IndustryDataNetworkValidation {
  const signalRegistry = validateSignalRegistry();
  const eventRegistry = validateEventRegistry();
  const observationRegistry = validateObservationRegistry();
  const dataContext = validateDataContextRegistry();
  const dataQuery = validateDataQueryRegistry();

  return {
    valid:
      signalRegistry.valid &&
      eventRegistry.valid &&
      observationRegistry.valid &&
      dataContext.valid &&
      dataQuery.valid,
    signalRegistry,
    eventRegistry,
    observationRegistry,
    dataContext,
    dataQuery,
  };
}
