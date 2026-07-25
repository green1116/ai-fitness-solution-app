/**
 * Product Customer — Segment types
 */

import type { CUSTOMER_SEGMENTS } from "../foundation/foundation.constants";

export type CustomerSegmentCode = (typeof CUSTOMER_SEGMENTS)[number];
export type SegmentMetadata = Record<string, unknown>;

export type CustomerSegmentAssignment = {
  id: string;
  customerId: string;
  segment: CustomerSegmentCode;
  detail: string;
  metadata: SegmentMetadata;
  assignedAt: string;
};

export type AssignSegmentInput = {
  id?: string;
  customerId: string;
  segment: CustomerSegmentCode;
  metadata?: SegmentMetadata;
};
