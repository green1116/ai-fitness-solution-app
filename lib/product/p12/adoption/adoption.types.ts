/**
 * Product P12 — Adoption types
 */

import type { ADOPTION_LEVELS } from "../launch/launch.constants";

export type AdoptionLevel = (typeof ADOPTION_LEVELS)[number];
export type AdoptionMetadata = Record<string, unknown>;

export type LaunchAdoption = {
  id: string;
  launchId: string;
  segment: string;
  level: AdoptionLevel;
  activeUsers: number;
  detail: string;
  metadata: AdoptionMetadata;
  measuredAt: string;
};

export type RecordAdoptionInput = {
  id?: string;
  launchId: string;
  segment: string;
  level: AdoptionLevel;
  activeUsers: number;
  metadata?: AdoptionMetadata;
};
