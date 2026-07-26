/**
 * Product Routing — Registry types
 */

import type { ROUTING_KINDS } from "../management/management.constants";

export type RoutingKind = (typeof ROUTING_KINDS)[number];
export type RouteMetadata = Record<string, unknown>;

export type NotificationRoute = {
  id: string;
  routingKey: string;
  name: string;
  kind: RoutingKind;
  preferenceKey: string;
  templateKey: string;
  detail: string;
  metadata: RouteMetadata;
  createdAt: string;
};

export type RegisterRouteInput = {
  id?: string;
  routingKey: string;
  name: string;
  kind: RoutingKind;
  preferenceKey: string;
  templateKey: string;
  metadata?: RouteMetadata;
};
