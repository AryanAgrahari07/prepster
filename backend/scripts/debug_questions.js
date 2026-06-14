/**
 * debug_questions.js
 * Quick script to check what company slugs are in the DB
 * Run: node scripts/debug_questions.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Question = require('../src/modules/aptitude/question.model');

async function run() {
  const uri = process.env.MONGODB_URI ||
    'mongodb+srv://dinzsoftwares_db_user:cKB7TkiaYcVDsk94@cluster0prepster.gsmpyba.mongodb.net/prepster?appName=Cluster0prepster';
  await mongoose.connect(uri);
  console.log('Connected ✓\n');

  // Count by company slug
  const results = await Question.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$companies' },
    { $group: { _id: '$companies', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 30 }
  ]);

  console.log('📊 Questions per company slug in DB:');
  console.log('=====================================');
  results.forEach(r => console.log(`  ${r._id.padEnd(25)} → ${r.count} questions`));

  // Specifically check infosys
  const infosysCount = await Question.countDocuments({ companies: 'infosys', isActive: true });
  const infosysCapCount = await Question.countDocuments({ companies: 'Infosys', isActive: true });
  console.log('\n🔍 Infosys check:');
  console.log(`  companies: "infosys"  → ${infosysCount}`);
  console.log(`  companies: "Infosys"  → ${infosysCapCount}`);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
