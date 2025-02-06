const MICROCMS_API_KEY = "ULt966FfabOAsH3EQuYdDlBGLyZwaMAqNvuy";

const formEl = document.getElementById("contact-form");
const buttonEl = document.getElementById("submit")

formEl.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const formData = new FormData(formEl);
  const entries = Object.fromEntries(formData.entries());

  sendContact(entries);
});

//Microcms
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
}


