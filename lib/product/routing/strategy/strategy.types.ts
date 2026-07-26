/**
 * Product Routing — Strategy types
 */

import type { ROUTING_STRATEGIES } from "../management/management.constants";

export type RoutingStrategyKind = (typeof ROUTING_STRATEGIES)[number];
export type StrategyMetadata = Record<string, unknown>;

export type RoutingStrategy = {
  id: string;
  routeId: string;
  strategy: RoutingStrategyKind;
  detail: string;
  metadata: StrategyMetadata;
  createdAt: string;
};

export type AttachRoutingStrategyInput = {
  id?: string;
  routeId: string;
  strategy: RoutingStrategyKind;
  metadata?: StrategyMetadata;
};
