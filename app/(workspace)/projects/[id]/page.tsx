import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjectById } from "@/lib/services/project.service";

const ZONE_SECTIONS = [
  {
    zone: "导入",
    description: "上传招标文件并解析需求",
    items: [
      {
        title: "上传标书",
        subtitle: "Pilot Intake · 解析招标文件",
        href: "/pilot/intake",
        primary: true,
      },
    ],
  },
  {
    zone: "计算",
    description: "生成方案与预算",
    items: [
      {
        title: "生成方案 Quote",
        subtitle: "方案生成",
        href: (id: string) => `/quote?projectId=${id}`,
      },
      {
        title: "计算预算 Budget",
        subtitle: "预算计算与 PDF",
        href: (id: string) => `/budget?projectId=${id}`,
      },
    ],
  },
  {
    zone: "交付",
    description: "生成标书 PDF",
    items: [
      {
        title: "生成标书 Tender",
        subtitle: "标书 PDF 生成",
        href: (id: string) => `/tender?projectId=${id}`,
      },
    ],
  },
  {
    zone: "归档",
    description: "下载与交付记录",
    items: [
      {
        title: "Document Center",
        subtitle: "全部交付物与下载",
        href: (id: string) => `/documents/projects/${id}`,
        primary: true,
      },
    ],
  },
] as const;

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/projects" className="text-sm text-zinc-400 hover:text-white">
          ← 返回项目列表
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-zinc-400">
          {project.clientName ?? "—"} · {project.city ?? "—"}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          主流程：导入 → 计算 → 交付 → 归档
        </p>
      </div>

      {ZONE_SECTIONS.map((section) => (
        <section key={section.zone} className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-white">{section.zone}</h2>
            <p className="text-xs text-zinc-500">{section.description}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {section.items.map((item) => {
              const href =
                typeof item.href === "function" ? item.href(project.id) : item.href;
              return (
                <Link
                  key={item.title}
                  href={href}
                  className={`rounded-xl border p-4 transition ${
                    "primary" in item && item.primary
                      ? "border-sky-800 bg-sky-950/20 hover:border-sky-600"
                      : "border-zinc-800 bg-black hover:border-zinc-600"
                  }`}
                >
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-zinc-400">{item.subtitle}</div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <section className="rounded-xl border border-zinc-800 bg-black p-4 text-xs text-zinc-400">
        <div>Project ID: {project.id}</div>
        <div>
          Quote {project.quotes.length} · Budget {project.budgets.length} · Tender{" "}
          {project.tenders.length}
        </div>
        <div>Site: {project.siteType} · Budget Level: {project.budgetLevel}</div>
      </section>
    </div>
  );
}
