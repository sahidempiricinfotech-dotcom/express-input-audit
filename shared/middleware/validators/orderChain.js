const { param } = require('express-validator');

const orderStatusChain = [
  param('orderId').isUUID()
];

module.exports = { orderStatusChain };
