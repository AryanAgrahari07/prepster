/**
 * SchemaTemplates.js
 * 
 * Reusable JSON-LD structured data generators for Prepster.
 * Every schema follows schema.org specifications and Google's guidelines (2026).
 * 
 * Usage: import { schemas } from '@/components/seo/SchemaTemplates';
 *        <SEO schema={[schemas.organization(), schemas.breadcrumbs([...])]} />
 */

const SITE_URL = 'https://prepster.online';
const SITE_NAME = 'Prepster';
const LOGO_URL = `${SITE_URL}/logo.svg`;

// ─── Organization (brand entity) ──────────────────────────────────────────────
export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: LOGO_URL,
    width: 512,
    height: 512,
  },
  description: 'India\'s #1 placement preparation platform for engineering and MBA students. Aptitude practice, company-specific tracks, and curated job feeds.',
  sameAs: [
    'https://www.linkedin.com/company/prepster',
    'https://twitter.com/prepster_in',
    'https://instagram.com/prepster.in',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@prepster.in',
    contactType: 'customer support',
    availableLanguage: ['English', 'Hindi'],
  },
  foundingDate: '2024',
  founder: {
    '@type': 'Organization',
    name: 'Dinz Software Pvt. Ltd.',
  },
});

// ─── WebSite (with SearchAction for sitelinks search box) ─────────────────────
export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Placement preparation platform for Indian engineering and MBA students.',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/aptitude?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

// ─── BreadcrumbList ──────────────────────────────────────────────────────────
export const breadcrumbSchema = (items = []) => {
  // items: [{ name: 'Home', url: '/' }, { name: 'Aptitude', url: '/aptitude' }, ...]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  };
};

// ─── Course (for aptitude topics, company tracks, MBA prep) ──────────────────
export const courseSchema = ({
  name,
  description,
  url,
  provider = SITE_NAME,
  category,
  difficulty,
  duration,
  questionCount,
  image,
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name,
  description,
  url: `${SITE_URL}${url}`,
  provider: {
    '@type': 'Organization',
    name: provider,
    url: SITE_URL,
  },
  ...(category && { courseCode: category }),
  ...(difficulty && { educationalLevel: difficulty }),
  ...(duration && { timeRequired: duration }),
  ...(questionCount && { hasPart: { '@type': 'Quiz', numberOfQuestions: questionCount } }),
  ...(image && { image }),
  isAccessibleForFree: true,
  inLanguage: 'en',
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
  },
});

// ─── ItemList (for listing pages — companies, topics, jobs) ──────────────────
export const itemListSchema = ({ name, description, url, items = [] }) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  description,
  url: `${SITE_URL}${url}`,
  numberOfItems: items.length,
  itemListElement: items.slice(0, 30).map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: item.name,
    url: item.url ? `${SITE_URL}${item.url}` : undefined,
    ...(item.description && { description: item.description }),
  })),
});

// ─── FAQPage ────────────────────────────────────────────────────────────────
export const faqPageSchema = (faqs = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// ─── Article (for blog posts) ───────────────────────────────────────────────
export const articleSchema = ({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author,
  tags = [],
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline,
  description,
  url: `${SITE_URL}${url}`,
  image: image || LOGO_URL,
  datePublished,
  dateModified: dateModified || datePublished,
  author: {
    '@type': author ? 'Person' : 'Organization',
    name: author || SITE_NAME,
    ...(author ? {} : { url: SITE_URL }),
  },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SITE_URL}${url}`,
  },
  ...(tags.length > 0 && { keywords: tags.join(', ') }),
  inLanguage: 'en',
});

// ─── JobPosting ─────────────────────────────────────────────────────────────
export const jobPostingSchema = ({
  title,
  description,
  companyName,
  companyLogo,
  location,
  workMode,
  type,
  ctc,
  datePosted,
  validThrough,
  url,
  batchYears = [],
}) => {
  const employmentTypeMap = {
    'full-time': 'FULL_TIME',
    'internship': 'INTERN',
    'contract': 'CONTRACTOR',
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    datePosted,
    ...(validThrough && { validThrough }),
    employmentType: employmentTypeMap[type] || 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: companyName,
      ...(companyLogo && { logo: companyLogo }),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: location || 'India',
        addressCountry: 'IN',
      },
    },
    url: `${SITE_URL}${url}`,
  };

  // Add remote work info
  if (workMode === 'remote') {
    schema.jobLocationType = 'TELECOMMUTE';
  }

  // Add salary
  if (ctc?.min || ctc?.max) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: ctc.currency || 'INR',
      value: {
        '@type': 'QuantitativeValue',
        ...(ctc.min && { minValue: ctc.min * 100000 }), // Convert LPA to actual amount
        ...(ctc.max && { maxValue: ctc.max * 100000 }),
        unitText: 'YEAR',
      },
    };
  }

  // Add qualification
  if (batchYears.length > 0) {
    schema.qualifications = `Batch year: ${batchYears.join(', ')}`;
  }

  return schema;
};

// ─── CollectionPage (for blog listing, company listing) ─────────────────────
export const collectionPageSchema = ({ name, description, url }) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  description,
  url: `${SITE_URL}${url}`,
  isPartOf: { '@id': `${SITE_URL}/#website` },
});

// ─── Quiz Schema (for practice sessions) ────────────────────────────────────
export const quizSchema = ({ name, description, url, questionCount, difficulty }) => ({
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name,
  about: {
    '@type': 'Thing',
    name: description,
  },
  url: `${SITE_URL}${url}`,
  ...(questionCount && { numberOfQuestions: questionCount }),
  ...(difficulty && { educationalLevel: difficulty }),
  educationalAlignment: {
    '@type': 'AlignmentObject',
    alignmentType: 'educationalSubject',
    targetName: 'Placement Aptitude',
  },
});

// ─── Export all as a convenience namespace ───────────────────────────────────
export const schemas = {
  organization: organizationSchema,
  website: websiteSchema,
  breadcrumbs: breadcrumbSchema,
  course: courseSchema,
  itemList: itemListSchema,
  faqPage: faqPageSchema,
  article: articleSchema,
  jobPosting: jobPostingSchema,
  collectionPage: collectionPageSchema,
  quiz: quizSchema,
};

export { SITE_URL, SITE_NAME, LOGO_URL };
export default schemas;
