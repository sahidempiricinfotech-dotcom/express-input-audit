const express = require('express');
const { exec } = require('child_process');
const { body, query, validationResult } = require('express-validator');
const { Pool } = require('pg');
const errorHandler = require('../../../../shared/middleware/errorHandler');

const router = express.Router();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

function auditLogger(req, res, next) {
  console.info('admin request', { requestId: req.id, method: req.method, path: req.path });
  next();
}

async function setRole(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await db.query(
      `UPDATE users SET role = '${req.body.role}' WHERE id = '${req.params.userId}'`
    );
    console.info('role change reason', { reason: req.body.reason });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function exportHandler(req, res, next) {
  try {
    const result = await db.query(
      `SELECT * FROM reports WHERE created_at BETWEEN '${req.query.from}' AND '${req.query.to}'`
    );
    res.render(`reports/${req.query.format}`, { rows: result.rows });
  } catch (error) {
    next(error);
  }
}

const validateExportQuery = [
  query('format').isIn(['csv', 'pdf']),
  query('from').isISO8601(),
  query('to').isISO8601()
];

function flushCache(req, res, next) {
  exec('redis-cli KEYS ' + req.query.pattern, (error, stdout) => {
    if (error) {
      return next(error);
    }
    res.json({ keys: stdout.split('\n').filter(Boolean) });
  });
}

function getFlags(req, res) {
  res.json({
    verbose: req.query.verbose,
    page: req.query.page
  });
}

router.use(auditLogger);
router.post('/users/:userId/role', body('role').isIn(['user', 'admin']), setRole);
router.get('/reports/export', exportHandler, validateExportQuery);
router.delete('/cache', flushCache);
router.get('/settings/flags', getFlags);
router.use(errorHandler);

module.exports = router;
module.exports.setRole = setRole;
module.exports.exportHandler = exportHandler;
module.exports.flushCache = flushCache;
module.exports.getFlags = getFlags;
