import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Produits.module.scss";
import accueilStyles from "../Accueil/Accueil.module.scss";
import cardStyles from "../../components/ProducerShowcase/ProducerShowcase.module.scss";
import { BsCart3, BsFilter } from "react-icons/bs";
import { productAPI } from "../../services/api";
import { transformProductData, getCategoryBadgeClass, getCategoryBadge } from "../../utils/defaults";

const Produits = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAllCats, setShowAllCats] = useState(false);
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

        // Build unique categories list from transformed products
        const uniqueCatValues = Array.from(
          new Set(
            transformed
              .map((p) => p.category)
              .filter(Boolean)
              .map((c) => String(c).toLowerCase())
          )
        );
        const cats = uniqueCatValues.map((val) => ({
          value: val,
          label: getCategoryBadge(val),
        }));
        setCategories(cats);
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

  // Filtered products by selected category
  const visibleProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (p) => String(p.category || "").toLowerCase() === selectedCategory
        );

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

            <div className={styles.filtersWrap} aria-label="Filtres de catégorie">
              <div className={styles.chipRow} role="listbox" aria-label="Catégories">
                <span className={styles.filterIcon} aria-hidden="true">
                  <BsFilter />
                </span>
                <button
                  type="button"
                  className={`${styles.chip} ${selectedCategory === "all" ? styles.chipActive : ""}`}
                  aria-pressed={selectedCategory === "all"}
                  onClick={() => setSelectedCategory("all")}
                >
                  Tous
                </button>
                {categories.slice(0, 5).map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    className={`${styles.chip} ${selectedCategory === c.value ? styles.chipActive : ""}`}
                    aria-pressed={selectedCategory === c.value}
                    onClick={() => setSelectedCategory(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
                {categories.length > 5 && (
                  <button
                    type="button"
                    className={styles.chip}
                    aria-haspopup="menu"
                    aria-expanded={showAllCats}
                    aria-controls="all-categories-menu"
                    onClick={() => setShowAllCats((v) => !v)}
                    title="Voir toutes les catégories"
                  >
                    ...
                    <span className={styles.srOnly}>Voir toutes les catégories</span>
                  </button>
                )}
              </div>

              {showAllCats && categories.length > 5 && (
                <div
                  id="all-categories-menu"
                  className={styles.menuPanel}
                  role="menu"
                  aria-label="Autres catégories"
                >
                  {categories.slice(5).map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      role="menuitem"
                      className={`${styles.chip} ${selectedCategory === c.value ? styles.chipActive : ""}`}
                      aria-pressed={selectedCategory === c.value}
                      onClick={() => {
                        setSelectedCategory(c.value);
                        setShowAllCats(false);
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

            {visibleProducts.length === 0 ? (
              <div className={styles.noProducts}>
                <p>Aucun produit pour cette catégorie.</p>
              </div>
            ) : (
              <div className={styles.grid} role="grid" aria-label="Grille des produits">
              {visibleProducts.map((product) => (
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
                      src={product.image && product.image.trim() !== "" ? product.image : "/placeholder-product.jpg"}
                      alt={`Image de ${product.name}`}
                      loading="lazy"
                      onError={(e) => {
                        if (!e.currentTarget.src.endsWith("/placeholder-product.jpg")) {
                          e.currentTarget.src = "/placeholder-product.jpg";
                        }
                      }}
                      decoding="async"
                      referrerPolicy="no-referrer"
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Produits;
