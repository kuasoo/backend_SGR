// backend/routes/contenido.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    
    const [capitulos] = await db.query("SELECT *, 'capitulo' as tipo FROM capitulos ORDER BY orden, id");
    const [secciones] = await db.query("SELECT *, 'seccion' as tipo FROM secciones ORDER BY orden, id");
    const [subsecciones] = await db.query("SELECT *, 'subseccion' as tipo FROM subsecciones ORDER BY orden, id");

    
    const seccionesConHijos = secciones.map(seccion => ({
      ...seccion,
      children: subsecciones.filter(sub => sub.seccion_id === seccion.id)
    }));

    
    const arbolCompleto = capitulos.map(capitulo => ({
      ...capitulo,
      children: seccionesConHijos.filter(sec => sec.capitulo_id === capitulo.id)
    }));
    
  
    res.json(arbolCompleto);
  } catch (err) {
    console.error("Error al construir el contenido anidado:", err);
    res.status(500).json({ error: "Error interno al obtener el contenido." });
  }
});

module.exports = router;
