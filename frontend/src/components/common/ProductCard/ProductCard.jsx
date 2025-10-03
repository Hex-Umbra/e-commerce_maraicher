import React from 'react';
import PropTypes from 'prop-types';
import { BsCart3 } from 'react-icons/bs';
import ImageWithFallback from '../ImageWithFallback';
import { getCategoryBadgeClass } from '../../../utils/defaults';
import styles from './ProductCard.module.scss';

/**
 * ProductCard Component
 * 
 * A reusable product card component used across multiple pages.
 * Displays product information with image, tags, price, and cart functionality.
 * 
 * @example
 * // Basic usage
 * <ProductCard
 *   product={{
 *     id: '123',
 *     name: 'Miel Bio',
 *     price: 7.50,
 *     image: '/images/honey.jpg',
 *     category: 'produits de la ruche',
 *     tags: ['Nouveau', 'Bio'],
 *     quantity: 10,
 *     producerName: 'Jean Martin'
 *   }}
 *   onAddToCart={(product) => console.log('Add to cart:', product)}
 *   showProducer={true}
 *   showStock={true}
 * />
 */
const ProductCard = ({
  product,
  onAddToCart,
  showProducer = false,
  showStock = false,
  variant = 'default',
  className = '',
}) => {
  const {
    id,
    name,
    description,
    price,
    image,
    category,
    tags = [],
    quantity = 0,
    producerName,
  } = product;

  const formatPrice = (price) => {
    if (typeof price === 'number') return price.toFixed(2);
    return String(price);
  };

  const renderTags = () => {
    if (!tags || tags.length === 0) return null;

    return tags.map((tag, index) => {
      const tagLower = String(tag).toLowerCase();
      let tagClass = styles.tagDefault;

      if (tagLower === 'nouveau') {
        tagClass = styles.tagNew;
      } else if (tagLower === 'promo') {
        tagClass = styles.tagPromo;
      } else {
        const categoryClass = getCategoryBadgeClass(category || tag);
        tagClass = styles[categoryClass] || styles.tagDefault;
      }

      return (
        <span
          key={`${id}-${tag}-${index}`}
          className={`${styles.tag} ${tagClass}`}
          aria-label={`Catégorie: ${tag}`}
        >
          {tag}
        </span>
      );
    });
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const isOutOfStock = Number(quantity) <= 0;
  const cardClasses = `${styles.productCard} ${variant === 'compact' ? styles.compact : ''} ${className}`;

  return (
    <article
      className={cardClasses}
      role="gridcell"
      tabIndex="0"
      aria-labelledby={`product-name-${id}`}
    >
      <div className={styles.thumbWrap}>
        <ImageWithFallback
          src={image}
          fallback="/placeholder-product.jpg"
          alt={`Image de ${name}`}
        />
      </div>

      <div className={styles.productBody}>
        <div className={styles.productHeader}>
          <h5
            id={`product-name-${id}`}
            className={styles.productName}
            title={name}
          >
            {name}
          </h5>
          {tags.length > 0 && (
            <div className={styles.tags} role="list" aria-label="Catégories du produit">
              {renderTags()}
            </div>
          )}
        </div>

        {showProducer && producerName && (
          <p className={styles.producerName}>
            par {producerName}
          </p>
        )}

        {description && (
          <p className={styles.productDescription} title={description}>
            {description}
          </p>
        )}

        <div className={styles.priceRow}>
          <span
            className={styles.price}
            aria-label={`Prix: ${formatPrice(price)} euros`}
          >
            {formatPrice(price)}€
          </span>

          {isOutOfStock ? (
            <span
              className={styles.outOfStock}
              role="status"
              aria-label="Rupture de stock"
              title="Rupture de stock"
            >
              Rupture de stock
            </span>
          ) : (
            onAddToCart && (
              <button
                className={styles.cartBtn}
                onClick={handleAddToCart}
                aria-label={`Ajouter ${name} au panier`}
                title="Ajouter au panier"
              >
                <BsCart3 aria-hidden="true" />
              </button>
            )
          )}

          {showStock && (
            <span
              className={styles.stockInfo}
              aria-label={`Stock disponible: ${Number(quantity)}`}
              title={`Stock: ${Number(quantity)}`}
            >
              Stock: {Number(quantity)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    image: PropTypes.string,
    category: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    quantity: PropTypes.number,
    producerName: PropTypes.string,
  }).isRequired,
  onAddToCart: PropTypes.func,
  showProducer: PropTypes.bool,
  showStock: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'compact']),
  className: PropTypes.string,
};

export default ProductCard;
