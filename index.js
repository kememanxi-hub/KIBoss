const express = require("express");
const crypto = require("crypto");

const app = express();

app.use(express.json());

const SESSION_SECRET =
  process.env.SESSION_SECRET || "KIBOSS_CHANGE_THIS_SECRET_2026";

const COOKIE_NAME = "kiboss_session";
const SESSION_DURATION = 60 * 60 * 8; // 8 jam

// ======================================================
// USER
// ======================================================
// Untuk sementara tetap memakai akun yang sekarang.
// Nanti password bisa dipindahkan ke Environment Variable.
const USERS = [
  {
    username: "kibo",
    passwordHash: crypto
      .createHash("sha256")
      .update("kibo12345")
      .digest("hex"),
  },
];

// ======================================================
// ROOT / HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// ======================================================
// COOKIE HELPERS
// ======================================================

function parseCookies(req) {
  const cookies = {};

  const header = req.headers.cookie;
  if (!header) return cookies;

  header.split(";").forEach((cookie) => {
    const index = cookie.indexOf("=");

    if (index === -1) return;

    const key = cookie.slice(0, index).trim();
    const value = cookie.slice(index + 1).trim();

    cookies[key] = decodeURIComponent(value);
  });

  return cookies;
}

function createSession(username) {
  const payload = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

function verifySession(token) {
  if (!token) return null;

  const parts = token.split(".");

  if (parts.length !== 2) return null;

  const [payload, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);

  if (a.length !== b.length) return null;

  if (!crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (!data.username || !data.exp) {
      return null;
    }

    if (data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

function getSessionUser(req) {
  const cookies = parseCookies(req);
  const session = verifySession(cookies[COOKIE_NAME]);

  if (!session) return null;

  return USERS.find(
    (user) => user.username === session.username
  );
}

// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Username dan password wajib diisi",
    });
  }

  const user = USERS.find(
    (item) => item.username === username
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Username atau password salah",
    });
  }

  const passwordHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  if (passwordHash !== user.passwordHash) {
    return res.status(401).json({
      success: false,
      message: "Username atau password salah",
    });
  }

  const sessionToken = createSession(user.username);

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(
      sessionToken
    )}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DURATION}`
  );

  return res.json({
    success: true,
    message: "Login berhasil",
    user: {
      username: user.username,
    },
  });
});

// ======================================================
// CHECK SESSION
// ======================================================

app.get("/api/me", (req, res) => {
  const user = getSessionUser(req);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Belum login",
    });
  }

  return res.json({
    success: true,
    user: {
      username: user.username,
    },
  });
});

// ======================================================
// LOGOUT
// ======================================================

app.post("/api/logout", (req, res) => {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  );

  return res.json({
    success: true,
    message: "Logout berhasil",
  });
});

// ======================================================
// PROTECTED DASHBOARD API
// ======================================================

app.get("/api/dashboard", (req, res) => {
  const user = getSessionUser(req);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Silakan login.",
    });
  }

  return res.json({
    success: true,
    message: "Dashboard KIBoss aktif",
    user: {
      username: user.username,
    },
  });
});

module.exports = app;
