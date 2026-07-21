/**
 * E12-P5 — API Product Manager
 * Orchestrates catalog / key / developer / scope / usage / audit
 */

import { getProductRegistryManifest } from "../registry/product.registry";
import { getTenantProductRegistryManifest } from "../tenant/tenant.manager";
import { getBillingCommercialRegistryManifest } from "../billing/billing.manager";
import { recordApiAudit, listApiAuditEntries, clearApiAuditTrail } from "./api.audit";
import {
  registerApiCatalogEntry,
  getApiCatalogEntry,
  listApiCatalogEntries,
  clearApiCatalog,
} from "./api.catalog";
import {
  E12_API_PRODUCT_BASE,
  E12_API_PRODUCT_FREEZE_VERSION,
  E12_API_PRODUCT_ID,
  E12_API_PRODUCT_VERSION,
} from "./api.constants";
import {
  registerDeveloperAccess,
  getDeveloperAccess,
  listDeveloperAccess,
  suspendDeveloper,
  grantDeveloperScope,
  revokeDeveloperScope,
  clearDeveloperAccess,
} from "./api.developer";
import {
  createApiKey,
  revokeApiKey,
  getApiKey,
  listApiKeys,
  clearApiKeys,
} from "./api.key";
import { evaluateApiScope, evaluateApiCallAccess } from "./api.scope";
import {
  recordApiUsage,
  listApiUsageRecords,
  getApiUsageCount,
  clearApiUsageRecords,
} from "./api.usage";
import type {
  ApiAuditEntry,
  ApiCatalogEntry,
  ApiKey,
  ApiManagerStatus,
  ApiPermissionScope,
  ApiProductRegistryManifest,
  ApiScopeEvaluationResult,
  ApiUsageRecord,
  CreateApiKeyInput,
  DeveloperAccess,
  RecordApiAuditInput,
  RecordApiUsageInput,
  RegisterApiCatalogInput,
  RegisterDeveloperAccessInput,
} from "./api.types";

