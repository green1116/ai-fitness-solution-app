import type { RegistryValidation } from "./shared/types";
import { getAllEvents } from "./event-registry";
import { getAllObservations } from "./observation-registry";
import { getAllSignals } from "./signal-registry";
import type { IndustryDataContext } from "./shared/types";
import {
  CANONICAL_DATA_SUBJECT_ID,
  INDUSTRY_DATA_NETWORK_TAG,
  INDUSTRY_DATA_NETWORK_VERSION,
} from "./shared/types";

export function buildIndustryDataContext(): IndustryDataContext {
  const signals = getAllSignals();
  const events = getAllEvents();
  const observations = getAllObservations();

  return {
    contextId: `industry-data-context-${INDUSTRY_DATA_NETWORK_VERSION}`,
    signals,
    events,
    observations,
    signalCount: signals.length,
    eventCount: events.length,
    observationCount: observations.length,
    dataReady: signals.length > 0 && events.length > 0 && observations.length > 0,
    mode: "industry-data-network",
  };
}

export function validateIndustryDataContext(context: IndustryDataContext): boolean {
  const canonicalObservations = context.observations.filter(
    (observation) => observation.subjectId === CANONICAL_DATA_SUBJECT_ID,
  );

  return (
    context.dataReady &&
    context.signalCount >= 10 &&
    context.eventCount >= 10 &&
    context.observationCount >= 8 &&
    context.signals.length === context.signalCount &&
    context.events.length === context.eventCount &&
    context.observations.length === context.observationCount &&
    canonicalObservations.length >= 1 &&
    context.mode === "industry-data-network"
  );
}

export function validateDataContextRegistry(): RegistryValidation {
  const context = buildIndustryDataContext();
  const valid =
    validateIndustryDataContext(context) &&
    INDUSTRY_DATA_NETWORK_VERSION === "v32-industry-data-network-1" &&
    INDUSTRY_DATA_NETWORK_TAG === "v32-industry-data-network-foundation";

  return {
    valid,
    count: context.signalCount + context.eventCount + context.observationCount,
    summary: `data-context signals=${context.signalCount} events=${context.eventCount} observations=${context.observationCount} ready=${context.dataReady} valid=${valid}`,
  };
}
