import Link from "next/link";

const LINKS = [
  { href: "/pricing", label: "定价" },
  { href: "/demo", label: "Demo" },
  { href: "/case", label: "案例" },
  { href: "/login", label: "登录" },
  { href: "/register", label: "注册" },
];

export function MarketingNav() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-zinc-900">
          AI Fitness Solution
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm text-zinc-600">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-emerald-600">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
