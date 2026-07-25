/**
 * Product Iteration — Roadmap types
 */

import type { ROADMAP_HORIZONS } from "../cycle/cycle.constants";

export type RoadmapHorizon = (typeof ROADMAP_HORIZONS)[number];
export type RoadmapMetadata = Record<string, unknown>;

export type RoadmapItem = {
  id: string;
  cycleId: string;
  title: string;
  horizon: RoadmapHorizon;
  detail: string;
  metadata: RoadmapMetadata;
  createdAt: string;
};

export type CreateRoadmapInput = {
  id?: string;
  cycleId: string;
  title: string;
  horizon: RoadmapHorizon;
  metadata?: RoadmapMetadata;
};
