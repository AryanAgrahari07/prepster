/**
 * SEO Routes — Sitemap Generator & Dynamic robots.txt
 * 
 * Serves dynamic XML sitemaps generated from MongoDB collections.
 * All sitemap responses are cached for 1 hour.
 */
const express = require('express');
const router = express.Router();

const SITE_URL = 'https://prepster.online';

// ─── Helper: XML escaping ────────────────────────────────────────────────────
const escapeXml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// ─── Helper: Build URL entry ────────────────────────────────────────────────
const urlEntry = (loc, lastmod, changefreq = 'weekly', priority = '0.5') => {
  let entry = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`;
  if (lastmod) entry += `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>\n`;
  entry += `    <changefreq>${changefreq}</changefreq>\n`;
  entry += `    <priority>${priority}</priority>\n`;
  entry += `  </url>\n`;
  return entry;
};

// ─── Helper: Wrap in sitemap XML ─────────────────────────────────────────────
const wrapSitemap = (entries) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries}</urlset>`;
};

// ═════════════════════════════════════════════════════════════════════════════
// Sitemap Index (master sitemap referencing child sitemaps)
// ═════════════════════════════════════════════════════════════════════════════
router.get('/sitemap.xml', (req, res) => {
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
  
  const now = new Date().toISOString().split('T')[0];
  
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-companies.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-blogs.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-jobs.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`);
});

// ═════════════════════════════════════════════════════════════════════════════
// Static Pages Sitemap
// ═════════════════════════════════════════════════════════════════════════════
router.get('/sitemap-static.xml', (req, res) => {
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600');
  
  const now = new Date().toISOString().split('T')[0];
  
  let entries = '';
  
  // Homepage — highest priority
  entries += urlEntry(`${SITE_URL}/`, now, 'daily', '1.0');
  
  // Core public pages
  const staticPages = [
    { path: '/aptitude', freq: 'daily', priority: '0.9' },
    { path: '/companies', freq: 'weekly', priority: '0.9' },
    { path: '/jobs', freq: 'daily', priority: '0.9' },
    { path: '/blogs', freq: 'daily', priority: '0.8' },
    { path: '/roadmap', freq: 'weekly', priority: '0.8' },
    { path: '/upgrade', freq: 'monthly', priority: '0.7' },
    // MBA pages
    { path: '/mba/gd', freq: 'weekly', priority: '0.8' },
    { path: '/mba/pi', freq: 'weekly', priority: '0.8' },
    { path: '/mba/cases', freq: 'weekly', priority: '0.8' },
    { path: '/mba/wat', freq: 'weekly', priority: '0.8' },
    { path: '/mba/sectors', freq: 'weekly', priority: '0.7' },
    { path: '/mba/guesstimates', freq: 'weekly', priority: '0.7' },
    // Aptitude topics
    { path: '/aptitude/topic/quantitative', freq: 'weekly', priority: '0.8' },
    { path: '/aptitude/topic/logical', freq: 'weekly', priority: '0.8' },
    { path: '/aptitude/topic/verbal', freq: 'weekly', priority: '0.8' },
    { path: '/aptitude/topic/di', freq: 'weekly', priority: '0.8' },
    { path: '/aptitude/topic/dsa', freq: 'weekly', priority: '0.8' },
    { path: '/aptitude/topic/os', freq: 'weekly', priority: '0.7' },
    { path: '/aptitude/topic/dbms', freq: 'weekly', priority: '0.7' },
    { path: '/aptitude/topic/sql', freq: 'weekly', priority: '0.7' },
    { path: '/aptitude/topic/cn', freq: 'weekly', priority: '0.7' },
    { path: '/aptitude/topic/oops', freq: 'weekly', priority: '0.7' },
    { path: '/aptitude/topic/system-design', freq: 'weekly', priority: '0.7' },
    { path: '/aptitude/topic/se', freq: 'weekly', priority: '0.6' },
    { path: '/aptitude/topic/web', freq: 'weekly', priority: '0.6' },
    { path: '/aptitude/topic/cloud', freq: 'weekly', priority: '0.6' },
    { path: '/aptitude/topic/ml', freq: 'weekly', priority: '0.6' },
    // Roadmap tracks
    { path: '/roadmap/software-engineer', freq: 'monthly', priority: '0.7' },
    { path: '/roadmap/frontend', freq: 'monthly', priority: '0.7' },
    { path: '/roadmap/backend', freq: 'monthly', priority: '0.7' },
    { path: '/roadmap/data-science', freq: 'monthly', priority: '0.7' },
    // Static/info pages
    { path: '/about', freq: 'monthly', priority: '0.5' },
    { path: '/contact', freq: 'monthly', priority: '0.5' },
    { path: '/faq', freq: 'monthly', priority: '0.6' },
    { path: '/privacy', freq: 'yearly', priority: '0.3' },
    { path: '/terms', freq: 'yearly', priority: '0.3' },
  ];
  
  staticPages.forEach(p => {
    entries += urlEntry(`${SITE_URL}${p.path}`, now, p.freq, p.priority);
  });
  
  res.send(wrapSitemap(entries));
});

// ═════════════════════════════════════════════════════════════════════════════
// Companies Sitemap (dynamic from MongoDB)
// ═════════════════════════════════════════════════════════════════════════════
router.get('/sitemap-companies.xml', async (req, res) => {
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600');
  
  let entries = '';
  
  try {
    const CompanyTrack = require('mongoose').model('CompanyTrack');
    const companies = await CompanyTrack.find({ isActive: true })
      .select('slug updatedAt')
      .lean();
    
    companies.forEach(c => {
      entries += urlEntry(
        `${SITE_URL}/companies/${c.slug}`,
        c.updatedAt,
        'weekly',
        '0.8'
      );
    });
  } catch (err) {
    // Model not loaded yet or DB error — return empty sitemap
    console.error('Sitemap companies error:', err.message);
  }
  
  res.send(wrapSitemap(entries));
});

// ═════════════════════════════════════════════════════════════════════════════
// Blog Posts Sitemap (dynamic from MongoDB)
// ═════════════════════════════════════════════════════════════════════════════
router.get('/sitemap-blogs.xml', async (req, res) => {
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600');
  
  let entries = '';
  
  try {
    const Blog = require('mongoose').model('Blog');
    const posts = await Blog.find({ status: 'published' })
      .select('slug updatedAt createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    posts.forEach(p => {
      entries += urlEntry(
        `${SITE_URL}/blogs/${p.slug}`,
        p.updatedAt || p.createdAt,
        'weekly',
        '0.7'
      );
    });
  } catch (err) {
    console.error('Sitemap blogs error:', err.message);
  }
  
  res.send(wrapSitemap(entries));
});

// ═════════════════════════════════════════════════════════════════════════════
// Jobs Sitemap (dynamic from MongoDB)
// ═════════════════════════════════════════════════════════════════════════════
router.get('/sitemap-jobs.xml', async (req, res) => {
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600');
  
  let entries = '';
  
  try {
    const Job = require('mongoose').model('Job');
    const jobs = await Job.find({ status: 'active' })
      .select('_id updatedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(1000) // Cap at 1000 most recent jobs
      .lean();
    
    jobs.forEach(j => {
      entries += urlEntry(
        `${SITE_URL}/jobs/${j._id}`,
        j.updatedAt || j.createdAt,
        'daily',
        '0.6'
      );
    });
  } catch (err) {
    console.error('Sitemap jobs error:', err.message);
  }
  
  res.send(wrapSitemap(entries));
});

module.exports = router;
