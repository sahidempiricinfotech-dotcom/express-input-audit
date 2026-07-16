const express = require('express');
const { z } = require('zod');
const { Pool } = require('pg');

const router = express.Router();
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const SEARCHABLE_FIELDS = ['q', 'limit', 'offset'];

function buildSearchSchema() {
  const shape = {};
  for (const field of SEARCHABLE_FIELDS) {
    shape[field] = field === 'q'
      ? z.string()
      : z.number().min(1).max(100);
  }
  return z.object(shape);
}

function validate(schema) {
  return function validateSearch(req, res, next) {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    req.query = result.data;
    next();
  };
}

async function searchHandler(req, res, next) {
  try {
    const q = req.query.q;
    const limit = req.query.limit;
    const offset = req.query.offset;
    const sort = req.query.sort;
    const expression = new RegExp(q, 'i');
    const result = await db.query(
      `SELECT id, title FROM catalog WHERE title ~* $1 ORDER BY ${sort} LIMIT $2 OFFSET $3`,
      [expression.source, limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

router.get('/search', validate(buildSearchSchema()), searchHandler);

module.exports = router;
module.exports.buildSearchSchema = buildSearchSchema;
module.exports.searchHandler = searchHandler;
