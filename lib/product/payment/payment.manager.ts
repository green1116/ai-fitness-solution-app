/**
 * Product Payment — Payment Integration Manager
 */

import {
  captureIntent,
  clearCaptures,
  getCapture,
  listCaptures,
} from "./capture/capture.registry";
import type {
  CaptureIntentInput,
  PaymentCapture,
} from "./capture/capture.types";
import {
  PRODUCT_PAYMENT_INTEGRATION_BASE,
  PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION,
  PRODUCT_PAYMENT_INTEGRATION_ID,
  PRODUCT_PAYMENT_INTEGRATION_VERSION,
} from "./integration/integration.constants";
import {
  assertPaymentIntegrationReadinessReady,
  evaluatePaymentIntegrationReadiness,
} from "./integration/integration.readiness";
import type {
  PaymentManagerStatus,
  PaymentReadinessResult,
  PaymentRegistryManifest,
} from "./integration/integration.types";
import {
  authorizeIntent,
  cancelIntent,
  clearIntents,
  createIntent,
  getIntent,
  listIntents,
} from "./intent/intent.registry";
import type {
  AuthorizeIntentInput,
  CancelIntentInput,
  CreateIntentInput,
  PaymentIntent,
} from "./intent/intent.types";
import {
  clearProviders,
  disableProvider,
  getProvider,
  listProviders,
  registerProvider,
} from "./provider/provider.registry";
import type {
  DisableProviderInput,
  PaymentProvider,
  RegisterProviderInput,
} from "./provider/provider.types";
import {
  clearRefunds,
  getRefund,
  listRefunds,
  refundCapture,
} from "./refund/refund.registry";
import type {
  PaymentRefund,
  RefundCaptureInput,
} from "./refund/refund.types";

export type PaymentManagerSnapshot = {
  managerId: string;
  status: PaymentManagerStatus;
  layerId: typeof PRODUCT_PAYMENT_INTEGRATION_ID;
  version: typeof PRODUCT_PAYMENT_INTEGRATION_VERSION;
  providerCount: number;
  intentCount: number;
  captureCount: number;
  refundCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type PaymentManager = {
  initialize: () => PaymentManagerSnapshot;
  start: () => PaymentManagerSnapshot;
  stop: () => PaymentManagerSnapshot;
  status: () => PaymentManagerSnapshot;
  registerProvider: (input: RegisterProviderInput) => PaymentProvider;
  disableProvider: (input: DisableProviderInput) => PaymentProvider;
  createIntent: (input: CreateIntentInput) => PaymentIntent;
  authorizeIntent: (input: AuthorizeIntentInput) => PaymentIntent;
  cancelIntent: (input: CancelIntentInput) => PaymentIntent;
  captureIntent: (input: CaptureIntentInput) => PaymentCapture;
  refundCapture: (input: RefundCaptureInput) => PaymentRefund;
  evaluateReadiness: () => PaymentReadinessResult;
  manifest: () => PaymentRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getPaymentRegistryManifest(): PaymentRegistryManifest {
  return {
    foundationId: PRODUCT_PAYMENT_INTEGRATION_ID,
    version: PRODUCT_PAYMENT_INTEGRATION_VERSION,
    freezeVersion: PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION,
    base: PRODUCT_PAYMENT_INTEGRATION_BASE,
    providerCount: listProviders().length,
    intentCount: listIntents().length,
    captureCount: listCaptures().length,
    refundCount: listRefunds().length,
  };
}

export function clearPaymentIntegrationLayer(): void {
  clearRefunds();
  clearCaptures();
  clearIntents();
  clearProviders();
}

export function createPaymentManager(options?: {
  managerId?: string;
}): PaymentManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-pay-mgr");
  let state: PaymentManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): PaymentManagerSnapshot {
    const reg = getPaymentRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_PAYMENT_INTEGRATION_ID,
      version: PRODUCT_PAYMENT_INTEGRATION_VERSION,
      providerCount: reg.providerCount,
      intentCount: reg.intentCount,
      captureCount: reg.captureCount,
      refundCount: reg.refundCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): PaymentManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearPaymentIntegrationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): PaymentManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): PaymentManagerSnapshot {
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
    registerProvider: (input) => {
      assertRunning("registerProvider");
      return registerProvider(input);
    },
    disableProvider: (input) => {
      assertRunning("disableProvider");
      return disableProvider(input);
    },
    createIntent: (input) => {
      assertRunning("createIntent");
      return createIntent(input);
    },
    authorizeIntent: (input) => {
      assertRunning("authorizeIntent");
      return authorizeIntent(input);
    },
    cancelIntent: (input) => {
      assertRunning("cancelIntent");
      return cancelIntent(input);
    },
    captureIntent: (input) => {
      assertRunning("captureIntent");
      return captureIntent(input);
    },
    refundCapture: (input) => {
      assertRunning("refundCapture");
      return refundCapture(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluatePaymentIntegrationReadiness();
    },
    manifest: getPaymentRegistryManifest,
  };
}

export {
  assertPaymentIntegrationReadinessReady,
  getCapture,
  getIntent,
  getProvider,
  getRefund,
  listCaptures,
  listIntents,
  listProviders,
  listRefunds,
};
