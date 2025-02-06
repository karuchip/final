const path = require('path');
const express = require('express');
const app = express();

// http://127.0.0.1/static/*の場合、/public/*へマッピング
app.use('/static', express.static(path.join(__dirname, 'public')))
// POST リクエストのリクエストボディを取り出すために必要な設定
app.use(express.json());

// http://127.0.0.1/の場合、index.htmlを返す
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});


//sendgrid　メール本文
function buildMessage({email, name}) {
  return {
    personalizations: [
      {
        to: [{ email, name, }],
      },
    ],
    from: {
      email: "hikaru.-27-@outlook.jp",
      name: "Hikaru Hatakeyama",
    },
    subject: "お問い合わせありがとうございます",
    content: [
      {
        type: "text/plain",
        value: [
          `${name}様`,
          "",
          "お問い合わせいただき、誠にありがとうございます。",
          "このメールは、システムによる自動返信であり、お問い合わせを受け付けたことをお知らせするものです。",
          "お問い合わせ内容につきましては、担当者が確認の上、改めてご連絡させていただきます。",
          "",
          "通常、1営業日以内には回答を差し上げておりますが、内容によっては少々お時間をいただく場合がございます。",
        ].join("\n"),
      },
    ],
  }
};

//MicroCMSへのデータ送信
async function sendContact(contact) {

  try {
    const resp = await fetch(
      "https://bw98n6r601.microcms.io/api/v1/potepan",
      {
        method: "POST",
        headers: {
          "X-MICROCMS-API-KEY": process.env.MICROCMS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contact),
      }
    );
    if (!resp.ok) {
      throw new Error(`お問い合わせの送信に失敗しました：${resp.statusText}`);
    }
    return await resp.json();
  } catch (err) {
    throw err;
  }
}

//sendgridからメール送信
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendMail({email, name}) {
  const message = buildMessage({email, name});

  try {
    const resp = await sgMail
    .send(message)
      if (!resp.ok) {
        const data= await resp.json();
        throw new Error(`メールの送信に失敗しました: ${data.errors[0].message}`)
      }
      return { ok: true };
  }catch(err){
    throw err;
  }
}


app.post("/api/contact", async (req, res) => {
  const contact = req.body

  try {
    await Promise.all([
      sendContact(contact),
      sendMail({email: contact.email, name: contact.name})
    ])
    res.redirect("/complete")
  }catch(err) {
    console.error("error: ", err)
    res.status(500).json({message: err.message})
  }
});


app.listen(3000, () => console.log("listening on port 3000"));
