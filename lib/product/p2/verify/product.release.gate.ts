/**
 * Product P2 — Organization Workspace Release Gate
 * BASE: enterprise-product-p1-customer-onboarding-v1
 * Isolated — product layer only; does not mutate architecture layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { PRODUCT_P1_CUSTOMER_ONBOARDING_ID } from "../../p1/onboarding/onboarding.constants";
import {
  DEPARTMENT_STATUSES,
  INVITATION_STATUSES,
  MEMBER_STATUSES,
  ORGANIZATION_STATUSES,
  P2_MANAGER_STATUSES,
  P2_READINESS_VERDICTS,
  PERMISSION_SCOPES,
  PRODUCT_P2_ORGANIZATION_FREEZE_VERSION,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_ID,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION,
  ROLE_KINDS,
  WORKSPACE_STATUSES,
} from "../organization/organization.constants";
import {
  assertP2OrganizationWorkspaceReadinessReady,
  clearP2OrganizationWorkspaceLayer,
  createP2OrganizationWorkspaceManager,
  getP2RegistryManifest,
} from "../organization.manager";

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

export const PRODUCT_P2_SIGNOFF_VERSION = "product-p2-signoff-1" as const;

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
  clearP2OrganizationWorkspaceLayer();
}

export function checkProductP2ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P2-CONSTANTS",
      "organization",
      "Product P2 organization workspace version constants",
      PRODUCT_P2_ORGANIZATION_WORKSPACE_ID ===
        "enterprise-product-p2-organization-workspace-v1" &&
        PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION === "product-p2-1" &&
        PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE ===
          PRODUCT_P1_CUSTOMER_ONBOARDING_ID &&
        PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION ===
          "product-p2-organization-workspace-freeze-1" &&
        PRODUCT_P2_ORGANIZATION_FREEZE_VERSION ===
          "product-p2-organization-workspace-freeze-1" &&
        ORGANIZATION_STATUSES.length === 4 &&
        DEPARTMENT_STATUSES.length === 3 &&
        MEMBER_STATUSES.length === 4 &&
        ROLE_KINDS.length === 5 &&
        PERMISSION_SCOPES.length === 4 &&
        WORKSPACE_STATUSES.length === 4 &&
        INVITATION_STATUSES.length === 4 &&
        P2_READINESS_VERDICTS.length === 3 &&
        P2_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P2_ORGANIZATION_WORKSPACE_ID} base=${PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P2-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P2-P1-BASE",
      "product-p1",
      "P1 customer onboarding BASE preserved",
      PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE ===
        "enterprise-product-p1-customer-onboarding-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE}`,
    ),
  );

  checks.push(
    check(
      "P2-UPSTREAM",
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
    const mgr = createP2OrganizationWorkspaceManager({
      managerId: "prod-p2-gate",
    });
    mgr.initialize();
    mgr.start();

    const org = mgr.registerOrganization({
      id: "p2.gate.org",
      accountRef: "acme-fitness",
      name: "Acme Fitness Org",
      owner: "admin.alex",
    });
    const dept = mgr.registerDepartment({
      id: "p2.gate.dept",
      organizationId: org.id,
      name: "Coaching",
      code: "COACH",
    });
    const member = mgr.registerMember({
      id: "p2.gate.mem",
      organizationId: org.id,
      departmentId: dept.id,
      email: "coach.alex@acme.test",
      displayName: "Coach Alex",
    });
    const role = mgr.registerRole({
      id: "p2.gate.role",
      organizationId: org.id,
      kind: "ADMIN",
    });
    mgr.assignRole({
      id: "p2.gate.rasn",
      memberId: member.id,
      roleId: role.id,
    });
    const permission = mgr.registerPermission({
      id: "p2.gate.perm",
      organizationId: org.id,
      key: "org.manage",
      scope: "ORG",
      description: "Manage organization settings",
    });
    mgr.grantPermission({
      id: "p2.gate.pgr",
      roleId: role.id,
      permissionId: permission.id,
    });
    const workspace = mgr.registerWorkspace({
      id: "p2.gate.ws",
      organizationId: org.id,
      name: "Acme Primary Workspace",
    });
    mgr.updateWorkspaceStatus({
      workspaceId: workspace.id,
      status: "LIVE",
    });
    const invitation = mgr.createInvitation({
      id: "p2.gate.inv",
      organizationId: org.id,
      email: "new.coach@acme.test",
      roleKind: "MEMBER",
      invitedBy: "admin.alex",
    });
    mgr.updateInvitationStatus({
      invitationId: invitation.id,
      status: "ACCEPTED",
    });
    const directory = mgr.buildDirectory({
      id: "p2.gate.dir",
      organizationId: org.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getP2RegistryManifest();

    const ok =
      directory.entryCount >= 4 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_P2_ORGANIZATION_WORKSPACE_ID &&
      registry.base === PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE &&
      registry.organizationCount >= 1 &&
      registry.departmentCount >= 1 &&
      registry.memberCount >= 1 &&
      registry.roleCount >= 1 &&
      registry.permissionCount >= 1 &&
      registry.workspaceCount >= 1 &&
      registry.invitationCount >= 1 &&
      registry.directoryCount >= 1;

    try {
      assertP2OrganizationWorkspaceReadinessReady(readiness);
      checks.push(
        check(
          "P2-STACK",
          "organization",
          "Org / dept / member / role / permission / workspace / invitation / directory",
          ok,
          `entries=${directory.entryCount} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P2-STACK",
          "organization",
          "Org / dept / member / role / permission / workspace / invitation / directory",
          false,
          error instanceof Error
            ? error.message
            : "p2 organization workspace not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P2-STACK",
        "organization",
        "Org / dept / member / role / permission / workspace / invitation / directory",
        false,
        error instanceof Error
          ? error.message
          : "p2 organization workspace probe failed",
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
      `product-p2-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP2ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP2ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P2 release gate failed: ${gate.summary}`);
  }
}