export type ApiProductManagerSnapshot = {
  managerId: string;
  status: ApiManagerStatus;
  layerId: typeof E12_API_PRODUCT_ID;
  version: typeof E12_API_PRODUCT_VERSION;
  catalogEntryCount: number;
  apiKeyCount: number;
  developerCount: number;
  usageRecordCount: number;
  auditEntryCount: number;
  tenantProductCount: number;
  billingSubscriptionCount: number;
  productIdentityCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ApiProductManager = {
  initialize: () => ApiProductManagerSnapshot;
  start: () => ApiProductManagerSnapshot;
  stop: () => ApiProductManagerSnapshot;
  status: () => ApiProductManagerSnapshot;
  registerCatalogEntry: (input: RegisterApiCatalogInput) => ApiCatalogEntry;
  getCatalogEntry: typeof getApiCatalogEntry;
  listCatalogEntries: typeof listApiCatalogEntries;
  registerDeveloper: (input: RegisterDeveloperAccessInput) => DeveloperAccess;
  getDeveloper: typeof getDeveloperAccess;
  listDevelopers: typeof listDeveloperAccess;
  suspendDeveloper: (id: string) => DeveloperAccess;
  grantScope: (id: string, scope: ApiPermissionScope) => DeveloperAccess;
  revokeScope: (id: string, scope: ApiPermissionScope) => DeveloperAccess;
  createKey: (input: CreateApiKeyInput) => ApiKey;
  revokeKey: (id: string) => ApiKey;
  getKey: typeof getApiKey;
  listKeys: typeof listApiKeys;
  evaluateScope: (input: {
    developerId: string;
    scope: ApiPermissionScope;
  }) => ApiScopeEvaluationResult;
  evaluateCallAccess: (input: {
    apiKeyId: string;
    apiCatalogEntryId: string;
  }) => ApiScopeEvaluationResult;
  recordUsage: (input: RecordApiUsageInput) => ApiUsageRecord;
  listUsage: typeof listApiUsageRecords;
  usageCount: typeof getApiUsageCount;
  recordAudit: (input: RecordApiAuditInput) => ApiAuditEntry;
  listAudit: typeof listApiAuditEntries;
  manifest: () => ApiProductRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getApiProductRegistryManifest(): ApiProductRegistryManifest {
  return {
    apiProductId: E12_API_PRODUCT_ID,
    version: E12_API_PRODUCT_VERSION,
    freezeVersion: E12_API_PRODUCT_FREEZE_VERSION,
    base: E12_API_PRODUCT_BASE,
    catalogEntryCount: listApiCatalogEntries().length,
    apiKeyCount: listApiKeys().length,
    developerCount: listDeveloperAccess().length,
    usageRecordCount: listApiUsageRecords().length,
    auditEntryCount: listApiAuditEntries().length,
  };
}

export function clearApiProductLayer(): void {
  clearApiAuditTrail();
  clearApiUsageRecords();
  clearApiKeys();
  clearDeveloperAccess();
  clearApiCatalog();
}

export function createApiProductManager(options?: {
  managerId?: string;
}): ApiProductManager {
  const managerId =
    options?.managerId?.trim() || createId("e12-apm-mgr");
  let state: ApiManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ApiProductManagerSnapshot {
    const productReg = getProductRegistryManifest();
    const tenantReg = getTenantProductRegistryManifest();
    const billingReg = getBillingCommercialRegistryManifest();
    const reg = getApiProductRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: E12_API_PRODUCT_ID,
      version: E12_API_PRODUCT_VERSION,
      catalogEntryCount: reg.catalogEntryCount,
      apiKeyCount: reg.apiKeyCount,
      developerCount: reg.developerCount,
      usageRecordCount: reg.usageRecordCount,
      auditEntryCount: reg.auditEntryCount,
      tenantProductCount: tenantReg.tenantCount,
      billingSubscriptionCount: billingReg.billingSubscriptionCount,
      productIdentityCount: productReg.identityCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ApiProductManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearApiProductLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ApiProductManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ApiProductManagerSnapshot {
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
    registerCatalogEntry: (input) => {
      assertRunning("registerCatalogEntry");
      const entry = registerApiCatalogEntry(input);
      recordApiAudit({
        action: "KEY_CREATED",
        actorUserId: "system",
        productTenantId: undefined,
        apiCatalogEntryId: entry.id,
        detail: `api registered: ${entry.name}`,
      });
      return entry;
    },
    getCatalogEntry: getApiCatalogEntry,
    listCatalogEntries: listApiCatalogEntries,
    registerDeveloper: (input) => {
      assertRunning("registerDeveloper");
      const dev = registerDeveloperAccess(input);
      recordApiAudit({
        action: "DEVELOPER_REGISTERED",
        actorUserId: dev.userId,
        productTenantId: dev.productTenantId,
        detail: `developer registered: ${dev.userId}`,
      });
      return dev;
    },
    getDeveloper: getDeveloperAccess,
    listDevelopers: listDeveloperAccess,
    suspendDeveloper: (id) => {
      assertRunning("suspendDeveloper");
      const dev = suspendDeveloper(id);
      recordApiAudit({
        action: "DEVELOPER_SUSPENDED",
        actorUserId: dev.userId,
        productTenantId: dev.productTenantId,
        detail: `developer suspended: ${dev.userId}`,
      });
      return dev;
    },
    grantScope: (id, scope) => {
      assertRunning("grantScope");
      const dev = grantDeveloperScope(id, scope);
      recordApiAudit({
        action: "SCOPE_CHANGED",
        actorUserId: dev.userId,
        productTenantId: dev.productTenantId,
        detail: `scope granted: ${scope}`,
      });
      return dev;
    },
    revokeScope: (id, scope) => {
      assertRunning("revokeScope");
      const dev = revokeDeveloperScope(id, scope);
      recordApiAudit({
        action: "SCOPE_CHANGED",
        actorUserId: dev.userId,
        productTenantId: dev.productTenantId,
        detail: `scope revoked: ${scope}`,
      });
      return dev;
    },
    createKey: (input) => {
      assertRunning("createKey");
      const key = createApiKey(input);
      recordApiAudit({
        action: "KEY_CREATED",
        actorUserId: key.developerId,
        productTenantId: key.productTenantId,
        apiKeyId: key.id,
        detail: `api key created: ${key.name}`,
      });
      return key;
    },
    revokeKey: (id) => {
      assertRunning("revokeKey");
      const key = revokeApiKey(id);
      recordApiAudit({
        action: "KEY_REVOKED",
        actorUserId: key.developerId,
        productTenantId: key.productTenantId,
        apiKeyId: key.id,
        detail: `api key revoked: ${key.name}`,
      });
      return key;
    },
    getKey: getApiKey,
    listKeys: listApiKeys,
    evaluateScope: (input) => {
      assertRunning("evaluateScope");
      return evaluateApiScope(input);
    },
    evaluateCallAccess: (input) => {
      assertRunning("evaluateCallAccess");
      return evaluateApiCallAccess(input);
    },
    recordUsage: (input) => {
      assertRunning("recordUsage");
      const record = recordApiUsage(input);
      recordApiAudit({
        action: "API_CALL",
        actorUserId: record.developerId,
        productTenantId: record.productTenantId,
        apiKeyId: record.apiKeyId,
        apiCatalogEntryId: record.apiCatalogEntryId,
        detail: `api call: ${record.path} ${record.statusCode}`,
      });
      return record;
    },
    listUsage: listApiUsageRecords,
    usageCount: getApiUsageCount,
    recordAudit: (input) => {
      assertRunning("recordAudit");
      return recordApiAudit(input);
    },
    listAudit: listApiAuditEntries,
    manifest: getApiProductRegistryManifest,
  };
}
