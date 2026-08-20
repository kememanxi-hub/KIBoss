const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server KIBOBoss Aktif!');
});

// Endpoint untuk file json dengan menambahkan data tanggal yang valid (misal tahun 2030)
app.get('/users/kibo.json', (req, res) => {
  res.json({
    username: "kibo",
    password: "kibboss",
    status: "active",
    expired: "2030-12-31",
    date: "2026-01-01"
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'kibo' && password === 'kibboss') {
    return res.json({ status: true, message: 'Login Berhasil!' });
  }
  res.status(401).json({ status: false, message: 'Gagal Login' });
});

module.exports = app;
