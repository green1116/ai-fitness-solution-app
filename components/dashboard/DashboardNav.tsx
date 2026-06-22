import Link from "next/link";

const NAV = [
  { href: "/overview", label: "总览" },
  { href: "/revenue", label: "收入" },
  { href: "/customers", label: "客户" },
  { href: "/sales", label: "销售" },
  { href: "/growth", label: "增长" },
  { href: "/operations", label: "运营" },
] as const;

export function DashboardNav({ active }: { active: string }) {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={
            active === item.href
              ? "rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
              : "rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
          }
        >
          {item.label}
        </Link>
      ))}
      <Link
        href="/dashboard"
        className="ml-auto rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-300"
      >
        返回旧控制台
      </Link>
    </nav>
  );
}
