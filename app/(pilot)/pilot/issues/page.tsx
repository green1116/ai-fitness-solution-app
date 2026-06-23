"use client";

import { useEffect, useState } from "react";

type Issue = {
  id: string;
  title: string;
  severity: string;
  status: string;
  description: string;
};

export default function PilotIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");

  const load = async () => {
    const res = await fetch("/api/pilot/issues");
    const data = await res.json();
    if (data.ok) setIssues(data.report.issues);
  };

  useEffect(() => {
    void load();
  }, []);

  const report = async () => {
    if (!title.trim() || !description.trim()) return;
    await fetch("/api/pilot/issues/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, severity }),
    });
    setTitle("");
    setDescription("");
    await load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Issue Triage</h2>
      <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="问题标题"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="问题描述"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm min-h-[80px]"
        />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        >
          {["blocker", "high", "medium", "low"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => void report()} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium">
          上报问题
        </button>
      </div>
      <ul className="space-y-2">
        {issues.map((i) => (
          <li key={i.id} className="rounded-lg border border-zinc-800 bg-black/30 p-3 text-sm">
            <span className="font-medium">{i.title}</span>
            <span className="ml-2 text-amber-500">{i.severity}</span>
            <span className="ml-2 text-zinc-500">{i.status}</span>
            <p className="mt-1 text-zinc-400">{i.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
