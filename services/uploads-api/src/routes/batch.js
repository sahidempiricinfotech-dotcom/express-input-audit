const express = require('express');
const path = require('path');
const multer = require('multer');
const Joi = require('joi');
const { Pool } = require('pg');
const validateBody = require('../../../../shared/middleware/validateBody');

const router = express.Router();
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const BATCH_DIR = process.env.BATCH_DIR || path.join(process.cwd(), 'var', 'batches');

const storage = multer.diskStorage({
  destination: BATCH_DIR,
  filename(req, file, callback) {
    if (!/^[\w.-]{1,64}$/.test(file.originalname)) {
      return callback(new Error('invalid filename'));
    }
    callback(null, file.originalname);
  }
});

function fileFilter(req, file, callback) {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  callback(null, allowed.includes(file.mimetype));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 }
});

const batchSchema = Joi.object({
  albumId: Joi.string().uuid().required()
}).unknown(true);

async function uploadBatch(req, res, next) {
  try {
    const files = req.files;
    for (const file of files) {
      await db.query(
        'INSERT INTO album_files (album_id, original_name, mime_type) VALUES ($1, $2, $3)',
        [req.body.albumId, file.originalname, file.mimetype]
      );
    }
    res.status(201).json({ uploaded: files.length });
  } catch (error) {
    next(error);
  }
}

router.post('/batch', upload.array('files', 10), validateBody(batchSchema), uploadBatch);

module.exports = router;
module.exports.uploadBatch = uploadBatch;
