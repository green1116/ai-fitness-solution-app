import Link from "next/link";
import { buildEnterpriseLandingFoundation } from "@/lib/commercialization/landing/index";

export const dynamic = "force-dynamic";

function readyLabel(ready: boolean) {
  return ready ? "text-emerald-400" : "text-amber-400";
}

export default function EnterpriseLandingPage() {
  const landing = buildEnterpriseLandingFoundation({ deploymentId: "enterprise-landing-page" });
  const { cards, readiness, manifest } = landing;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-sky-400/90">V3.7-H17 · Enterprise Landing</p>
          <h1 className="text-3xl font-bold">Enterprise Landing Experience</h1>
          <p className="text-sm text-zinc-400">
            SaaS deployment readiness · operational quick access · governance / release / audit summaries
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Landing", ready: manifest.readyForLanding },
            { label: "Deployment", ready: manifest.readyForDeployment },
            { label: "Enterprise", ready: manifest.readyForEnterprise },
            { label: "Ops", ready: readiness.opsReady },
            { label: "Governance", ready: readiness.governanceReady },
            { label: "Release", ready: readiness.releaseReady },
            { label: "Audit", ready: readiness.auditReady },
            { label: "Observability", ready: readiness.observabilityReady },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold text-zinc-400">{item.label}</h2>
              <p className={readyLabel(item.ready)}>{item.ready ? "Ready" : "Pending"}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-sky-900/30 bg-sky-950/10 p-5">
          <h2 className="mb-2 text-lg font-semibold">SaaS Readiness</h2>
          <p className="text-2xl font-bold text-sky-300">{readiness.confidenceScore}%</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">{readiness.summary}</p>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {cards.quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">Deployment Readiness Cards</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {cards.readinessCards.map((card) => (
              <article key={card.id} className="rounded-lg border border-zinc-700 p-4">
                <Link href={card.href} className="font-semibold text-sky-300 underline">
                  {card.label}
                </Link>
                <p className="mt-1 text-xs text-zinc-500">{card.description}</p>
                <p className="mt-2 text-xs text-zinc-600">{card.tags.join(" · ")}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Governance</h2>
            <ul className="space-y-2 text-sm">
              {cards.governanceCards.map((card) => (
                <li key={card.id}>
                  <Link href={card.href} className="text-sky-300 underline">
                    {card.label}
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Release</h2>
            <ul className="space-y-2 text-sm">
              {cards.releaseCards.map((card) => (
                <li key={card.id}>
                  <Link href={card.href} className="text-sky-300 underline">
                    {card.label}
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Audit</h2>
            <ul className="space-y-2 text-sm">
              {cards.auditCards.map((card) => (
                <li key={card.id}>
                  <Link href={card.href} className="text-sky-300 underline">
                    {card.label}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">All Landing Cards</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.cards.map((card) => (
              <article key={card.id} className="rounded-lg border border-zinc-800 p-3">
                <span className="text-xs uppercase text-zinc-600">{card.category}</span>
                <Link href={card.href} className="block font-medium text-zinc-200 hover:text-white">
                  {card.label}
                </Link>
                <p className="text-xs text-zinc-600">{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-sky-900/40 bg-sky-950/20 p-5">
          <Link
            href="/api/commercialization/enterprise-landing"
            className="text-sm text-sky-300 underline"
          >
            Open enterprise landing API (JSON)
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{landing.foundationSummary}</p>

        <Link href="/dashboard" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          ← 返回控制台
        </Link>
      </div>
    </main>
  );
}
