"use client";

import React, { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  proposalNo: string;
  orderNo?: string;
  plan?: any;
  planId: string;
  mode: "full" | "budget";
  onPay?: () => void;
  onVerified?: (downloadToken: string) => void;
};

export default function VerifyGateModal({
  open,
  onClose,
  proposalNo,
  orderNo,
  plan,
  planId,
  mode,
  onPay,
  onVerified,
}: Props) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [downloadToken, setDownloadToken] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const canSend = cooldown <= 0 && !!email.trim();

  useEffect(() => {
    if (!open) return;
    setCode("");
    setDownloadToken(null);
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  if (!open) return null;

  async function sendCode() {
    if (!canSend) return;

    setSending(true);
    try {
      const res = await fetch("/api/auth/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          mode,
          planId,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body?.error || body?.msg || "send_failed");
      }

      setCooldown(60);
      alert("验证码已发送，请检查收件箱和垃圾邮件文件夹。验证码 10 分钟内有效。");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert("发送失败：" + message);
    } finally {
      setSending(false);
    }
  }

  async function verifyCode() {
    if (!email.trim() || !code.trim()) return;

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          mode,
          planId,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body?.message || body?.error || "verify_failed");
      }

      const token = body.downloadToken;
      setDownloadToken(token);
      onVerified?.(token);
      alert("验证成功，现在可以下载完整版 PDF。");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert("验证失败：" + message);
    } finally {
      setVerifying(false);
    }
  }

  async function downloadPdf() {
    setDownloading(true);
    try {
      const proposalNoValue = proposalNo || "attaguy-plan";

      if (!plan) {
        alert("缺少 plan 数据，无法生成 PDF。");
        return;
      }

      const pdfRes = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalNo: proposalNoValue, plan }),
      });

      if (pdfRes.status === 402) {
        const body = await pdfRes.json().catch(() => ({}));
        alert(body?.msg || "需要先完成验证或支付。");
        return;
      }

      if (!pdfRes.ok) {
        const t = await pdfRes.text();
        console.error("[VerifyGateModal] 生成失败", t);
        return;
      }

      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${proposalNoValue}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("[VerifyGateModal] 下载失败", message, e);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.title}>需要验证</div>
        <div style={styles.desc}>下载完整版 PDF 前，请先完成支付或邮箱验证。</div>

        <button
          style={styles.payBtn}
          onClick={() => (onPay ? onPay() : alert("请先接入支付跳转。"))}
        >
          前往支付（￥499）
        </button>

        <div style={{ height: 16 }} />

        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="输入邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button style={styles.smallBtn} onClick={sendCode} disabled={!canSend || sending}>
            {cooldown > 0 ? `已发送（${cooldown}s）` : sending ? "发送中..." : "获取验证码"}
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div style={styles.row}>
          <input
            style={{ ...styles.input, color: "#111", caretColor: "#111", background: "#fff" }}
            placeholder="输入邮箱验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            style={styles.smallBtn}
            onClick={verifyCode}
            disabled={!email.trim() || !code.trim() || verifying}
          >
            {verifying ? "验证中..." : "验证"}
          </button>
        </div>

        <div style={{ height: 16 }} />

        <button
          style={{
            ...styles.downloadBtn,
            opacity: downloadToken || orderNo ? 1 : 0.6,
          }}
          onClick={downloadPdf}
          disabled={downloading}
        >
          {downloading ? "下载中..." : "下载完整版 PDF"}
        </button>

        <div style={{ height: 10 }} />

        <button style={styles.cancel} onClick={onClose}>
          取消
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: 640,
    maxWidth: "92vw",
    background: "#fff",
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  title: { fontSize: 22, fontWeight: 800, marginBottom: 6 },
  desc: { color: "#555", marginBottom: 18 },
  row: { display: "flex", gap: 10 },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    border: "1px solid #ddd",
    padding: "0 12px",
    outline: "none",
  },
  payBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  smallBtn: {
    width: 140,
    height: 44,
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fafafa",
    cursor: "pointer",
    fontWeight: 700,
  },
  downloadBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "none",
    background: "#0b63ff",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  cancel: {
    width: "100%",
    height: 40,
    borderRadius: 10,
    border: "none",
    background: "transparent",
    color: "#666",
    cursor: "pointer",
  },
};