/**
 * Product P8 — Tender Delivery Release Gate
 * BASE: enterprise-product-p7-collaboration-approval-v1
 * Isolated — product layer only
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { PRODUCT_P7_COLLABORATION_APPROVAL_ID } from "../../p7/collaboration/collaboration.constants";
import {
  DELIVERY_CHANNELS,
  DOCUMENT_KINDS,
  EXPORT_FORMATS,
  HANDOVER_STATUSES,
  P8_MANAGER_STATUSES,
  P8_READINESS_VERDICTS,
  PACKAGE_STATUSES,
  PRODUCT_P8_TENDER_DELIVERY_BASE,
  PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION,
  PRODUCT_P8_TENDER_DELIVERY_ID,
  PRODUCT_P8_TENDER_DELIVERY_VERSION,
  PRODUCT_P8_TENDER_FREEZE_VERSION,
  SUBMISSION_STATUSES,
  TENDER_STATUSES,
  TRACKING_EVENTS,
} from "../tender/tender.constants";
import {
  assertP8TenderDeliveryReadinessReady,
  clearP8TenderDeliveryLayer,
  createP8TenderManager,
  getP8RegistryManifest,
} from "../tender.manager";

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

export const PRODUCT_P8_SIGNOFF_VERSION = "product-p8-signoff-1" as const;

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
  clearP8TenderDeliveryLayer();
}

export function checkProductP8ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P8-CONSTANTS",
      "tender",
      "Product P8 tender delivery version constants",
      PRODUCT_P8_TENDER_DELIVERY_ID ===
        "enterprise-product-p8-tender-delivery-v1" &&
        PRODUCT_P8_TENDER_DELIVERY_VERSION === "product-p8-1" &&
        PRODUCT_P8_TENDER_DELIVERY_BASE ===
          PRODUCT_P7_COLLABORATION_APPROVAL_ID &&
        PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION ===
          "product-p8-tender-delivery-freeze-1" &&
        PRODUCT_P8_TENDER_FREEZE_VERSION ===
          "product-p8-tender-delivery-freeze-1" &&
        TENDER_STATUSES.length === 6 &&
        DELIVERY_CHANNELS.length === 5 &&
        DOCUMENT_KINDS.length === 6 &&
        EXPORT_FORMATS.length === 5 &&
        PACKAGE_STATUSES.length === 4 &&
        SUBMISSION_STATUSES.length === 4 &&
        TRACKING_EVENTS.length === 6 &&
        HANDOVER_STATUSES.length === 4 &&
        P8_READINESS_VERDICTS.length === 3 &&
        P8_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P8_TENDER_DELIVERY_ID} base=${PRODUCT_P8_TENDER_DELIVERY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P8-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P8-P7-BASE",
      "product-p7",
      "P7 collaboration & approval BASE preserved",
      PRODUCT_P8_TENDER_DELIVERY_BASE ===
        "enterprise-product-p7-collaboration-approval-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P8_TENDER_DELIVERY_BASE}`,
    ),
  );

  checks.push(
    check(
      "P8-UPSTREAM",
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
    const mgr = createP8TenderManager({ managerId: "prod-p8-gate" });
    mgr.initialize();
    mgr.start();

    const tender = mgr.createTender({
      id: "p8.gate.tnd",
      collaborationRef: "p7.gate.col",
      title: "Acme tender package",
      owner: "ae.sam",
    });
    mgr.recordTracking({
      id: "p8.gate.trk1",
      tenderId: tender.id,
      kind: "CREATED",
      message: "Tender case opened",
    });
    mgr.updateTenderStatus({
      tenderId: tender.id,
      status: "PACKAGING",
    });

    const doc1 = mgr.createDocument({
      id: "p8.gate.doc1",
      tenderId: tender.id,
      kind: "PROPOSAL",
      title: "AI Coaching Proposal",
      sourceRef: "p5.gate.prp",
    });
    const doc2 = mgr.createDocument({
      id: "p8.gate.doc2",
      tenderId: tender.id,
      kind: "BUDGET",
      title: "Budget & ROI Summary",
      sourceRef: "p6.gate.bdg",
    });
    const doc3 = mgr.createDocument({
      id: "p8.gate.doc3",
      tenderId: tender.id,
      kind: "APPROVAL",
      title: "Executive Approval",
      sourceRef: "p7.gate.apr",
    });

    const exp = mgr.createExport({
      id: "p8.gate.exp",
      tenderId: tender.id,
      format: "PDF",
      documentIds: [doc1.id, doc2.id, doc3.id],
    });
    mgr.recordTracking({
      id: "p8.gate.trk2",
      tenderId: tender.id,
      kind: "EXPORTED",
      message: "Documents exported to PDF",
    });

    const pkg = mgr.createPackage({
      id: "p8.gate.pkg",
      tenderId: tender.id,
      name: "Acme sealed tender pack",
      exportIds: [exp.id],
    });
    mgr.sealPackage({
      packageId: pkg.id,
      exportIds: [exp.id],
    });
    mgr.recordTracking({
      id: "p8.gate.trk3",
      tenderId: tender.id,
      kind: "PACKAGED",
      message: "Package sealed",
    });

    const delivery = mgr.createDelivery({
      id: "p8.gate.dlv",
      tenderId: tender.id,
      channel: "PORTAL",
      recipient: "acme.procurement",
      address: "https://acme.example/tenders",
    });
    const submission = mgr.createSubmission({
      id: "p8.gate.sub",
      tenderId: tender.id,
      packageId: pkg.id,
      deliveryId: delivery.id,
      referenceCode: "ACME-2026-001",
    });
    mgr.acknowledgeSubmission({
      submissionId: submission.id,
    });
    mgr.recordTracking({
      id: "p8.gate.trk4",
      tenderId: tender.id,
      kind: "SUBMITTED",
      message: "Submission acknowledged",
    });
    mgr.updateTenderStatus({
      tenderId: tender.id,
      status: "SUBMITTED",
    });

    const handover = mgr.createHandover({
      id: "p8.gate.hnd",
      tenderId: tender.id,
      submissionId: submission.id,
      recipient: "acme.procurement",
      notes: "Hand over sealed pack to buyer",
    });
    mgr.completeHandover({
      handoverId: handover.id,
      notes: "Buyer confirmed receipt",
    });
    mgr.recordTracking({
      id: "p8.gate.trk5",
      tenderId: tender.id,
      kind: "HANDED_OVER",
      message: "Handover complete",
    });
    mgr.updateTenderStatus({
      tenderId: tender.id,
      status: "HANDED_OVER",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getP8RegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_P8_TENDER_DELIVERY_ID &&
      registry.base === PRODUCT_P8_TENDER_DELIVERY_BASE &&
      registry.tenderCount >= 1 &&
      registry.deliveryCount >= 1 &&
      registry.documentCount >= 3 &&
      registry.exportCount >= 1 &&
      registry.packageCount >= 1 &&
      registry.submissionCount >= 1 &&
      registry.trackingCount >= 1 &&
      registry.handoverCount >= 1;

    try {
      assertP8TenderDeliveryReadinessReady(readiness);
      checks.push(
        check(
          "P8-STACK",
          "tender",
          "Tender / delivery / document / export / package / submission / tracking / handover",
          ok,
          `readiness=${readiness.verdict} submissions=${registry.submissionCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P8-STACK",
          "tender",
          "Tender / delivery / document / export / package / submission / tracking / handover",
          false,
          error instanceof Error
            ? error.message
            : "p8 tender delivery not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P8-STACK",
        "tender",
        "Tender / delivery / document / export / package / submission / tracking / handover",
        false,
        error instanceof Error
          ? error.message
          : "p8 tender delivery probe failed",
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
      `product-p8-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP8ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP8ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P8 release gate failed: ${gate.summary}`);
  }
}
