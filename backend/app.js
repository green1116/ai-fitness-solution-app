require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime');

const OpenAI = require('openai');
const stripeLib = require('stripe');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');

const PORT = Number(process.env.PORT || 3000);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change_me';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 45000);
const OPENAI_MAX_TOKENS = Number(process.env.OPENAI_MAX_TOKENS || 1400);
const OPENAI_TEMPERATURE = Number(process.env.OPENAI_TEMPERATURE || 0.2);
const OPENAI_RETRIES = Number(process.env.OPENAI_RETRIES || 2);

const PDF_FORMAT = process.env.PDF_FORMAT || 'A4';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const stripe = STRIPE_SECRET_KEY ? stripeLib(STRIPE_SECRET_KEY) : null;

// ---- Notification env ----
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER || '';
const MAIL_TO_OPS = process.env.MAIL_TO_OPS || ''; // 运营/你自己的邮箱

const WECOM_WEBHOOK_URL = process.env.WECOM_WEBHOOK_URL || '';
const FEISHU_WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL || '';

const app = express();
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---- DB (SQLite MVP) ----
const db = new Database('mvp.db');

db.prepare(`
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'CNY',
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME NULL,
  pay_meta TEXT NULL
)`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_no TEXT UNIQUE NOT NULL,
  order_no TEXT NULL,
  answers TEXT NOT NULL,
  status TEXT DEFAULT 'waiting',
  result_url TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();

// ---- OpenAI client ----
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// ---- Helpers ----
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || '';
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' });
  next();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, (m) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

// ---- Notification helpers ----
let mailTransporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  try {
    mailTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  } catch (err) {
    console.warn('Failed to create mail transporter:', err.message);
  }
}

async function sendWebhook(platform, title, content) {
  const url = platform === 'wecom' ? WECOM_WEBHOOK_URL : FEISHU_WEBHOOK_URL;
  if (!url) return;

  try {
    // Use built-in fetch (Node.js 18+)
    if (platform === 'wecom') {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msgtype: 'text',
          text: { content: `${title}\n${content}` }
        })
      });
    } else if (platform === 'feishu') {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msg_type: 'text',
          content: { text: `${title}\n${content}` }
        })
      });
    }
  } catch (err) {
    console.error(`Send ${platform} webhook error:`, err.message);
  }
}

async function notifyOps(event, data) {
  const title = `[AI Judgment] ${event}`;
  const content = JSON.stringify(data, null, 2);
  
  // Email to ops
  if (MAIL_TO_OPS) {
    await sendEmail({ to: MAIL_TO_OPS, subject: title, text: content });
  }
  
  // Webhook notifications
  if (WECOM_WEBHOOK_URL) {
    await sendWebhook('wecom', title, content);
  }
  if (FEISHU_WEBHOOK_URL) {
    await sendWebhook('feishu', title, content);
  }
}

// ---- 通知工具函数 ----
function maskJson(obj) {
  // 避免把敏感信息（比如电话、地址）直接推到群里
  // 这里只做最小处理：截断长字段
  const clone = JSON.parse(JSON.stringify(obj || {}));
  for (const k of Object.keys(clone)) {
    const v = clone[k];
    if (typeof v === 'string' && v.length > 180) clone[k] = v.slice(0, 180) + '...';
  }
  return clone;
}

function getMailer() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

