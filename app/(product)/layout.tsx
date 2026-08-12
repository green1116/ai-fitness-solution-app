import Link from "next/link";
import { GET } from "@/app/api/product/intelligence/route";
import type { ProductIntelligenceView } from "@/lib/product/intelligence";

export const dynamic = "force-dynamic";

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await GET();
  const view = (await res.json()) as ProductIntelligenceView;
  const { status, signals, attention } = view;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 text-sm">
          <Link href="/dashboard" className="font-semibold text-zinc-300 hover:text-white">
            控制台
          </Link>
          <Link href="/quote" className="text-zinc-400 hover:text-white">
            方案 Quote
          </Link>
          <Link href="/budget" className="text-zinc-400 hover:text-white">
            预算 Budget
          </Link>
          <Link href="/tender" className="text-zinc-400 hover:text-white">
            标书 Tender
          </Link>
        </nav>
        <section className="mx-auto mt-4 max-w-5xl rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-600">只读 · GET /api/product/intelligence</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-zinc-500">Status</p>
              <p className="mt-1 text-lg font-semibold">{status}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Signals</p>
              <p className="mt-1 text-sm text-zinc-300">
                open {signals.openCount} · queued {signals.queuedCount} · watch{" "}
                {signals.watchCount} · held {signals.heldCount} · escalate{" "}
                {signals.escalateCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Attention</p>
              <p className="mt-1 text-sm text-zinc-300">
                open {attention.openCount} · escalate {attention.escalateCount}
              </p>
            </div>
          </div>
        </section>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
