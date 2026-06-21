import { loadV55QuoteRuntimeSnapshot } from "../../bridge/quote-runtime-bridge";
import type { QuoteApiAdapterPort } from "../../ports/quote-api.adapter.port";
import type { QuoteApiBinding } from "./quote-api-binding";
import {
  mapQuoteApiExposureResult,
  mapQuoteApiReadiness,
  mapQuoteApiSurface,
} from "./quote-api-mapper";

export interface QuoteApiAdapterOptions {
  binding: QuoteApiBinding;
}

export function createQuoteApiAdapter(options: QuoteApiAdapterOptions): QuoteApiAdapterPort {
  const { service } = options.binding;

  return {
    getQuoteSurface(workspaceId: string): unknown {
      const snapshot = loadV55QuoteRuntimeSnapshot(workspaceId).snapshot;
      return mapQuoteApiSurface(workspaceId, snapshot);
    },
    getQuoteReadiness(workspaceId: string): string {
      const snapshot = loadV55QuoteRuntimeSnapshot(workspaceId).snapshot;
      return mapQuoteApiReadiness(snapshot);
    },
    exposeQuoteApi(workspaceId: string): { exposed: boolean; route: string } {
      const route = service.resolveWorkspaceQuotesRoute(workspaceId);
      const exposure = mapQuoteApiExposureResult({
        workspaceId,
        route,
        methods: service.resolveWorkspaceQuotesMethods(),
        phase: service.resolveExposurePhase(),
      });
      return {
        exposed: exposure.exposed,
        route: exposure.route,
      };
    },
  };
}

export function createQuoteApiPortBinding(options: QuoteApiAdapterOptions): QuoteApiAdapterPort {
  return createQuoteApiAdapter(options);
}
