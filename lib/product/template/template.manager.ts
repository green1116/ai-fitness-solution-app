/**
 * Product Template — Template Management Manager
 */

import {
  clearTemplateDefinitions,
  defineTemplate,
  getTemplateDefinition,
  listTemplateDefinitions,
  updateTemplateDefinitionStatus,
} from "./definition/definition.registry";
import type {
  DefineTemplateInput,
  TemplateDefinition,
  UpdateTemplateDefinitionStatusInput,
} from "./definition/definition.types";
import {
  PRODUCT_TEMPLATE_MANAGEMENT_BASE,
  PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_ID,
  PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
} from "./management/management.constants";
import {
  assertTemplateManagementReadinessReady,
  evaluateTemplateManagementReadiness,
} from "./management/management.readiness";
import type {
  TemplateManagerStatus,
  TemplateReadinessResult,
  TemplateRegistryManifest,
} from "./management/management.types";
import {
  clearTemplatePublishes,
  createTemplatePublish,
  getTemplatePublish,
  listTemplatePublishes,
  updateTemplatePublishStatus,
} from "./publish/publish.registry";
import type {
  CreateTemplatePublishInput,
  TemplatePublish,
  UpdateTemplatePublishStatusInput,
} from "./publish/publish.types";
import {
  clearTemplateVariables,
  declareTemplateVariable,
  getTemplateVariable,
  listTemplateVariables,
} from "./variable/variable.registry";
import type {
  DeclareTemplateVariableInput,
  TemplateVariable,
} from "./variable/variable.types";
import {
  clearTemplateVariants,
  getTemplateVariant,
  listTemplateVariants,
  registerTemplateVariant,
} from "./variant/variant.registry";
import type {
  RegisterTemplateVariantInput,
  TemplateVariant,
} from "./variant/variant.types";

export type TemplateManagerSnapshot = {
  managerId: string;
  status: TemplateManagerStatus;
  layerId: typeof PRODUCT_TEMPLATE_MANAGEMENT_ID;
  version: typeof PRODUCT_TEMPLATE_MANAGEMENT_VERSION;
  definitionCount: number;
  variantCount: number;
  variableCount: number;
  publishCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type TemplateManager = {
  initialize: () => TemplateManagerSnapshot;
  start: () => TemplateManagerSnapshot;
  stop: () => TemplateManagerSnapshot;
  status: () => TemplateManagerSnapshot;
  defineTemplate: (input: DefineTemplateInput) => TemplateDefinition;
  updateDefinitionStatus: (
    input: UpdateTemplateDefinitionStatusInput,
  ) => TemplateDefinition;
  registerVariant: (input: RegisterTemplateVariantInput) => TemplateVariant;
  declareVariable: (
    input: DeclareTemplateVariableInput,
  ) => TemplateVariable;
  createPublish: (input: CreateTemplatePublishInput) => TemplatePublish;
  updatePublishStatus: (
    input: UpdateTemplatePublishStatusInput,
  ) => TemplatePublish;
  evaluateReadiness: () => TemplateReadinessResult;
  manifest: () => TemplateRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getTemplateRegistryManifest(): TemplateRegistryManifest {
  return {
    managementId: PRODUCT_TEMPLATE_MANAGEMENT_ID,
    version: PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
    freezeVersion: PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_TEMPLATE_MANAGEMENT_BASE,
    definitionCount: listTemplateDefinitions().length,
    variantCount: listTemplateVariants().length,
    variableCount: listTemplateVariables().length,
    publishCount: listTemplatePublishes().length,
  };
}

export function clearTemplateManagementLayer(): void {
  clearTemplatePublishes();
  clearTemplateVariables();
  clearTemplateVariants();
  clearTemplateDefinitions();
}

export function createTemplateManager(options?: {
  managerId?: string;
}): TemplateManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-tpl-mgr");
  let state: TemplateManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): TemplateManagerSnapshot {
    const reg = getTemplateRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_TEMPLATE_MANAGEMENT_ID,
      version: PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
      definitionCount: reg.definitionCount,
      variantCount: reg.variantCount,
      variableCount: reg.variableCount,
      publishCount: reg.publishCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): TemplateManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearTemplateManagementLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): TemplateManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): TemplateManagerSnapshot {
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
    defineTemplate: (input) => {
      assertRunning("defineTemplate");
      return defineTemplate(input);
    },
    updateDefinitionStatus: (input) => {
      assertRunning("updateDefinitionStatus");
      return updateTemplateDefinitionStatus(input);
    },
    registerVariant: (input) => {
      assertRunning("registerVariant");
      return registerTemplateVariant(input);
    },
    declareVariable: (input) => {
      assertRunning("declareVariable");
      return declareTemplateVariable(input);
    },
    createPublish: (input) => {
      assertRunning("createPublish");
      return createTemplatePublish(input);
    },
    updatePublishStatus: (input) => {
      assertRunning("updatePublishStatus");
      return updateTemplatePublishStatus(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateTemplateManagementReadiness();
    },
    manifest: getTemplateRegistryManifest,
  };
}

export {
  assertTemplateManagementReadinessReady,
  getTemplateDefinition,
  getTemplatePublish,
  getTemplateVariable,
  getTemplateVariant,
  listTemplateDefinitions,
  listTemplatePublishes,
  listTemplateVariables,
  listTemplateVariants,
};
