import Link from "next/link";
import {
  CP_RELEASE_API_PATH,
  CP_RELEASE_PAGE_PATH,
  CP_RELEASE_TAG,
} from "@/lib/commercial-products/release/release-types";
import {
  createRelease,
  listReleases,
  publishRelease,
} from "@/lib/commercial-products/release/release-runtime";

export const dynamic = "force-dynamic";

export default function CommercialV47ReleasePage() {
  const created = createRelease({ tag: CP_RELEASE_TAG });
  const published = publishRelease({ releaseId: created.release.releaseId });
  const snapshot = listReleases();

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-amber-400/90">V47 · Commercial Release</p>
          <h1 className="text-3xl font-bold">Release Overview</h1>
          <p className="text-sm text-zinc-400">
            Release Ledger · Manifest · Verification Status · Freeze Tags
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-4">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm text-zinc-500">Version</h2>
            <p className="text-lg font-semibold">{published.release.version}</p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm text-zinc-500">Status</h2>
            <p className="text-lg font-semibold text-emerald-400">{published.release.status}</p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm text-zinc-500">Tag</h2>
            <p className="truncate text-xs text-zinc-300">{published.release.tag}</p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm text-zinc-500">Modules</h2>
            <p className="text-lg font-semibold">{snapshot.manifest.modules.length}</p>
          </article>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-lg font-semibold">Verification Status</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["tsc", "build", "verify"] as const).map((key) => (
              <article key={key} className="rounded-lg border border-zinc-800 px-4 py-3">
                <p className="text-sm uppercase text-zinc-500">{key}</p>
                <p className={published.release.verification[key] ? "text-emerald-400" : "text-rose-400"}>
                  {published.release.verification[key] ? "PASS" : "FAIL"}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-lg font-semibold">Release Manifest</h2>
          <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-black p-4 text-xs text-zinc-300">
            {JSON.stringify(snapshot.manifest, null, 2)}
          </pre>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-lg font-semibold">Release Ledger</h2>
          <ul className="space-y-3 text-sm">
            {snapshot.ledger.map((entry) => (
              <li key={entry.ledgerId} className="rounded-lg border border-zinc-800 px-4 py-3">
                <p className="font-medium">{entry.version} · {entry.tag}</p>
                <p className="text-xs text-zinc-500">
                  publishedAt={new Date(entry.publishedAt).toLocaleString("zh-CN")} modules=
                  {entry.modules.length}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-xs text-zinc-500">
          <p>Release API: {CP_RELEASE_API_PATH}</p>
          <p>Release Page: {CP_RELEASE_PAGE_PATH}</p>
          <p>Freeze Tag: {CP_RELEASE_TAG}</p>
        </section>

        <div className="flex flex-wrap gap-4">
          <Link href="/commercial/v47/audit" className="text-sm text-sky-300 underline">
            Audit
          </Link>
          <Link href="/commercial/v47" className="text-sm text-sky-300 underline">
            ← Sales Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
