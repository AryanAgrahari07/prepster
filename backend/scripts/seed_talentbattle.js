/**
 * seed_talentbattle.js
 * ====================
 * Uploads TalentBattle scraped questions to MongoDB WITHOUT deleting
 * existing questions. Also upserts Company documents for every company
 * found in the CSV so they appear in the UI.
 *
 * Run: node scripts/seed_talentbattle.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const Redis = require('ioredis');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Question = require('../src/modules/aptitude/question.model');
const Company = require('../src/modules/company/company.model');
const { TOPICS } = require('../src/shared/constants');

// ── Resolve path to TALENTBATTLE_questions.csv ───────────────────────────────
// __dirname = Desktop/prepster/backend/scripts
// We need: Desktop/prepster_scraper/output
const SCRAPER_OUT_DIR = path.join(__dirname, '../../../prepster_scraper/output');
const TALENTBATTLE_QUESTIONS_FILE = path.join(SCRAPER_OUT_DIR, 'TALENTBATTLE_questions.csv');

console.log('📂 Looking for CSV at:', TALENTBATTLE_QUESTIONS_FILE);

// ── Company slug/name/sector mapping ─────────────────────────────────────────
// Maps the lowercase slug (used in questions.companies[]) to metadata
const COMPANY_META = {
  accenture:     { name: 'Accenture',        sector: 'IT Services',         fresher: '₹4.5 LPA' },
  cisco:         { name: 'Cisco',            sector: 'Networking & Cloud',  fresher: '₹12 LPA'  },
  cognizant:     { name: 'Cognizant',        sector: 'IT Services',         fresher: '₹4 LPA'   },
  capgemini:     { name: 'Capgemini',        sector: 'IT Services',         fresher: '₹3.8 LPA' },
  deloitte:      { name: 'Deloitte',         sector: 'Consulting',          fresher: '₹7 LPA'   },
  dxc:           { name: 'DXC Technology',   sector: 'IT Services',         fresher: '₹3.5 LPA' },
  dell:          { name: 'Dell',             sector: 'IT Hardware',         fresher: '₹5 LPA'   },
  goldman_sachs: { name: 'Goldman Sachs',    sector: 'Finance & Banking',   fresher: '₹12 LPA'  },
  hexaware:      { name: 'Hexaware',         sector: 'IT Services',         fresher: '₹3.5 LPA' },
  infosys:       { name: 'Infosys',          sector: 'IT Services',         fresher: '₹3.6 LPA' },
  infytq:        { name: 'InfyTQ',           sector: 'IT Services',         fresher: '₹3.6 LPA' },
  lti:           { name: 'LTI Mindtree',     sector: 'IT Services',         fresher: '₹4 LPA'   },
  mindtree:      { name: 'Mindtree',         sector: 'IT Services',         fresher: '₹4 LPA'   },
  tcs:           { name: 'TCS',              sector: 'IT Services',         fresher: '₹3.36 LPA'},
  tech_mahindra: { name: 'Tech Mahindra',    sector: 'IT Services',         fresher: '₹3.5 LPA' },
  wipro:         { name: 'Wipro',            sector: 'IT Services',         fresher: '₹3.5 LPA' },
  hcl:           { name: 'HCL Technologies', sector: 'IT Services',         fresher: '₹3.5 LPA' },
  amazon:        { name: 'Amazon',           sector: 'Product & E-Commerce',fresher: '₹28 LPA'  },
  zoho:          { name: 'Zoho',             sector: 'SaaS / Product',      fresher: '₹6.5 LPA' },
};

// ── CSV helpers ───────────────────────────────────────────────────────────────
function parseCSVLine(text) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"') { current += '"'; i++; }
    else if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += char; }
  }
  result.push(current);
  return result;
}

function toSlug(raw) {
  const str = (raw || '').trim().toLowerCase();
  if (str.includes('tcs') || str === 'tata consultancy services') return 'tcs';
  if (str.includes('infytq'))                                      return 'infytq';
  if (str.includes('infosys'))                                     return 'infosys';
  if (str.includes('wipro'))                                       return 'wipro';
  if (str.includes('accenture'))                                   return 'accenture';
  if (str.includes('cognizant'))                                   return 'cognizant';
  if (str.includes('capgemini'))                                   return 'capgemini';
  if (str.includes('hcl'))                                         return 'hcl';
  if (str.includes('tech mahindra') || str.includes('techm') || str.includes('tech_mahindra')) return 'tech_mahindra';
  if (str.includes('amazon'))                                      return 'amazon';
  if (str.includes('zoho'))                                        return 'zoho';
  if (str.includes('cisco'))                                       return 'cisco';
  if (str.includes('deloitte'))                                    return 'deloitte';
  if (str.includes('dxc'))                                         return 'dxc';
  if (str.includes('dell'))                                        return 'dell';
  if (str.includes('goldman'))                                     return 'goldman_sachs';
  if (str.includes('hexaware'))                                    return 'hexaware';
  if (str.includes('lti') || str.includes('mindtree'))            return 'lti';
  return str.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function mapTopic(topic, subTopic, tagsArray = []) {
  if (topic === 'quantitative') return TOPICS.QUANTITATIVE;
  if (topic === 'logical')      return TOPICS.LOGICAL;
  if (topic === 'verbal')       return TOPICS.VERBAL;
  if (topic === 'data_interpretation') return TOPICS.DI;
  if (topic === 'dbms')         return TOPICS.DBMS;
  if (topic === 'os')           return TOPICS.OS;
  if (topic === 'oops')         return TOPICS.OOPS;
  if (topic === 'sql')          return TOPICS.SQL;
  if (topic === 'se')           return TOPICS.SE;
  if (topic === 'system-design') return TOPICS.SYSTEM_DESIGN;
  if (topic === 'cn')           return TOPICS.CN;
  if (topic === 'dsa')          return TOPICS.DSA;
  if (topic === 'web')          return TOPICS.WEB;
  if (topic === 'ml')           return TOPICS.ML;
  if (topic === 'cloud')        return TOPICS.CLOUD;

  if (topic === 'cs_sde') {
    const st = (subTopic || '').toLowerCase();
    const tags = tagsArray.map(t => t.toLowerCase());
    if (tags.includes('dbms') || st.includes('dbms'))           return TOPICS.DBMS;
    if (tags.includes('os') || st.includes('os'))               return TOPICS.OS;
    if (tags.includes('oops') || st.includes('oops'))           return TOPICS.OOPS;
    if (tags.includes('networks') || tags.includes('cn') || st.includes('network')) return TOPICS.CN;
    if (tags.includes('sql') || st.includes('sql'))             return TOPICS.SQL;
    if (tags.includes('system_design') || st.includes('system-design')) return TOPICS.SYSTEM_DESIGN;
    if (tags.includes('web') || st.includes('web'))             return TOPICS.WEB;
    if (tags.includes('cloud') || st.includes('cloud'))         return TOPICS.CLOUD;
    if (tags.includes('ml') || st.includes('ml'))               return TOPICS.ML;
    return TOPICS.DSA;
  }
  return TOPICS.QUANTITATIVE;
}

// ── Step 1: Parse CSV and insert questions ────────────────────────────────────
async function seedQuestions() {
  console.log('\n📌 Step 1 — Inserting TalentBattle questions...');

  if (!fs.existsSync(TALENTBATTLE_QUESTIONS_FILE)) {
    console.error('❌ CSV not found at:', TALENTBATTLE_QUESTIONS_FILE);
    console.error('   Please run: python scrapers/scraper_talentbattle.py first.');
    return new Set();
  }

  // Remove any previously uploaded TalentBattle questions (safe to re-run)
  const { deletedCount } = await Question.deleteMany({ source: 'TalentBattle_Scraped' });
  if (deletedCount > 0) console.log(`   Removed ${deletedCount} old TalentBattle questions (re-seeding).`);

  const fileStream = fs.createReadStream(TALENTBATTLE_QUESTIONS_FILE);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let isHeader = true;
  let headers = [];
  let batch = [];
  let total = 0;
  const BATCH_SIZE = 200;
  const companySlugsFound = new Set(); // track which companies appeared in the CSV

  for await (const line of rl) {
    if (!line.trim()) continue;
    const parsed = parseCSVLine(line);

    if (isHeader) { headers = parsed; isHeader = false; continue; }

    const row = {};
    headers.forEach((h, i) => { row[h] = (parsed[i] || '').trim(); });

    const options = [
      { label: 'A', text: row.optionA },
      { label: 'B', text: row.optionB },
      { label: 'C', text: row.optionC },
      { label: 'D', text: row.optionD },
    ].filter(o => o.text && o.text.length > 0);

    if (options.length < 2 || !row.text) continue;

    const tagsArray = row.tags ? row.tags.split(';').map(s => s.trim()).filter(Boolean) : [];

    const compArray = row.companies
      ? row.companies.split(';').map(s => toSlug(s)).filter(Boolean)
      : [];

    compArray.forEach(s => companySlugsFound.add(s));

    batch.push({
      text:          row.text,
      options,
      correctOption: row.correctOption || 'A',
      explanation:   row.explanation || 'No explanation provided.',
      topic:         mapTopic(row.topic, row.subTopic, tagsArray),
      subTopic:      row.subTopic || 'General',
      difficulty:    ['easy', 'medium', 'hard'].includes(row.difficulty) ? row.difficulty : 'medium',
      companies:     compArray,
      tags:          tagsArray,
      source:        'TalentBattle_Scraped',
      isActive:      true,
    });

    if (batch.length >= BATCH_SIZE) {
      await Question.insertMany(batch, { ordered: false });
      total += batch.length;
      process.stdout.write(`\r   Inserted ${total} questions...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await Question.insertMany(batch, { ordered: false });
    total += batch.length;
  }

  console.log(`\n✅ Inserted ${total} TalentBattle questions.`);
  return companySlugsFound;
}

// ── Step 2: Upsert Company documents so they appear in the UI ─────────────────
async function upsertCompanies(companySlugsFound) {
  console.log('\n📌 Step 2 — Upserting Company documents for UI visibility...');

  let upserted = 0;

  for (const slug of companySlugsFound) {
    const meta = COMPANY_META[slug];
    const name  = meta?.name   || slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const sector = meta?.sector || 'IT Services';
    const fresher = meta?.fresher || 'Varies';

    await Company.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          slug,
          name,
          sector,
          hiringProcess: { overview: '', rounds: [] },
          selectionCriteria: { minCGPA: 6.0, backlogs: 'No active backlogs', branches: [], batchYears: [] },
          packageInfo: { fresher, notes: '' },
        },
        $set: { isActive: true },
      },
      { upsert: true, new: true }
    );
    upserted++;
    console.log(`   ✓ ${name} (${slug})`);
  }

  console.log(`\n✅ Upserted ${upserted} company documents.`);
}

// ── Step 3: Update totalQuestions count on each Company ───────────────────────
async function updateQuestionCounts(companySlugsFound) {
  console.log('\n📌 Step 3 — Updating question counts on Company documents...');

  for (const slug of companySlugsFound) {
    const count = await Question.countDocuments({ companies: slug, isActive: true });
    await Company.findOneAndUpdate({ slug }, { $set: { totalQuestions: count } });
    console.log(`   ${slug}: ${count} questions`);
  }

  console.log('✅ Question counts updated.');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  try {
    const uri = process.env.MONGODB_URI ||
      'mongodb+srv://dinzsoftwares_db_user:cKB7TkiaYcVDsk94@cluster0prepster.gsmpyba.mongodb.net/prepster?appName=Cluster0prepster';
    console.log(`🔌 Connecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log('Connected ✓');

    const slugsFound = await seedQuestions();
    if (slugsFound.size === 0) { process.exit(1); }

    await upsertCompanies(slugsFound);
    await updateQuestionCounts(slugsFound);

    // Clear Redis cache
    try {
      const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      await redis.flushall();
      console.log('\n🧹 Redis cache cleared.');
      redis.disconnect();
    } catch (e) {
      console.log('\n⚠ Redis not available — frontend may show cached data for a few minutes.');
    }

    console.log('\n🎉 All done! Companies and questions are now live in the UI.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

run();
