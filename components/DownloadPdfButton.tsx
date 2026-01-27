"use client";

import React from "react";

type Props = {
  planId: string;
  mode?: "full" | "preview";
  className?: string;
  children?: React.ReactNode;
};

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function mapErrorMessage(payload: any, fallback: string) {
  const code = payload?.code || payload?.error || payload?.reason;

  if (code === "TOKEN_REQUIRED") return "需要先验证后才能下载（请先获取下载凭证）";
  if (code === "TOKEN_INVALID") return payload?.message || "下载凭证无效或已过期，请重新获取";
  if (code === "TOKEN_PLAN_MISMATCH") return "下载凭证与当前方案不匹配";
  if (code === "LOGIN_REQUIRED") return "需要登录后才能下载";
  if (code === "PAYMENT_REQUIRED") return "需要支付后才能下载完整版";
  if (code === "PLAN_ID_REQUIRED" || code === "PLANID_REQUIRED") return "缺少 planId";
  if (code === "TOKEN_CREATE_FAILED") return "生成下载凭证失败，请稍后重试";

  return payload?.message || payload?.msg || fallback;
}

export default function DownloadPdfButton({
  planId,
  mode = "full",
  className,
  children,
}: Props) {
  const [loading, setLoading] = React.useState(false);

  const onClick = async () => {
    if (!planId) {
      alert("缺少 planId，无法下载");
      return;
    }

    setLoading(true);
    try {
      // 1) 获取 token
      const r = await fetch(`/api/download-token?planId=${encodeURIComponent(planId)}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await r.json().catch(() => ({}));

      if (r.status === 401 && (data?.error === "login_required" || data?.code === "LOGIN_REQUIRED")) {
        // ✅ 记住要回到哪里（result + planId）
        const returnTo = `/result?planId=${encodeURIComponent(planId)}`;
        window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
        return;
      }

      if (!r.ok) {
        alert(data?.msg || data?.message || "获取下载链接失败");
        return;
      }

      const token = data.token;
      if (!token) {
        alert("后端未返回 token（download-token 接口异常）");
        return;
      }

      // 2) 打开下载链接
      const url = `/api/pdf?planId=${encodeURIComponent(planId)}&mode=${encodeURIComponent(
        mode
      )}&downloadToken=${encodeURIComponent(token)}`;

      // 用 window.open 能触发浏览器下载（并且不会被 fetch 的 CORS/流处理卡住）
      window.open(url, "_blank");
    } catch (err) {
      // ✅ 不写 catch (err: any)，避免你之前 Next/SWC 解析报错
      const msg =
        err instanceof Error ? err.message : "下载失败，请稍后重试";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={className}
      type="button"
    >
      {loading ? "生成下载链接..." : children ?? "下载 PDF"}
    </button>
  );
}

