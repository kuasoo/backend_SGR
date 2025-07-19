// middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../db');
const SECRET = process.env.JWT_SECRET || 'clave_secreta';

function verificarToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido' });
  }
}


function soloAdmin(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
}

async function puedeEditarSeccion(req, res, next) {
  const userId = req.user.id;
  const seccionId = req.params.id;

  const [[asignacion]] = await db.query(
    'SELECT * FROM asignaciones WHERE usuario_id = ? AND seccion_id = ?',
    [userId, seccionId]
  );

  if (!asignacion && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permiso para editar esta sección' });
  }
  next();
}

module.exports = {
  verificarToken,
  soloAdmin,
  puedeEditarSeccion,
};
