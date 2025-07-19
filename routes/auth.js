// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'sgr_secret';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [[user]] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, rol: user.rol }, SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, username: user.username, rol: user.rol } });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
