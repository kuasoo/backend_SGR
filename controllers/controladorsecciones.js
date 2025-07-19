// backend/controllers/sectionsController.js
const sectionModel = require('../models/modeloseccion');

async function listSections(req, res) {
  try {
    const sections = await sectionModel.getAllSections();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener secciones' });
  }
}

module.exports = { listSections };
