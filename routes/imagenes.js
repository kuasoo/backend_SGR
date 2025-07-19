// backend/routes/imagenes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


router.post('/', upload.single('file'), (req, res) => {
  

  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  //URL pública del archivo
  const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;

 
  res.json({ location: fileUrl });
});

module.exports = router;