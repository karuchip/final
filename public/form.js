
const formEl = document.getElementById("contact-form");
const buttonEl = document.getElementById("submit")

formEl.addEventListener("submit", async(evt) => {
  evt.preventDefault();

  const formData = new FormData(formEl);
  const entries = Object.fromEntries(formData.entries());

  const company = entries.company;
  const name = entries.name;
  const email = entries.email;
  const phoneNumber = entries.phoneNumber;

  //非同期バリデーションチェック
   const isValid = await validationCheck(company, name, email, phoneNumber);
   if(isValid===true) {
    sendContact(entries);
   }else{
    console.log("apiの呼び出しができませんでした");
   }
});

//Microcmsについて、ブラウザからサーバー(app.js)に入力情報を渡す
async function sendContact(entries) {
  const response = await fetch("/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type" : "application/json",
        },
        body: JSON.stringify(entries),
      }
    );
  const data = await response.json();
  console.log(data);
  if (response.ok) {
    const messageEl = document.getElementById("completion-message");
    messageEl.classList.add("show");
  }
}

//form入力のバリデーションチェック
async function validationCheck(company, name, email, phoneNumber) {

  //エラーメッセージの削除
  errMessageReset();

  //エラーボックス（赤枠）の削除
  boxColorReset();

  const isValid = true;

  // 企業名
  if(!company) {
    document.getElementById("company-err").innerHTML = "企業名を入力してください";
    //エラーボックス（赤枠）の追加
    boxColorChange("company");
    isValid = false;
  }

  // お名前
  if(!name) {
    document.getElementById("name-err").innerHTML = "お名前を入力してください";
    boxColorChange("name");
    isValid = false;
  }

  // メールアドレス
  if(!email) {
    document.getElementById("email-err").innerHTML = "メールアドレスを入力してください";
    boxColorChange("email");
    isValid = false;
  }else if (!email.match(/^[A-Za-z0-9@.]+$/)){
    document.getElementById("email-err").innerHTML = "半角英数字入力してください";
    boxColorChange("email");
    isValid = false;
  }else if (!email.includes("@")){
    document.getElementById("email-err").innerHTML = "正しいメールアドレスを入力してください";
    boxColorChange("email");
    isValid = false;
  }

  // 電話番号
  if(!phoneNumber) {
    document.getElementById("phone-err").innerHTML = "電話番号を入力してください";
    boxColorChange("phoneNumber");
    isValid = false;
  }else if(isNaN(phoneNumber)) {
    document.getElementById("phone-err").innerHTML = "半角数字を入力してください";
    boxColorChange("phoneNumber");
    isValid = false;
  }
  return isValid;
}


//エラーメッセージの削除
function errMessageReset() {
  const items = ["company-err", "name-err", "email-err", "phone-err"];
  items.forEach((item) => {
    document.getElementById(item).innerHTML = "";
  })
}

//エラーボックス（赤枠）の削除
function boxColorReset() {
  const categories =["company", "name", "email", "phoneNumber"];
  categories.forEach((category) => {
    document.getElementById(category).classList.remove("err-box");
  })
}

//エラーボックス（赤枠）の追加
function boxColorChange(category) {
  return document.getElementById(category).classList.add("err-box");
}


// ハンバーガーメニュー
const menu = document.getElementById("menu-btn");
const cancel = document.getElementById("cancel-btn");
const nav = document.getElementById("hanb-menu");

const toggleActive = ()=>{
  menu.classList.toggle('inactive');
  cancel.classList.toggle('inactive');
  nav.classList.toggle('inactive');
}

const btns = Array.from(document.getElementsByClassName("js-icon"));
btns.forEach((btn) => {
  btn.addEventListener("click", toggleActive)
});

const items = Array.from(document.getElementsByClassName("js-lists"));
items.forEach ((item) => {
  item.addEventListener("click", toggleActive)
});

