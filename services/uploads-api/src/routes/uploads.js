const express = require('express');

const router = express.Router();

router.use(require('./avatar'));
router.use(require('./document'));
router.use(require('./batch'));

module.exports = router;
