const express = require('express');
const crypto = require('crypto');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'Server KIBOBoss Aktif!'
  });
});

// Data akun.
// Untuk tahap awal ini masih berada di server,
// bukan di APK dan bukan endpoint publik.
const USERS = [
  {
    username: 'kibo',
    passwordHash: crypto
      .createHash('sha256')
      .update('kibo12345')
      .digest('hex')
  }
];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: 'Username dan password wajib diisi'
    });
  }

  const user = USERS.find(
    item => item.username === username
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Username atau password salah'
    });
  }

  const passwordHash = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');

  if (passwordHash !== user.passwordHash) {
    return res.status(401).json({
      success: false,
      message: 'Username atau password salah'
    });
  }

  return res.json({
    success: true,
    message: 'Login berhasil',
    user: {
      username: user.username
    }
  });
});

module.exports = app;
