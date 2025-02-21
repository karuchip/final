const path = require('path');
const express = require('express');
const app = express();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(context.env.SENDGRID_API_KEY);

// http://127.0.0.1/static/*の場合、/public/*へマッピング
app.use('/static', express.static(path.join(__dirname, 'public')))
// POST リクエストのリクエストボディを取り出すために必要な設定
app.use(express.json());

// http://127.0.0.1/の場合、index.htmlを返す
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});


//sendgrid　メール本文
function buildMessage({email, name, company}) {
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
  }
};

//MicroCMSへのデータ送信
async function sendContact(contact, apiKey) {
  try {
    console.log("送信データ：", contact);
    const response = await fetch(
      "https://vf9jrqgl0p.microcms.io/api/v1/contact",
      {
        method: "POST",
        headers: {
          // "X-MICROCMS-API-KEY": process.env.MICROCMS_API_KEY.trim(),
          "X-MICROCMS-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contact),
      }
    );
    if (!response.ok) {
      throw new Error(`お問い合わせの送信に失敗しました：${response.statusText}`);
    }
    return await response.json();
    // const data = await response.json();
    // console.log("レスポンス", data);
  } catch (err) {
    throw err;
  }
}

//sendgridからメール送信


async function sendMail({email, name, company}) {
  const message = buildMessage({email, name, company});

  try {
    const [response, body] = await sgMail.send(message)
      if (response.statusCode >= 400) {
        const data= await resp.json();
        throw new Error(`メールの送信に失敗しました: ${JSON.stringify(body)}`);
      }
      return { ok: true };
  }catch(err){
    throw err;
  }
}


export async function onRequestPost(context) {
  const contact = await context.request.json();
  // app.post("/api/contact", async (req, res) => {
    //   const contact = req.body


    try {
      await Promise.all([
        sendContact(contact, context.env.MICROCMS_API_KEY.trim()),
        sendMail({email: contact.email, name: contact.name, company: contact.company})
      ])
      res.json({ message: "お問い合わせ送信成功" });
    }catch(err) {
      console.error("error: ", err)
      res.status(500).json({message: err.message})
    }
  // });
}

app.listen(3000, () => console.log("listening on port 3000"));
