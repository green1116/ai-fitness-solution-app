import Link from "next/link";
import { buildEnterpriseRolloutFoundation } from "@/lib/commercialization/deployment-readiness/index";

export const dynamic = "force-dynamic";

function readyLabel(ready: boolean) {
  return ready ? "text-emerald-400" : "text-amber-400";
}

function checkLabel(passed: boolean) {
  return passed ? "text-emerald-400" : "text-amber-400";
}

export default function RolloutReadinessPage() {
  const rollout = buildEnterpriseRolloutFoundation({ deploymentId: "rollout-readiness-page" });
  const { readiness, summary, manifest } = rollout;

  const checkSections = [
    { title: "Deployment Checks", checks: readiness.deploymentChecks },
    { title: "Rollout Checks", checks: readiness.rolloutChecks },
    { title: "Onboarding Checks", checks: readiness.onboardingChecks },
    { title: "Governance Checks", checks: readiness.governanceChecks },
    { title: "Operational Checks", checks: readiness.operationalChecks },
    { title: "Release Checks", checks: readiness.releaseChecks },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-violet-400/90">V3.7-H18 · Enterprise Rollout</p>
          <h1 className="text-3xl font-bold">Rollout Readiness Surface</h1>
          <p className="text-sm text-zinc-400">
            Deployment · rollout · onboarding · governance · operational continuity readiness
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Deployment", ready: summary.deploymentReady },
            { label: "Rollout", ready: summary.rolloutReady },
            { label: "Onboarding", ready: summary.onboardingReady },
            { label: "Governance", ready: summary.governanceReady },
            { label: "Operational", ready: summary.operationalReady },
            { label: "Release", ready: summary.releaseReady },
            { label: "Enterprise", ready: manifest.readyForEnterprise },
            { label: "Confidence", ready: summary.confidenceScore >= 80 },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold text-zinc-400">{item.label}</h2>
              <p className={readyLabel(item.ready)}>
                {item.label === "Confidence" ? `${summary.confidenceScore}%` : item.ready ? "Ready" : "Pending"}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-violet-900/30 bg-violet-950/10 p-5">
          <h2 className="mb-2 text-lg font-semibold">Rollout Readiness Summary</h2>
          <p className="font-mono text-xs text-zinc-500">{summary.summary}</p>
          <p className="mt-2 font-mono text-xs text-zinc-600">{manifest.summary}</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {checkSections.map((section) => (
            <article key={section.title} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="mb-3 text-lg font-semibold">{section.title}</h2>
              <ul className="space-y-2 text-sm">
                {section.checks.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-2">
                    <span className="text-zinc-300">
                      {item.href ? (
                        <Link href={item.href} className="underline hover:text-white">
                          {item.label}
                        </Link>
                      ) : (
                        item.label
                      )}
                      <span className="ml-2 text-xs text-zinc-600">{item.surface}</span>
                    </span>
                    <span className={checkLabel(item.passed)}>{item.passed ? "Pass" : "Pending"}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-violet-900/40 bg-violet-950/20 p-5">
          <Link
            href="/api/commercialization/rollout-readiness"
            className="text-sm text-violet-300 underline"
          >
            Open rollout readiness API (JSON)
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{rollout.foundationSummary}</p>

        <div className="flex gap-4 text-sm">
          <Link href="/dashboard/enterprise-landing" className="text-zinc-400 underline hover:text-zinc-200">
            ← Enterprise Landing
          </Link>
          <Link href="/dashboard" className="text-zinc-400 underline hover:text-zinc-200">
            ← 控制台
          </Link>
        </div>
      </div>
    </main>
  );
}
