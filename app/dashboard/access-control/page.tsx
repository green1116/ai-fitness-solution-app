import Link from "next/link";
import { buildProductionAccessControlFoundation } from "@/lib/commercialization/access";

export const dynamic = "force-dynamic";

export default function AccessControlPage() {
  const foundation = buildProductionAccessControlFoundation({ deploymentId: "access-control-page" });
  const { dto, matrix, manifest } = foundation;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-amber-400/90">V3.7-H10 · Access Control</p>
          <h1 className="text-3xl font-bold">Access Matrix Review</h1>
          <p className="text-sm text-zinc-400">
            只读权限矩阵摘要 — 供企业级权限复核与入口可见性判断使用。
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Ops Readiness</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>
                Ready for ops:{" "}
                <span className={manifest.readyForOps ? "text-emerald-400" : "text-amber-400"}>
                  {manifest.readyForOps ? "yes" : "no"}
                </span>
              </li>
              <li>
                Ready for review:{" "}
                <span className={manifest.readyForReview ? "text-emerald-400" : "text-amber-400"}>
                  {manifest.readyForReview ? "yes" : "no"}
                </span>
              </li>
              <li>Default role: {dto.defaultRole}</li>
              <li>Granted permissions: {matrix.grantedCount}</li>
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Matrix Coverage</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>Roles: {dto.roles.length}</li>
              <li>Resources: {dto.resources.length}</li>
              <li>Permissions: {dto.permissions.length}</li>
              <li>Allow rules: {dto.allowRules.length}</li>
              <li>Deny rules: {dto.denyRules.length}</li>
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 sm:col-span-2">
            <h2 className="mb-3 text-lg font-semibold">Roles</h2>
            <ul className="space-y-2 text-sm text-zinc-300">
              {dto.roles.map((role) => (
                <li key={role.id}>
                  <span className="font-medium text-zinc-200">{role.label}</span>
                  <span className="ml-2 font-mono text-xs text-zinc-500">{role.id}</span>
                  <p className="text-xs text-zinc-500">{role.description}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 sm:col-span-2">
            <h2 className="mb-3 text-lg font-semibold">Resources</h2>
            <ul className="grid gap-2 sm:grid-cols-2 text-sm text-zinc-300">
              {dto.resources.map((resource) => (
                <li key={resource.id} className="rounded-lg border border-zinc-800/80 p-3">
                  <span className="font-medium">{resource.label}</span>
                  <p className="font-mono text-xs text-zinc-500">{resource.href}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-5">
          <h2 className="mb-2 text-lg font-semibold">API Access</h2>
          <Link
            href="/api/commercialization/access-control"
            className="text-sm text-sky-300 underline"
          >
            Open readonly access control API (JSON)
          </Link>
          <span className="mx-2 text-zinc-600">·</span>
          <Link href="/dashboard/policy-review" className="text-sm text-sky-300 underline">
            Policy review
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{foundation.summary}</p>

        <Link href="/dashboard" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          ← 返回控制台
        </Link>
      </div>
    </main>
  );
}
