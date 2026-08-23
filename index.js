const express = require("express");

const app = express();

app.use(express.json());

/*
 * ==============================
 * DATA LOGIN KEYZO
 * ==============================
 */

const USERNAME = "keyzo";
const PASSWORD = "keyzo864";


/*
 * ==============================
 * LOGIN API
 * ==============================
 */

app.post("/api/login", (req, res) => {

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username dan password wajib diisi."
    });
  }

  if (
    username === USERNAME &&
    password === PASSWORD
  ) {

    return res.status(200).json({
      success: true,
      message: "Login berhasil.",
      user: {
        username: username
      }
    });

  }

  return res.status(401).json({
    success: false,
    message: "Username atau password salah."
  });

});


/*
 * ==============================
 * HEALTH CHECK
 * ==============================
 */

app.get("/api/health", (req, res) => {

  res.status(200).json({
    success: true,
    message: "KEYZO API online."
  });

});


/*
 * ==============================
 * EXPORT
 * ==============================
 */

module.exports = app;
