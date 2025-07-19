const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  const { seccion_id, subseccion_id, orden = 1 } = req.body;
  if (!req.file) return res.status(400).json({ error: 'Archivo no encontrado' });

  const url = `http://localhost:3001/uploads/${req.file.filename}`;

  try {
    await db.query('INSERT INTO imagenes (seccion_id, subseccion_id, url, orden) VALUES (?, ?, ?, ?)', [
      seccion_id || null, subseccion_id || null, url, orden
    ]);
    res.json({ url });
  } catch (err) {
    console.error('Error al registrar imagen:', err);
    res.status(500).json({ error: 'Error interno al guardar imagen' });
  }
});

module.exports = router;
