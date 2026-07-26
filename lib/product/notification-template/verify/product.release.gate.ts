/**
 * Product Notification Template — Release Gate
 * MODULE: Notification Template (M06-P2)
 * BASE: enterprise-product-notification-foundation-v1
 * GATES: Registry | Variant | Schema | Renderer | State | Manifest | Compatibility
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import {
  clearNotificationTemplateManagementLayer,
  createNotificationTemplateManager,
  getNotificationTemplateRegistryManifest,
} from "../notification-template.manager";
import {
  NOTIFICATION_TEMPLATE_KINDS,
  NOTIFICATION_TEMPLATE_LOCALES,
  NOTIFICATION_TEMPLATE_MANAGER_STATUSES,
  NOTIFICATION_TEMPLATE_READINESS_VERDICTS,
  NOTIFICATION_TEMPLATE_VARIABLE_TYPES,
  NOTIFICATION_TEMPLATE_VERSION_STATES,
  PRODUCT_TEMPLATE_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_BASE,
  PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_ID,
  PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
} from "../management/management.constants";
import { getNotificationTemplateSchema } from "../schema/schema.registry";
import { getNotificationTemplateVariant } from "../variant/variant.registry";

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

export const PRODUCT_NOTIFICATION_TEMPLATE_SIGNOFF_VERSION =
  "product-notification-template-signoff-1" as const;

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
  clearNotificationTemplateManagementLayer();
}

export function checkProductNotificationTemplateReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  try {
    cleanup();
    const mgr = createNotificationTemplateManager({
      managerId: "prod-ntpl-gate",
    });
    mgr.initialize();
    mgr.start();

    const template = mgr.registerTemplate({
      id: "ntpl.gate.tpl",
      templateKey: "WELCOME_NTPL",
      name: "Welcome Notification",
      kind: "TRANSACTIONAL",
    });
    checks.push(
      check(
        "NTPL-REGISTRY",
        "registry",
        "Template registry + templateKey",
        template.templateKey === "WELCOME_NTPL" &&
          !!mgr.manifest().templateCount,
        `key=${template.templateKey}`,
      ),
    );

    const variant = mgr.registerVariant({
      id: "ntpl.gate.var",
      templateId: template.id,
      locale: "EN",
      subject: "Hello {{NAME}}",
      body: "Welcome {{NAME}}, code={{CODE}}",
    });
    checks.push(
      check(
        "NTPL-VARIANT",
        "variant",
        "Locale variant registered",
        variant.locale === "EN" && variant.templateId === template.id,
        `locale=${variant.locale}`,
      ),
    );

    const schema = mgr.declareSchema({
      id: "ntpl.gate.sch",
      templateId: template.id,
      variables: [
        {
          name: "NAME",
          type: "STRING",
          required: true,
          description: "Recipient display name",
        },
        {
          name: "CODE",
          type: "STRING",
          required: false,
          defaultValue: "N/A",
          description: "Optional code",
        },
      ],
    });
    checks.push(
      check(
        "NTPL-SCHEMA",
        "schema",
        "Variable schema name/type/required/default/description",
        schema.variables.length === 2 &&
          schema.variables[0].name === "NAME" &&
          schema.variables[0].required === true &&
          schema.variables[1].defaultValue === "N/A",
        `variables=${schema.variables.length}`,
      ),
    );

    const rendered = mgr.render({
      variant: getNotificationTemplateVariant(variant.id)!,
      schema: getNotificationTemplateSchema(schema.id)!,
      values: { NAME: "Ada" },
    });
    checks.push(
      check(
        "NTPL-RENDERER",
        "renderer",
        "Pure renderer side-effect free",
        rendered.subject === "Hello Ada" &&
          rendered.body === "Welcome Ada, code=N/A" &&
          rendered.usedVariables.join(",") === "CODE,NAME",
        `subject=${rendered.subject}`,
      ),
    );

    const publication = mgr.createPublication({
      id: "ntpl.gate.pub",
      templateId: template.id,
      versionTag: "v1.0.0",
      variantIds: [variant.id],
      schemaId: schema.id,
    });
    mgr.transitionPublication({
      publicationId: publication.id,
      state: "REVIEW",
    });
    const published = mgr.transitionPublication({
      publicationId: publication.id,
      state: "PUBLISHED",
    });
    let archivedBlocked = false;
    mgr.transitionPublication({
      publicationId: publication.id,
      state: "ARCHIVED",
    });
    try {
      mgr.transitionPublication({
        publicationId: publication.id,
        state: "PUBLISHED",
      });
    } catch {
      archivedBlocked = true;
    }
    checks.push(
      check(
        "NTPL-STATE",
        "state",
        "Draft>Review>Published>Archived; archived cannot republish",
        published.state === "PUBLISHED" && archivedBlocked,
        `archivedBlocked=${archivedBlocked}`,
      ),
    );

    // recreate published path for manifest (current is archived)
    const pub2 = mgr.createPublication({
      id: "ntpl.gate.pub2",
      templateId: template.id,
      versionTag: "v1.0.1",
      variantIds: [variant.id],
      schemaId: schema.id,
    });
    mgr.transitionPublication({ publicationId: pub2.id, state: "REVIEW" });
    mgr.transitionPublication({ publicationId: pub2.id, state: "PUBLISHED" });
    const release = mgr.createReleaseManifest({
      id: "ntpl.gate.rel",
      publicationId: pub2.id,
    });
    checks.push(
      check(
        "NTPL-MANIFEST",
        "manifest",
        "Release manifest + checksum",
        release.checksum.length === 64 &&
          release.templateKey === "WELCOME_NTPL" &&
          release.versionTag === "v1.0.1",
        `checksum=${release.checksum.slice(0, 12)}…`,
      ),
    );

    const platform = buildPlatformV1Manifest();
    const registry = getNotificationTemplateRegistryManifest();
    const readiness = mgr.evaluateReadiness();
    checks.push(
      check(
        "NTPL-COMPAT",
        "compatibility",
        "Foundation-only dependency; constants + platform aligned",
        PRODUCT_TEMPLATE_MANAGEMENT_ID ===
          "enterprise-product-template-management-v1" &&
          PRODUCT_TEMPLATE_MANAGEMENT_VERSION ===
            "product-notification-template-1" &&
          PRODUCT_TEMPLATE_MANAGEMENT_BASE ===
            PRODUCT_NOTIFICATION_FOUNDATION_ID &&
          PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION ===
            "product-notification-template-management-freeze-1" &&
          PRODUCT_TEMPLATE_FREEZE_VERSION ===
            "product-notification-template-management-freeze-1" &&
          PRODUCT_NOTIFICATION_FOUNDATION_ID ===
            "enterprise-product-notification-foundation-v1" &&
          NOTIFICATION_TEMPLATE_KINDS.length === 4 &&
          NOTIFICATION_TEMPLATE_LOCALES.length === 3 &&
          NOTIFICATION_TEMPLATE_VARIABLE_TYPES.length === 4 &&
          NOTIFICATION_TEMPLATE_VERSION_STATES.length === 4 &&
          NOTIFICATION_TEMPLATE_READINESS_VERDICTS.length === 3 &&
          NOTIFICATION_TEMPLATE_MANAGER_STATUSES.length === 4 &&
          platform.aligned === true &&
          readiness.verdict === "READY" &&
          registry.base === PRODUCT_TEMPLATE_MANAGEMENT_BASE,
        `base=${PRODUCT_TEMPLATE_MANAGEMENT_BASE}`,
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "notification template probe failed";
    const present = new Set(checks.map((c) => c.id));
    for (const id of [
      "NTPL-REGISTRY",
      "NTPL-VARIANT",
      "NTPL-SCHEMA",
      "NTPL-RENDERER",
      "NTPL-STATE",
      "NTPL-MANIFEST",
      "NTPL-COMPAT",
    ]) {
      if (!present.has(id)) {
        checks.push(check(id, "gate", id, false, detail));
      }
    }
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
      `product-notification-template-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductNotificationTemplateReleaseGatePass(
  gate: ReleaseGateResult = checkProductNotificationTemplateReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product notification template release gate failed: ${gate.summary}`,
    );
  }
}
