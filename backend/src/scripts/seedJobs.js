require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../modules/jobs/job.model');
const User = require('../modules/user/user.model');

const seedJobs = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find an admin user to assign jobs to
    const admin = await User.findOne({ role: 'admin' }) || await User.findOne({});
    const adminId = admin ? admin._id : null;

    const jobs = [
      {
        postedBy: adminId,
        companyName: 'Dinz Software',
        title: 'Full Stack Developer Intern',
        description: 'Join Dinz Software to build cutting-edge web applications using the MERN stack. You will be responsible for developing scalable APIs and responsive frontends.',
        type: 'internship',
        location: 'Remote',
        workMode: 'remote',
        ctc: { min: 3, max: 5, currency: 'INR' },
        eligibility: { batchYears: [2024, 2025], branches: ['CSE', 'IT'], minCGPA: 7.0 },
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'Express'],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        postedBy: adminId,
        companyName: 'Acme Corp',
        title: 'Software Engineer I',
        description: 'Acme Corp is looking for freshers to join their backend team. Strong understanding of data structures and algorithms is required.',
        type: 'full-time',
        location: 'Bangalore',
        workMode: 'hybrid',
        ctc: { min: 8, max: 12, currency: 'INR' },
        eligibility: { batchYears: [2024], branches: ['CSE', 'ECE', 'EEE'], minCGPA: 6.5 },
        skillsRequired: ['Java', 'Spring Boot', 'SQL', 'Algorithms'],
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        postedBy: adminId,
        companyName: 'TechFlow',
        title: 'Frontend Developer',
        description: 'Build beautiful UIs with Next.js and Tailwind CSS. We need someone with a keen eye for design.',
        type: 'full-time',
        location: 'Pune',
        workMode: 'onsite',
        ctc: { min: 6, max: 9, currency: 'INR' },
        eligibility: { batchYears: [2024, 2025], branches: ['Any'], minCGPA: 6.0 },
        skillsRequired: ['JavaScript', 'React', 'CSS', 'Tailwind'],
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      }
    ];

    console.log('Clearing old jobs...');
    await Job.deleteMany({});
    
    console.log('Inserting new jobs...');
    await Job.insertMany(jobs);
    
    console.log('✅ Job seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedJobs();
