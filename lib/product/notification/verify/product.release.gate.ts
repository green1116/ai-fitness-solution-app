/**
 * Product Notification — Notification Foundation Release Gate
 * MODULE: Notification
 * BASE: enterprise-product-admin-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../../billing-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../../customer-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID } from "../../analytics-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID } from "../../admin-baseline/freeze/freeze.lock";
import { PRODUCT_ADMIN_AUDIT_ID } from "../../admin-audit/traceability/traceability.constants";
import { PRODUCT_ADMIN_FOUNDATION_ID } from "../../admin/foundation/foundation.constants";
import {
  assertNotificationFoundationReadinessReady,
  clearNotificationFoundationLayer,
  createNotificationManager,
  getNotificationRegistryManifest,
} from "../notification.manager";
import {
  NOTIFICATION_CHANNEL_KINDS,
  NOTIFICATION_CHANNEL_STATUSES,
  NOTIFICATION_DELIVERY_STATUSES,
  NOTIFICATION_MANAGER_STATUSES,
  NOTIFICATION_MESSAGE_PRIORITIES,
  NOTIFICATION_READINESS_VERDICTS,
  NOTIFICATION_TEMPLATE_KINDS,
  PRODUCT_NOTIFICATION_FOUNDATION_BASE,
  PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_FOUNDATION_ID,
  PRODUCT_NOTIFICATION_FOUNDATION_VERSION,
  PRODUCT_NOTIFICATION_FREEZE_VERSION,
} from "../foundation/foundation.constants";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_NOTIFICATION_SIGNOFF_VERSION =
  "product-notification-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearNotificationFoundationLayer();
}

export function checkProductNotificationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "NTF-CONSTANTS",
      "foundation",
      "Product notification foundation version constants",
      PRODUCT_NOTIFICATION_FOUNDATION_ID ===
        "enterprise-product-notification-foundation-v1" &&
        PRODUCT_NOTIFICATION_FOUNDATION_VERSION ===
          "product-notification-1" &&
        PRODUCT_NOTIFICATION_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID &&
        PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION ===
          "product-notification-foundation-freeze-1" &&
        PRODUCT_NOTIFICATION_FREEZE_VERSION ===
          "product-notification-foundation-freeze-1" &&
        NOTIFICATION_CHANNEL_KINDS.length === 4 &&
        NOTIFICATION_CHANNEL_STATUSES.length === 3 &&
        NOTIFICATION_TEMPLATE_KINDS.length === 3 &&
        NOTIFICATION_MESSAGE_PRIORITIES.length === 3 &&
        NOTIFICATION_DELIVERY_STATUSES.length === 4 &&
        NOTIFICATION_READINESS_VERDICTS.length === 3 &&
        NOTIFICATION_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_NOTIFICATION_FOUNDATION_ID} base=${PRODUCT_NOTIFICATION_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "NTF-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "NTF-ADM-BASE",
      "product-admin-baseline",
      "Admin baseline BASE preserved",
      PRODUCT_NOTIFICATION_FOUNDATION_BASE ===
        "enterprise-product-admin-baseline-v1" &&
        ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID ===
          "enterprise-product-admin-baseline-v1" &&
        PRODUCT_ADMIN_AUDIT_ID === "enterprise-product-admin-audit-v1" &&
        PRODUCT_ADMIN_FOUNDATION_ID ===
          "enterprise-product-admin-foundation-v1" &&
        ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID ===
          "enterprise-product-analytics-baseline-v1" &&
        ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
          "enterprise-product-customer-baseline-v1" &&
        ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
          "enterprise-product-billing-baseline-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_NOTIFICATION_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "NTF-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createNotificationManager({ managerId: "prod-ntf-gate" });
    mgr.initialize();
    mgr.start();

    const channel = mgr.registerChannel({
      id: "ntf.gate.chn",
      code: "EMAIL_PRIMARY",
      kind: "EMAIL",
    });
    mgr.updateChannelStatus({ channelId: channel.id, status: "ACTIVE" });
    const template = mgr.registerTemplate({
      id: "ntf.gate.tpl",
      code: "WELCOME_EMAIL",
      channelId: channel.id,
      kind: "TRANSACTIONAL",
      subject: "Welcome",
      body: "Hello {{name}}",
    });
    const message = mgr.composeMessage({
      id: "ntf.gate.msg",
      templateId: template.id,
      recipient: "user@acme.example",
      priority: "NORMAL",
      payload: "name=Acme",
    });
    const delivery = mgr.queueDelivery({
      id: "ntf.gate.dlv",
      messageId: message.id,
      channelId: channel.id,
    });
    mgr.updateDeliveryStatus({
      deliveryId: delivery.id,
      status: "SENT",
    });
    mgr.updateDeliveryStatus({
      deliveryId: delivery.id,
      status: "DELIVERED",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getNotificationRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_NOTIFICATION_FOUNDATION_ID &&
      registry.base === PRODUCT_NOTIFICATION_FOUNDATION_BASE &&
      registry.channelCount >= 1 &&
      registry.templateCount >= 1 &&
      registry.messageCount >= 1 &&
      registry.deliveryCount >= 1;

    try {
      assertNotificationFoundationReadinessReady(readiness);
      checks.push(
        check(
          "NTF-STACK",
          "foundation",
          "Channel / template / message / delivery",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "NTF-STACK",
          "foundation",
          "Channel / template / message / delivery",
          false,
          error instanceof Error
            ? error.message
            : "product notification not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "NTF-STACK",
        "foundation",
        "Channel / template / message / delivery",
        false,
        error instanceof Error
          ? error.message
          : "product notification probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-notification-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductNotificationReleaseGatePass(
  gate: ReleaseGateResult = checkProductNotificationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product notification release gate failed: ${gate.summary}`,
    );
  }
}
