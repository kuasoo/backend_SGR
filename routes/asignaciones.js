// backend/routes/asignaciones.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verificarToken } = require('../middleware/auth');

// Obtener secciones asignadas a un usuario (ya lo tienes)
router.get('/', verificarToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      'SELECT s.* FROM secciones s JOIN asignaciones a ON s.id = a.seccion_id WHERE a.usuario_id = ? ORDER BY s.orden',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener secciones asignadas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


router.post('/asignar', verificarToken, async (req, res) => {
  const { usuario_id, secciones } = req.body;

  try {
    // Solo admin puede asignar
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Eliminar asignaciones anteriores
    await db.query('DELETE FROM asignaciones WHERE usuario_id = ?', [usuario_id]);

    // Insertar nuevas asignaciones
    if (Array.isArray(secciones) && secciones.length > 0) {
      const values = secciones.map(id => [usuario_id, id]);
      await db.query('INSERT INTO asignaciones (usuario_id, seccion_id) VALUES ?', [values]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error al asignar secciones:', err);
    res.status(500).json({ error: 'Error interno al asignar secciones' });
  }
});

module.exports = router;
