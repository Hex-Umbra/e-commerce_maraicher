import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './HeroSection.module.scss';

/**
 * HeroSection Component
 * 
 * A reusable hero section component used across multiple pages.
 * Supports single CTA, multiple links, and different layout variants.
 * 
 * @example
 * // Simple hero with single CTA
 * <HeroSection
 *   title="Welcome to our platform"
 *   subtitle="Discover amazing products"
 *   ctaText="Get Started"
 *   ctaLink="/products"
 * />
 * 
 * @example
 * // Hero with multiple links (404 page style)
 * <HeroSection
 *   title="404 - Page Not Found"
 *   subtitle="The page you're looking for doesn't exist"
 *   secondaryLinks={[
 *     { text: 'Go Home', link: '/', variant: 'primary' },
 *     { text: 'View Products', link: '/products', variant: 'secondary' }
 *   ]}
 *   variant="centered"
 * />
 */
const HeroSection = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondaryLinks = [],
  variant = 'default',
  className = '',
}) => {
  const heroClasses = `${styles.hero} ${variant === 'centered' ? styles.centered : ''} ${className}`;

  return (
    <section className={heroClasses}>
      <div className={styles.heroInner}>
        <h2 className={styles.headline}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>

        {/* Single CTA button */}
        {ctaText && ctaLink && (
          <Link
            to={ctaLink}
            className={styles.cta}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') {
                e.preventDefault();
                e.currentTarget.click();
              }
            }}
          >
            {ctaText}
          </Link>
        )}

        {/* Multiple links (for 404-style pages) */}
        {secondaryLinks.length > 0 && (
          <div className={styles.links}>
            {secondaryLinks.map((link, index) => (
              <Link
                key={index}
                to={link.link}
                className={
                  link.variant === 'primary'
                    ? styles.linkBtn
                    : styles.linkBtnSecondary
                }
              >
                {link.text}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

HeroSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  ctaText: PropTypes.string,
  ctaLink: PropTypes.string,
  secondaryLinks: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(['primary', 'secondary']),
    })
  ),
  variant: PropTypes.oneOf(['default', 'centered']),
  className: PropTypes.string,
};

export default HeroSection;
