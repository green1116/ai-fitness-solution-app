import type { PortalSessionSnapshot } from "../shared/portal-types";

interface SettingsPageContentProps {
  session: PortalSessionSnapshot;
}

export function SettingsPageContent({ session }: SettingsPageContentProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-2xl font-semibold">Settings</h3>
        <p className="text-sm text-zinc-400">
          Tenant session wired via Cookie → Membership → GET /api/saas-product/me
        </p>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <dl className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-zinc-500">User</dt>
            <dd className="mt-1 font-medium text-white">{session.user.userId}</dd>
            {session.user.email ? <dd className="text-zinc-400">{session.user.email}</dd> : null}
          </div>
          <div>
            <dt className="text-zinc-500">Tenant</dt>
            <dd className="mt-1 font-medium text-white">{session.tenant.tenantId}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Role</dt>
            <dd className="mt-1 font-medium text-white">{session.role ?? session.membership.roleSystemCode ?? "unknown"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Membership</dt>
            <dd className="mt-1 font-medium text-white">{session.membership.id}</dd>
            <dd className="text-zinc-400">{session.membership.organizationId ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Session Source</dt>
            <dd className="mt-1 font-medium text-white">{session.sessionSource}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Portal</dt>
            <dd className="mt-1 font-medium text-white">{session.portalDisplayName ?? "Enterprise Portal"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
