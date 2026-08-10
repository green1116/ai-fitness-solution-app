"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  IntakeDocumentType,
  MultiDocConsolidationState,
} from "@/lib/pilot/v80/intake/multidoc.schema";
import type { TenderRequirements } from "@/lib/pilot/v80/intake/requirements.schema";

type DocRow = {
  id: string;
  fileName: string;
  docType: IntakeDocumentType;
  order: number;
  priority: number;
  status: string;
  fileSize?: number;
};

type Props = {
  sessionId: string;
  readOnly?: boolean;
  onRequirementsChange: (req: TenderRequirements, meta?: { revision?: number }) => void;
};

const DOC_TYPE_LABEL: Record<IntakeDocumentType, string> = {
  primary: "主标书",
  addendum: "补遗",
  annex: "附件",
  drawing: "图纸",
  qa: "答疑",
  other: "其他",
};

export function IntakeMultiDocPanel({
  sessionId,
  readOnly = false,
  onRequirementsChange,
}: Props) {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [consolidation, setConsolidation] = useState<MultiDocConsolidationState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [docType, setDocType] = useState<IntakeDocumentType>("addendum");

  const load = useCallback(async () => {
    const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/documents`);
    const data = await res.json();
    if (res.ok && data.ok) {
      setDocs(data.documents ?? []);
      setConsolidation(data.consolidation ?? null);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addFile(file: File) {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("sessionId", sessionId);
      fd.append("docType", docType);
      const res = await fetch("/api/pilot/v80/intake/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "追加失败");
      setDocs(data.documents ?? []);
      setConsolidation(data.consolidation ?? null);
      if (data.requirements) {
        onRequirementsChange(data.requirements, { revision: data.revision });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "追加失败");
    } finally {
      setBusy(false);
    }
  }

  async function reconsolidate() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/documents`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "consolidate" }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "合并失败");
      setDocs(data.documents ?? []);
      setConsolidation(data.consolidation ?? null);
      if (data.requirements) {
        onRequirementsChange(data.requirements, { revision: data.revision });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "合并失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-black/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">多文档合并</h3>
          <p className="text-xs text-zinc-500">
            {docs.length} 份源文件
            {consolidation
              ? ` · 冲突 ${consolidation.conflicts.length} · 保留 ${consolidation.keptItemCount} 条`
              : null}
          </p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void reconsolidate()}
            className="rounded-lg border border-sky-800 px-3 py-1.5 text-xs text-sky-300 disabled:opacity-40"
          >
            重新合并
          </button>
        ) : null}
      </div>

      <ul className="space-y-1 text-xs text-zinc-400">
        {docs.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center gap-2 border-b border-zinc-900 py-1.5">
            <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-300">
              {DOC_TYPE_LABEL[d.docType]}
            </span>
            <span className="text-zinc-200">{d.fileName}</span>
            <span className="font-mono text-zinc-600">prio {d.priority}</span>
          </li>
        ))}
      </ul>

      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-3">
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300"
            value={docType}
            onChange={(e) => setDocType(e.target.value as IntakeDocumentType)}
          >
            {(Object.keys(DOC_TYPE_LABEL) as IntakeDocumentType[]).map((k) => (
              <option key={k} value={k}>
                {DOC_TYPE_LABEL[k]}
              </option>
            ))}
          </select>
          <label className="cursor-pointer rounded-lg border border-dashed border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:border-sky-600">
            {busy ? "处理中…" : "追加 PDF / DOCX"}
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void addFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      ) : null}

      {consolidation && consolidation.conflicts.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-amber-300">跨文档冲突 / 去重</p>
          <ul className="max-h-40 space-y-1 overflow-y-auto text-[11px] text-zinc-500">
            {consolidation.conflicts.slice(0, 20).map((c) => (
              <li key={c.id} className="border-l border-amber-900/60 pl-2">
                <span className="text-amber-200/80">{c.kind}</span> · {c.message}
                <span className="ml-1 text-zinc-600">({c.resolution})</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </section>
  );
}
