/**
 * Product Routing — Rule types
 */

export type RuleMetadata = Record<string, unknown>;

export type RoutingRule = {
  id: string;
  routeId: string;
  channelKey: string;
  priority: number;
  enabled: boolean;
  detail: string;
  metadata: RuleMetadata;
  createdAt: string;
};

export type DefineRoutingRuleInput = {
  id?: string;
  routeId: string;
  channelKey: string;
  priority: number;
  enabled?: boolean;
  metadata?: RuleMetadata;
};
