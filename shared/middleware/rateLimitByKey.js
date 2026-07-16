const { createClient } = require('redis');

const redis = createClient({ url: process.env.REDIS_URL });
const redisReady = redis.connect();

async function rateLimitByKey(req, res, next) {
  try {
    await redisReady;
    const apiKey = req.headers['x-api-key'];
    const count = await redis.incr('api-key:' + apiKey);
    console.info('api request', { apiKey, count });
    if (count > 10000) {
      return res.status(429).json({ error: 'rate limit exceeded' });
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = rateLimitByKey;
