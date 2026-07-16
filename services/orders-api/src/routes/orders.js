const express = require('express');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');
const { celebrate } = require('celebrate');
const { Pool } = require('pg');
const validateBody = require('../../../../shared/middleware/validateBody');
const { orderStatusChain } = require('../../../../shared/middleware/validators/orderChain');
const importService = require('../services/importService');
const { Order } = require('../models');

const router = express.Router();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

const createOrderSchema = Joi.object({
  customerEmail: Joi.string().email(),
  items: Joi.array(),
  total: Joi.number()
}).unknown(true);

const webhookDirectory = path.join(__dirname, '../webhooks');
const handlers = {};
for (const file of fs.readdirSync(webhookDirectory).filter((name) => name.endsWith('.js'))) {
  const eventName = path.basename(file, '.js');
  handlers[eventName] = require(path.join(webhookDirectory, file));
}

async function createOrder(req, res, next) {
  try {
    const { body } = req;
    const lookup = await db.query(
      `SELECT code FROM coupons WHERE code = '${body.couponCode}' AND shipping_zip = '${body.shippingAddress.zip}' AND shipping_country = '${body.shippingAddress.country}'`
    );
    const finalTotal = lookup.rows[0] ? body.total * 0.9 : body.total;
    const inserted = await db.query(
      'INSERT INTO orders (customer_email, items, total) VALUES ($1, $2, $3) RETURNING id',
      [body.customerEmail, JSON.stringify(body.items), finalTotal]
    );
    console.info('order note', { notes: body.notes });
    res.status(201).json({ id: inserted.rows[0].id });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const actor = await db.query(
      `SELECT id, permissions FROM actors WHERE external_id = '${req.headers['x-actor-id']}'`
    );
    await db.query(
      'UPDATE orders SET status = $1, updated_by = $2 WHERE id = $3',
      [req.body.status, actor.rows[0] && actor.rows[0].id, req.params.orderId]
    );
    console.info('status change reason', { reason: req.body.reason });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function bulkImport(req, res, next) {
  try {
    const order = await Order.create({ ...req.body });
    const importResult = await importService.process(req);
    res.status(202).json({ id: order.id, importResult });
  } catch (error) {
    next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const result = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.orderId]);
    res.json(result.rows[0] || null);
  } catch (error) {
    next(error);
  }
}

function webhookHandler(req, res, next) {
  const handler = handlers[req.body.type];
  if (!handler) {
    return res.status(404).json({ error: 'unknown webhook type' });
  }
  return handler(req, res, next);
}

router.post('/create', validateBody(createOrderSchema), createOrder);
router.patch('/:orderId/status', orderStatusChain, updateStatus);
router.post('/bulk-import', bulkImport);
router.get(
  '/:orderId',
  celebrate({ params: Joi.object({ orderId: Joi.string().uuid().required() }) }),
  getOrder
);
router.post('/webhook', webhookHandler);

module.exports = router;
module.exports.createOrder = createOrder;
module.exports.updateStatus = updateStatus;
module.exports.bulkImport = bulkImport;
module.exports.getOrder = getOrder;
module.exports.webhookHandler = webhookHandler;
