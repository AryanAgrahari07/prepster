const Redis = require('ioredis');

let redis;

const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

  if (!redisUrl) {
    console.warn('⚠️  No Redis URL configured — using in-memory fallback (dev only)');
    return null;
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 10) return null; // Stop retrying after 10 attempts
      return Math.min(times * 100, 3000);
    },
    lazyConnect: true,
  });

  client.on('connect', () => console.log('✅ Redis connected'));
  client.on('error', (err) => console.error('❌ Redis error:', err.message));
  client.on('close', () => console.warn('⚠️  Redis connection closed'));

  return client;
};

// Singleton
redis = createRedisClient();

// ─── In-memory fallback store (dev only when Redis not configured) ───
const memStore = new Map();
const inMemoryFallback = {
  get: async (key) => memStore.get(key) ?? null,
  set: async (key, value) => { memStore.set(key, value); return 'OK'; },
  setex: async (key, ttl, value) => { memStore.set(key, value); return 'OK'; },
  del: async (...keys) => { keys.flat().forEach(k => memStore.delete(k)); return keys.flat().length; },
  exists: async (key) => (memStore.has(key) ? 1 : 0),
  keys: async (pattern) => {
    // Simple glob pattern: only supports trailing '*' for prefix matching
    const prefix = pattern.endsWith('*') ? pattern.slice(0, -1) : null;
    return [...memStore.keys()].filter(k => prefix ? k.startsWith(prefix) : k === pattern);
  },
  incr: async (key) => {
    const val = parseInt(memStore.get(key) || '0') + 1;
    memStore.set(key, String(val));
    return val;
  },
  expire: async () => 1,
  ttl: async () => -1,
  zadd: async () => 1,
  zrevrange: async () => [],
  zrevrangebyscore: async () => [],
};

const getRedis = () => redis || inMemoryFallback;

module.exports = { getRedis, redis };
