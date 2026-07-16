const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Pool } = require('pg');

const router = express.Router();
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const AVATAR_DIR = process.env.AVATAR_DIR || path.join(process.cwd(), 'var', 'avatars');
const upload = multer({
  dest: AVATAR_DIR,
  limits: { fileSize: 5 * 1024 * 1024 }
});

async function uploadAvatar(req, res, next) {
  try {
    const file = req.file;
    const destination = path.join(AVATAR_DIR, file.originalname);
    fs.renameSync(file.path, destination);

    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return res.status(415).json({ error: 'unsupported media type' });
    }

    await db.query(
      'UPDATE users SET avatar_path = $1 WHERE id = $2',
      [destination, req.body.userId]
    );
    res.status(201).json({ path: destination });
  } catch (error) {
    next(error);
  }
}

router.post('/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
module.exports.uploadAvatar = uploadAvatar;
