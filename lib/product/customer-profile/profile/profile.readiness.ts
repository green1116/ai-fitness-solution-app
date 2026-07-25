/**
 * Product Customer Profile — readiness
 */

import { PRODUCT_ORGANIZATION_MANAGEMENT_ID } from "../../organization/management/management.constants";
import { listAttributes } from "../attribute/attribute.registry";
import { listContacts } from "../contact/contact.registry";
import { listIdentities } from "../identity/identity.registry";
import { listPreferences } from "../preference/preference.registry";
import { PRODUCT_CUSTOMER_PROFILE_BASE } from "./profile.constants";
import type {
  CustomerProfileReadinessCheck,
  CustomerProfileReadinessResult,
} from "./profile.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): CustomerProfileReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateCustomerProfileReadiness(): CustomerProfileReadinessResult {
  const checks: CustomerProfileReadinessCheck[] = [];

  checks.push(
    check(
      "CPRF-BASE",
      "profile",
      "Organization management aligned",
      PRODUCT_CUSTOMER_PROFILE_BASE === PRODUCT_ORGANIZATION_MANAGEMENT_ID,
      `base=${PRODUCT_CUSTOMER_PROFILE_BASE}`,
    ),
  );

  const identities = listIdentities();
  checks.push(
    check(
      "CPRF-ID",
      "identity",
      "Active profile identities present",
      identities.some((i) => i.status === "ACTIVE"),
      `identities=${identities.length}`,
    ),
  );

  const contacts = listContacts();
  checks.push(
    check(
      "CPRF-CT",
      "contact",
      "Primary contacts present",
      contacts.some((c) => c.primary === true),
      `contacts=${contacts.length}`,
    ),
  );

  const preferences = listPreferences();
  checks.push(
    check(
      "CPRF-PF",
      "preference",
      "Preferences present",
      preferences.length >= 1,
      `preferences=${preferences.length}`,
    ),
  );

  const attributes = listAttributes();
  checks.push(
    check(
      "CPRF-AT",
      "attribute",
      "Attributes present",
      attributes.length >= 1,
      `attributes=${attributes.length}`,
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
    summary: `product-customer-profile readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertCustomerProfileReadinessReady(
  result: CustomerProfileReadinessResult,
): asserts result is CustomerProfileReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product customer profile not ready: ${result.summary}`,
    );
  }
}
