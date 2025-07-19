// backend/models/sectionModel.js
const db = require('../db');

async function getAllSections() {
  const [rows] = await db.query('SELECT * FROM secciones ORDER BY orden');
  return rows;
}

module.exports = { getAllSections };
