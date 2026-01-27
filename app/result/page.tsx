"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DownloadPdfButton from "@/components/DownloadPdfButton";

// /result：网页版咨询交付件（Web Proposal）
// PDF：对外、可转发、正式交付
// /result：在线讨论、二次修改、转化入口

// 规范化 plan
function normalizePlan(plan: any) {
  if (!plan) return plan;
  return {
    ...plan,
    clientProfile: plan.clientProfile ?? {
      companySize: plan.client_profile?.company_size,
      area: plan.client_profile?.space_area,
      scenario: plan.client_profile?.scene,
      budget: plan.client_profile?.budget_range,
    }
  };
}

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<any>(null);
  const [showPayOrVerifyModal, setShowPayOrVerifyModal] = useState(false);
  const [authError, setAuthError] = useState<any>(null);
  const [emailToken, setEmailToken] = useState("");
  const [orderNo, setOrderNo] = useState("");
  
  // 邮箱验证相关状态
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // 从 localStorage 读取 plan.json（唯一事实源）
    // 数据流向：表单 → LLM → plan.json → localStorage → result 页面
    const raw = localStorage.getItem("attaguy_plan");
    if (!raw) {
      router.push("/plan");
      return;
    }
    const planData = JSON.parse(raw);
    setPlan(planData);
    
    // 从 URL 参数或 plan 数据中获取 orderNo 和 emailToken
    const urlOrderNo = searchParams.get("orderNo") || "";
    const urlEmailToken = searchParams.get("emailToken") || "";
    setOrderNo(urlOrderNo || planData.orderNo || "");
    setEmailToken(urlEmailToken || planData.emailToken || "");
  }, [router, searchParams]);

  // 检查登录状态
  async function isLoggedIn() {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json();
    return !!data?.email;
  }

  // 打开验证码弹窗
  function openVerifyModal() {
    setShowPayOrVerifyModal(true);
  }

  // 请求 OTP 验证码
  async function requestOtp(email: string) {
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) alert("发送失败，请检查邮箱或稍后再试");
    else alert("验证码已发送，请查收邮箱");
  }

  // 关闭验证码弹窗
  function closeVerifyModal() {
    setShowPayOrVerifyModal(false);
  }

  // 验证 OTP 并下载 PDF
  async function verifyOtpAndDownload(email: string, code: string, planId: string) {
    try {
      const r = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, planId }),
      });
      const data = await r.json();

      if (!r.ok) throw new Error(data?.message || "验证失败");

      const downloadToken = data?.downloadToken;
      if (!downloadToken) throw new Error("后端未返回 downloadToken");

      // ✅ 成功：使用 downloadToken 下载 PDF
      const pdfUrl = `/api/pdf?planId=${encodeURIComponent(planId)}&downloadToken=${encodeURIComponent(downloadToken)}`;
      window.open(pdfUrl, "_blank");

      closeVerifyModal();
    } catch (e: any) {
      alert(e?.message || "验证失败，请稍后重试");
    }
  }

  // 请求方案深化
  async function requestDeepen(planId: string) {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        intent: "深化方案",
        payload: {
          modules: ["材料", "康复", "布局"],
        },
      }),
    });

    // TODO: 临时关闭登录校验（开发调试）
    // if (res.status === 402) {
    //   openVerifyModal();
    //   return;
    // }

    // 然后弹你现在的提示框（图3）
    alert("联系顾问进行方案深化：材料选型 / 康复模块 / 布局优化");
  }

  // 新的下载 PDF 函数（使用新的认证流程）
  async function downloadPdfWithAuth(planId: string) {
    // 从 localStorage 获取 plan 数据作为 fallback
    const raw = localStorage.getItem("attaguy_plan");
    const planData = raw ? JSON.parse(raw) : null;
    
    const res = await fetch(`/api/pdf?planId=${encodeURIComponent(planId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planData, planId }),
    });

    // TODO: 临时关闭登录校验（开发调试）
    // if (res.status === 402) {
    //   // 未登录 → 打开验证码弹窗
    //   openVerifyModal();
    //   return;
    // }

    if (!res.ok) {
      let errorData: any = {};
      try {
        const errorText = await res.text();
        if (errorText) {
          errorData = JSON.parse(errorText);
        }
      } catch (e) {
        // 忽略解析错误
      }
      console.error("[Download] PDF 下载失败:", { status: res.status, statusText: res.statusText, error: errorData });
      alert(`下载失败: ${errorData.error || errorData.msg || res.statusText || "请稍后重试"} (状态码: ${res.status})`);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${planId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  async function downloadPdf() {
    const normalized = normalizePlan(plan);
    const planId = normalized?.meta?.plan_id || normalized?.meta?.proposalNo || "";
    if (!planId) {
      alert("错误：无法获取方案 ID，请重新生成方案");
      return;
    }
    await downloadPdfWithAuth(planId);
  }

  // 1) 请求发送验证码
  async function handleSendCode() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("请输入有效的邮箱地址");
      return;
    }

    setSendingCode(true);
    try {
      const res = await fetch("/api/auth/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "发送验证码失败");
      }

      setCodeSent(true);
      // 60秒倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      alert("验证码已发送，请查收邮箱（可能需要几分钟才能送达，请检查收件箱和垃圾邮件文件夹，10分钟内有效）");
    } catch (err: any) {
      alert(err?.message || "发送验证码失败，请稍后重试");
    } finally {
      setSendingCode(false);
    }
  }

  // 2) 验证验证码并重新触发下载
  async function handleVerifyCode() {
    if (!email || !code) {
      alert("请输入邮箱和验证码");
      return;
    }

    // 获取 planId
    const normalized = normalizePlan(plan);
    const planId = normalized?.meta?.plan_id || normalized?.meta?.proposalNo || "";
    
    if (!planId) {
      alert("错误：无法获取方案 ID，请重新生成方案");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, planId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        // 提供更详细的错误信息
        const errorMsg = data.msg || data.error || "验证码错误或已过期";
        console.error("[Verify] 验证失败:", { status: res.status, data });
        throw new Error(errorMsg);
      }

      // 验证成功：关闭弹窗
      setShowPayOrVerifyModal(false);
      
      if (data.downloadToken) {
        const url =
          `/api/pdf?planId=${encodeURIComponent(planId)}` +
          `&downloadToken=${encodeURIComponent(data.downloadToken)}` +
          `&mode=full`;

        const a = document.createElement("a");
        a.href = url;
        a.download = `${planId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        await downloadPdf();
      }
    } catch (err: any) {
      alert(err?.message || "验证失败，请检查验证码是否正确");
    } finally {
      setVerifying(false);
    }
  }

  function handlePay() {
    // TODO: 跳转到支付页面
    router.push(`/deep-form?order_no=${orderNo || "NEW"}`);
  }

  if (!plan) return null;

  // 规范化 plan 数据
  const normalizedPlan = normalizePlan(plan);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }} className="text-white/80">
      {/* 1. 标题区（方案名称 + 客户关键信息） */}
      <section>
        <h1>企业健身空间解决方案</h1>
        <p>
          公司规模: {normalizedPlan.clientProfile?.companySize ?? "—"} 人 |
          面积: {normalizedPlan.clientProfile?.area ?? "—"} m² |
          预算: {normalizedPlan.clientProfile?.budget ?? "—"}
        </p>
      </section>

      {/* 2. 管理层结论（summary） */}
      <section>
        <h2>管理层结论</h2>
        <ul>
          {(normalizedPlan.summary || []).map((s: string, i: number) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>

      {/* 客户概况 */}
      <section>
        <h2>客户概况</h2>
        <p>公司规模：{normalizedPlan.clientProfile?.companySize ?? "—"} 人</p>
        <p>面积：{normalizedPlan.clientProfile?.area ?? "—"} m²</p>
        <p>场景：{normalizedPlan.clientProfile?.scenario ?? "—"}</p>
        <p>预算：{normalizedPlan.clientProfile?.budget ?? "—"}</p>
      </section>

      {/* 4. 空间布局建议（layoutPlan） */}
      <section>
        <h2>空间布局建议</h2>
        <ul>
          {(normalizedPlan.layoutPlan?.zones || []).map((z: any, i: number) => (
            <li key={i}>
              {z.name}（{z.ratio}）：{z.reason}
            </li>
          ))}
        </ul>
        <p>动线：{normalizedPlan.layoutPlan?.flow || "待规划"}</p>
      </section>

      {/* 5. 设备清单（equipmentList） */}
      <section>
        <h2>设备清单</h2>
        <table>
          <thead>
            <tr>
              <th>分类</th>
              <th>设备</th>
              <th>数量</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            {(normalizedPlan.equipmentList || []).map((e: any, i: number) => (
              <tr key={i}>
                <td>{e.category || "-"}</td>
                <td>{e.name || "-"}</td>
                <td>{e.qty || e.count || "-"}</td>
                <td>{e.reason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 6. 实施流程（implementationSteps） */}
      <section>
        <h2>实施流程</h2>
        {(normalizedPlan.implementationSteps || []).map((p: any, i: number) => {
          // 兼容字符串格式和对象格式
          if (typeof p === 'string') {
            return <div key={i}><strong>{p}</strong></div>;
          }
          return (
            <div key={i}>
              <strong>{p.phase}｜{p.title}（{p.duration}）</strong>
              <ul>
                {(p.items || []).map((it: string, j: number) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* 7. 服务与升级选项（upsellHints） */}
      <section>
        <h2>服务与升级选项</h2>
        <ul>
          {(normalizedPlan.upsellHints || []).map((u: string, i: number) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </section>

      {/* 8. 行动区（转化核心，必须有） */}
      <section style={{ marginTop: 48, padding: "24px", backgroundColor: "#f9f9f9", borderRadius: "12px", border: "1px solid #e0e0e0" }} className="text-gray-900">
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, fontWeight: 600, color: "#000" }}>下一步行动</h3>
        <p style={{ marginBottom: 20, color: "#666", fontSize: 14 }}>
          以下是您可以立即进行的操作：
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <DownloadPdfButton
            planId={normalizedPlan?.meta?.plan_id || normalizedPlan?.meta?.proposalNo || searchParams.get("planId") || "attaguy-plan"}
            mode="full"
            className="px-4 py-2 rounded bg-black text-white"
          >
            下载完整版 PDF
          </DownloadPdfButton>
          <button
            onClick={() => {
              // TODO: 跳转到深化方案页面或联系顾问
              alert("联系顾问进行方案深化：材料选型 / 康复模块 / 布局优化");
            }}
            style={{
              flex: 1,
              minWidth: 200,
              padding: "14px 24px",
              backgroundColor: "#fff",
              color: "#000",
              border: "1px solid #000",
              borderRadius: "8px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            深化方案（材料 / 康复 / 布局）
          </button>
        </div>
      </section>

      {/* 支付/验证弹窗 */}
      {showPayOrVerifyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowPayOrVerifyModal(false)}
        >
          <div
            className="w-[520px] rounded-2xl bg-white text-gray-900 shadow-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              需要验证
            </h3>
            <p className="mb-6 text-gray-600 text-sm">
              {authError?.msg || "下载完整版 PDF 需要先支付或完成邮箱验证"}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={handlePay}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                前往支付（¥499）
              </button>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  邮箱地址
                </label>
                <input
                  type="email"
                  placeholder="your@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={codeSent}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: 14,
                    marginBottom: 12,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="text"
                  placeholder="输入6位验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={!codeSent}
                  maxLength={6}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    color: "#111",
                    caretColor: "#111",
                    background: "#fff",
                    borderRadius: "6px",
                    fontSize: 14,
                    textAlign: "center",
                    letterSpacing: "4px",
                    fontFamily: "monospace",
                  }}
                />
                <button
                  onClick={handleSendCode}
                  disabled={sendingCode || countdown > 0 || !email}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: countdown > 0 ? "#ccc" : "#f5f5f5",
                    color: countdown > 0 ? "#666" : "#000",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: (sendingCode || countdown > 0 || !email) ? "not-allowed" : "pointer",
                    minWidth: 100,
                  }}
                >
                  {sendingCode ? "发送中..." : countdown > 0 ? `${countdown}秒` : "获取验证码"}
                </button>
              </div>

              {codeSent && (
                <button
                  onClick={handleVerifyCode}
                  disabled={verifying || code.length !== 6}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: (verifying || code.length !== 6) ? "#ccc" : "#000",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: (verifying || code.length !== 6) ? "not-allowed" : "pointer",
                    width: "100%",
                  }}
                >
                  {verifying ? "验证中..." : "验证并下载 PDF"}
                </button>
              )}

              <button
                onClick={() => setShowPayOrVerifyModal(false)}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "none",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
