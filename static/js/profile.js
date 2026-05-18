const userIdInput = document.getElementById("user-id");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const countryInput = document.getElementById("country");
const newPasswordInput = document.getElementById("new-password");
const saveBtn = document.getElementById("save-btn");
const backBtn = document.getElementById("back-btn");
const statusBox = document.getElementById("status");

const user = getStoredUser();
if (!user || !user.id) {
  window.location.href = "/static/login.html";
}

function fillForm(profile) {
  userIdInput.value = String(profile.id);
  nameInput.value = profile.name || "";
  ageInput.value = String(profile.age ?? "");
  emailInput.value = profile.email || "";
  phoneInput.value = profile.phone || "";
  countryInput.value = profile.country || "";
}

function getPayload() {
  const name = nameInput.value.trim();
  const age = Number(ageInput.value);
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const country = countryInput.value.trim();
  const newPassword = newPasswordInput.value;

  if (!name || !age || !email || !phone || !country) {
    throw new Error("Please fill all required fields.");
  }
  if (newPassword && newPassword.length < 4) {
    throw new Error("New password must be at least 4 characters.");
  }

  const payload = {
    id: user.id,
    name,
    age,
    email,
    phone,
    country,
  };
  if (newPassword) {
    payload.new_password = newPassword;
  }
  return payload;
}

async function loadProfile() {
  const profile = await apiGet(`/profile/profile?user_id=${user.id}`);
  fillForm(profile);
  setStoredUser(profile);
}

async function saveProfile() {
  const payload = getPayload();
  const updated = await apiPut("/profile/profile", payload);
  setStoredUser(updated);
  newPasswordInput.value = "";
  fillForm(updated);
  statusBox.textContent = "Profile saved.";
}

saveBtn.addEventListener("click", () => {
  saveProfile().catch((err) => {
    statusBox.textContent = err.message;
  });
});

backBtn.addEventListener("click", () => {
  window.location.href = "/static/chats.html";
});

loadProfile().catch((err) => {
  statusBox.textContent = err.message;
});
