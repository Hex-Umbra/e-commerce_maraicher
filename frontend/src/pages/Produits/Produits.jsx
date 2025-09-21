import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Produits.module.scss";
import accueilStyles from "../Accueil/Accueil.module.scss";
import cardStyles from "../../components/ProducerShowcase/ProducerShowcase.module.scss";
import { BsCart3 } from "react-icons/bs";
import { productAPI } from "../../services/api";
import { transformProductData, getCategoryBadgeClass } from "../../utils/defaults";

const Produits = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productAPI.getAllProducts();
        const rawProducts = response.products || [];
        const transformed = rawProducts.map(transformProductData);
        setProducts(transformed);
      } catch (err) {
        console.error("Erreur lors de la récupération des produits:", err);
        setError(err.message || "Erreur lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Tag rendering (duplicate of ProducerShowcase logic for reuse)
  const renderProductTags = (product) => {
    if (!product.tags || product.tags.length === 0) return null;

    return product.tags.map((tag, index) => {
      const tagLower = String(tag).toLowerCase();
      let tagClass = cardStyles.tagDefault;

      if (tagLower === "nouveau") {
        tagClass = cardStyles.tagNew;
      } else if (tagLower === "promo") {
        tagClass = cardStyles.tagPromo;
      } else {
        const categoryClass = getCategoryBadgeClass(product.category || tag);
        tagClass = cardStyles[categoryClass] || cardStyles.tagDefault;
      }

      return (
        <span
          key={`${product.id}-${tag}-${index}`}
          className={`${cardStyles.tag} ${tagClass}`}
          aria-label={`Catégorie: ${tag}`}
        >
          {tag}
        </span>
      );
    });
  };

  const handleAddToCart = (product, event) => {
    event.preventDefault();
    event.stopPropagation();
    // Hook into cart context here if available
    console.log("Ajout au panier:", product.name);
  };

  const formatPrice = (price) => {
    if (typeof price === "number") return price.toFixed(2);
    return String(price);
  };

  return (
    <div className={styles.produits}>
      <div className="container">
        {/* Hero section with same dimensions as Accueil */}
        <section className={accueilStyles.hero}>
          <div className={accueilStyles.heroInner}>
            <h2 className={accueilStyles.headline}>Tous nos produits locaux</h2>
            <p className={accueilStyles.subtitle}>
              Parcourez notre sélection complète de produits frais, artisanaux et de
              saison, directement des producteurs partenaires.
            </p>
            <Link to="/nosfermiers" className={accueilStyles.cta}>
              Découvrir nos fermiers !
            </Link>
          </div>
        </section>

        {/* Content states */}
        {loading ? (
          <div className={styles.loading}>
            <p>Chargement des produits...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>Erreur: {error}</p>
            {/* You can implement a retry by reloading the page or extracting fetch into a function */}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.noProducts}>
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <>
            <h3 className={styles.sectionHeading}>Tous les produits</h3>
            <div className={styles.grid} role="grid" aria-label="Grille des produits">
              {products.map((product) => (
                <article
                  key={product.id}
                  className={cardStyles.productCard}
                  role="gridcell"
                  tabIndex="0"
                  aria-labelledby={`product-name-${product.id}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      // Could trigger product detail view
                    }
                  }}
                >
                  <div className={cardStyles.thumbWrap}>
                    <img
                      src={product.image}
                      alt={`Image de ${product.name}`}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/placeholder-product.jpg";
                      }}
                    />
                  </div>
                  <div className={cardStyles.productBody}>
                    <div className={cardStyles.productHeader}>
                      <h5
                        id={`product-name-${product.id}`}
                        className={cardStyles.productName}
                        title={product.name}
                      >
                        {product.name}
                      </h5>
                      <div className={cardStyles.tags} role="list" aria-label="Catégories du produit">
                        {renderProductTags(product)}
                      </div>
                    </div>

                    {/* Producer name under product name */}
                    <p className={cardStyles.producerName}>
                      par {product.producerName || "—"}
                    </p>

                    {product.description && (
                      <p className={cardStyles.productDescription} title={product.description}>
                        {product.description}
                      </p>
                    )}

                    <div className={cardStyles.priceRow}>
                      <span
                        className={cardStyles.price}
                        aria-label={`Prix: ${formatPrice(product.price)} euros`}
                      >
                        {formatPrice(product.price)}€
                      </span>
                      <button
                        className={cardStyles.cartBtn}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Produits;
