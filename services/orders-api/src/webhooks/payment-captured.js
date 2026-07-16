module.exports = async function paymentCaptured(req, res) {
  const paymentPayload = req.body.payment;
  res.status(202).json({ accepted: true, paymentId: paymentPayload && paymentPayload.id });
};
