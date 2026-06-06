const { getRedis } = require('../config/redis');
const crypto = require('crypto');

/**
 * cacheMiddleware — wraps a route with Redis GET→SET caching.
 *
 * @param {string|function} keyOrFn — static key string, or (req) => string
 * @param {number} ttlSeconds — cache TTL (default 300 = 5 min)
 */
const cacheMiddleware = (keyOrFn, ttlSeconds = 300) => async (req, res, next) => {
  const redis = getRedis();
  const cacheKey = typeof keyOrFn === 'function' ? keyOrFn(req) : keyOrFn;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch (err) {
    // Cache read failure — fall through to DB
    console.warn('[cache] read error:', err.message);
  }

  // Monkey-patch res.json to also write to cache before sending
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (res.statusCode === 200) {
      try {
        await redis.setex(cacheKey, ttlSeconds, JSON.stringify(body));
      } catch (err) {
        console.warn('[cache] write error:', err.message);
      }
    }
    return originalJson(body);
  };

  next();
};

/**
 * invalidateCache — deletes one or more cache keys.
 * Call this in mutation routes (POST/PUT/DELETE) to bust stale cache.
 *
 * @param {...string} keys
 */
const invalidateCache = async (...keys) => {
  const redis = getRedis();
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    console.warn('[cache] invalidation error:', err.message);
  }
};

/**
 * jobsFeedKey — builds a deterministic cache key from the jobs query params.
 * Same filter → same cache key → one DB hit.
 */
const jobsFeedKey = (req) => {
  const { page = 1, limit = 10, type = '', workMode = '', q = '', batchYear = '' } = req.query;
  const hash = crypto
    .createHash('md5')
    .update(`${page}:${limit}:${type}:${workMode}:${q}:${batchYear}`)
    .digest('hex')
    .slice(0, 12);
  return `jobs_feed:${hash}`;
};

module.exports = { cacheMiddleware, invalidateCache, jobsFeedKey };
