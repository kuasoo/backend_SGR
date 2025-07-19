// backend/routes/capitulos.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Crear un nuevo capítulo
router.post('/', async (req, res) => {
  const { titulo } = req.body; 

  if (!titulo) {
    return res.status(400).json({ error: 'El título es obligatorio.' });
  }

  try {

    const [result] = await db.query('INSERT INTO capitulos (titulo) VALUES (?)', [titulo]);
    res.status(201).json({ success: true, message: 'Capítulo creado', insertedId: result.insertId });
  } catch (err) {
    console.error('Error al agregar capítulo:', err);
    res.status(500).json({ error: 'Error interno al agregar el capítulo' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    
    await db.query('DELETE FROM capitulos WHERE id = ?', [id]);
    res.json({ success: true, message: 'Capítulo eliminado' });
  } catch (err) {
    console.error('Error al eliminar capítulo:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});


router.put('/:id/titulo', async (req, res) => {
  const { id } = req.params;
  const { titulo } = req.body;
  try {
    await db.query('UPDATE capitulos SET titulo = ? WHERE id = ?', [titulo, id]);
    res.json({ success: true, message: 'Título de capítulo actualizado' });
  } catch (err) {
    console.error('Error al actualizar título de capítulo:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;