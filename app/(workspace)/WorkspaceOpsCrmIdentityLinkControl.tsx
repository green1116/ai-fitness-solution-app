"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type CrmCustomerOption = {
  id: string;
  name: string;
};

function orgHeaders(organizationId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-organization-id": organizationId,
  };
}

/**
 * Explicit Ops → CRM identity link control.
 * No name matching; tenant selects CRM customer id.
 * Organization + CRM customer list are provided by the parent (single fetch).
 */
export function WorkspaceOpsCrmIdentityLinkControl({
  opsCustomerId,
  organizationId,
  customers,
}: {
  opsCustomerId: string;
  organizationId: string;
  customers: readonly CrmCustomerOption[];
}) {
  const router = useRouter();
  const [crmCustomerId, setCrmCustomerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<"SUCCESS" | "FAILED" | null>(null);

  async function handleLink() {
    setMessage(null);
    setResult(null);
    const opsId = opsCustomerId.trim();
    const crmId = crmCustomerId.trim();
    const orgId = organizationId.trim();
    if (!orgId || !opsId || !crmId) {
      setResult("FAILED");
      setMessage("Select a CRM customer to link");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/runtime-ops/crm-identity/link", {
        method: "POST",
        headers: orgHeaders(orgId),
        body: JSON.stringify({
          opsCustomerId: opsId,
          crmCustomerId: crmId,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setResult("FAILED");
        setMessage(
          typeof data.message === "string" ? data.message : "Failed to link identity",
        );
        return;
      }
      setResult("SUCCESS");
      router.refresh();
    } catch {
      setResult("FAILED");
      setMessage("Failed to link identity");
    } finally {
      setSubmitting(false);
    }
  }

  if (!organizationId.trim()) {
    return (
      <p className="mt-2 text-xs text-zinc-600">Sign in to link CRM identity</p>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={crmCustomerId}
          onChange={(e) => setCrmCustomerId(e.target.value)}
          className="min-w-[12rem] rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200"
          aria-label="CRM customer"
        >
          <option value="">Select CRM customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name ? `${customer.name} · ${customer.id}` : customer.id}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void handleLink()}
          disabled={submitting || !crmCustomerId || result === "SUCCESS"}
          className="rounded border border-sky-700 px-2 py-1 text-xs uppercase tracking-wide text-sky-300 hover:border-sky-500 disabled:opacity-40"
        >
          LINK
        </button>
        {result ? (
          <span className="text-xs uppercase tracking-wide text-zinc-400">{result}</span>
        ) : null}
      </div>
      {customers.length === 0 ? (
        <p className="text-xs text-zinc-600">No CRM customers in this organization</p>
      ) : null}
      {message ? (
        <p
          className={`text-xs ${result === "SUCCESS" ? "text-emerald-500" : "text-red-400"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
