import Link from "next/link";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
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
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
