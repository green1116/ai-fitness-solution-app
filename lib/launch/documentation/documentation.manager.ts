/**
 * Launch P6 — Documentation Package Manager
 */

import { getLaunchRegistryManifest } from "../launch.manager";
import { getSupportRegistryManifest } from "../support/support.manager";
import {
  clearApiDocumentations,
  completeApiDocumentationSections,
  createApiDocumentation,
  getApiDocumentation,
  listApiDocumentations,
} from "./documentation.api";
import {
  LAUNCH_DOCUMENTATION_BASE,
  LAUNCH_DOCUMENTATION_FREEZE_VERSION,
  LAUNCH_DOCUMENTATION_ID,
  LAUNCH_DOCUMENTATION_VERSION,
} from "./documentation.constants";
import {
  clearDeploymentDocumentations,
  completeDeploymentDocumentationSections,
  createDeploymentDocumentation,
  getDeploymentDocumentation,
  listDeploymentDocumentations,
} from "./documentation.deployment";
import {
  clearCustomerGuides,
  completeCustomerGuideSections,
  createCustomerGuide,
  getCustomerGuide,
  listCustomerGuides,
} from "./documentation.guide";
import {
  clearOperationHandbooks,
  completeOperationHandbookSections,
  createOperationHandbook,
  getOperationHandbook,
  listOperationHandbooks,
} from "./documentation.handbook";
import { buildDocumentationManifest } from "./documentation.manifest";
import {
  clearDocumentationPackages,
  createDocumentationPackage,
  getDocumentationPackage,
  listDocumentationPackages,
  setDocumentationPackageStatus,
} from "./documentation.package";
import {
  assertDocumentationReadinessReady,
  evaluateDocumentationReadiness,
} from "./documentation.readiness";
import type {
  ApiDocumentation,
  CreateApiDocumentationInput,
  CreateCustomerGuideInput,
  CreateDeploymentDocumentationInput,
  CreateDocumentationPackageInput,
  CreateOperationHandbookInput,
  CustomerGuide,
  DeploymentDocumentation,
  DocumentationManagerStatus,
  DocumentationManifest,
  DocumentationPackage,
  DocumentationReadinessResult,
  DocumentationRegistryManifest,
  OperationHandbook,
} from "./documentation.types";

