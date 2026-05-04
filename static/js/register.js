const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const countryInput = document.getElementById("country");
const registerBtn = document.getElementById("register-btn");
const backBtn = document.getElementById("back-btn");
const statusBox = document.getElementById("status");

function getPayload() {
  const name = nameInput.value.trim();
  const age = Number(ageInput.value);
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const country = countryInput.value.trim();

  if (!name || !age || !email || !phone || !country) {
    throw new Error("Please fill all fields.");
  }

  return { name, age, email, phone, country };
}

async function registerUser() {
  const payload = getPayload();
  await apiPost("/profile/register", payload);
  statusBox.textContent = "User created. Redirecting...";
  window.setTimeout(() => {
    window.location.href = "/static/profile.html";
  }, 500);
}

registerBtn.addEventListener("click", () => {
  registerUser().catch((err) => {
    statusBox.textContent = err.message;
  });
});

backBtn.addEventListener("click", () => {
  window.location.href = "/static/profile.html";
});
