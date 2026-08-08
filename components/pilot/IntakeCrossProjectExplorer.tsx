"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Fingerprint = {
  sessionId: string;
  label: string;
  features: {
    industry: string;
    location: string;
    status: string;
    equipmentTexts: string[];
    hasProductionProject: boolean;
  };
};

type Explorer = {
  generatedAt: string;
  contentHash: string;
  fingerprints: Fingerprint[];
  topPairs: Array<{
    leftSessionId: string;
    rightSessionId: string;
    leftLabel: string;
    rightLabel: string;
    similarity: number;
  }>;
  insight: {
    projectCount: number;
    pairCount: number;
    avgPairSimilarity: number;
    headline: string;
  };
};

export function IntakeCrossProjectExplorer() {
  const [explorer, setExplorer] = useState<Explorer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v80/intake/similarity");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.code || "LOAD_FAILED");
      setExplorer(data.explorer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Pilot P17</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-100">跨项目智能</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            为历史完成项目生成指纹，确定性计算相似度，发现可复用的需求、设备、合规与执行经验。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/api/pilot/v80/intake/similarity?download=1"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            导出 JSON
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200"
          >
            刷新
          </button>
        </div>
      </header>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {loading ? <p className="text-sm text-zinc-500">加载中…</p> : null}

      {explorer ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="历史项目" value={String(explorer.insight.projectCount)} />
            <Stat label="高相似对" value={String(explorer.insight.pairCount)} />
            <Stat
              label="平均相似度"
              value={`${(explorer.insight.avgPairSimilarity * 100).toFixed(0)}%`}
            />
            <Stat label="洞察" value={explorer.insight.headline} small />
          </section>

          <section className="rounded-xl border border-zinc-800 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">最相似项目对</h2>
            <ul className="mt-3 space-y-2">
              {explorer.topPairs.map((p) => (
                <li
                  key={`${p.leftSessionId}-${p.rightSessionId}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800/80 px-3 py-2 text-xs text-zinc-300"
                >
                  <span>
                    <span className="text-zinc-200">{p.leftLabel}</span>
                    <span className="text-zinc-600"> ↔ </span>
                    <span className="text-zinc-200">{p.rightLabel}</span>
                  </span>
                  <span className="tabular-nums text-emerald-400/90">
                    {(p.similarity * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
              {explorer.topPairs.length === 0 ? (
                <li className="text-xs text-zinc-500">完成至少 2 个项目后显示相似对。</li>
              ) : null}
            </ul>
          </section>

          <section className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs text-zinc-500">
                <tr>
                  <th className="px-3 py-2">项目</th>
                  <th className="px-3 py-2">行业/地点</th>
                  <th className="px-3 py-2">状态</th>
                  <th className="px-3 py-2">设备数</th>
                  <th className="px-3 py-2">检索</th>
                </tr>
              </thead>
              <tbody>
                {explorer.fingerprints.map((f) => (
                  <tr key={f.sessionId} className="border-b border-zinc-900/80">
                    <td className="px-3 py-2 text-zinc-200">{f.label}</td>
                    <td className="px-3 py-2 text-xs text-zinc-400">
                      {f.features.industry || "—"} / {f.features.location || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-500">{f.features.status}</td>
                    <td className="px-3 py-2 tabular-nums text-zinc-400">
                      {f.features.equipmentTexts.length}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/pilot/intake?sessionId=${encodeURIComponent(f.sessionId)}`}
                        className="text-xs text-sky-400 hover:underline"
                      >
                        打开 Intake
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <p className="text-[10px] text-zinc-600">
            hash {explorer.contentHash.slice(0, 16)}… ·{" "}
            {new Date(explorer.generatedAt).toLocaleString("zh-CN")}
          </p>
        </>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-zinc-100 ${small ? "text-xs leading-snug" : "text-lg"}`}>
        {value}
      </div>
    </div>
  );
}
