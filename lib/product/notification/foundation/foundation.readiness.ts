/**
 * Product Notification — readiness
 */

import { ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID } from "../../admin-baseline/freeze/freeze.lock";
import { listNotificationChannels } from "../channel/channel.registry";
import { listNotificationDeliveries } from "../delivery/delivery.registry";
import { listNotificationMessages } from "../message/message.registry";
import { listNotificationTemplates } from "../template/template.registry";
import { PRODUCT_NOTIFICATION_FOUNDATION_BASE } from "./foundation.constants";
import type {
  NotificationReadinessCheck,
  NotificationReadinessResult,
} from "./foundation.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): NotificationReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateNotificationFoundationReadiness(): NotificationReadinessResult {
  const checks: NotificationReadinessCheck[] = [];

  checks.push(
    check(
      "NTF-BASE",
      "foundation",
      "Admin baseline aligned",
      PRODUCT_NOTIFICATION_FOUNDATION_BASE ===
        ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID,
      `base=${PRODUCT_NOTIFICATION_FOUNDATION_BASE}`,
    ),
  );

  const channels = listNotificationChannels();
  checks.push(
    check(
      "NTF-CHN",
      "channel",
      "Active channels present",
      channels.some((c) => c.status === "ACTIVE"),
      `channels=${channels.length}`,
    ),
  );

  const templates = listNotificationTemplates();
  checks.push(
    check(
      "NTF-TPL",
      "template",
      "Templates present",
      templates.length >= 1,
      `templates=${templates.length}`,
    ),
  );

  const messages = listNotificationMessages();
  checks.push(
    check(
      "NTF-MSG",
      "message",
      "Messages present",
      messages.length >= 1,
      `messages=${messages.length}`,
    ),
  );

  const deliveries = listNotificationDeliveries();
  checks.push(
    check(
      "NTF-DLV",
      "delivery",
      "Delivered or sent deliveries present",
      deliveries.some(
        (d) => d.status === "SENT" || d.status === "DELIVERED",
      ),
      `deliveries=${deliveries.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-notification readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertNotificationFoundationReadinessReady(
  result: NotificationReadinessResult,
): asserts result is NotificationReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product notification foundation not ready: ${result.summary}`,
    );
  }
}
