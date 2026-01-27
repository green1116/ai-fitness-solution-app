// lib/notify.ts
export async function notify(text: string) {
  const tasks: Promise<any>[] = [];

  const wecom = process.env.WE_COM_WEBHOOK;
  if (wecom) {
    tasks.push(
      fetch(wecom, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msgtype: "text", text: { content: text } }),
      }).catch(() => null)
    );
  }

  const feishu = process.env.FEISHU_WEBHOOK;
  if (feishu) {
    tasks.push(
      fetch(feishu, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msg_type: "text", content: { text } }),
      }).catch(() => null)
    );
  }

  // 可选：如果你想把通知也发到你自己邮箱
  // 这里我留接口，你如果要我给你 Resend 邮件通知版我再补（避免你现在又多装包）
  await Promise.all(tasks);
}

