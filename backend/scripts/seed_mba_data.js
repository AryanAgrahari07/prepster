const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Load models
const Sector = require('../src/modules/mba/models/sector.model');
const PiQuestion = require('../src/modules/mba/models/piQuestion.model');
const CaseStudy = require('../src/modules/mba/models/caseStudy.model');
const Guesstimate = require('../src/modules/mba/models/guesstimate.model');
const GdTopic = require('../src/modules/mba/models/gdTopic.model');
const WatTopic = require('../src/modules/mba/models/watTopic.model');

const SCRAPER_OUT_DIR = path.join(__dirname, '../../../prepster_scraper/output');

async function seedData(model, fileName, modelName) {
  const filePath = path.join(SCRAPER_OUT_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ ${fileName} not found at: ${filePath}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let inserted = 0;
  
  // Clear existing items to prevent duplicates during seeding
  await model.deleteMany({});

  for (const item of data) {
    try {
      await model.create(item);
      inserted++;
    } catch (err) {
      console.error(`Error inserting into ${modelName}:`, err.message);
    }
  }
  console.log(`✅ Seeded ${inserted} ${modelName}s`);
}

async function run() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://dinzsoftwares_db_user:cKB7TkiaYcVDsk94@cluster0prepster.gsmpyba.mongodb.net/?appName=Cluster0prepster';
    console.log(`🔌 Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
    console.log('Connected ✓\n');

    console.log('📌 Starting MBA Data Seeding...');
    await seedData(Sector, 'mba_sectors.json', 'Sector');
    await seedData(PiQuestion, 'mba_pi_questions.json', 'PI Question');
    await seedData(CaseStudy, 'mba_case_studies.json', 'Case Study');
    await seedData(Guesstimate, 'mba_guesstimates.json', 'Guesstimate');
    await seedData(GdTopic, 'mba_gd_topics.json', 'GD Topic');
    await seedData(WatTopic, 'mba_wat_topics.json', 'WAT Topic');

    // Clear Redis cache so frontend immediately sees the new data
    try {
      const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      await redis.flushall();
      console.log('🧹 Cleared Redis Cache successfully.');
      redis.disconnect();
    } catch (redisErr) {
      console.log('⚠ Could not clear Redis cache, you may need to wait 5 mins for frontend updates.', redisErr.message);
    }

    console.log('\n🎉 MBA Database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

run();
