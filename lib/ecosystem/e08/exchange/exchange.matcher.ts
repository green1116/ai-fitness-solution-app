/**
 * E08-P3 — AI Partner Exchange Matcher
 * Matches capability offers and exchanges via bound E08 organization networks
 */

import { getNetworkById } from "../network/network.registry";
import { executeNetwork } from "../network/network.executor";
import {
  EXCHANGE_CATALOG,
  listExchangeableListings,
} from "./exchange.catalog";
import { assertExchangeListing } from "./exchange.registry";
import {
  appendExchangeTraceEvent,
  createExchangeRuntimeTrace,
  type ExchangeRuntimeTrace,
} from "./exchange.trace";
import type {
  ExchangeListing,
  ExchangeMatchCandidate,
  ExchangeMatchQuery,
  ExchangeMatchResult,
  PartnerExchangeResult,
} from "./exchange.types";

export type PartnerExchangeBundle = {
  result: PartnerExchangeResult;
  trace: ExchangeRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function scoreListing(
  listing: ExchangeListing,
  query: ExchangeMatchQuery,
): ExchangeMatchCandidate | undefined {
  if (query.category && listing.category !== query.category) {
    return undefined;
  }
  if (query.networkId && listing.networkId !== query.networkId) {
    return undefined;
  }
  if (
    query.requireExchangeable !== false &&
    listing.listingStatus !== "exchangeable"
  ) {
    return undefined;
  }

  const queryTags = query.tags ?? [];
  const matchedTags =
    queryTags.length === 0
      ? [...listing.tags]
      : listing.tags.filter((tag) => queryTags.includes(tag));

  if (queryTags.length > 0 && matchedTags.length === 0) {
    return undefined;
  }

  let score = 1;
  if (query.category && listing.category === query.category) score += 2;
  if (query.networkId && listing.networkId === query.networkId) score += 2;
  score += matchedTags.length;

  return {
    listingId: listing.id,
    category: listing.category,
    networkId: listing.networkId,
    score,
    matchedTags,
    title: listing.title,
    readOnly: true,
  };
}

export function matchPartnerExchange(
  query: ExchangeMatchQuery,
  listings: ExchangeListing[] = EXCHANGE_CATALOG,
): ExchangeMatchResult {
  const pool =
    query.requireExchangeable === false
      ? listings
      : listExchangeableListings(listings);

  const candidates = pool
    .map((listing) => scoreListing(listing, query))
    .filter((c): c is ExchangeMatchCandidate => Boolean(c))
    .sort((a, b) => b.score - a.score || a.listingId.localeCompare(b.listingId));

  return {
    success: candidates.length > 0,
    query: Object.freeze({ ...query }),
    candidates: Object.freeze([...candidates]) as ExchangeMatchCandidate[],
    best: candidates[0],
    matchCount: candidates.length,
    readOnly: true,
  };
}

export function exchangePartnerCapability(
  listing: ExchangeListing,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
    query?: ExchangeMatchQuery;
  },
): PartnerExchangeBundle {
  assertExchangeListing(listing);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("xchg-inst");
  const taskId = options?.taskId?.trim() || createId("xchg-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createExchangeRuntimeTrace({
    instanceId,
    listingId: listing.id,
    taskId,
  });

  trace = appendExchangeTraceEvent(
    trace,
    "ready",
    `listing ${listing.id} ready`,
    { category: listing.category, networkId: listing.networkId },
  );

  try {
    if (listing.listingStatus !== "exchangeable") {
      throw new Error(
        `listing ${listing.id} is not exchangeable (status=${listing.listingStatus})`,
      );
    }

    const query: ExchangeMatchQuery = options?.query ?? {
      category: listing.category,
      tags: [...listing.tags],
      networkId: listing.networkId,
      requireExchangeable: true,
    };

    trace = appendExchangeTraceEvent(
      trace,
      "query",
      `query category=${query.category ?? "*"} tags=${(query.tags ?? []).join(",") || "*"}`,
      {
        category: query.category ?? "",
        networkId: query.networkId ?? "",
      },
    );

    const match = matchPartnerExchange(query);
    const best = match.best;
    if (!best || best.listingId !== listing.id) {
      throw new Error(
        `listing ${listing.id} did not win match (best=${best?.listingId ?? "none"})`,
      );
    }

    trace = appendExchangeTraceEvent(
      trace,
      "match",
      `matched ${best.title} score=${best.score}`,
      {
        listingId: best.listingId,
        score: String(best.score),
        matchedTags: best.matchedTags.join(","),
      },
    );

    const network = getNetworkById(listing.networkId);
    if (!network) {
      throw new Error(`network missing: ${listing.networkId}`);
    }

    trace = appendExchangeTraceEvent(
      trace,
      "exchange",
      `exchanging via network ${network.id}`,
      { kind: network.kind, nodeCount: String(network.nodes.length) },
    );

    const networkRun = executeNetwork(network, {
      taskId: `${taskId}:network`,
      input: {
        ...input,
        listingId: listing.id,
        exchangeCategory: listing.category,
        goal:
          typeof input.goal === "string"
            ? input.goal
            : `exchange:${listing.category}`,
      },
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e08-exchange",
        listingId: listing.id,
      },
    });

    if (!networkRun.result.success) {
      const status =
        networkRun.result.status === "blocked" ? "blocked" : "failed";
      const message =
        networkRun.result.errorMessage ?? `network ${status}`;

      trace = appendExchangeTraceEvent(trace, "error", message, {
        networkStatus: networkRun.result.status,
      });

      return {
        trace,
        result: {
          success: false,
          listingId: listing.id,
          category: listing.category,
          networkId: listing.networkId,
          instanceId,
          taskId,
          traceId: trace.traceId,
          match,
          network: networkRun.result,
          output: {},
          duration: Date.now() - startedAt,
          status,
          errorMessage: message,
          readOnly: true,
        },
      };
    }

    const duration = Date.now() - startedAt;
    const result: PartnerExchangeResult = {
      success: true,
      listingId: listing.id,
      category: listing.category,
      networkId: listing.networkId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      match,
      network: networkRun.result,
      output: Object.freeze({
        listingId: listing.id,
        category: listing.category,
        title: listing.title,
        networkId: listing.networkId,
        networkKind: network.kind,
        completedNodes: networkRun.result.completedNodes,
        matchScore: best.score,
        tags: [...listing.tags],
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendExchangeTraceEvent(
      trace,
      "result",
      `result ready nodes=${networkRun.result.completedNodes} durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "partner exchange failed";
    const duration = Date.now() - startedAt;

    trace = appendExchangeTraceEvent(trace, "error", message);

    return {
      trace,
      result: {
        success: false,
        listingId: listing.id,
        category: listing.category,
        networkId: listing.networkId,
        instanceId,
        taskId,
        traceId: trace.traceId,
        output: {},
        duration,
        status: "failed",
        errorMessage: message,
        readOnly: true,
      },
    };
  }
}

export function exchangePartnerCapabilityOrThrow(
  listing: ExchangeListing,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
    query?: ExchangeMatchQuery;
  },
): PartnerExchangeBundle & {
  result: PartnerExchangeResult & { success: true; status: "result" };
} {
  const bundle = exchangePartnerCapability(listing, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E08 partner exchange failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as PartnerExchangeBundle & {
    result: PartnerExchangeResult & { success: true; status: "result" };
  };
}