async function sendEmail({ to, subject, text, html }) {
  const mailer = getMailer();
  if (!mailer) return { skipped: true, reason: 'SMTP not configured' };
  const info = await mailer.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    text,
    html
  });
  return { ok: true, messageId: info.messageId };
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Webhook failed (${res.status}): ${body}`);
  return { ok: true };
}

async function notifyWebhooks({ title, lines }) {
  const text = [title, ...lines].join('\n');

  // 企业微信：text 消息
  if (WECOM_WEBHOOK_URL) {
    await postJson(WECOM_WEBHOOK_URL, {
      msgtype: 'text',
      text: { content: text }
    });
  }

  // 飞书：text 消息（简单版）
  if (FEISHU_WEBHOOK_URL) {
    await postJson(FEISHU_WEBHOOK_URL, {
      msg_type: 'text',
      content: { text }
    });
  }

  return { ok: true };
}

async function notifyAll({ userEmail, opsEmail, title, lines, emailSubject, emailText, emailHtml }) {
  // 1) 邮件发给用户（如果有 userEmail）
  if (userEmail) {
    try {
      await sendEmail({
        to: userEmail,
        subject: emailSubject || title,
        text: emailText || [title, ...lines].join('\n'),
        html: emailHtml
      });
    } catch (e) {
      console.error('sendEmail user failed:', e.message);
    }
  }

  // 2) 邮件发给运营/你（如果配置了 MAIL_TO_OPS 或 opsEmail）
  const toOps = opsEmail || MAIL_TO_OPS;
  if (toOps) {
    try {
      await sendEmail({
        to: toOps,
        subject: emailSubject || title,
        text: emailText || [title, ...lines].join('\n'),
        html: emailHtml
      });
    } catch (e) {
      console.error('sendEmail ops failed:', e.message);
    }
  }

  // 3) 推送到企业微信/飞书群
  try {
    await notifyWebhooks({ title, lines });
  } catch (e) {
    console.error('notifyWebhooks failed:', e.message);
  }
}

function readPromptTemplate() {
  const p = path.join(__dirname, 'prompts', 'openai_prompt.txt');
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    const parts = content.split('USER:');
    return {
      system: parts[0].replace('SYSTEM:', '').trim(),
      userTemplate: parts[1] || ''
    };
  }
  // fallback minimal
  return {
    system: '你是资深商业咨询师 + 产品经理，擅长把用户提供的背景信息转为"结构化判断报告"。输出遵循固定格式：结论（Yes/No/Conditional）、判断依据（<=3条）、风险拆解（<=3条）、被忽略但重要的变量（<=3条）、低成本验证路径（1-3条）、下一步建议（1-3条）。语言专业但通俗，尽量短句，使用项目符号。不要编造用户没提供的具体事实或数据；如缺失请明确说明"信息不足"。',
    userTemplate: '以下是用户提交的答案（JSON）：\n{answers}\n\n请基于这些信息，生成一份判断报告，严格遵循以下结构并用中文输出：\n\n1) 最终判断结论（一句话，明确：推荐继续/不推荐/在满足X条件下继续）\n2) 判断依据（每条一句话，最多3条）\n3) 最大风险拆解（最多3个风险：为何发生 + 后果）\n4) 被忽略但很重要的变量（最多3条）\n5) 更轻量的验证路径（1-3个，2周内可完成，低成本）\n6) 下一步 1-3 条建议（保持判断者视角，不写代码细节）'
  };
}

async function callOpenAIReport(answersJson) {
  if (!openai) {
    return `（未配置 OPENAI_API_KEY，无法自动生成。请人工使用 prompts/openai_prompt.txt 在 ChatGPT 生成报告。）\n\n用户答案：\n${JSON.stringify(answersJson, null, 2)}`;
  }

  const tpl = readPromptTemplate();
  const userPrompt = tpl.userTemplate.replace('{answers}', JSON.stringify(answersJson, null, 2));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  let lastErr = null;
  for (let attempt = 0; attempt <= OPENAI_RETRIES; attempt++) {
    try {
      const resp = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: tpl.system },
          { role: 'user', content: userPrompt }
        ],
        temperature: OPENAI_TEMPERATURE,
        max_tokens: OPENAI_MAX_TOKENS
      }, { signal: controller.signal });

      const text = resp.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error('Empty model output');
      clearTimeout(timeout);
      return text;
    } catch (err) {
      lastErr = err;
      const isAbort = String(err?.name || '').toLowerCase().includes('abort');
      const isRate = String(err?.status || '').includes('429') || String(err?.message || '').includes('Rate limit');
      const isTimeout = isAbort || String(err?.message || '').toLowerCase().includes('timeout');

      if (attempt < OPENAI_RETRIES && (isRate || isTimeout)) {
        // exponential backoff
        await sleep(600 * (attempt + 1) * (attempt + 1));
        continue;
      }
      clearTimeout(timeout);
      throw err;
    }
  }
  clearTimeout(timeout);
  throw lastErr || new Error('Unknown OpenAI error');
}

// ---- API: Orders ----
app.post('/api/orders/create', async (req, res) => {
  try {
    const order_no = 'ORD-' + Date.now() + '-' + uuidv4().substring(0, 8).toUpperCase();
    const amount = 49900; // cents
    db.prepare(`INSERT INTO orders(order_no, amount, currency, status) VALUES (?,?,?,?)`)
      .run(order_no, amount, 'CNY', 'pending');

    // Notify ops: new order created
    notifyOps('新订单创建', { order_no, amount, currency: 'CNY' }).catch(console.error);

    // If Stripe is configured, create checkout session
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [{
            price_data: {
              currency: 'cny',
              product_data: {
                name: '深化判断服务'
              },
              unit_amount: 49900
            },
            quantity: 1
          }],
          success_url: `${BASE_URL}/pay-success?order_no=${order_no}`,
          cancel_url: `${BASE_URL}/pay-cancel?order_no=${order_no}`,
          metadata: { order_no }
        });

        return res.json({
          order_no,
          amount,
          currency: 'CNY',
          stripe_session_id: session.id,
          stripe_url: session.url,
          pay_method: 'stripe'
        });
      } catch (stripeErr) {
        console.error('Stripe checkout session creation failed:', stripeErr);
        // Fallback to manual payment if Stripe fails
      }
    }

    res.json({
      order_no,
      amount,
      currency: 'CNY',
      pay_instructions: 'MVP：请扫码支付（微信/支付宝），并在转账备注写订单号；支付后客服将人工确认。',
      manual_qr: '/static/sample-qrcode.png',
      pay_method: 'manual'
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: '创建订单失败', detail: err.message });
  }
});

// 管理员：确认支付
app.post('/api/orders/confirm', requireAdmin, (req, res) => {
  try {
    const { order_no } = req.body || {};
    if (!order_no) return res.status(400).json({ error: 'order_no required' });
    const row = db.prepare(`SELECT * FROM orders WHERE order_no=?`).get(order_no);
    if (!row) return res.status(404).json({ error: 'order not found' });
    db.prepare(`UPDATE orders SET status='paid', paid_at=datetime('now') WHERE order_no=?`).run(order_no);
    
    // Notify ops: payment confirmed
    notifyOps('订单支付确认', { order_no, paid_at: new Date().toISOString() }).catch(console.error);
    
    res.json({ ok: true, order_no });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ error: '确认支付失败', detail: err.message });
  }
});

// ---- API: Submissions ----
app.post('/api/submissions', async (req, res) => {
  try {
    const { order_no, email, answers } = req.body || {};
    const submission_no = 'SUB-' + Date.now();

    // 把 email 也存进 answers（MVP 简化：不改表结构）
    const answersWithMeta = { ...(answers || {}), _email: email || '' };

    db.prepare(`INSERT INTO submissions(submission_no, order_no, answers, status) VALUES (?,?,?,?)`)
      .run(submission_no, order_no || null, JSON.stringify(answersWithMeta), 'waiting');

    // 通知：提交成功（发给运营/群）
    const safe = maskJson(answersWithMeta);
    await notifyAll({
      userEmail: email || null,
      title: '✅ 新的深化判断提交',
      lines: [
        `submission: ${submission_no}`,
        `order: ${order_no || 'N/A'}`,
        `email: ${email || '未填写'}`,
        `状态: waiting`,
        `查看(后台)：POST /api/submissions/${submission_no}/generate (需要 x-admin-token)`,
        `answers(截断)：${JSON.stringify(safe)}`
      ],
      emailSubject: `新的深化判断提交：${submission_no}`,
      emailText: [
        `新的深化判断提交已收到`,
        `submission: ${submission_no}`,
        `order: ${order_no || 'N/A'}`,
        `email: ${email || '未填写'}`,
        `请在 48 小时内生成报告并交付。`
      ].join('\n')
    });

    res.json({ submission_id: submission_no });
  } catch (err) {
    console.error('Create submission error:', err);
    res.status(500).json({ error: '创建提交失败', detail: err.message });
  }
});

// 管理员：生成报告（OpenAI + PDF）
app.post('/api/submissions/:id/generate', requireAdmin, async (req, res) => {
  const submission_no = req.params.id;
  const row = db.prepare(`SELECT * FROM submissions WHERE submission_no=?`).get(submission_no);
  if (!row) return res.status(404).json({ error: 'submission not found' });

  const answers = JSON.parse(row.answers || '{}');

  // 标记 in_progress
  db.prepare(`UPDATE submissions SET status='in_progress' WHERE submission_no=?`).run(submission_no);

  try {
    const reportText = await callOpenAIReport(answers);

    const reportHtml = buildReportHtml(submission_no, answers, reportText);
    const result_url = await renderPdfToPublicReports(submission_no, reportHtml);

    db.prepare(`UPDATE submissions SET status='done', result_url=? WHERE submission_no=?`)
      .run(result_url, submission_no);

    // 通知：报告生成成功
    const userEmail = (answers._email || '').trim() || null;
    const downloadLink = `${BASE_URL}${result_url}`;

    await notifyAll({
      userEmail,
      title: '📄 深化判断报告已生成',
      lines: [
        `submission: ${submission_no}`,
        `order: ${row.order_no || 'N/A'}`,
        `下载: ${downloadLink}`,
        `状态: done`
      ],
      emailSubject: `你的判断报告已完成（${submission_no}）`,
      emailText: [
        `你的深化判断报告已完成`,
        `提交编号：${submission_no}`,
        `下载链接：${downloadLink}`,
        ``,
        `如果你希望我们基于该判断继续做"落地路线/执行规划"，回复"跟进"。`
      ].join('\n'),
      emailHtml: `
        <p>你的深化判断报告已完成 ✅</p>
        <p><b>提交编号：</b>${submission_no}</p>
        <p><b>下载链接：</b><a href="${downloadLink}">${downloadLink}</a></p>
        <p>如果你希望我们基于该判断继续做「落地路线 / 执行规划」，直接回复"跟进"。</p>
      `
    }).catch(console.error);

    res.json({ ok: true, result_url, download: `${BASE_URL}${result_url}` });
  } catch (err) {
    console.error('Generate report error:', err);
    db.prepare(`UPDATE submissions SET status='waiting' WHERE submission_no=?`).run(submission_no);

    // 通知：报告生成失败（需要人工处理）
    await notifyAll({
      userEmail: null,
      title: '⚠️ 报告生成失败（需要人工处理）',
      lines: [
        `submission: ${submission_no}`,
        `order: ${row.order_no || 'N/A'}`,
        `原因: ${String(err?.message || err)}`,
        `建议：人工用 openai_prompt.txt 在 ChatGPT 生成，再手工导出 PDF`
      ],
      emailSubject: `报告生成失败：${submission_no}`,
      emailText: `报告生成失败：${submission_no}\n原因：${String(err?.message || err)}`
    }).catch(console.error);

    res.status(500).json({ error: 'generate failed', detail: String(err?.message || err) });
  }
});

// 查询 submission（给用户或管理）
app.get('/api/submissions/:id', (req, res) => {
  try {
    const submission_no = req.params.id;
    const row = db.prepare(`SELECT submission_no, order_no, status, result_url, created_at FROM submissions WHERE submission_no=?`).get(submission_no);
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json({ ...row, download: row.result_url ? `${BASE_URL}${row.result_url}` : null });
  } catch (err) {
    console.error('Get submission error:', err);
    res.status(500).json({ error: '查询失败', detail: err.message });
  }
});

// 获取结果数据（用于渲染前端页面）
app.get('/api/result/:id', (req, res) => {
  try {
    const submission_no = req.params.id;
    const row = db.prepare(`SELECT * FROM submissions WHERE submission_no=?`).get(submission_no);
    
    if (!row) {
      // Return sample data as fallback
      return res.json({
        summary: "综合判断：项目存在机会，但推进路径的结构性风险偏高。建议先用低成本验证关键假设，再决定是否扩大投入。",
        dims: [
          "目标清晰度：目标仍偏"想做什么"，需要拆成可验证假设。",
          "资源匹配：当前资源更适合小步验证，不适合全面铺开。",
          "路径可逆性：一旦投入，回撤成本较高，需要保留回退方案。",
          "外部不确定性：真实用户反馈与指标尚未系统采集。"
        ],
        risks: [
          "过早锁定未经验证的路径，导致后期推倒重来。",
          "把技术实现当作验证，忽略商业必要性与付费动机。",
          "关键指标未定义，导致投入后无法判断对错。"
        ],
        actions: [
          "明确当前阶段唯一要验证的核心假设，并设计 2 周内可完成的测试。",
          "延迟不可逆决策，用小步试错获取真实数据。",
          "定义 1-2 个关键指标，用于判断是否继续投入。"
        ]
      });
    }

    const answers = JSON.parse(row.answers || '{}');
    
    // Parse report from result_url if available, or generate from answers
    const result = {
      summary: answers.q1 ? `基于您提出的问题"${answers.q1}"，AI 正在分析中。` : "AI 综合判断结论待生成。",
      dims: [
        answers.q1 ? `问题定义：${answers.q1}` : "问题定义待明确",
        answers.q2 ? `成功标准：${answers.q2}` : "成功标准待明确",
        answers.q3 ? `风险容忍度：${answers.q3}` : "风险容忍度待明确",
        answers.q4 ? `资源投入：${answers.q4}` : "资源投入待明确"
      ],
      risks: answers.q8 ? [answers.q8] : ["风险分析待完成"],
      actions: answers.q7 ? [answers.q7] : ["建议待生成"]
    };

    res.json(result);
  } catch (err) {
    console.error('Get result error:', err);
    res.status(500).json({ error: '获取结果失败', detail: err.message });
  }
});

// ---- Optional: Stripe webhook (auto mark paid) ----
app.post('/webhook/stripe', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) return res.status(400).send('stripe not configured');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderNo = session?.metadata?.order_no;
    if (orderNo) {
      const row = db.prepare(`SELECT * FROM orders WHERE order_no=?`).get(orderNo);
      if (row) db.prepare(`UPDATE orders SET status='paid', paid_at=datetime('now') WHERE order_no=?`).run(orderNo);
    }
  }
  res.json({ received: true });
});

// ---- PDF render ----
function buildReportHtml(submissionNo, answers, reportText) {
  // 这里是"咨询报告风格"的 PDF 版式（简洁但专业）
  return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  body{font-family:Arial,Helvetica,sans-serif;padding:26px;color:#111}
  .h1{font-size:20px;font-weight:700;margin:0 0 6px}
  .sub{color:#555;font-size:12px;margin:0 0 18px}
  .box{border:1px solid #e6edf3;border-radius:10px;padding:14px;margin:12px 0}
  .badge{display:inline-block;background:#eef6ff;color:#0b63ff;border-radius:999px;padding:4px 10px;font-size:12px}
  pre{white-space:pre-wrap;background:#f6f7f9;border-radius:10px;padding:12px;border:1px solid #e6edf3}
  .muted{color:#666;font-size:12px}
</style></head>
<body>
  <div class="h1">深化判断报告</div>
  <div class="sub">提交编号：${escapeHtml(submissionNo)}　<span class="badge">AI + 人工复核（建议前期人工校对）</span></div>

  <div class="box">
    <div style="font-weight:700;margin-bottom:8px">AI 判断报告正文</div>
    <pre>${escapeHtml(reportText)}</pre>
  </div>

  <div class="box">
    <div style="font-weight:700;margin-bottom:8px">用户原始回答（用于审计与复盘）</div>
    <pre>${escapeHtml(JSON.stringify(answers, null, 2))}</pre>
  </div>

  <div class="muted">声明：本报告用于决策参考，不代替法律/财务/安全等专业意见。</div>
</body></html>`;
}

async function renderPdfToPublicReports(submissionNo, html) {
  const outDir = path.join(__dirname, 'public', 'reports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const pdfPath = path.join(outDir, `${submissionNo}.pdf`);
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'], headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: pdfPath, format: PDF_FORMAT, printBackground: true, margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' } });
  await browser.close();

  return `/reports/${submissionNo}.pdf`;
}

// ---- Start ----
app.listen(PORT, () => {
  console.log(`MVP running: ${BASE_URL}`);
  console.log(`Admin endpoints require header: x-admin-token: ${ADMIN_TOKEN}`);
  console.log(`OpenAI: ${openai ? 'configured' : 'not configured'}`);
  console.log(`Stripe: ${stripe ? 'configured' : 'not configured'}`);
  console.log(`Email: ${mailTransporter ? 'configured' : 'not configured'}`);
  console.log(`WeCom Webhook: ${WECOM_WEBHOOK_URL ? 'configured' : 'not configured'}`);
  console.log(`Feishu Webhook: ${FEISHU_WEBHOOK_URL ? 'configured' : 'not configured'}`);
});
