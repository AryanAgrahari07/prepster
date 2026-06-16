const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PiQuestion = require('../src/modules/mba/models/piQuestion.model');

async function cleanPiQuestions() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://dinzsoftwares_db_user:cKB7TkiaYcVDsk94@cluster0prepster.gsmpyba.mongodb.net/?appName=Cluster0prepster';
    console.log(`🔌 Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
    console.log('Connected ✓\n');

    // Find questions that look like scraper junk
    // Criteria: sampleAnswer is empty, or question length > 250
    const query = {
      $or: [
        { sampleAnswer: "" },
        { sampleAnswer: { $exists: false } },
        { $expr: { $gt: [{ $strLenCP: "$question" }, 250] } }
      ]
    };

    const badQuestions = await PiQuestion.find(query);
    console.log(`Found ${badQuestions.length} bad questions to delete.`);

    for (const q of badQuestions) {
      console.log(`Deleting: ${q.question.substring(0, 50)}...`);
    }

    const result = await PiQuestion.deleteMany(query);
    console.log(`\n✅ Deleted ${result.deletedCount} bad PI questions from the database.`);

    process.exit(0);
  } catch (err) {
    console.error('Error cleaning up data:', err);
    process.exit(1);
  }
}

cleanPiQuestions();
