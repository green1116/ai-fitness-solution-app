"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CrmCustomerOption = {
  id: string;
  name: string;
};

async function resolveOrganizationId(): Promise<string> {
  const meRes = await fetch("/api/auth/me");
  const me = (await meRes.json()) as { organizationId?: string | null };
  return typeof me.organizationId === "string" ? me.organizationId.trim() : "";
}

function orgHeaders(organizationId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-organization-id": organizationId,
  };
}

/**
 * Explicit Ops → CRM identity link control.
 * No name matching; tenant selects CRM customer id.
 */
export function WorkspaceOpsCrmIdentityLinkControl({
  opsCustomerId,
}: {
  opsCustomerId: string;
}) {
  const router = useRouter();
  const [organizationId, setOrganizationId] = useState("");
  const [customers, setCustomers] = useState<CrmCustomerOption[]>([]);
  const [crmCustomerId, setCrmCustomerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<"SUCCESS" | "FAILED" | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setMessage(null);
      try {
        const orgId = await resolveOrganizationId();
        if (cancelled) return;
        if (!orgId) {
          setOrganizationId("");
          setCustomers([]);
          return;
        }
        setOrganizationId(orgId);
        const res = await fetch("/api/crm/customers", {
          headers: { "x-organization-id": orgId },
        });
        const data = (await res.json()) as {
          ok?: boolean;
          customers?: Array<{ id?: string; name?: string }>;
        };
        if (cancelled) return;
        if (!data.ok || !Array.isArray(data.customers)) {
          setCustomers([]);
          return;
        }
        setCustomers(
          data.customers
            .map((row) => ({
              id: typeof row.id === "string" ? row.id.trim() : "",
              name: typeof row.name === "string" ? row.name.trim() : "",
            }))
            .filter((row) => row.id.length > 0),
        );
      } catch {
        if (!cancelled) {
          setCustomers([]);
          setMessage("Failed to load CRM customers");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLink() {
    setMessage(null);
    setResult(null);
    const opsId = opsCustomerId.trim();
    const crmId = crmCustomerId.trim();
    if (!organizationId || !opsId || !crmId) {
      setResult("FAILED");
      setMessage("Select a CRM customer to link");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/runtime-ops/crm-identity/link", {
        method: "POST",
        headers: orgHeaders(organizationId),
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

  if (loading) {
    return <p className="mt-2 text-xs text-zinc-600">Loading CRM customers…</p>;
  }

  if (!organizationId) {
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
