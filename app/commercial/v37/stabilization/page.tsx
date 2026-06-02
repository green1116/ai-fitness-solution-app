import Link from "next/link";
import {
  runCommercialClosureFoundation,
  runCommercialV37ClosureFoundation,
} from "@/lib/commercialization/closure";
import { runCommercialCommerceFoundation } from "@/lib/commercialization/commerce";
import { runCommercialOperationsFoundation } from "@/lib/commercialization/operations";
import { runCommercialPortalFoundation } from "@/lib/commercialization/portal";
import { runCommercialProductFoundation } from "@/lib/commercialization/product";
import { runCommercialV37FinalFoundation } from "@/lib/commercialization/final";
import { runCommercialV37SupportFoundation } from "@/lib/commercialization/support";
import { runCommercialV37PhaseClosureFoundation } from "@/lib/commercialization/v37";
import { runCommercialV37LaunchFoundation } from "@/lib/commercialization/launch";
import { runCommercialV37OperatingFoundation } from "@/lib/commercialization/operations-v37";
import { runCommercialV37SunsetFoundation } from "@/lib/commercialization/sunset";
import { runCommercialV37ArchiveFoundation } from "@/lib/commercialization/archive";
import { runCommercialV37LegacyFoundation } from "@/lib/commercialization/legacy";
import { runCommercialV37AtlasFoundation } from "@/lib/commercialization/atlas";
import { runCommercialV37HubFoundation } from "@/lib/commercialization/hub";
import { runCommercialV37StabilizationFoundation } from "@/lib/commercialization/stabilization";

export const dynamic = "force-dynamic";

const V36_HOOKS = [
  "public-surface-ready=3.6-public-1",
  "http-ready=3.6-http-1",
  "integration-ready=3.6-integration-1",
  "client-ready=3.6-client-1",
  "release-portal-ready=3.6-release-1",
  "discovery-ready=3.6-discovery-1",
  "support-portal-ready=3.6-support-1",
  "trust-center-ready=3.6-trust-1",
  "transparency-center-ready=3.6-transparency-1",
];

