import Link from "next/link";
import { buildPermissionLineage } from "@/lib/commercialization/governance/index";

export const dynamic = "force-dynamic";

export default function PermissionLineagePage() {
  const lineage = buildPermissionLineage({ deploymentId: "permission-lineage-page" });

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-violet-400/90">V3.7-H12 · Permission Lineage</p>
          <h1 className="text-3xl font-bold">Permission Lineage Review</h1>
          <p className="text-sm text-zinc-400">
            只读权限血缘摘要 — 供 role lineage、inherited access 与 readonly 解释复核使用。
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Lineage Counts</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>Role lineage: {lineage.roleLineage.length}</li>
              <li>Permission lineage: {lineage.permissionLineage.length}</li>
              <li>Resource lineage: {lineage.resourceLineage.length}</li>
              <li>Inherited access: {lineage.inheritedAccess.length}</li>
              <li>Readonly explanations: {lineage.readonlyExplanations.length}</li>
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Role Lineage</h2>
            <ul className="space-y-2 text-sm text-zinc-300">
              {lineage.roleLineage.map((entry) => (
                <li key={entry.id}>
                  <span className="font-medium text-zinc-200">{entry.label}</span>
                  <p className="font-mono text-xs text-zinc-500">{entry.detail}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Inherited Access</h2>
          {lineage.inheritedAccess.map((entry) => (
            <article
              key={entry.roleId}
              className="rounded-xl border border-violet-900/30 bg-violet-950/10 p-4"
            >
              <p className="font-mono text-sm text-violet-300/90">{entry.roleId}</p>
              {entry.inheritsFrom.length > 0 && (
                <p className="mt-1 text-xs text-zinc-500">
                  inherits: {entry.inheritsFrom.join(", ")}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-400">{entry.explanation}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">Readonly Explanations</h2>
          <ul className="max-h-64 space-y-1 overflow-y-auto font-mono text-xs text-zinc-500">
            {lineage.readonlyExplanations.map((explanation, index) => (
              <li key={index}>{explanation}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-violet-900/40 bg-violet-950/20 p-5">
          <h2 className="mb-2 text-lg font-semibold">API Access</h2>
          <Link
            href="/api/commercialization/permission-lineage"
            className="text-sm text-sky-300 underline"
          >
            Open readonly permission lineage API (JSON)
          </Link>
          <span className="mx-2 text-zinc-600">·</span>
          <Link href="/dashboard/governance-review" className="text-sm text-sky-300 underline">
            Governance review
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{lineage.summary}</p>

        <Link href="/dashboard" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          ← 返回控制台
        </Link>
      </div>
    </main>
  );
}
