// backend/routes/estructura.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener estructura completa: capítulos con secciones y subsecciones
router.get('/', async (req, res) => {
  try {
    const [capitulos] = await db.query('SELECT * FROM capitulos ORDER BY orden');
    const [secciones] = await db.query('SELECT * FROM secciones ORDER BY orden');
    const [subsecciones] = await db.query('SELECT * FROM subsecciones ORDER BY orden');

    const estructura = capitulos.map(cap => {
      const seccionesDelCapitulo = secciones
        .filter(sec => sec.capitulo_id === cap.id)
        .map(sec => {
          const subs = subsecciones.filter(sub => sub.seccion_id === sec.id);
          return { ...sec, tipo: 'seccion', children: subs.map(s => ({ ...s, tipo: 'subseccion' })) };
        });
      return { ...cap, tipo: 'capitulo', children: seccionesDelCapitulo };
    });

    res.json(estructura);
  } catch (err) {
    console.error('Error cargando jerarquía:', err);
    res.status(500).json({ error: 'Error cargando la estructura' });
  }
});

module.exports = router;
