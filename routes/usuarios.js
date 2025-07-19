//backend/routes/usarios.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// Crear usuario y asignar secciones
router.post('/crear', async (req, res) => {
  const { username, password, rol, secciones } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)', [
      username,
      hashedPassword,
      rol
    ]);

    const userId = result.insertId;

    if (Array.isArray(secciones) && secciones.length > 0) {
      const values = secciones.map(id => [userId, id]);
      await db.query('INSERT INTO asignaciones (usuario_id, seccion_id) VALUES ?', [values]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error creando usuario:', err);
    res.status(500).json({ error: 'Error interno al crear usuario' });
  }
});


//obtener usuarios
router.get('/', async (req, res) => {
    try {
      
        const [usuarios] = await db.query('SELECT id, username, rol FROM usuarios');
        res.json(usuarios);
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


//eliminar usuarios
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json({ success: true, message: 'Usuario eliminado con éxito.' });
    } catch (err) {
        console.error("Error al eliminar usuario:", err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


module.exports = router;
