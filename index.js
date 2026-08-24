const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json({ limit: "32kb" }));
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.get("/", (req, res) => res.status(200).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BOSS KEYZO</title><style>body{font-family:system-ui;background:#0b0d10;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0}.card{max-width:520px;padding:32px;border:1px solid #30343b;border-radius:18px;background:#12151a}.ok{color:#55d187}</style></head><body><div class="card"><h1>BOSS KEYZO</h1><p class="ok">● Server online</p><p>Login API: <code>/api/login</code></p><p>License API: <code>/api/license/validate</code></p><p>Health: <code>/api/health</code></p></div></body></html>`));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "BOSS KEYZO",
    login: Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD),
    license_validation: true
  });
});

function normalizeKey(v) { return String(v || "").trim().toUpperCase(); }

function loadLicenses() {
  try {
    const parsed = JSON.parse(process.env.LICENSE_KEYS_JSON || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) { return []; }
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

app.post("/api/login", (req, res) => {
  const body = req.body || {};
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password || username.length > 128 || password.length > 512) {
    return res.status(400).json({ success: false, status: false, authenticated: false, message: "Data login tidak valid." });
  }

  const expectedUsername = String(process.env.ADMIN_USERNAME || "").trim();
  const expectedPassword = String(process.env.ADMIN_PASSWORD || "");

  if (!expectedUsername || !expectedPassword) {
    console.error("Login configuration missing: ADMIN_USERNAME/ADMIN_PASSWORD");
    return res.status(503).json({ success: false, status: false, authenticated: false, message: "Login server belum dikonfigurasi." });
  }

  if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
    return res.status(401).json({ success: false, status: false, authenticated: false, message: "Username atau password salah." });
  }

  return res.status(200).json({ success: true, status: true, authenticated: true, username: expectedUsername, message: "Login berhasil!" });
});

app.post("/api/license/validate", (req, res) => {
  const body = req.body || {};
  const key = normalizeKey(body.key);
  const deviceId = String(body.device_id || "").trim();
  const appVersion = String(body.app_version || "").trim();

  if (!key) return res.status(400).json({ valid: false, message: "Key wajib diisi." });
  if (!deviceId) return res.status(400).json({ valid: false, message: "Device ID wajib." });

  const license = loadLicenses().find((x) => normalizeKey(x.key) === key);
  if (!license) return res.status(401).json({ valid: false, status: "not_found", message: "Key tidak ditemukan." });

  const status = String(license.status || "active").toLowerCase();
  if (status !== "active") {
    return res.status(403).json({ valid: false, status, message: status === "banned" ? "Key telah diblokir." : "Key tidak aktif." });
  }

  if (license.expires_at) {
    const d = new Date(license.expires_at);
    if (!Number.isNaN(d.getTime()) && d.getTime() <= Date.now()) {
      return res.status(403).json({ valid: false, status: "expired", expires_at: license.expires_at, message: "Key sudah expired." });
    }
  }

  const bound = String(license.device_id || "").trim();
  if (bound && bound !== deviceId && !license.allow_rebind) {
    return res.status(403).json({ valid: false, status: "device_mismatch", message: "Key sudah terikat ke perangkat lain." });
  }

  return res.status(200).json({ valid: true, status: "active", key: license.key, expires_at: license.expires_at || null, device_bound: Boolean(bound), app_version: appVersion || null, message: "Login key berhasil." });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) return res.status(400).json({ success: false, message: "JSON request tidak valid." });
  console.error(err);
  return res.status(500).json({ success: false, message: "Internal server error." });
});

if (require.main === module) app.listen(port, () => console.log("BOSS KEYZO listening on " + port));
module.exports = app;
