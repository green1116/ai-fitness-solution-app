/**
 * Minimal document aggregator stub for Pilot P1.
 * Shape matches artifact-delivery expectations; returns empty packs.
 */

import type { DeliveryRecord } from "../delivery/delivery.types";

export type ProjectDocumentsSnapshot = {
  tenderPack: Record<string, DeliveryRecord | DeliveryRecord[] | undefined>;
  quotes: Array<{ id: string; status: string }>;
  tenders: Array<{ id: string; status: string }>;
  deliveries: DeliveryRecord[];
};

export async function getProjectDocuments(
  _organizationId: string,
  _projectId: string,
): Promise<ProjectDocumentsSnapshot | null> {
  return {
    tenderPack: {},
    quotes: [],
    tenders: [],
    deliveries: [],
  };
}
