"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type BootstrapPackage = {
  bootstrapId: string;
  contentHash: string;
  projectId: string;
  quoteId?: string;
  tenderId?: string;
  handoffPackageId?: string;
  v80WorkflowJobId?: string;
  owners: Array<{ role: string; label: string; displayName: string; email?: string }>;
  milestones: Array<{
    id: string;
    title: string;
    status: string;
    ownerRole: string;
    dueOffsetDays: number;
    order: number;
  }>;
  tasks: Array<{
    id: string;
    milestoneId: string;
    title: string;
    status: string;
    ownerRole: string;
    source: string;
  }>;
  kickoff: {
    projectName: string;
    clientName: string;
    location: string;
    ready: boolean;
    headline: string;
    bullets: string[];
    risks: string[];
    nextActions: string[];
    milestoneCount: number;
    taskCount: number;
  };
  traceability: {
    intakeRevision: number;
    sourceDocuments: Array<{ fileName: string; docType: string }>;
    requirementItemCount: number;
    compliancePassed?: boolean;
  };
};

type Props = {
  sessionId: string;
  readOnly?: boolean;
};

export function IntakeBootstrapKickoffPanel({ sessionId, readOnly = false }: Props) {
  const [pkg, setPkg] = useState<BootstrapPackage | null>(null);
  const [hasProject, setHasProject] = useState(false);
  const [idempotent, setIdempotent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/bootstrap`);
    const data = await res.json();
    if (res.ok && data.ok) {
      setHasProject(data.hasProject === true);
      setPkg(data.bootstrap?.package ?? null);
      setIdempotent(data.bootstrap?.idempotent === true);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function seed() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/bootstrap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persistProduction: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "种子失败");
      setPkg(data.package);
      setIdempotent(data.idempotent === true);
      setHasProject(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "种子失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-black/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">项目启动种子</h3>
          <p className="text-xs text-zinc-500">
            从已批准 Intake 生成里程碑 / 任务 / Owner（写入 Project / Tender）
          </p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            disabled={busy || !hasProject}
            onClick={() => void seed()}
            className="rounded-lg border border-sky-800 px-3 py-1.5 text-xs text-sky-300 disabled:opacity-40"
            title={!hasProject ? "需先批准并创建 Project" : "生成或刷新执行种子"}
          >
            {busy ? "生成中…" : "生成执行种子"}
          </button>
        ) : null}
      </div>

      {!hasProject ? (
        <p className="text-xs text-amber-300">尚无生产 Project — 请先完成批准交接。</p>
      ) : null}

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}

      {pkg ? (
        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap gap-3 text-zinc-400">
            <span className="font-mono text-zinc-500">{pkg.bootstrapId}</span>
            {idempotent ? <span className="text-sky-400">幂等命中</span> : null}
            <span className={pkg.kickoff.ready ? "text-emerald-400" : "text-amber-300"}>
              {pkg.kickoff.ready ? "可启动" : "有阻断"}
            </span>
            <Link
              href={`/documents/projects/${pkg.projectId}`}
              className="text-sky-400 underline"
            >
              打开项目
            </Link>
          </div>

          <div className="rounded-lg border border-zinc-800 p-3">
            <p className="font-medium text-zinc-200">{pkg.kickoff.headline}</p>
            <p className="mt-1 text-zinc-400">
              {pkg.kickoff.projectName} · {pkg.kickoff.clientName} · {pkg.kickoff.location}
            </p>
            <ul className="mt-2 list-disc pl-4 text-zinc-500">
              {pkg.kickoff.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="mt-2 text-zinc-500">
              下一步：{pkg.kickoff.nextActions.join("；")}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 p-3">
              <p className="mb-1 font-medium text-zinc-300">
                里程碑（{pkg.milestones.length}）
              </p>
              <ul className="space-y-1 text-zinc-500">
                {pkg.milestones.map((m) => (
                  <li key={m.id}>
                    {m.order}. {m.title}{" "}
                    <span className="text-zinc-600">
                      [{m.status}] · {m.ownerRole} · +{m.dueOffsetDays}d
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-zinc-800 p-3">
              <p className="mb-1 font-medium text-zinc-300">Owner 映射</p>
              <ul className="space-y-1 text-zinc-500">
                {pkg.owners.map((o) => (
                  <li key={o.role}>
                    {o.label}：{o.displayName}
                    {o.email ? ` <${o.email}>` : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 p-3">
            <p className="mb-1 font-medium text-zinc-300">任务（{pkg.tasks.length}）</p>
            <ul className="max-h-40 space-y-1 overflow-y-auto text-zinc-500">
              {pkg.tasks.slice(0, 20).map((t) => (
                <li key={t.id}>
                  <span className="text-zinc-400">[{t.status}]</span> {t.title}{" "}
                  <span className="text-zinc-600">
                    → {t.ownerRole} · {t.source}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-zinc-600">
            追溯：handoff {pkg.handoffPackageId ?? "—"} · 文档{" "}
            {pkg.traceability.sourceDocuments.length} · 需求条目{" "}
            {pkg.traceability.requirementItemCount} · hash{" "}
            {pkg.contentHash.slice(0, 12)}…
          </div>
        </div>
      ) : hasProject ? (
        <p className="text-xs text-zinc-600">尚未生成执行种子。</p>
      ) : null}
    </section>
  );
}
