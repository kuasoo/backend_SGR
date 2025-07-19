// backend/routes/elementos.js
const express = require('express');
const router = express.Router();
const db = require('../db');


router.post('/', async (req, res) => {
  const { tipo, titulo, parentId, orden } = req.body;
  const nuevoOrden = orden ? parseInt(orden, 10) : null;

  if (!tipo || !titulo) {
    return res.status(400).json({ error: 'Faltan datos (tipo o título).' });
  }

  let tableName = '';
  let parentColumn = '';
  switch (tipo) {
    case 'Capítulo': tableName = 'capitulos'; break;
    case 'Sección': tableName = 'secciones'; parentColumn = 'capitulo_id'; break;
    case 'Subsección': tableName = 'subsecciones'; parentColumn = 'seccion_id'; break;
    default: return res.status(400).json({ error: 'Tipo no válido.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let finalOrden;
    const whereClause = parentColumn ? `WHERE ${parentColumn} = ?` : 'WHERE 1=1'; 
    const whereParams = parentColumn ? [parentId] : [];

    if (nuevoOrden) { 
      finalOrden = nuevoOrden;
      
      const updateQuery = `UPDATE ?? SET orden = orden + 1 WHERE ${parentColumn ? `${parentColumn} = ? AND` : ''} orden >= ? ORDER BY orden DESC`;
      const updateParams = parentColumn ? [tableName, parentId, finalOrden] : [tableName, finalOrden];
      
      
      const finalUpdateParams = parentColumn ? [tableName, parentId, finalOrden] : [tableName, finalOrden];
      if (parentColumn) {
          await connection.query(`UPDATE ?? SET orden = orden + 1 WHERE ${parentColumn} = ? AND orden >= ? ORDER BY orden DESC`, [tableName, parentId, finalOrden]);
      } else {
          await connection.query(`UPDATE ?? SET orden = orden + 1 WHERE orden >= ? ORDER BY orden DESC`, [tableName, finalOrden]);
      }

    } else { 
      const [rows] = await connection.query(`SELECT MAX(orden) as maxOrden FROM ?? ${whereClause}`, [tableName, ...whereParams]);
      finalOrden = (rows[0].maxOrden === null) ? 1 : rows[0].maxOrden + 1;
    }

    
    const insertQuery = parentColumn 
      ? `INSERT INTO ?? (titulo, ${parentColumn}, orden, numero) VALUES (?, ?, ?, ?)`
      : `INSERT INTO ?? (titulo, orden, numero) VALUES (?, ?, ?)`;
    const insertParams = parentColumn 
      ? [tableName, titulo, parentId, finalOrden, finalOrden]
      : [tableName, titulo, finalOrden, finalOrden];
      
    await connection.query(insertQuery, insertParams);

    await connection.commit();
    res.status(201).json({ message: `${tipo} creado con éxito.` });

  } catch (err) {
    await connection.rollback();
    console.error(`ERROR AL INSERTAR [${tipo}]`, err);
    res.status(500).json({ error: 'Error del servidor al crear el elemento.' });
  } finally {
    connection.release();
  }
});




router.post('/reordenar', async (req, res) => {
  const elementos = req.body;
  if (!Array.isArray(elementos) || elementos.length === 0) {
    return res.status(400).json({ error: 'Se esperaba un array de elementos.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const updatePromises = elementos.map(elemento => {
      let tableName = '';
      switch (elemento.tipo) {
        case 'capitulo': tableName = 'capitulos'; break;
        case 'seccion': tableName = 'secciones'; break;
        case 'subseccion': tableName = 'subsecciones'; break;
        default: throw new Error(`Tipo de elemento desconocido: ${elemento.tipo}`);
      }
      return connection.query(`UPDATE ?? SET orden = ? WHERE id = ?`, [tableName, elemento.orden, elemento.id]);
    });

    await Promise.all(updatePromises);
    await connection.commit();
    res.json({ success: true, message: 'Orden actualizado.' });
  } catch (err) {
    await connection.rollback();
    console.error('Error al reordenar elementos:', err);
    res.status(500).json({ error: 'Error interno al actualizar el orden.' });
  } finally {
    connection.release();
  }
});

module.exports = router;