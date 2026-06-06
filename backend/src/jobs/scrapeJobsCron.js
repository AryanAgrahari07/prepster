const cron = require('node-cron');
const Job = require('../modules/jobs/job.model');
const logger = require('../config/logger');

// Helper to convert HTML description to plain text while preserving structure
const formatHtmlToText = (html) => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')       // Convert <br> to newline
    .replace(/<\/p>/gi, '\n\n')          // Convert </p> to double newline
    .replace(/<li[^>]*>/gi, '• ')        // Convert <li> to bullet
    .replace(/<\/li>/gi, '\n')           // Convert </li> to newline
    .replace(/<[^>]+>/g, '')             // Strip all remaining HTML tags (including tracking imgs)
    .replace(/\n\s*\n\s*\n/g, '\n\n')    // Collapse 3+ newlines into 2
    .replace(/&amp;/g, '&')              // Decode common entities
    .replace(/&nbsp;/g, ' ')
    .trim();
};

// Fetch and sync jobs from public API
const runJobScraper = async () => {
  logger.info('Starting external job scraping process...');
  let importedCount = 0;
  
  try {
    // 1. Fetch India-specific tech jobs first from Remotive (gives priority)
    const remotiveIndiaRes = await fetch('https://remotive.com/api/remote-jobs?search=india&category=software-dev&limit=20');
    let remotiveIndiaJobs = [];
    if (remotiveIndiaRes.ok) {
      const data = await remotiveIndiaRes.json();
      remotiveIndiaJobs = data.jobs || [];
    }
    
    // 2. Fetch general software-dev remote jobs from Remotive
    const remotiveGlobalRes = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=30');
    let remotiveGlobalJobs = [];
    if (remotiveGlobalRes.ok) {
      const data = await remotiveGlobalRes.json();
      remotiveGlobalJobs = data.jobs || [];
    }
    
    // 3. Fetch from The Muse API (Specifically for India, Entry Level & Internships)
    const museRes = await fetch('https://www.themuse.com/api/public/jobs?category=Software%20Engineer&category=Data%20Science&location=India&level=Entry%20Level&level=Internship');
    let museJobs = [];
    if (museRes.ok) {
      const data = await museRes.json();
      // Map The Muse format to match Remotive's format so the rest of the pipeline handles it uniformly
      museJobs = (data.results || []).map(job => ({
        id: `muse_${job.id}`,
        title: job.name,
        company_name: job.company?.name || 'Unknown Company',
        company_logo: '', // The Muse doesn't reliably provide logo in this endpoint
        description: job.contents,
        job_type: job.type === 'external' ? 'full-time' : job.type,
        candidate_required_location: 'India',
        url: job.refs?.landing_page || ''
      }));
    }
    
    // 4. Fetch from Jobicy API (Specifically targeting APAC/India tech jobs)
    const jobicyRes = await fetch('https://jobicy.com/api/v2/remote-jobs?geo=apac&industry=programming');
    let jobicyJobs = [];
    if (jobicyRes.ok) {
      const data = await jobicyRes.json();
      jobicyJobs = (data.jobs || []).map(job => ({
        id: `jobicy_${job.id}`,
        title: job.jobTitle,
        company_name: job.companyName,
        company_logo: job.companyLogo || '',
        description: job.jobDescription,
        job_type: (job.jobType || [])[0] || 'full-time',
        candidate_required_location: job.jobGeo || 'APAC',
        url: job.url
      }));
    }
    
    // 5. Fetch from Arbeitnow
    const arbeitRes = await fetch('https://arbeitnow.com/api/job-board-api');
    let arbeitJobs = [];
    if (arbeitRes.ok) {
      const data = await arbeitRes.json();
      arbeitJobs = (data.data || []).map(job => ({
        id: `arbeit_${job.slug}`,
        title: job.title,
        company_name: job.company_name,
        company_logo: '',
        description: job.description,
        job_type: (job.job_types || [])[0] || 'full-time',
        candidate_required_location: job.location || 'Worldwide',
        url: job.url
      }));
    }

    // 6. Fetch from RemoteOK
    const remoteOkRes = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Prepster-Job-Bot/1.0' }
    });
    let remoteOkJobs = [];
    if (remoteOkRes.ok) {
      const data = await remoteOkRes.json();
      // RemoteOK API returns metadata in the first index, skip it
      const actualJobs = Array.isArray(data) ? data.slice(1) : [];
      remoteOkJobs = actualJobs.map(job => ({
        id: `remoteok_${job.id}`,
        title: job.position,
        company_name: job.company,
        company_logo: job.company_logo || '',
        description: job.description,
        job_type: 'full-time',
        candidate_required_location: job.location || 'Worldwide',
        url: job.url
      }));
    }
    
    // Combine and deduplicate by external job ID
    const combinedJobs = [
      ...remotiveIndiaJobs, 
      ...museJobs, 
      ...jobicyJobs, 
      ...arbeitJobs,
      ...remoteOkJobs,
      ...remotiveGlobalJobs
    ];
    const uniqueJobsMap = new Map();
    combinedJobs.forEach(job => {
      if (job.id) uniqueJobsMap.set(job.id, job);
    });
    const allJobs = Array.from(uniqueJobsMap.values());
    
    // Filter to strictly worldwide/global or India-friendly remote jobs
    const validLocations = ['worldwide', 'global', 'india', 'apac', 'asia'];
    const restrictedKeywords = ['us', 'usa', 'uk', 'europe', 'emea', 'america', 'canada', 'latam', 'timezone', 'only'];
    
    // Keywords indicating mid/senior roles that we want to exclude
    const seniorKeywords = [
      'senior', 'sr', 'lead', 'staff', 'principal', 'manager', 'head', 
      'director', 'vp', 'architect', ' ii', ' iii', ' iv', ' v', 
      'mid', 'intermediate', 'experienced', 'expert'
    ];

    const jobs = allJobs.filter(job => {
      const loc = (job.candidate_required_location || '').toLowerCase();
      const title = (job.title || '').toLowerCase();
      
      // 1. Must be global or India friendly
      // Check for exact universal terms or "india"
      let isRightLocation = validLocations.some(valid => loc.includes(valid));
      
      // If it says "anywhere", we must ensure it doesn't say "anywhere in US"
      if (loc.includes('anywhere')) {
        const hasRestriction = restrictedKeywords.some(restrict => loc.match(new RegExp(`\\b${restrict}\\b`, 'i')));
        if (!hasRestriction) {
          isRightLocation = true;
        }
      }
      
      // 2. Must not contain senior/mid level keywords in the title
      // We check with word boundaries or just includes, but includes might catch "vp" inside another word.
      // Better to check with regex for standalone words.
      const isSenior = seniorKeywords.some(keyword => {
        // Regex to match the keyword as a whole word, or starting/ending with it
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(title);
      });

      return isRightLocation && !isSenior;
    });
    
    for (const jobData of jobs) {
      // Check if job already exists to avoid duplicates
      const exists = await Job.findOne({
        title: jobData.title,
        companyName: jobData.company_name
      });
      
      if (!exists) {
        // Map external data to our schema
        let jobType = 'full-time';
        const typeStr = (jobData.job_type || '').toLowerCase();
        if (typeStr.includes('contract') || typeStr.includes('freelance')) jobType = 'contract';
        if (typeStr.includes('internship')) jobType = 'internship';

        await Job.create({
          title: jobData.title,
          companyName: jobData.company_name,
          companyLogo: jobData.company_logo || '',
          description: formatHtmlToText(jobData.description),
          type: jobType,
          location: jobData.candidate_required_location || 'Remote',
          workMode: 'remote', // Remotive is remote-first
          externalApplyUrl: jobData.url,
          status: 'active',
          // Optionally set postedBy to null or an admin ID, leaving it undefined is fine if it's optional
        });
        
        importedCount++;
      }
    }
    
    logger.info(`Job scraping completed. Imported ${importedCount} new jobs.`);
    return { success: true, importedCount };
  } catch (error) {
    logger.error('Failed to scrape jobs:', error.message);
    return { success: false, error: error.message };
  }
};

// Start the cron schedule
const start = () => {
  // Run everyday at 01:00 AM IST
  cron.schedule('0 1 * * *', async () => {
    logger.info('Running scheduled job scraper...');
    await runJobScraper();
  }, {
    timezone: 'Asia/Kolkata'
  });
};

module.exports = { start, runJobScraper };
