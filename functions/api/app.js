

function buildMessage({ email, name, company }) {
  return {
    personalizations: [{ to: [{ email, name }] }],
    from: { email: "hikaru.-27-@outlook.jp", name: "Hikaru Hatakeyama" },
    subject: "お問い合わせいただきありがとうございます。",
    content: [
      {
        type: "text/plain",
        value: [
          `${company}`,
          `${name}様`,
          "",
          "この度はお問い合わせいただきありがとうございます。",
          "担当より追ってご連絡させていただきますので、",
          "お待ちくださいませ。",
        ].join("\n"),
      },
    ],
  };
}

// MicroCMS へのデータ送信
async function sendContact(contact, apiKey) {
  try {
    const response = await fetch(
      "https://vf9jrqgl0p.microcms.io/api/v1/contact",
      {
        method: "POST",
        headers: {
          "X-MICROCMS-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contact),
      }
    );
    if (!response.ok) {
      throw new Error(`お問い合わせの送信に失敗しました: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

// SendGrid からメール送信
async function sendMail({ email, name, company }, apiKey) {

  const message = buildMessage({ email, name, company });

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      throw new Error(`メールの送信に失敗しました: ${response.statusText}`);
    }
    return { ok: true };
  } catch (err) {
    throw err;
  }
}

// Cloudflare Workers
export async function onRequestPost(context) {
  try {
    const contact = await context.request.json();

    await Promise.all([
      sendContact(contact, context.env.MICROCMS_API_KEY),
      sendMail(contact, context.env.SENDGRID_API_KEY)
    ]);

    return new Response(JSON.stringify({ message: "お問い合わせ送信成功" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
