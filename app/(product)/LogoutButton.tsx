"use client";

import { useState } from "react";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const logout = async () => {
    if (pending) return;
    setPending(true);
    setFailed(false);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("LOGOUT_FAILED");
      window.location.assign("/login");
    } catch {
      setFailed(true);
      setPending(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          void logout();
        }}
        disabled={pending}
        className="text-zinc-300 underline-offset-2 hover:text-white hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "退出中…" : "退出"}
      </button>
      {failed ? <span className="text-rose-400">退出失败，请重试</span> : null}
    </span>
  );
}
