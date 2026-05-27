import Link from "next/link";
import { buildPolicyReview } from "@/lib/commercialization/access";

export const dynamic = "force-dynamic";

export default function PolicyReviewPage() {
  const review = buildPolicyReview({ deploymentId: "policy-review-page" });
  const granted = review.effectiveAccess.filter((e) => e.granted);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-sky-400/90">V3.7-H10 · Policy Review</p>
          <h1 className="text-3xl font-bold">Policy Review Surface</h1>
          <p className="text-sm text-zinc-400">
            只读策略复核摘要 — 供企业权限审计与 effective access 解释使用。
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Summaries</h2>
            <ul className="space-y-1 font-mono text-xs text-zinc-400">
              <li>{review.roleSummary}</li>
              <li>{review.resourceSummary}</li>
              <li>{review.permissionSummary}</li>
              <li>{review.allowSummary}</li>
              <li>{review.denySummary}</li>
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Effective Access</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>Total entries: {review.effectiveAccess.length}</li>
              <li>Granted: {granted.length}</li>
              <li>Denied: {review.effectiveAccess.length - granted.length}</li>
            </ul>
          </article>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Granted Access</h2>
          {granted.map((entry) => (
            <article
              key={`${entry.roleId}-${entry.resourceId}`}
              className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-4"
            >
              <p className="text-sm text-zinc-200">
                <span className="font-mono text-emerald-400/90">{entry.roleId}</span>
                {" → "}
                <span className="font-mono text-emerald-400/90">{entry.resourceId}</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">{entry.explanation}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-sky-900/40 bg-sky-950/20 p-5">
          <h2 className="mb-2 text-lg font-semibold">API Access</h2>
          <Link
            href="/api/commercialization/policy-review"
            className="text-sm text-sky-300 underline"
          >
            Open readonly policy review API (JSON)
          </Link>
          <span className="mx-2 text-zinc-600">·</span>
          <Link href="/dashboard/access-control" className="text-sm text-sky-300 underline">
            Access matrix review
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{review.summary}</p>

        <Link href="/dashboard" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          ← 返回控制台
        </Link>
      </div>
    </main>
  );
}
