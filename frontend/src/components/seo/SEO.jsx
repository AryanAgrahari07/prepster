import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, name, type, image, url, schema }) => {
  const defaultTitle = 'Prepster | Placement Preparation Platform';
  const defaultDescription = 'Prepare for your campus placements with company-specific tracks, aptitude mock tests, and curated job feeds. Join Prepster to boost your tech career.';
  const defaultName = 'Prepster';
  const defaultImage = 'https://res.cloudinary.com/dv4s3q1nq/image/upload/v1700000000/prepster_og_image.jpg'; // Placeholder default OG image
  const defaultUrl = 'https://prepster.in'; // Assuming domain

  const pageTitle = title ? `${title} - ${defaultName}` : defaultTitle;
  const pageUrl = url || defaultUrl;
  const pageImage = image || defaultImage;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={pageUrl} />
      
      {/* Open Graph metadata tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:site_name" content={name || defaultName} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageImage} />
      
      {/* Twitter metadata tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
