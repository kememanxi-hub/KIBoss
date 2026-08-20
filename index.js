const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server KIBOBoss Berjalan dengan Baik!');
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Mengubah data login sesuai permintaan Anda
  if (username === 'kibo' && password === 'kibboss') {
    return res.json({ status: true, message: 'Login Berhasil!' });
  }
  
  res.status(401).json({ status: false, message: 'Username atau Password salah!' });
});

module.exports = app;
