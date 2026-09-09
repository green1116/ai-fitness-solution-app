import Link from "next/link";

const LINKS = [
  { href: "/demo", label: "免费体验" },
  { href: "/pricing", label: "定价" },
  { href: "/case", label: "案例" },
  { href: "/login", label: "登录" },
];

export function MarketingNav() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-zinc-900">
          AI 企业健身项目解决方案
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                l.href === "/demo"
                  ? "font-medium text-emerald-700 hover:text-emerald-600"
                  : "hover:text-emerald-600"
              }
            >
              {l.label}
            </Link>
          ))}
          <Link href="/register" className="text-zinc-500 hover:text-emerald-600">
            注册
          </Link>
        </nav>
      </div>
    </header>
  );
}
