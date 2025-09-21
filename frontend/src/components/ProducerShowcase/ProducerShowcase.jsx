import PropTypes from "prop-types";
import { BsCart3 } from "react-icons/bs";
import { getCategoryBadgeClass } from "../../utils/defaults";
import styles from "./ProducerShowcase.module.scss";

const ProducerShowcase = ({ producer, onViewAllHref = "/produits", onAddToCart }) => {
  const {
    name = "Nom Producteur",
    specialty = "Spécialité du producteur",
    description = "Description du Producteur",
    avatar = "https://i.pravatar.cc/100?img=12",
    products = [],
  } = producer || {};

  // Memoized tag rendering function
  const renderProductTags = (product) => {
    if (!product.tags || product.tags.length === 0) return null;
    
    return product.tags.map((tag, index) => {
      const tagLower = String(tag).toLowerCase();
      let tagClass = styles.tagDefault;
      
      // Check for special tags first
      if (tagLower === "nouveau") {
        tagClass = styles.tagNew;
      } else if (tagLower === "promo") {
        tagClass = styles.tagPromo;
      } else {
        // Use category-based styling
        const categoryClass = getCategoryBadgeClass(product.category || tag);
        tagClass = styles[categoryClass] || styles.tagDefault;
      }
      
      return (
        <span 
          key={`${product.id}-${tag}-${index}`} 
          className={`${styles.tag} ${tagClass}`}
          aria-label={`Catégorie: ${tag}`}
        >
          {tag}
        </span>
      );
    });
  };

  // Handle cart button click
  const handleAddToCart = (product, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      console.log('Ajout au panier:', product.name);
    }
  };

  // Format price display
  const formatPrice = (price) => {
    if (typeof price === "number") {
      return price.toFixed(2);
    }
    return String(price);
  };

  return (
    <section className={styles.section} aria-labelledby="producer-title">
      <div className={styles.card}>
        <header className={styles.header}>
          <img 
            className={styles.avatar} 
            src={avatar && String(avatar).trim() !== "" ? avatar : "https://i.pravatar.cc/100?img=12"} 
            alt={`Photo de ${name}`}
            loading="lazy"
            onError={(e) => {
              const fallback = "https://i.pravatar.cc/100?img=12";
              if (!e.currentTarget.src.includes("i.pravatar.cc/100?img=12")) {
                e.currentTarget.src = fallback;
              }
            }}
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className={styles.meta}>
            <div className={styles.nameRow}>
              <h3 id="producer-title" className={styles.name}>{name}</h3>
              {specialty && <span className={styles.chip} aria-label="Spécialité">{specialty}</span>}
            </div>
            {description && <p className={styles.desc}>{description}</p>}
          </div>
        </header>

        <h4 className={styles.productsTitle} aria-label={`Produits de ${name}`}>
          Produits
          {products.length > 0 && (
            <span className={styles.productCount} aria-label={`${products.length} produits disponibles`}>
              ({products.length})
            </span>
          )}
        </h4>
        
        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Aucun produit disponible pour le moment</p>
          </div>
        ) : (
          <div className={styles.grid} role="grid" aria-label="Grille des produits">
            {products.map((product) => (
              <article 
                key={product.id} 
                className={styles.productCard}
                role="gridcell"
                tabIndex="0"
                aria-labelledby={`product-name-${product.id}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Could trigger product detail view
                  }
                }}
              >
                <div className={styles.thumbWrap}>
                  <img 
                    src={product.image && String(product.image).trim() !== "" ? product.image : "/placeholder-product.jpg"} 
                    alt={`Image de ${product.name}`}
                    loading="lazy"
                    onError={(e) => {
                      const fallback = "/placeholder-product.jpg";
                      if (!e.currentTarget.src.endsWith(fallback)) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className={styles.productBody}>
                  <div className={styles.productHeader}>
                    <h5 
                      id={`product-name-${product.id}`}
                      className={styles.productName}
                      title={product.name}
                    >
                      {product.name}
                    </h5>
                    <div className={styles.tags} role="list" aria-label="Catégories du produit">
                      {renderProductTags(product)}
                    </div>
                  </div>
                  {product.description && (
                    <p className={styles.productDescription} title={product.description}>
                      {product.description}
                    </p>
                  )}
                  <div className={styles.priceRow}>
                    <span 
                      className={styles.price}
                      aria-label={`Prix: ${formatPrice(product.price)} euros`}
                    >
                      {formatPrice(product.price)}€
                    </span>
                    <button 
                      className={styles.cartBtn} 
                      onClick={(e) => handleAddToCart(product, e)}
                      aria-label={`Ajouter ${product.name} au panier`}
                      title="Ajouter au panier"
                    >
                      <BsCart3 aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <a 
            href={onViewAllHref} 
            className={styles.cta}
            aria-label={`Voir tous les produits de ${name}`}
          >
            Voir tous les produits
          </a>
        </div>
      </div>
    </section>
  );
};

ProducerShowcase.propTypes = {
  producer: PropTypes.shape({
    name: PropTypes.string,
    specialty: PropTypes.string,
    description: PropTypes.string,
    avatar: PropTypes.string,
    products: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        image: PropTypes.string.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        tags: PropTypes.arrayOf(PropTypes.string),
        category: PropTypes.string,
      })
    ),
  }),
  onViewAllHref: PropTypes.string,
  onAddToCart: PropTypes.func,
};

export default ProducerShowcase;
