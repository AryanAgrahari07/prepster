require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Blog = require('../modules/blog/blog.model');
const User = require('../modules/user/user.model'); // Adjust if user model is different

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prepster');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const SEED_BLOGS = [
  {
    title: "TCS NQT 2026 Complete Preparation Guide: Syllabus, Pattern, and Strategies",
    slug: "tcs-nqt-preparation-guide-2026",
    excerpt: "Cracking the TCS National Qualifier Test (NQT) requires a structured approach. Learn the exact syllabus, test pattern, and coding strategies used by top selected candidates.",
    coverImage: "https://res.cloudinary.com/demo/image/upload/v1611139414/blog-tcs_nqt.jpg",
    tags: ["TCS", "Placement Preparation", "Engineering", "Aptitude"],
    isPublished: true,
    readTime: 8,
    content: `
# TCS NQT 2026 Complete Preparation Guide

The Tata Consultancy Services (TCS) National Qualifier Test (NQT) is one of the largest campus hiring drives in India. If you are an engineering student looking to start your career with TCS, passing the NQT is your first hurdle.

## 1. TCS NQT Exam Pattern (Updated)
The exam evaluates candidates on cognitive and programming skills. It consists of:
- **Numerical Ability**: 20 mins
- **Verbal Ability**: 15 mins
- **Reasoning Ability**: 25 mins
- **Programming Logic**: 15 mins
- **Hands-on Coding**: 45 mins (2 questions)

## 2. Important Topics to Master
To maximize your chances, focus heavily on the following topics inside the **Quantitative Aptitude** and **Logical Reasoning** sections:
*   Time, Speed, and Distance
*   Percentages, Profit, and Loss
*   Syllogisms and Blood Relations
*   Data Interpretation (DI)

## 3. Preparation Strategy
Use Prepster's dedicated **TCS Company Track**. Start by taking a full-length 90-minute Mock Test to establish your baseline score. Identify your weak areas from the analytics dashboard and solve 50 targeted questions on those topics daily.

## 4. Coding Round Tips
TCS coding questions usually test basic arrays, strings, and fundamental algorithms (like GCD, LCM, Prime factors, and sorting). Ensure you are comfortable with edge cases and time complexities. Practice the top 100 coding questions directly inside our Hands-on Practice area.

*Get started today with Prepster's 25,000+ aptitude questions and dominate your upcoming placements.*
`
  },
  {
    title: "How to Crack MBA Placements: GD & PI Strategies from IIM Alumni",
    slug: "crack-mba-placements-gd-pi-strategies",
    excerpt: "The ultimate guide to clearing Group Discussions and Personal Interviews for top MBA campuses. Learn frameworks used by successful candidates.",
    coverImage: "https://res.cloudinary.com/demo/image/upload/v1611139414/blog-mba_placements.jpg",
    tags: ["MBA", "Interview", "GD", "PI", "Soft Skills"],
    isPublished: true,
    readTime: 7,
    content: `
# How to Crack MBA Placements: GD & PI Strategies

Cracking placements at top B-schools requires more than just academic excellence; it requires impeccable communication, logical structuring, and confidence. Here is a definitive guide to conquering your Group Discussions (GD) and Personal Interviews (PI).

## 1. Group Discussion (GD) Frameworks
In a GD, moderators look for leadership, clarity of thought, and team dynamics.
- **The PESTLE Approach**: When given an abstract or current affairs topic, analyze it using Political, Economic, Social, Technological, Legal, and Environmental lenses. This guarantees you will always have unique points to contribute.
- **Entry Strategy**: If you can't start the discussion, aim for the first 3 minutes. Use phrases like, *"Adding to what my friend just said, another critical aspect is..."*

## 2. Personal Interview (PI) Essentials
Your resume gets you shortlisted, but your PI gets you the offer.
- **Master the 'Tell me about yourself'**: Do not recite your resume. Give a 90-second elevator pitch covering your background, your biggest achievement, and why you are sitting for this specific role.
- **The STAR Method**: Answer behavioral questions using Situation, Task, Action, and Result. Always quantify your results (e.g., *"increased sales by 15%*").

## 3. Utilizing Prepster for MBA
Prepster is uniquely built to help MBA students. Check out our **Case Study Library** and **Guesstimate Practice Hub**. We have compiled over 50 real-world case studies asked by top consulting and FMCG firms. 
`
  },
  {
    title: "Top 50 Quantitative Aptitude Questions for Campus Placements",
    slug: "top-50-quantitative-aptitude-questions",
    excerpt: "Boost your problem-solving speed with these top 50 highly repeated quantitative aptitude questions from companies like Infosys, Wipro, and Accenture.",
    coverImage: "https://res.cloudinary.com/demo/image/upload/v1611139414/blog-aptitude.jpg",
    tags: ["Aptitude", "Quantitative", "Practice", "Placements"],
    isPublished: true,
    readTime: 10,
    content: `
# Top 50 Quantitative Aptitude Questions for Campus Placements

Quantitative Aptitude is the make-or-break section for 90% of campus placement drives. Companies like Wipro, Infosys, and Cognizant heavily weight this section to filter candidates. 

## High-Frequency Topics
Our data team at Prepster analyzed over 5,000 previous year papers to identify the most heavily tested concepts:
1. **Time and Work** (15% of all questions)
2. **Speed, Distance, and Time** (12%)
3. **Probability & Permutations** (10%)
4. **Percentages and Ratios** (10%)

## Practice Methodology
Reading questions is not enough. You need to simulate the pressure of a ticking clock.
- **Step 1**: Go to Prepster's Practice Hub.
- **Step 2**: Select the 'Quantitative Aptitude' category.
- **Step 3**: Turn on the 'Timed Mode' (60 seconds per question).

## Example Question & Shortcut
**Q:** A can do a piece of work in 10 days, and B can do it in 15 days. How long will they take working together?
**Traditional Method:** 1/10 + 1/15 = 5/30 = 1/6. (6 days).
**Shortcut:** (A * B) / (A + B) = (10 * 15) / (25) = 150 / 25 = 6 days.

Mastering these small shortcuts saves 10-15 seconds per question, which can be the difference between getting shortlisted and rejected.
`
  }
];

const seedDB = async () => {
  await connectDB();
  
  try {
    let admin = null;
    try {
      admin = await User.findOne({ role: 'admin' });
      if (!admin) admin = await User.findOne({});
    } catch(err) {
      console.log('Could not find user, using random ID');
    }

    const authorId = admin ? admin._id : new mongoose.Types.ObjectId();

    await Blog.deleteMany({ slug: { $in: SEED_BLOGS.map(b => b.slug) } }); 
    
    const blogsToInsert = SEED_BLOGS.map(blog => ({
      ...blog,
      author: authorId
    }));

    await Blog.insertMany(blogsToInsert);
    console.log('✅ Successfully seeded 3 high-quality SEO blog posts.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
    process.exit(1);
  }
};

seedDB();
