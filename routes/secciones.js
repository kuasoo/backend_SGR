//routes/secciones.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las secciones
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM secciones ORDER BY orden');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener secciones:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Crear nueva sección
router.post('/', async (req, res) => {
  const { capitulo_id, titulo, numero, orden, contenido } = req.body;
  try {
    await db.query('INSERT INTO secciones (capitulo_id, titulo, numero, contenido, orden) VALUES (?, ?, ?, ?, ?)',
      [capitulo_id, titulo, numero, contenido || '', orden]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al agregar sección:', err);
    res.status(500).json({ error: 'Error al agregar sección' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    
    await db.query('DELETE FROM subsecciones WHERE seccion_id = ?', [id]);
    await db.query('DELETE FROM secciones WHERE id = ?', [id]);
    res.json({ success: true, message: 'Sección y sus subsecciones eliminadas' });
  } catch (err) {
    console.error('Error al eliminar sección:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});


// Editar contenido
router.post('/:id', async (req, res) => {
  const { contenido } = req.body;
  const id = req.params.id;
  try {
    await db.query('UPDATE secciones SET contenido = ? WHERE id = ?', [contenido, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar contenido:', err);
    res.status(500).json({ error: 'Error al actualizar contenido' });
  }
});

// Actualizar solo el título
router.put('/:id/titulo', async (req, res) => {
  const id = req.params.id;
  const { titulo } = req.body;
  try {
    await db.query('UPDATE secciones SET titulo = ? WHERE id = ?', [titulo, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar título:', err);
    res.status(500).json({ error: 'Error al actualizar título' });
  }
});

module.exports = router;