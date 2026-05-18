"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  onSessionChange?: () => void;
};

export default function AccountAuthBar(props: Props) {
  const { onSessionChange } = props;
  const { user, loading, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const showMockControls =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === "1";

  const notify = useCallback(() => {
    onSessionChange?.();
  }, [onSessionChange]);

  const loginMock = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/mock-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(j.message || "登录失败");
      }
      await refresh();
      notify();
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      await refresh();
      notify();
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-zinc-400">
        账号会话加载中…
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-950/25 px-3 py-2 text-xs text-emerald-100">
        <span>
          已登录：<span className="font-mono text-emerald-50">{user.email}</span>
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={() => void logout()}
          className="rounded-lg border border-white/15 px-2 py-1 text-[11px] text-white/85 hover:bg-white/10 disabled:opacity-50"
        >
          退出
        </button>
      </div>
    );
  }

  if (!showMockControls) {
    return (
      <div className="rounded-xl border border-amber-400/25 bg-amber-950/20 px-3 py-2 text-xs text-amber-100/90">
        购买前请先登录（正式 OAuth / 邮箱登录接入后将在此展示）。
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-zinc-200">
      <div className="font-medium text-white/85">账号（mock 邮箱登录）</div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="min-w-[200px] flex-1 rounded-lg border border-zinc-500 bg-white px-2 py-1.5 text-sm text-black placeholder:text-zinc-500"
        />
        <button
          type="button"
          disabled={busy || !email.trim()}
          onClick={() => void loginMock()}
          className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-400 disabled:opacity-50"
        >
          {busy ? "登录中…" : "登录"}
        </button>
      </div>
      <p className="text-[11px] leading-snug text-zinc-500">
        正式环境可关闭 mock：勿设置 NEXT_PUBLIC_ENABLE_MOCK_AUTH，并接入真实登录提供商。
      </p>
    </div>
  );
}
