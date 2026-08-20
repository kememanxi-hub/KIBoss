const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server KIBOBoss Aktif!');
});

// Endpoint untuk melayani file json langsung lewat kode
app.get('/users/kibo.json', (req, res) => {
  res.json({
    username: "kibo",
    password: "kibboss",
    status: "active"
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
