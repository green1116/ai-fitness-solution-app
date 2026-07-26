/**
 * Product Routing — Fallback types
 */

import type { ROUTING_FALLBACK_MODES } from "../management/management.constants";

export type RoutingFallbackMode = (typeof ROUTING_FALLBACK_MODES)[number];
export type FallbackMetadata = Record<string, unknown>;

export type RoutingFallback = {
  id: string;
  routeId: string;
  mode: RoutingFallbackMode;
  fallbackChannelKey?: string;
  detail: string;
  metadata: FallbackMetadata;
  createdAt: string;
};

export type AttachRoutingFallbackInput = {
  id?: string;
  routeId: string;
  mode: RoutingFallbackMode;
  fallbackChannelKey?: string;
  metadata?: FallbackMetadata;
};
