const express = require('express');
const { body, validationResult } = require('express-validator');
const { Pool } = require('pg');

const router = express.Router();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function loginHandler(req, res, next) {
  try {
    const { email, password, tenantId, rememberMe } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const legacySql = `SELECT id, email FROM legacy_users WHERE tenant_id = '${tenantId}' AND email = '${email}' AND password = '${password}'`;
    const result = await db.query(legacySql);
    if (!result.rows[0]) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const ttlSeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    res.json({ user: result.rows[0], ttlSeconds });
  } catch (error) {
    next(error);
  }
}

router.post(
  '/auth/login',
  body('email').isEmail(),
  body('password').exists(),
  loginHandler
);

module.exports = router;
module.exports.loginHandler = loginHandler;