export default function CommercialV37StabilizationPage() {
  const id = "stabilization-page";
  const v36 = runCommercialClosureFoundation({ deploymentId: id, observedHooks: V36_HOOKS });
  const product = runCommercialProductFoundation({ deploymentId: id, closure: v36, tier: "enterprise" });
  const commerce = runCommercialCommerceFoundation({ deploymentId: id, product });
  const operations = runCommercialOperationsFoundation({ deploymentId: id, product, commerce });
  const portal = runCommercialPortalFoundation({ deploymentId: id, product, commerce, operations });
  const v37Closure = runCommercialV37ClosureFoundation({
    deploymentId: id,
    v36Closure: v36,
    product,
    commerce,
    operations,
    portal,
    observedHooks: [
      "product-surface-ready=3.7-product-1",
      "pricing-surface-ready=3.7-commerce-1",
      "operations-surface-ready=3.7-operations-1",
      "portal-surface-ready=3.7-portal-1",
    ],
  });
  const v37Support = runCommercialV37SupportFoundation({
    deploymentId: id,
    product,
    portal,
    v37Closure,
  });
  const v37Final = runCommercialV37FinalFoundation({
    deploymentId: id,
    v37Closure,
    v37Support,
    observedHooks: [
      "product-surface-ready=3.7-product-1",
      "pricing-surface-ready=3.7-commerce-1",
      "operations-surface-ready=3.7-operations-1",
      "portal-surface-ready=3.7-portal-1",
      "v37-closure-ready=3.7-closure-1",
      "support-surface-ready=3.7-support-6",
      "final-surface-ready=3.7-final-7",
    ],
  });
  const phase = runCommercialV37PhaseClosureFoundation({
    deploymentId: id,
    v37Final,
    observedHooks: [
      "product-surface-ready=3.7-product-1",
      "pricing-surface-ready=3.7-commerce-1",
      "operations-surface-ready=3.7-operations-1",
      "portal-surface-ready=3.7-portal-1",
      "v37-closure-ready=3.7-closure-1",
      "support-surface-ready=3.7-support-6",
      "final-surface-ready=3.7-final-7",
    ],
  });
  const launch = runCommercialV37LaunchFoundation({
    deploymentId: id,
    v37PhaseClosure: phase,
    v37Final,
    observedHooks: [
      "product-surface-ready=3.7-product-1",
      "pricing-surface-ready=3.7-commerce-1",
      "operations-surface-ready=3.7-operations-1",
      "portal-surface-ready=3.7-portal-1",
      "v37-closure-ready=3.7-closure-1",
      "support-surface-ready=3.7-support-6",
      "final-surface-ready=3.7-final-7",
      "v37-phase-closure-ready=3.7-phase-closure-8",
    ],
  });
  const operating = runCommercialV37OperatingFoundation({
    deploymentId: id,
    v37Launch: launch,
    v37PhaseClosure: phase,
    assistive: true,
  });
  const sunset = runCommercialV37SunsetFoundation({
    deploymentId: id,
    v37Operating: operating,
    v37PhaseClosure: phase,
  });
  const archive = runCommercialV37ArchiveFoundation({
    deploymentId: id,
    v37Sunset: sunset,
    v37PhaseClosure: phase,
  });
  const legacy = runCommercialV37LegacyFoundation({ deploymentId: id, v37Archive: archive });
  const atlas = runCommercialV37AtlasFoundation({
    deploymentId: id,
    v37Legacy: legacy,
    phaseClosed: phase.phaseClosed,
  });
  const hub = runCommercialV37HubFoundation({
    deploymentId: id,
    v37Atlas: atlas,
    phaseClosed: phase.phaseClosed,
  });
  const stab = runCommercialV37StabilizationFoundation({ deploymentId: id, v37Hub: hub });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 space-y-2">
        <p className="text-sm text-emerald-400/90">V3.7 · Final stabilization</p>
        <h1 className="text-3xl font-bold">Consolidation & Release Readiness</h1>
        <p className="text-sm text-zinc-400">
          Freezable · regression-verifiable · publishable · maintainable — read-only surface.
        </p>
        <p
          className={
            stab.stabilizationReady
              ? "text-sm font-medium text-emerald-400"
              : "text-sm font-medium text-amber-400"
          }
        >
          Stabilization ready: {stab.stabilizationReady ? "yes" : "pending"} · Seal: {stab.sealId}
        </p>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm">
          <h2 className="font-semibold">Consolidation</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-400">
            {stab.consolidation.items.map((i) => (
              <li key={i.id}>
                {i.label}: {i.consolidated ? "ok" : "pending"}
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm">
          <h2 className="font-semibold">Freeze boundary</h2>
          <ul className="mt-2 space-y-1 text-zinc-400">
            {stab.freezeBoundary.rules.map((r) => (
              <li key={r.id}>
                {r.label}: {r.locked ? "locked" : "open"}
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm">
          <h2 className="font-semibold">Regression baseline</h2>
          <p className="text-zinc-400">{stab.regressionBaseline.regressionBaselineSummary}</p>
        </article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm">
          <h2 className="font-semibold">Release readiness</h2>
          <p className="text-zinc-400">
            {stab.releaseReadiness.readyCount}/{stab.releaseReadiness.totalCount} · publishable:{" "}
            {stab.releaseReadiness.publishable ? "yes" : "no"}
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5 text-sm">
        <h2 className="mb-2 font-semibold">Maintainability</h2>
        <ul className="list-disc space-y-1 pl-5 text-zinc-400">
          {stab.maintainability.bullets.map((b) => (
            <li key={b.id}>{b.text}</li>
          ))}
        </ul>
        <Link href="/commercial/v37/hub" className="mt-3 inline-block text-sky-300 underline">
          Canonical hub
        </Link>
      </section>

      <p className="mt-8 font-mono text-xs text-zinc-600">{stab.summary}</p>
    </main>
  );
}
