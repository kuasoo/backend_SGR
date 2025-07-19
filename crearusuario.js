const bcrypt = require('bcryptjs');
const db = require('./db');

async function crearUsuario() {
  const username = 'kuasoo';
  const passwordPlano = '1234';
  const hash = await bcrypt.hash(passwordPlano, 10);

  await db.query(
    'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)',
    [username, hash, 'colaborador']
  );

  console.log('Usuario creado correctamente');
  process.exit();
}

crearUsuario();
