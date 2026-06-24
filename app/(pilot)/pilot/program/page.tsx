"use client";

import { useEffect, useState } from "react";

type ProgramReport = {
  organizations: { organizationId: string; name: string; status: string }[];
  users: { userId: string; email?: string; status: string }[];
  projects: { projectId: string; name?: string; status: string }[];
  activeOrganizations: number;
};

export default function PilotProgramPage() {
  const [report, setReport] = useState<ProgramReport | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  const load = async () => {
    const res = await fetch("/api/pilot/program");
    const data = await res.json();
    if (data.ok) setReport(data.report);
  };

  useEffect(() => {
    void load();
  }, []);

  const enroll = async () => {
    setEnrolling(true);
    await fetch("/api/pilot/program/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enroll" }),
    });
    await load();
    setEnrolling(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pilot Program</h2>
        <button
          type="button"
          onClick={() => void enroll()}
          disabled={enrolling}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {enrolling ? "登记中…" : "登记当前组织为试点"}
        </button>
      </div>

      {report ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Roster title="Organizations" count={report.activeOrganizations} items={report.organizations.map((o) => o.name)} />
          <Roster title="Users" count={report.users.length} items={report.users.map((u) => u.email ?? u.userId)} />
          <Roster title="Projects" count={report.projects.length} items={report.projects.map((p) => p.name ?? p.projectId)} />
        </div>
      ) : (
        <p className="text-zinc-400">加载中…</p>
      )}
    </div>
  );
}

function Roster({ title, count, items }: { title: string; count: number; items: string[] }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/40 p-4">
      <h3 className="font-medium">
        {title} <span className="text-zinc-500">({count})</span>
      </h3>
      <ul className="mt-2 space-y-1 text-sm text-zinc-400">
        {items.length === 0 ? <li>暂无</li> : items.slice(0, 8).map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}
