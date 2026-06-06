require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Question = require('../modules/aptitude/question.model');

const seedQuestions = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const filePath = path.join(__dirname, 'questions.json');
    if (!fs.existsSync(filePath)) {
      console.warn('questions.json not found. Creating a sample file...');
      const sample = [
        {
          text: 'What is the sum of the first 10 prime numbers?',
          options: [
            { label: 'A', text: '129' },
            { label: 'B', text: '130' },
            { label: 'C', text: '131' },
            { label: 'D', text: '141' },
          ],
          correctOption: 'A',
          explanation: 'The first 10 prime numbers are 2, 3, 5, 7, 11, 13, 17, 19, 23, 29. Their sum is 129.',
          topic: 'quantitative',
          subTopic: 'number-system',
          difficulty: 'medium',
          companies: ['TCS', 'Infosys'],
          tags: ['primes', 'sum'],
        }
      ];
      fs.writeFileSync(filePath, JSON.stringify(sample, null, 2));
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Found ${data.length} questions. Deleting old ones...`);
    
    // Warning: This clears all questions. Remove in production!
    await Question.deleteMany({});
    
    console.log('Inserting new questions...');
    await Question.insertMany(data);
    
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedQuestions();
