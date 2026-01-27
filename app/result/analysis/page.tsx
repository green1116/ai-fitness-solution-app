"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VerifyGateModal from "../VerifyGateModal";

// ============================================
// /result 页面完整前端 HTML + CSS
// ============================================
export default function ResultAnalysisPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const resultId = sp.get("id") || "123"; // 从 URL 参数获取 result ID

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // 从 URL 参数或数据中获取 proposalNo 和 orderNo
  const proposalNo = sp.get("proposalNo") || data?.meta?.proposalNo || "attaguy-plan";
  const orderNo = sp.get("orderNo") || data?.orderNo || "";

  // 加载结果数据
  useEffect(() => {
    async function loadData() {
      try {
        // TODO: 替换为真实 API，例如 /api/result/:id
        const res = await fetch(`/api/result/${resultId}`);
        if (!res.ok) {
          // 如果 API 失败，使用示例数据
          const sample = {
            summary: "基于当前信息，项目存在显著机会，但推进路径风险高。建议先验证核心假设，避免前期大规模投入。",
            dims: [
              "目标清晰度：目标偏模糊，需要把\"想做的事\"拆成可验证假设。",
              "资源匹配：当前资源适合小范围验证，不适合全面铺开。",
              "路径可逆性：当前路径回撤成本高，需要保留回退方案。",
              "市场不确定性：真实用户反馈尚未采集。",
            ],
            risks: [
              "过早锁定一条未经验证的路径，导致执行后难以回撤。",
              "把技术难题等同于验证问题，忽略商业必要性。",
              "关键数据指标尚未明确，容易在后期出现偏差。",
            ],
            actions: [
              "明确当前最需要验证的一个核心假设，并设计小规模测试。",
              "延迟不可逆成本，采用快速迭代获取真实数据。",
              "制定 2 周内的反馈窗口，确保早期结论及时校正。",
            ],
          };
          setData(sample);
          return;
        }
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        console.error("加载结果失败:", err);
        // 使用示例数据作为 fallback
        const sample = {
          summary: "基于当前信息，项目存在显著机会，但推进路径风险高。建议先验证核心假设，避免前期大规模投入。",
          dims: [
            "目标清晰度：目标偏模糊，需要把\"想做的事\"拆成可验证假设。",
            "资源匹配：当前资源适合小范围验证，不适合全面铺开。",
            "路径可逆性：当前路径回撤成本高，需要保留回退方案。",
            "市场不确定性：真实用户反馈尚未采集。",
          ],
          risks: [
            "过早锁定一条未经验证的路径，导致执行后难以回撤。",
            "把技术难题等同于验证问题，忽略商业必要性。",
            "关键数据指标尚未明确，容易在后期出现偏差。",
          ],
          actions: [
            "明确当前最需要验证的一个核心假设，并设计小规模测试。",
            "延迟不可逆成本，采用快速迭代获取真实数据。",
            "制定 2 周内的反馈窗口，确保早期结论及时校正。",
          ],
        };
        setData(sample);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resultId]);

  // 创建订单并跳转到补充信息页
  async function handleBuyClick() {
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 49900 }),
      });

      if (!res.ok) throw new Error("创建订单失败");
      const body = await res.json();

      // 显示支付说明
      alert("请按页面提示支付：" + JSON.stringify(body.pay_instructions));

      // 跳转到补充信息页
      router.push(`/deep-form?order_no=${body.order_no}`);
    } catch (err: any) {
      alert(err?.message || "创建订单失败");
    }
  }

  // 下载报告 - 打开验证 Modal
  function handleDownloadClick() {
    setModalOpen(true);
  }

  // 人工咨询
  function handleContactClick() {
    alert("人工咨询功能：请联系客服或填写表单");
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <p>加载中……</p>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        :root {
          font-family: Inter, system-ui, "Segoe UI", Arial, sans-serif;
          color: #222;
        }
        body {
          margin: 0;
          background: #f5f6f8;
          padding: 24px;
        }
        .container {
          max-width: 920px;
          margin: 20px auto;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 6px 22px rgba(12, 20, 30, 0.06);
          overflow: hidden;
        }
        header {
          padding: 28px 32px;
          border-bottom: 1px solid #eef0f3;
          background: linear-gradient(90deg, #fbfcfd, #ffffff);
        }
        .title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 6px;
        }
        .sub {
          color: #6b7280;
          font-size: 13px;
          margin: 0;
        }
        .summary {
          padding: 22px 32px;
          background: #f7fbff;
          border-left: 4px solid #2b7cff;
        }
        .summary h2 {
          margin: 0;
          font-size: 16px;
        }
        .summary p {
          margin: 8px 0 0;
          color: #1f2937;
          font-size: 15px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 18px;
          padding: 20px 32px;
        }
        .card {
          background: #fff;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #eef2f6;
        }
        .card h3 {
          margin: 0;
          font-size: 15px;
        }
        .list {
          margin: 8px 0 0;
          padding-left: 18px;
          color: #344054;
        }
        .list li {
          margin: 8px 0;
        }
        .risk {
          background: #fff5f5;
          border-left: 4px solid #ff6b6b;
        }
        .cta {
          padding: 20px 32px;
          border-top: 1px solid #eef0f3;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn {
          background: #0b63ff;
          color: #fff;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
        .btn:hover {
          background: #0954d6;
        }
        .muted {
          color: #6b7280;
          font-size: 13px;
        }
        .small-note {
          font-size: 13px;
          color: #475569;
          margin-top: 6px;
        }
        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
            padding: 16px;
          }
          .container {
            margin: 8px;
          }
          .cta {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="container" id="app">
        <header>
          <div className="title">AI 判断咨询报告</div>
          <div className="sub">
            基于你提交的背景与资源，AI 给出结构化判断——可用于决策是否继续投入
          </div>
        </header>

        <section className="summary">
          <h2>AI 综合判断结论（Executive Summary）</h2>
          <p id="summary">{data?.summary || "加载中……"}</p>
        </section>

        <div className="grid">
          <div>
            <div className="card">
              <h3>关键判断维度（AI 的思考逻辑）</h3>
              <ol className="list" id="dims">
                {data?.dims?.map((dim: string, i: number) => (
                  <li key={i}>{dim}</li>
                )) || <li>暂无数据</li>}
              </ol>
            </div>

            <div className="card risk" style={{ marginTop: 12 }}>
              <h3>识别出的关键风险与盲区</h3>
              <ul className="list" id="risks">
                {data?.risks?.map((risk: string, i: number) => (
                  <li key={i}>{risk}</li>
                )) || <li>暂无风险提示</li>}
              </ul>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <h3>当前阶段可执行建议（免费）</h3>
              <ul className="list" id="actions">
                {data?.actions?.map((action: string, i: number) => (
                  <li key={i}>{action}</li>
                )) || <li>暂无建议</li>}
              </ul>
            </div>
          </div>

          <aside>
            <div className="card">
              <h3>下一步建议</h3>
              <p className="small-note">
                若需得到针对你情况的完整判断报告（含风险拆解、替代路径与结论），请购买「深化判断方案」。
              </p>
              <div style={{ marginTop: 12 }}>
                <button className="btn" id="buyBtn" onClick={handleBuyClick}>
                  获取深化判断方案（¥499）
                </button>
                <p className="muted" style={{ marginTop: 10 }}>
                  支付后将引导你填写 10 个关键问题，48小时内交付报告（人工+AI).
                </p>
              </div>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <h3>常见 Q&A</h3>
              <p className="small-note">
                本判断不包含代码交付和执行建议。若需后续执行咨询，请在报告内选择跟进服务。
              </p>
            </div>
          </aside>
        </div>

        <div className="cta">
          <div className="muted">
            报告由 AI + 专家复核生成。报告仅供决策参考。
          </div>
          <div>
            <button
              className="btn"
              id="downloadBtn"
              onClick={handleDownloadClick}
              style={{ marginRight: 8 }}
            >
              下载报告（示例）
            </button>
            <button
              className="btn"
              id="contactBtn"
              onClick={handleContactClick}
              style={{ background: "#0f1724" }}
            >
              人工咨询
            </button>
          </div>
        </div>
      </div>

      <VerifyGateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        proposalNo={proposalNo}
        orderNo={orderNo || undefined}
        plan={data}
        onPay={() => router.push("/pay")}
        onVerified={(emailToken: string) => {
          const { maskToken } = require("@/lib/mask");
          console.log("邮箱验证成功，token:", maskToken(emailToken));
        }}
      />
    </>
  );
}
