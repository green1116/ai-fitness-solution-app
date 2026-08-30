import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { redirect } from "next/navigation";
import {
  PEX_INTELLIGENCE_ENDPOINT,
  readProductIntelligenceExperience,
} from "@/lib/product/experience";
import { WorkspaceActionSurfacePanel } from "./WorkspaceActionSurfacePanel";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { status, signals, attention } = await readProductIntelligenceExperience();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white">
            控制台
          </Link>
          <Link href="/projects" className="font-semibold">
            项目 Workspace
          </Link>
        </nav>
        <section className="mx-auto mt-4 max-w-5xl rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-600">只读 · GET {PEX_INTELLIGENCE_ENDPOINT}</p>
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
        <WorkspaceActionSurfacePanel />
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
