/**
 * Product Notification Template — Manager
 */

import {
  clearNotificationTemplateReleaseManifests,
  createNotificationTemplateReleaseManifest,
  getNotificationTemplateReleaseManifest,
  listNotificationTemplateReleaseManifests,
  type NotificationTemplateReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_TEMPLATE_MANAGEMENT_BASE,
  PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_ID,
  PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
} from "./management/management.constants";
import {
  assertNotificationTemplateReadinessReady,
  evaluateNotificationTemplateReadiness,
} from "./management/management.readiness";
import type {
  NotificationTemplateManagerStatus,
  NotificationTemplateReadinessResult,
  NotificationTemplateRegistryManifest,
} from "./management/management.types";
import {
  clearNotificationTemplatePublications,
  createNotificationTemplatePublication,
  getNotificationTemplatePublication,
  listNotificationTemplatePublications,
  transitionNotificationTemplatePublication,
} from "./publication/publication.registry";
import type {
  CreateNotificationTemplatePublicationInput,
  NotificationTemplatePublication,
  TransitionNotificationTemplatePublicationInput,
} from "./publication/publication.types";
import {
  clearNotificationTemplates,
  getNotificationTemplate,
  getNotificationTemplateByKey,
  listNotificationTemplates,
  registerNotificationTemplate,
} from "./registry/template.registry";
import type {
  NotificationTemplate,
  RegisterNotificationTemplateInput,
} from "./registry/template.types";
import {
  renderNotificationTemplate,
  type RenderNotificationTemplateInput,
  type RenderNotificationTemplateResult,
} from "./renderer/renderer";
import {
  clearNotificationTemplateSchemas,
  declareNotificationTemplateSchema,
  getNotificationTemplateSchema,
  listNotificationTemplateSchemas,
} from "./schema/schema.registry";
import type {
  DeclareNotificationTemplateSchemaInput,
  NotificationTemplateSchema,
} from "./schema/schema.types";
import {
  clearNotificationTemplateVariants,
  getNotificationTemplateVariant,
  listNotificationTemplateVariants,
  registerNotificationTemplateVariant,
} from "./variant/variant.registry";
import type {
  NotificationTemplateVariant,
  RegisterNotificationTemplateVariantInput,
} from "./variant/variant.types";

export type NotificationTemplateManagerSnapshot = {
  managerId: string;
  status: NotificationTemplateManagerStatus;
  layerId: typeof PRODUCT_TEMPLATE_MANAGEMENT_ID;
  version: typeof PRODUCT_TEMPLATE_MANAGEMENT_VERSION;
  templateCount: number;
  variantCount: number;
  schemaCount: number;
  publicationCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type NotificationTemplateManager = {
  initialize: () => NotificationTemplateManagerSnapshot;
  start: () => NotificationTemplateManagerSnapshot;
  stop: () => NotificationTemplateManagerSnapshot;
  status: () => NotificationTemplateManagerSnapshot;
  registerTemplate: (
    input: RegisterNotificationTemplateInput,
  ) => NotificationTemplate;
  registerVariant: (
    input: RegisterNotificationTemplateVariantInput,
  ) => NotificationTemplateVariant;
  declareSchema: (
    input: DeclareNotificationTemplateSchemaInput,
  ) => NotificationTemplateSchema;
  createPublication: (
    input: CreateNotificationTemplatePublicationInput,
  ) => NotificationTemplatePublication;
  transitionPublication: (
    input: TransitionNotificationTemplatePublicationInput,
  ) => NotificationTemplatePublication;
  createReleaseManifest: (input: {
    id?: string;
    publicationId: string;
  }) => NotificationTemplateReleaseManifest;
  render: (
    input: RenderNotificationTemplateInput,
  ) => RenderNotificationTemplateResult;
  evaluateReadiness: () => NotificationTemplateReadinessResult;
  manifest: () => NotificationTemplateRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getNotificationTemplateRegistryManifest(): NotificationTemplateRegistryManifest {
  return {
    managementId: PRODUCT_TEMPLATE_MANAGEMENT_ID,
    version: PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
    freezeVersion: PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_TEMPLATE_MANAGEMENT_BASE,
    templateCount: listNotificationTemplates().length,
    variantCount: listNotificationTemplateVariants().length,
    schemaCount: listNotificationTemplateSchemas().length,
    publicationCount: listNotificationTemplatePublications().length,
    releaseCount: listNotificationTemplateReleaseManifests().length,
  };
}

export function clearNotificationTemplateManagementLayer(): void {
  clearNotificationTemplateReleaseManifests();
  clearNotificationTemplatePublications();
  clearNotificationTemplateSchemas();
  clearNotificationTemplateVariants();
  clearNotificationTemplates();
}

export function createNotificationTemplateManager(options?: {
  managerId?: string;
}): NotificationTemplateManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-ntpl-mgr");
  let state: NotificationTemplateManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): NotificationTemplateManagerSnapshot {
    const reg = getNotificationTemplateRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_TEMPLATE_MANAGEMENT_ID,
      version: PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
      templateCount: reg.templateCount,
      variantCount: reg.variantCount,
      schemaCount: reg.schemaCount,
      publicationCount: reg.publicationCount,
      releaseCount: reg.releaseCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): NotificationTemplateManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearNotificationTemplateManagementLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): NotificationTemplateManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): NotificationTemplateManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerTemplate: (input) => {
      assertRunning("registerTemplate");
      return registerNotificationTemplate(input);
    },
    registerVariant: (input) => {
      assertRunning("registerVariant");
      return registerNotificationTemplateVariant(input);
    },
    declareSchema: (input) => {
      assertRunning("declareSchema");
      return declareNotificationTemplateSchema(input);
    },
    createPublication: (input) => {
      assertRunning("createPublication");
      return createNotificationTemplatePublication(input);
    },
    transitionPublication: (input) => {
      assertRunning("transitionPublication");
      return transitionNotificationTemplatePublication(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createNotificationTemplateReleaseManifest(input);
    },
    render: (input) => {
      assertRunning("render");
      return renderNotificationTemplate(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateNotificationTemplateReadiness();
    },
    manifest: getNotificationTemplateRegistryManifest,
  };
}

export {
  assertNotificationTemplateReadinessReady,
  getNotificationTemplate,
  getNotificationTemplateByKey,
  getNotificationTemplatePublication,
  getNotificationTemplateReleaseManifest,
  getNotificationTemplateSchema,
  getNotificationTemplateVariant,
  listNotificationTemplatePublications,
  listNotificationTemplateReleaseManifests,
  listNotificationTemplateSchemas,
  listNotificationTemplateVariants,
  listNotificationTemplates,
  renderNotificationTemplate,
};
