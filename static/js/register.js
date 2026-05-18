const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const countryInput = document.getElementById("country");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("register-btn");
const backBtn = document.getElementById("back-btn");
const statusBox = document.getElementById("status");

function getPayload() {
  const name = nameInput.value.trim();
  const age = Number(ageInput.value);
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const country = countryInput.value.trim();
  const password = passwordInput.value;

  if (!name || !age || !email || !phone || !country || !password) {
    throw new Error("Please fill all fields.");
  }
  if (password.length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }

  return { name, age, email, phone, country, password };
}

async function registerUser() {
  const payload = getPayload();
  const profile = await apiPost("/profile/register", payload);
  setStoredUser(profile);
  clearStoredChat();
  statusBox.textContent = "User created. Redirecting...";
  window.setTimeout(() => {
    window.location.href = "/static/chats.html";
  }, 500);
}

registerBtn.addEventListener("click", () => {
  registerUser().catch((err) => {
    statusBox.textContent = err.message;
  });
});

backBtn.addEventListener("click", () => {
  window.location.href = "/static/login.html";
});
