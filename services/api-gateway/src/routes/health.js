const express = require('express');

const router = express.Router();

function healthHandler(req, res) {
  res.json({ status: 'ok', verbose: req.query.verbose });
}

router.get('/health', healthHandler);

module.exports = router;
module.exports.healthHandler = healthHandler;
