/**
 * RSO-8 — Runtime Operations Manifest
 * Frozen component catalog for RSO-1..RSO-7 (no new runtime capability).
 */

import {
  POST_GA_PRODUCTION_BASELINE,
} from "../../release/health/release-health-registry";
import {
  OPERATIONS_FEEDBACK_CAPABILITY,
  OPERATIONS_FEEDBACK_VERSION,
  RSO6_SERVICE_RELIABILITY_BASELINE,
  RSO_7_ID,
} from "../feedback";
import {
  RUNTIME_HEALTH_CAPABILITY,
  RUNTIME_HEALTH_VERSION,
  RSO_1_ID,
} from "../health";
import {
  RSO2_APPLICATION_MONITORING_BASELINE,
  RUNTIME_INCIDENT_CAPABILITY,
  RUNTIME_INCIDENT_VERSION,
  RSO_3_ID,
} from "../incident";
import {
  APPLICATION_MONITORING_CAPABILITY,
  APPLICATION_MONITORING_VERSION,
  RSO1_RUNTIME_HEALTH_BASELINE,
  RSO_2_ID,
} from "../monitoring";
import {
  RECOVERY_WORKFLOW_CAPABILITY,
  RECOVERY_WORKFLOW_VERSION,
  RSO3_INCIDENT_MANAGEMENT_BASELINE,
  RSO_4_ID,
} from "../recovery";
import {
  RSO5_TENANT_OPERATIONS_BASELINE,
  SERVICE_RELIABILITY_CAPABILITY,
  SERVICE_RELIABILITY_VERSION,
  RSO_6_ID,
} from "../reliability";
import {
  RSO4_RECOVERY_WORKFLOW_BASELINE,
  TENANT_OPERATIONS_CAPABILITY,
  TENANT_OPERATIONS_VERSION,
  RSO_5_ID,
} from "../tenant";
import {
  ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
  RSO7_OPERATIONS_FEEDBACK_BASELINE,
  RUNTIME_OPERATIONS_FREEZE_VERSION,
} from "./runtime-operations-baseline";

export type RuntimeOperationsComponentStatus = "frozen";

export type RuntimeOperationsComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: RuntimeOperationsComponentStatus;
}>;

