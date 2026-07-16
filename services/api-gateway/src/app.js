const express = require('express');
const requestId = require('../../../shared/middleware/requestId');
const tenantContext = require('../../../shared/middleware/tenantContext');
const rateLimitByKey = require('../../../shared/middleware/rateLimitByKey');
const requireAdmin = require('../../../shared/middleware/requireAdmin');
const errorHandler = require('../../../shared/middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(requestId);
app.use('/api/v1', tenantContext);
app.use('/api/v1', rateLimitByKey);
app.use('/api/v1', require('./routes/auth'));
app.use('/api/v1', require('./routes/health'));
app.use('/api/v1', require('./routes/search'));
app.use('/api/v1/orders', require('../../orders-api/src/routes/orders'));
app.use('/api/v1/uploads', require('../../uploads-api/src/routes/uploads'));
app.use('/api/v1/admin', requireAdmin, require('../../admin-api/src/routes/admin'));
app.use(errorHandler);

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.info('gateway listening', { port }));
}

module.exports = app;
