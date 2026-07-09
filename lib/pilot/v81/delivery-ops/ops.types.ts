/**
 * V81 — Delivery ops & customer tracking types
 */

import type { IntakeLinkage } from "@/lib/pilot/v80";
import type { RollbackIndexEntry } from "@/lib/pilot/v80";

export const V81_DELIVERY_OPS_VERSION = "v81-delivery-ops-1";

export type DeliveryPackageStatus =
  | "released"
  | "opened"
  | "downloaded"
  | "viewed"
  | "pending_action"
  | "failed_delivery";

export type DeliveryTrackingEventType =
  | "delivery_opened"
  | "artifact_downloaded"
  | "artifact_viewed"
  | "pending_action"
  | "delivery_failed"
  | "release_ready";

export type DeliveryTrackingEvent = {
  id: string;
  sessionId: string;
  organizationId: string;
  type: DeliveryTrackingEventType;
  actorId?: string;
  timestamp: string;
  artifactKind?: string;
  meta?: Record<string, unknown>;
};

export type DeliveryOpsNotificationKind =
  | "release_ready"
  | "failed_delivery"
  | "recovery_available"
  | "admin_restore_only";

export type DeliveryOpsNotification = {
  id: string;
  sessionId: string;
  organizationId: string;
  kind: DeliveryOpsNotificationKind;
  message: string;
  timestamp: string;
  readOnly: boolean;
  meta?: Record<string, unknown>;
};

export type DeliveryOpsArtifactLink = {
  kind: string;
  label: string;
  status: string;
  downloadUrl?: string;
  openUrl?: string;
};

export type DeliveryOpsQueueItem = {
  sessionId: string;
  releasePackageId: string;
  projectName?: string;
  fileName: string;
  packageStatus: DeliveryPackageStatus;
  signedOffAt: string;
  signedOffBy: string;
  linkage: IntakeLinkage;
  artifactLinks: DeliveryOpsArtifactLink[];
  lastWorkflowEvent?: {
    step?: string;
    timestamp: string;
    message?: string;
  };
  tracking: {
    opened: boolean;
    downloaded: boolean;
    viewed: boolean;
    pendingAction: boolean;
    failed: boolean;
    lastEventAt?: string;
  };
  readOnly: true;
};

export type DeliveryOpsDashboard = {
  version: string;
  organizationId: string;
  releasedCount: number;
  items: DeliveryOpsQueueItem[];
  notifications: DeliveryOpsNotification[];
};

export type DeliveryExportBundle = {
  version: string;
  exportedAt: string;
  sessionId: string;
  organizationId: string;
  releasePackageId: string;
  releaseManifest: Record<string, unknown>;
  rollbackIndex: RollbackIndexEntry[];
  artifacts: DeliveryOpsArtifactLink[];
  auditSummary: {
    totalEvents: number;
    steps: string[];
    lastEventAt?: string;
  };
  tracking: DeliveryTrackingEvent[];
  readOnly: true;
};
