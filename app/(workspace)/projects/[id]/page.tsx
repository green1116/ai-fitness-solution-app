import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjectById } from "@/lib/services/project.service";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/projects" className="text-sm text-zinc-400 hover:text-white">
          ← 返回项目列表
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-zinc-400">
          {project.clientName ?? "—"} · {project.city ?? "—"}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href={`/quote?projectId=${project.id}`}
          className="rounded-xl border border-zinc-800 bg-black p-4 hover:border-zinc-600"
        >
          <div className="font-semibold">生成方案</div>
          <div className="text-xs text-zinc-400">Quote · {project.quotes.length} 条</div>
        </Link>
        <Link
          href="/budget"
          className="rounded-xl border border-zinc-800 bg-black p-4 hover:border-zinc-600"
        >
          <div className="font-semibold">计算预算</div>
          <div className="text-xs text-zinc-400">Budget · {project.budgets.length} 条</div>
        </Link>
        <Link
          href={`/documents/projects/${project.id}`}
          className="rounded-xl border border-sky-800 bg-sky-950/20 p-4 hover:border-sky-600"
        >
          <div className="font-semibold">交付中心</div>
          <div className="text-xs text-zinc-400">Documents · 全部交付物</div>
        </Link>
        <Link
          href="/tender"
          className="rounded-xl border border-zinc-800 bg-black p-4 hover:border-zinc-600"
        >
          <div className="font-semibold">生成标书</div>
          <div className="text-xs text-zinc-400">Tender · {project.tenders.length} 条</div>
        </Link>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-black p-4 text-xs text-zinc-400">
        <div>Project ID: {project.id}</div>
        <div>Site: {project.siteType} · Budget Level: {project.budgetLevel}</div>
      </section>
    </div>
  );
}
