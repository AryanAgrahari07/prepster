const { getRedis } = require('./backend/src/config/redis');
const User = require('./backend/src/modules/user/user.model');
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function resetLimits() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const redis = getRedis();
    if (!redis) {
      console.log('No Redis configured.');
      process.exit(0);
    }
    
    const users = await User.find();
    for (const user of users) {
      const dailyKey = `daily_q:${user._id}`;
      await redis.del(dailyKey);
      console.log(`Reset daily limit for user ${user.email}`);
    }
    
    console.log('All limits reset!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetLimits();
