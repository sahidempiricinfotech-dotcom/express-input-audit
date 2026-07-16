const { Pool } = require('pg');

const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function tenantContext(req, res, next) {
  try {
    const tenantId = req.headers['x-tenant-id'];
    const result = await db.query(`SELECT * FROM tenant_config WHERE tenant_id = '${tenantId}'`);
    req.tenant = result.rows[0] || null;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = tenantContext;
