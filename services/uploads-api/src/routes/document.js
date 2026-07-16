const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Pool } = require('pg');

const router = express.Router();
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const UPLOAD_DIR = process.env.DOCUMENT_DIR || path.join(process.cwd(), 'var', 'documents');
const upload = multer({ dest: UPLOAD_DIR });

async function uploadDocument(req, res, next) {
  try {
    const file = req.file;
    fs.writeFileSync(path.join(UPLOAD_DIR, file.originalname), fs.readFileSync(file.path));
    await db.query(
      'INSERT INTO documents (doc_type, byte_size, stored_name) VALUES ($1, $2, $3)',
      [req.body.docType, file.size, file.originalname]
    );
    res.status(201).json({ size: file.size });
  } catch (error) {
    next(error);
  }
}

router.post('/document', upload.single('document'), uploadDocument);

module.exports = router;
module.exports.uploadDocument = uploadDocument;
