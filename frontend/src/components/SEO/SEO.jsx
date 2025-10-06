import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * SEO Component
 * 
 * Manages meta tags for SEO optimization including:
 * - Page title and description
 * - Open Graph tags for social media
 * - Twitter Card tags
 * - Canonical URLs
 * 
 * @example
 * <SEO
 *   title="Produits Frais"
 *   description="Découvrez nos produits locaux"
 *   canonical="https://example.com/produits"
 *   ogImage="https://example.com/images/products.jpg"
 * />
 */
const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  twitterCard = 'summary_large_image',
  noindex = false,
  nofollow = false,
  children,
}) => {
  // Site configuration
  const siteConfig = {
    siteName: 'Marché Frais Fermier',
    siteUrl: 'https://mff-weld.vercel.app',
    defaultDescription: 'Découvrez les meilleurs produits locaux, laitages artisanaux et fruits de saison directement de notre réseau de confiance de fermiers familiaux.',
    defaultImage: '/images/og-default.jpg',
    twitterHandle: '@MarcheFrais',
  };

  // Construct full title
  const fullTitle = title 
    ? `${title} | ${siteConfig.siteName}`
    : siteConfig.siteName;

  // Use provided description or default
  const metaDescription = description || siteConfig.defaultDescription;

  // Construct canonical URL
  const canonicalUrl = canonical || siteConfig.siteUrl;

  // Construct OG image URL
  const ogImageUrl = ogImage 
    ? (ogImage.startsWith('http') ? ogImage : `${siteConfig.siteUrl}${ogImage}`)
    : `${siteConfig.siteUrl}${siteConfig.defaultImage}`;

  // Construct robots meta content
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:site_name" content={siteConfig.siteName} />
      <meta property="og:title" content={title || siteConfig.siteName} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={siteConfig.twitterHandle} />
      <meta name="twitter:title" content={title || siteConfig.siteName} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      {ogImageAlt && <meta name="twitter:image:alt" content={ogImageAlt} />}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="French" />
      <meta name="author" content={siteConfig.siteName} />

      {/* Custom children (for page-specific meta tags) */}
      {children}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  canonical: PropTypes.string,
  ogType: PropTypes.oneOf(['website', 'article', 'product', 'profile']),
  ogImage: PropTypes.string,
  ogImageAlt: PropTypes.string,
  twitterCard: PropTypes.oneOf(['summary', 'summary_large_image', 'app', 'player']),
  noindex: PropTypes.bool,
  nofollow: PropTypes.bool,
  children: PropTypes.node,
};

export default SEO;
