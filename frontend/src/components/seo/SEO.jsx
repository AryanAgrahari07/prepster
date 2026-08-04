import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://prepster.online';
const SITE_NAME = 'Prepster';
const DEFAULT_DESCRIPTION = 'India\'s #1 placement preparation platform. Practice 25,000+ aptitude questions, company-specific prep tracks for TCS, Infosys, Wipro & more, and apply to curated fresher jobs. Free for students.';
const DEFAULT_OG_IMAGE = 'https://prepster.online/logo.svg';

/**
 * Enhanced SEO component for Prepster.
 * 
 * Supports:
 * - Dynamic titles, descriptions, keywords
 * - Auto-generated canonical URLs from current route
 * - Multiple JSON-LD schemas (pass an array)
 * - Open Graph with locale, image dimensions
 * - Twitter Card metadata
 * - Article-specific meta (published_time, modified_time, tags)
 * - noindex for admin/auth pages
 * - hreflang for India-specific English
 * 
 * @param {object} props
 * @param {string} [props.title] - Page title (appended with " — Prepster")
 * @param {string} [props.description] - Meta description (max 160 chars recommended)
 * @param {string} [props.keywords] - Comma-separated keywords
 * @param {string} [props.canonical] - Override canonical URL (default: auto from route)
 * @param {string} [props.ogImage] - Open Graph image URL
 * @param {string} [props.ogType] - Open Graph type (default: 'website')
 * @param {object|object[]} [props.schema] - JSON-LD structured data (single or array)
 * @param {object} [props.article] - Article metadata: { publishedTime, modifiedTime, author, tags }
 * @param {boolean} [props.noindex] - If true, adds noindex,nofollow
 * @param {string} [props.url] - DEPRECATED: use canonical instead
 * @param {string} [props.image] - DEPRECATED: use ogImage instead
 * @param {string} [props.type] - DEPRECATED: use ogType instead
 */
const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType,
  schema,
  article,
  noindex = false,
  // Backwards compat
  url,
  image,
  type,
  name,
}) => {
  const location = useLocation();

  // Build page title
  const pageTitle = title
    ? (title.includes('Prepster') ? title : `${title} — ${SITE_NAME}`)
    : `${SITE_NAME} — Placement Preparation & Opportunities for Students`;

  // Build canonical URL
  const pageUrl = canonical || url || `${SITE_URL}${location.pathname}`;

  // Description
  const pageDescription = description || DEFAULT_DESCRIPTION;

  // Image
  const pageImage = ogImage || image || DEFAULT_OG_IMAGE;

  // Type
  const pageType = ogType || type || (article ? 'article' : 'website');

  // Normalize schema to array
  const schemas = schema
    ? (Array.isArray(schema) ? schema : [schema])
    : [];

  return (
    <Helmet>
      {/* ── Core Meta ──────────────────────────────────────── */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={pageUrl} />

      {/* ── Robots ─────────────────────────────────────────── */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}

      {/* ── hreflang (India-specific English) ──────────────── */}
      <link rel="alternate" hrefLang="en-in" href={pageUrl} />
      <link rel="alternate" hrefLang="x-default" href={pageUrl} />

      {/* ── Open Graph ─────────────────────────────────────── */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={pageType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />

      {/* ── Article Meta (for blog posts) ──────────────────── */}
      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {article?.author && (
        <meta property="article:author" content={article.author} />
      )}
      {article?.tags?.map((tag, i) => (
        <meta key={i} property="article:tag" content={tag} />
      ))}

      {/* ── Twitter Card ───────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@prepster_in" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* ── JSON-LD Structured Data ────────────────────────── */}
      {schemas.map((s, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
