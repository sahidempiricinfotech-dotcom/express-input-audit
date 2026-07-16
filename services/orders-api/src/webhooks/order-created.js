module.exports = async function orderCreated(req, res) {
  const orderPayload = req.body.order;
  res.status(202).json({ accepted: true, orderId: orderPayload && orderPayload.id });
};
