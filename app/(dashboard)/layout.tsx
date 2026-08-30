import { getCurrentUser } from "@/lib/auth/currentUser";
import { redirect } from "next/navigation";

export default async function CeoDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-500">
            V61 P2 · Enterprise Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold">CEO 运营控制台</h1>
          <p className="mt-1 text-sm text-zinc-400">全局业务监控 · 实时 KPI · 决策支持</p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </div>
  );
}
