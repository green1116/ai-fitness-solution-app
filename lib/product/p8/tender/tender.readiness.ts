/**
 * Product P8 — Tender Delivery readiness
 */

import { PRODUCT_P7_COLLABORATION_APPROVAL_ID } from "../../p7/collaboration/collaboration.constants";
import { listDeliveries } from "../delivery/delivery.registry";
import { listDocuments } from "../document/document.registry";
import { listExports } from "../export/export.registry";
import { listHandovers } from "../handover/handover.registry";
import { listPackages } from "../package/package.registry";
import { listSubmissions } from "../submission/submission.registry";
import { listTrackingEvents } from "../tracking/tracking.registry";
import { PRODUCT_P8_TENDER_DELIVERY_BASE } from "./tender.constants";
import { listTenders } from "./tender.registry";
import type { P8ReadinessCheck, P8ReadinessResult } from "./tender.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P8ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP8TenderDeliveryReadiness(): P8ReadinessResult {
  const checks: P8ReadinessCheck[] = [];

  checks.push(
    check(
      "P8-BASE",
      "foundation",
      "P7 collaboration & approval baseline aligned",
      PRODUCT_P8_TENDER_DELIVERY_BASE === PRODUCT_P7_COLLABORATION_APPROVAL_ID,
      `base=${PRODUCT_P8_TENDER_DELIVERY_BASE}`,
    ),
  );

  const tenders = listTenders();
  checks.push(
    check(
      "P8-TND",
      "tender",
      "Tenders present",
      tenders.length >= 1,
      `tenders=${tenders.length}`,
    ),
  );

  const deliveries = listDeliveries();
  checks.push(
    check(
      "P8-DLV",
      "delivery",
      "Deliveries present",
      deliveries.length >= 1,
      `deliveries=${deliveries.length}`,
    ),
  );

  const documents = listDocuments();
  checks.push(
    check(
      "P8-DOC",
      "document",
      "Documents present",
      documents.length >= 1,
      `documents=${documents.length}`,
    ),
  );

  const exportsList = listExports();
  checks.push(
    check(
      "P8-EXP",
      "export",
      "Exports present",
      exportsList.length >= 1,
      `exports=${exportsList.length}`,
    ),
  );

  const packages = listPackages();
  checks.push(
    check(
      "P8-PKG",
      "package",
      "Packages sealed",
      packages.some((p) => p.status === "SEALED" || p.status === "DELIVERED"),
      `packages=${packages.length}`,
    ),
  );

  const submissions = listSubmissions();
  checks.push(
    check(
      "P8-SUB",
      "submission",
      "Submissions present",
      submissions.some(
        (s) => s.status === "SENT" || s.status === "ACKNOWLEDGED",
      ),
      `submissions=${submissions.length}`,
    ),
  );

  const tracking = listTrackingEvents();
  checks.push(
    check(
      "P8-TRK",
      "tracking",
      "Tracking events present",
      tracking.length >= 1,
      `tracking=${tracking.length}`,
    ),
  );

  const handovers = listHandovers();
  checks.push(
    check(
      "P8-HND",
      "handover",
      "Handovers complete",
      handovers.some((h) => h.status === "COMPLETE"),
      `handovers=${handovers.length}`,
    ),
  );

  const advanced = tenders.some(
    (t) => t.status === "SUBMITTED" || t.status === "HANDED_OVER",
  );
  checks.push(
    check(
      "P8-LIFE",
      "tender",
      "Tender lifecycle advanced",
      advanced,
      `advanced=${advanced}`,
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
    summary: `p8-tender-delivery readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP8TenderDeliveryReadinessReady(
  result: P8ReadinessResult,
): asserts result is P8ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`p8 tender delivery not ready: ${result.summary}`);
  }
}
