wconst loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");

const loginMessage = document.getElementById("loginMessage");
const welcomeText = document.getElementById("welcomeText");


function showLogin() {
  loginPage.classList.remove("hidden");
  dashboardPage.classList.add("hidden");

  usernameInput.value = "";
  passwordInput.value = "";
  loginMessage.textContent = "";
}


function showDashboard(username) {
  loginPage.classList.add("hidden");
  dashboardPage.classList.remove("hidden");

  welcomeText.innerHTML =
    `Selamat datang, <strong>${username}</strong>!`;
}


async function login() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    loginMessage.textContent =
      "Username dan password wajib diisi.";
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Memproses...";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      loginMessage.textContent =
        data.message || "Login gagal.";
      return;
    }

    sessionStorage.setItem("KEYZO_user", username);

    showDashboard(username);

  } catch (error) {
    console.error(error);

    loginMessage.textContent =
      "Server tidak dapat dihubungi.";
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
}


function logout() {
  sessionStorage.removeItem("KEYZO_user");
  showLogin();
}


loginButton.addEventListener("click", login);

logoutButton.addEventListener("click", logout);


passwordInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    login();
  }
});


usernameInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    login();
  }
});


const savedUser = sessionStorage.getItem("KEYZO_user");

if (savedUser) {
  showDashboard(savedUser);
} else {
  showLogin();
}
