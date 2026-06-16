const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Company = require('../src/modules/company/company.model');

async function fixCompanyStreams() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://dinzsoftwares_db_user:cKB7TkiaYcVDsk94@cluster0prepster.gsmpyba.mongodb.net/?appName=Cluster0prepster';
    console.log(`🔌 Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
    console.log('Connected ✓\n');

    // Find companies with missing targetStream
    const companies = await Company.find({});
    let count = 0;
    
    for (const c of companies) {
      if (!c.targetStream) {
        c.targetStream = 'engineering';
        await c.save();
        count++;
        console.log(`Updated ${c.name} to targetStream: 'engineering'`);
      }
    }
    
    console.log(`\n✅ Updated ${count} companies with missing targetStream.`);

    process.exit(0);
  } catch (err) {
    console.error('Error fixing data:', err);
    process.exit(1);
  }
}

fixCompanyStreams();
