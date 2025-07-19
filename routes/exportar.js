const express = require('express');
const fs = require('fs');
const path = require('path');

const { Document, Packer, Paragraph, HeadingLevel, TextRun } = require('docx');
const db = require('../db');

const router = express.Router();


function limpiarHtml(htmlString) {
    if (!htmlString) return '';
    
    return htmlString.replace(/<p>/gi, '\n').replace(/<\/p>/gi, '').replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;/gi, ' ').replace(/<[^>]+>/g, '').trim();
}

router.get('/', async (req, res) => {
  try {
    const [capitulos] = await db.query('SELECT * FROM capitulos ORDER BY orden');
    const docChildren = []; 

    for (const [i, cap] of capitulos.entries()) {
      const capNum = `${i + 1}`;
      //Añadir Título del Capítulo
      docChildren.push(new Paragraph({
        text: `${capNum}. ${cap.titulo}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 }
      }));

      //Añadir Contenido del Capítulo
      if (cap.contenido) {
        const textoLimpio = limpiarHtml(cap.contenido);
        docChildren.push(new Paragraph({ text: textoLimpio, spacing: { after: 200 } }));
      }

      //Obtener y procesar Secciones
      const [secciones] = await db.query('SELECT * FROM secciones WHERE capitulo_id = ? ORDER BY orden', [cap.id]);
      for (const [j, sec] of secciones.entries()) {
        const secNum = `${capNum}.${j + 1}`;
        //Añadir Título de la Sección
        docChildren.push(new Paragraph({
          text: `${secNum} ${sec.titulo}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 }
        }));
        
        //Añadir Contenido de la Sección
        if (sec.contenido) {
          const textoLimpio = limpiarHtml(sec.contenido);
          docChildren.push(new Paragraph({ text: textoLimpio, spacing: { after: 200 } }));
        }

      

        //Obtener y procesar Subsecciones
        const [subsecciones] = await db.query('SELECT * FROM subsecciones WHERE seccion_id = ? ORDER BY orden', [sec.id]);
        for (const [k, sub] of subsecciones.entries()) {
          const subNum = `${secNum}.${k + 1}`;
          // Añadir Título de la Subsección 
          docChildren.push(new Paragraph({
            text: `${subNum} ${sub.titulo}`,
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200 }
          }));
          
          //Añadir Contenido de la Subsección 
          if (sub.contenido) {
            const textoLimpio = limpiarHtml(sub.contenido);
            docChildren.push(new Paragraph({ text: textoLimpio, spacing: { after: 200 } }));
          }

          
        }
      }
    }

    // Crear y enviar el documento
    const doc = new Document({
      creator: 'SGR System',
      title: 'Reporte Trimestral',
      sections: [{ children: docChildren }]
    });

    const buffer = await Packer.toBuffer(doc);
    const fileName = `reporte_${Date.now()}.docx`;

    // Enviar el archivo directamente como buffer, sin guardarlo en el disco
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);

  } catch (err) {
    console.error('Error generando documento:', err);
    res.status(500).json({ error: 'No se pudo generar el documento' });
  }
});

module.exports = router;




