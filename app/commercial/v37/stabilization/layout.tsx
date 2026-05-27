import Link from "next/link";

export default function V37StabilizationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <nav className="border-b border-zinc-800 px-6 py-2 text-xs text-zinc-500">
        <Link href="/commercial/v37/hub" className="hover:text-zinc-300">
          ← Canonical hub
        </Link>
      </nav>
      {children}
    </div>
  );
}