export const RSO_RUNTIME_COMPONENTS: readonly RuntimeOperationsComponentEntry[] =
  [
    {
      id: RSO_1_ID,
      name: "Runtime Health Foundation",
      capability: RUNTIME_HEALTH_CAPABILITY,
      version: RUNTIME_HEALTH_VERSION,
      baselineTag: POST_GA_PRODUCTION_BASELINE,
      modulePath: "lib/runtime/health/runtime-health.ts",
      verifyScript: "scripts/verify-rso-1-runtime-health.ts",
      buildApi: "buildRuntimeHealth",
      status: "frozen",
    },
    {
      id: RSO_2_ID,
      name: "Application Monitoring Layer",
      capability: APPLICATION_MONITORING_CAPABILITY,
      version: APPLICATION_MONITORING_VERSION,
      baselineTag: RSO1_RUNTIME_HEALTH_BASELINE,
      modulePath: "lib/runtime/monitoring/application-monitoring.ts",
      verifyScript: "scripts/verify-rso-2-application-monitoring.ts",
      buildApi: "buildApplicationMonitoring",
      status: "frozen",
    },
    {
      id: RSO_3_ID,
      name: "Incident Management Foundation",
      capability: RUNTIME_INCIDENT_CAPABILITY,
      version: RUNTIME_INCIDENT_VERSION,
      baselineTag: RSO2_APPLICATION_MONITORING_BASELINE,
      modulePath: "lib/runtime/incident/runtime-incidents.ts",
      verifyScript: "scripts/verify-rso-3-incident-management.ts",
      buildApi: "buildRuntimeIncidents",
      status: "frozen",
    },
    {
      id: RSO_4_ID,
      name: "Recovery Workflow Foundation",
      capability: RECOVERY_WORKFLOW_CAPABILITY,
      version: RECOVERY_WORKFLOW_VERSION,
      baselineTag: RSO3_INCIDENT_MANAGEMENT_BASELINE,
      modulePath: "lib/runtime/recovery/recovery-workflow.ts",
      verifyScript: "scripts/verify-rso-4-recovery-workflow.ts",
      buildApi: "buildRecoveryWorkflow",
      status: "frozen",
    },
    {
      id: RSO_5_ID,
      name: "Tenant Operations Runtime",
      capability: TENANT_OPERATIONS_CAPABILITY,
      version: TENANT_OPERATIONS_VERSION,
      baselineTag: RSO4_RECOVERY_WORKFLOW_BASELINE,
      modulePath: "lib/runtime/tenant/tenant-operations.ts",
      verifyScript: "scripts/verify-rso-5-tenant-operations.ts",
      buildApi: "buildTenantOperations",
      status: "frozen",
    },
    {
      id: RSO_6_ID,
      name: "Service Reliability Metrics",
      capability: SERVICE_RELIABILITY_CAPABILITY,
      version: SERVICE_RELIABILITY_VERSION,
      baselineTag: RSO5_TENANT_OPERATIONS_BASELINE,
      modulePath: "lib/runtime/reliability/service-reliability.ts",
      verifyScript: "scripts/verify-rso-6-service-reliability.ts",
      buildApi: "buildServiceReliability",
      status: "frozen",
    },
    {
      id: RSO_7_ID,
      name: "Operations Feedback",
      capability: OPERATIONS_FEEDBACK_CAPABILITY,
      version: OPERATIONS_FEEDBACK_VERSION,
      baselineTag: RSO6_SERVICE_RELIABILITY_BASELINE,
      modulePath: "lib/runtime/feedback/operations-feedback.ts",
      verifyScript: "scripts/verify-rso-7-operations-feedback.ts",
      buildApi: "buildOperationsFeedback",
      status: "frozen",
    },
  ] as const;

export type RuntimeOperationsVersionReferences = Readonly<{
  freezeVersion: typeof RUNTIME_OPERATIONS_FREEZE_VERSION;
  packBaseline: typeof RSO7_OPERATIONS_FEEDBACK_BASELINE;
  productBaseline: typeof ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: {
    "RSO-1": typeof RUNTIME_HEALTH_VERSION;
    "RSO-2": typeof APPLICATION_MONITORING_VERSION;
    "RSO-3": typeof RUNTIME_INCIDENT_VERSION;
    "RSO-4": typeof RECOVERY_WORKFLOW_VERSION;
    "RSO-5": typeof TENANT_OPERATIONS_VERSION;
    "RSO-6": typeof SERVICE_RELIABILITY_VERSION;
    "RSO-7": typeof OPERATIONS_FEEDBACK_VERSION;
  };
}>;

export type RuntimeOperationsManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1;
  packBaseline: typeof RSO7_OPERATIONS_FEEDBACK_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly RuntimeOperationsComponentEntry[];
  versionReferences: RuntimeOperationsVersionReferences;
  componentFingerprints: Readonly<{
    "RSO-1": string;
    "RSO-2": string;
    "RSO-3": string;
    "RSO-4": string;
    "RSO-5": string;
    "RSO-6": string;
    "RSO-7": string;
  }>;
}>;

export function buildRuntimeOperationsVersionReferences(): RuntimeOperationsVersionReferences {
  return {
    freezeVersion: RUNTIME_OPERATIONS_FREEZE_VERSION,
    packBaseline: RSO7_OPERATIONS_FEEDBACK_BASELINE,
    productBaseline: ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: {
      "RSO-1": RUNTIME_HEALTH_VERSION,
      "RSO-2": APPLICATION_MONITORING_VERSION,
      "RSO-3": RUNTIME_INCIDENT_VERSION,
      "RSO-4": RECOVERY_WORKFLOW_VERSION,
      "RSO-5": TENANT_OPERATIONS_VERSION,
      "RSO-6": SERVICE_RELIABILITY_VERSION,
      "RSO-7": OPERATIONS_FEEDBACK_VERSION,
    },
  };
}
