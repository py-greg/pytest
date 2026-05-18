const userSelect = document.getElementById("user-select");
const passwordInput = document.getElementById("password");
const continueBtn = document.getElementById("continue-btn");
const registerBtn = document.getElementById("register-btn");
const statusBox = document.getElementById("status");

async function loadUsers() {
  const users = await apiGet("/profile/users");
  userSelect.innerHTML = "";
  for (const user of users) {
    const option = document.createElement("option");
    option.value = String(user.id);
    option.textContent = `${user.id}: ${user.name}`;
    userSelect.appendChild(option);
  }

  const stored = getStoredUser();
  if (stored && stored.id) {
    userSelect.value = String(stored.id);
  }
}

async function continueToChats() {
  const userId = Number(userSelect.value);
  const password = passwordInput.value;
  if (!userId) {
    alert("Please choose a profile.");
    return;
  }
  if (!password) {
    alert("Please enter your password.");
    return;
  }

  const profile = await apiPost("/profile/login", {
    user_id: userId,
    input_password: password,
  });
  setStoredUser(profile);
  clearStoredChat();
  window.location.href = "/static/chats.html";
}

continueBtn.addEventListener("click", () => {
  continueToChats().catch((err) => {
    statusBox.textContent = err.message;
  });
});

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    continueBtn.click();
  }
});

registerBtn.addEventListener("click", () => {
  window.location.href = "/static/register.html";
});

loadUsers().catch((err) => {
  statusBox.textContent = err.message;
});
