require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('../modules/company/company.model');

const seedCompanies = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const companies = [
      {
        name: 'TCS',
        slug: 'tcs',
        sector: 'IT Services',
        hiringProcess: {
          overview: 'TCS conducts the National Qualifier Test (NQT) which is the primary gateway for hiring freshers across India.',
          rounds: [
            {
              name: 'Online Test (NQT)',
              description: 'Numerical Ability, Verbal Ability, Reasoning Ability, Programming Logic, and Hands-on Coding.',
              duration: '180 minutes',
              questionsCount: '92 questions',
              tips: ['Focus on time management', 'Practice dynamic programming']
            },
            {
              name: 'Technical Interview',
              description: 'Based on your core subjects, projects, and programming logic.',
              duration: '30-45 minutes',
              questionsCount: 'Varies',
              tips: ['Be thorough with your resume', 'Prepare core subjects (DBMS, OS, CN)']
            },
            {
              name: 'HR Interview',
              description: 'General behavioral questions and company fitment.',
              duration: '15-20 minutes',
              questionsCount: 'Varies',
              tips: ['Read about TCS values', 'Be confident and honest']
            }
          ]
        },
        selectionCriteria: {
          minCGPA: 6.0,
          tenthPercent: 60,
          twelfthPercent: 60,
          backlogs: 'Up to 1 active backlog allowed at the time of test',
          branches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
          batchYears: [2024, 2025]
        },
        packageInfo: {
          fresher: '3.36 LPA (Ninja)',
          digital: '7.0 LPA (Digital)',
          notes: 'Top performers in NQT get invited for Digital profile interviews.'
        }
      },
      {
        name: 'Infosys',
        slug: 'infosys',
        sector: 'IT Services',
        hiringProcess: {
          overview: 'Infosys conducts a massive online test to recruit for System Engineer (SE) roles.',
          rounds: [
            {
              name: 'Online Aptitude Test',
              description: 'Logical Reasoning, Quantitative Aptitude, Verbal Ability.',
              duration: '100 minutes',
              questionsCount: '54 questions',
              tips: ['High cutoff for Logical reasoning', 'Puzzles are commonly asked']
            }
          ]
        },
        selectionCriteria: {
          minCGPA: 6.0,
          tenthPercent: 60,
          twelfthPercent: 60,
          backlogs: 'No active backlogs allowed',
          branches: ['All Branches'],
          batchYears: [2024, 2025]
        },
        packageInfo: {
          fresher: '3.6 LPA (System Engineer)',
          digital: '5.0 LPA (Specialist Programmer)',
          notes: 'HackWithInfy is another route to get Specialist roles.'
        }
      }
    ];

    console.log('Clearing old companies...');
    await Company.deleteMany({});
    
    console.log('Inserting new companies...');
    await Company.insertMany(companies);
    
    console.log('✅ Company seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedCompanies();
