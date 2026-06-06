const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Question = require('../src/modules/aptitude/question.model');
const Company = require('../src/modules/company/company.model');
const { TOPICS } = require('../src/shared/constants');

const SCRAPER_OUT_DIR = path.join(__dirname, '../../../prepster_scraper/output');
const COMPANIES_FILE = path.join(SCRAPER_OUT_DIR, 'companies.json');
const QUESTIONS_FILE = path.join(SCRAPER_OUT_DIR, 'MASTER_questions.csv');

// ── Simple CSV parser (handles quoted fields with commas inside) ──────────────
function parseCSVLine(text) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ── Map scraper topic strings to backend TOPICS enum ─────────────────────────
function mapTopic(topic, subTopic) {
  if (topic === 'quantitative') return TOPICS.QUANTITATIVE;
  if (topic === 'logical')      return TOPICS.LOGICAL;
  if (topic === 'verbal')       return TOPICS.VERBAL;
  if (topic === 'data_interpretation') return TOPICS.DI;

  if (topic === 'cs_sde') {
    const st = (subTopic || '').toLowerCase();
    if (st.includes('dbms'))                      return TOPICS.DBMS;
    if (st.includes('os'))                        return TOPICS.OS;
    if (st.includes('oops'))                      return TOPICS.OOPS;
    if (st.includes('network') || st.includes('cn')) return TOPICS.CN;
    if (st.includes('sql'))                       return TOPICS.SQL;
    return TOPICS.DSA; // Default CS fallback
  }
  return TOPICS.QUANTITATIVE; // Absolute fallback
}

// ── Seed Companies ────────────────────────────────────────────────────────────
async function seedCompanies() {
  console.log('\n📌 Seeding Companies...');

  if (!fs.existsSync(COMPANIES_FILE)) {
    console.log('⚠ companies.json not found at:', COMPANIES_FILE);
    return;
  }

  const data = JSON.parse(fs.readFileSync(COMPANIES_FILE, 'utf-8'));
  let upserted = 0;

  for (const comp of data) {
    await Company.findOneAndUpdate(
      { slug: comp.slug },
      {
        name: comp.name,
        logo: comp.logo || '',
        sector: comp.sector || '',
        hiringProcess: comp.hiringProcess || {},
        selectionCriteria: comp.selectionCriteria || {},
        packageInfo: comp.packageInfo || {},
        isActive: true,
      },
      { upsert: true, new: true }
    );
    upserted++;
  }
  console.log(`✅ Upserted ${upserted} companies.`);
}

// ── Seed Questions ────────────────────────────────────────────────────────────
async function seedQuestions() {
  console.log('\n📌 Seeding Questions...');

  if (!fs.existsSync(QUESTIONS_FILE)) {
    console.log('⚠ MASTER_questions.csv not found at:', QUESTIONS_FILE);
    return;
  }

  // Clear existing seeded questions to avoid duplicates on re-run
  const deleted = await Question.deleteMany({ source: { $regex: /Scraped/i } });
  console.log(`  Cleared ${deleted.deletedCount} previously seeded questions.`);

  const fileStream = fs.createReadStream(QUESTIONS_FILE);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let isHeader = true;
  let headers = [];
  let batch = [];
  let total = 0;
  const BATCH_SIZE = 200;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const parsed = parseCSVLine(line);

    if (isHeader) {
      headers = parsed;
      isHeader = false;
      continue;
    }

    // Map row to object
    const row = {};
    headers.forEach((h, i) => { row[h] = (parsed[i] || '').trim(); });

    // Build structured options array
    const options = [
      { label: 'A', text: row.optionA },
      { label: 'B', text: row.optionB },
      { label: 'C', text: row.optionC },
      { label: 'D', text: row.optionD },
    ].filter(o => o.text && o.text.length > 0);

    if (options.length < 2 || !row.text) continue;

    const compArray = row.companies
      ? row.companies.split(';').map(s => s.trim()).filter(Boolean)
      : [];
    const tagsArray = row.tags
      ? row.tags.split(';').map(s => s.trim()).filter(Boolean)
      : [];

    batch.push({
      text: row.text,
      options,
      correctOption: row.correctOption || 'A',
      explanation: row.explanation || 'No explanation provided.',
      topic: mapTopic(row.topic, row.subTopic),
      subTopic: row.subTopic || 'General',
      difficulty: ['easy', 'medium', 'hard'].includes(row.difficulty) ? row.difficulty : 'medium',
      companies: compArray,
      tags: tagsArray,
      source: row.source || 'Scraped',
      isActive: true,
    });

    if (batch.length >= BATCH_SIZE) {
      await Question.insertMany(batch, { ordered: false });
      total += batch.length;
      process.stdout.write(`\r  Inserted ${total} questions...`);
      batch = [];
    }
  }

  // Flush remaining batch
  if (batch.length > 0) {
    await Question.insertMany(batch, { ordered: false });
    total += batch.length;
  }

  console.log(`\n✅ Successfully inserted ${total} questions.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepster';
    console.log(`🔌 Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
    console.log('Connected ✓\n');

    await seedCompanies();
    await seedQuestions();

    console.log('\n🎉 Database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

run();