export type DocumentationManagerSnapshot = {
  managerId: string;
  status: DocumentationManagerStatus;
  layerId: typeof LAUNCH_DOCUMENTATION_ID;
  version: typeof LAUNCH_DOCUMENTATION_VERSION;
  packageCount: number;
  apiDocCount: number;
  deploymentDocCount: number;
  customerGuideCount: number;
  handbookCount: number;
  launchProfileCount: number;
  supportProfileCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type DocumentationPackageManager = {
  initialize: () => DocumentationManagerSnapshot;
  start: () => DocumentationManagerSnapshot;
  stop: () => DocumentationManagerSnapshot;
  status: () => DocumentationManagerSnapshot;
  createPackage: (
    input: CreateDocumentationPackageInput,
  ) => DocumentationPackage;
  setPackageStatus: typeof setDocumentationPackageStatus;
  getPackage: typeof getDocumentationPackage;
  listPackages: typeof listDocumentationPackages;
  createApiDoc: (input: CreateApiDocumentationInput) => ApiDocumentation;
  publishApiDoc: typeof completeApiDocumentationSections;
  getApiDoc: typeof getApiDocumentation;
  listApiDocs: typeof listApiDocumentations;
  createDeploymentDoc: (
    input: CreateDeploymentDocumentationInput,
  ) => DeploymentDocumentation;
  publishDeploymentDoc: typeof completeDeploymentDocumentationSections;
  getDeploymentDoc: typeof getDeploymentDocumentation;
  listDeploymentDocs: typeof listDeploymentDocumentations;
  createCustomerGuide: (input: CreateCustomerGuideInput) => CustomerGuide;
  publishCustomerGuide: typeof completeCustomerGuideSections;
  getCustomerGuide: typeof getCustomerGuide;
  listCustomerGuides: typeof listCustomerGuides;
  createHandbook: (input: CreateOperationHandbookInput) => OperationHandbook;
  publishHandbook: typeof completeOperationHandbookSections;
  getHandbook: typeof getOperationHandbook;
  listHandbooks: typeof listOperationHandbooks;
  buildManifest: (documentationPackageId: string) => DocumentationManifest;
  evaluateReadiness: (
    documentationPackageId: string,
  ) => DocumentationReadinessResult;
  manifest: () => DocumentationRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getDocumentationRegistryManifest(): DocumentationRegistryManifest {
  return {
    documentationId: LAUNCH_DOCUMENTATION_ID,
    version: LAUNCH_DOCUMENTATION_VERSION,
    freezeVersion: LAUNCH_DOCUMENTATION_FREEZE_VERSION,
    base: LAUNCH_DOCUMENTATION_BASE,
    packageCount: listDocumentationPackages().length,
    apiDocCount: listApiDocumentations().length,
    deploymentDocCount: listDeploymentDocumentations().length,
    customerGuideCount: listCustomerGuides().length,
    handbookCount: listOperationHandbooks().length,
  };
}

export function clearDocumentationLayer(): void {
  clearApiDocumentations();
  clearDeploymentDocumentations();
  clearCustomerGuides();
  clearOperationHandbooks();
  clearDocumentationPackages();
}

export function createDocumentationPackageManager(options?: {
  managerId?: string;
}): DocumentationPackageManager {
  const managerId =
    options?.managerId?.trim() || createId("launch-p6-mgr");
  let state: DocumentationManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): DocumentationManagerSnapshot {
    const launchReg = getLaunchRegistryManifest();
    const supportReg = getSupportRegistryManifest();
    const reg = getDocumentationRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: LAUNCH_DOCUMENTATION_ID,
      version: LAUNCH_DOCUMENTATION_VERSION,
      packageCount: reg.packageCount,
      apiDocCount: reg.apiDocCount,
      deploymentDocCount: reg.deploymentDocCount,
      customerGuideCount: reg.customerGuideCount,
      handbookCount: reg.handbookCount,
      launchProfileCount: launchReg.profileCount,
      supportProfileCount: supportReg.profileCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): DocumentationManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearDocumentationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): DocumentationManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): DocumentationManagerSnapshot {
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
    createPackage: (input) => {
      assertRunning("createPackage");
      return createDocumentationPackage(input);
    },
    setPackageStatus: (id, status) => {
      assertRunning("setPackageStatus");
      return setDocumentationPackageStatus(id, status);
    },
    getPackage: getDocumentationPackage,
    listPackages: listDocumentationPackages,
    createApiDoc: (input) => {
      assertRunning("createApiDoc");
      return createApiDocumentation(input);
    },
    publishApiDoc: (id) => {
      assertRunning("publishApiDoc");
      return completeApiDocumentationSections(id);
    },
    getApiDoc: getApiDocumentation,
    listApiDocs: listApiDocumentations,
    createDeploymentDoc: (input) => {
      assertRunning("createDeploymentDoc");
      return createDeploymentDocumentation(input);
    },
    publishDeploymentDoc: (id) => {
      assertRunning("publishDeploymentDoc");
      return completeDeploymentDocumentationSections(id);
    },
    getDeploymentDoc: getDeploymentDocumentation,
    listDeploymentDocs: listDeploymentDocumentations,
    createCustomerGuide: (input) => {
      assertRunning("createCustomerGuide");
      return createCustomerGuide(input);
    },
    publishCustomerGuide: (id) => {
      assertRunning("publishCustomerGuide");
      return completeCustomerGuideSections(id);
    },
    getCustomerGuide,
    listCustomerGuides,
    createHandbook: (input) => {
      assertRunning("createHandbook");
      return createOperationHandbook(input);
    },
    publishHandbook: (id) => {
      assertRunning("publishHandbook");
      return completeOperationHandbookSections(id);
    },
    getHandbook: getOperationHandbook,
    listHandbooks: listOperationHandbooks,
    buildManifest: (documentationPackageId) => {
      assertRunning("buildManifest");
      return buildDocumentationManifest(documentationPackageId);
    },
    evaluateReadiness: (documentationPackageId) => {
      assertRunning("evaluateReadiness");
      return evaluateDocumentationReadiness(documentationPackageId);
    },
    manifest: getDocumentationRegistryManifest,
  };
}

export { assertDocumentationReadinessReady };
