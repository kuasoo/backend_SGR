// backend/server.js

// Importación de dependencias principales
const express = require('express');     // Framework para servidor HTTP
const cors = require('cors');           // Middleware para habilitar CORS (permite peticiones desde otros orígenes)
const dotenv = require('dotenv');       
const app = express();                  // Inicializa una instancia de Express


dotenv.config();

// Middlewares globales
app.use(cors());                        // Permite peticiones desde otros dominios
app.use(express.json());                // Habilita el análisis de JSON en las solicitudes

// Importación de rutas definidas en archivos separados
const estructuraRoutes = require('./routes/estructura');
const capitulosRoutes = require('./routes/capitulos');
const seccionesRoutes = require('./routes/secciones');
const subseccionesRoutes = require('./routes/subsecciones');
const contenidoRoutes = require('./routes/contenido');
const exportarDocxRoutes = require('./routes/exportar');
const authRoutes = require('./routes/auth');
const uploadsRoutes = require('./routes/uploads');
const usuariosRoutes = require('./routes/usuarios');

// Definición de rutas base para cada módulo del sistema
app.use('/api/estructura', estructuraRoutes);          // Estructura del reporte
app.use('/api/capitulos', capitulosRoutes);            // CRUD de capítulos
app.use('/api/secciones', seccionesRoutes);            // CRUD de secciones
app.use('/api/subsecciones', subseccionesRoutes);      // CRUD de subsecciones
app.use('/api/contenido', contenidoRoutes);            // Contenido textual de cada sección
app.use('/api/exportar-docx', exportarDocxRoutes);     // Exportación de documento Word
app.use('/api/auth', authRoutes);                      // Autenticación de usuarios
app.use('/api/uploads', uploadsRoutes);                // Subida de archivos
app.use('/api/usuarios', usuariosRoutes);              // Gestión de usuarios
app.use('/api/elementos', require('./routes/elementos')); // Ruta adicional para los elementos


// Configuración del puerto de escucha
const PORT = process.env.PORT || 3001;

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor backend en puerto ${PORT}`);
});
app.get('/', (req, res) => {
  res.send('🚀 Backend SGR desplegado exitosamente en Render.');
});

