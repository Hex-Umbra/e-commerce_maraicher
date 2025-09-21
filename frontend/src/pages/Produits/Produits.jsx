import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Produits.module.scss";
import accueilStyles from "../Accueil/Accueil.module.scss";
import cardStyles from "../../components/ProducerShowcase/ProducerShowcase.module.scss";
import { BsCart3, BsFilter } from "react-icons/bs";
import { productAPI, cartAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../utils/routes";
import { transformProductData, getCategoryBadgeClass, getCategoryBadge } from "../../utils/defaults";

const Produits = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAllCats, setShowAllCats] = useState(false);
  const [producers, setProducers] = useState([]);
  const [selectedProducer, setSelectedProducer] = useState("all");
  const [showAllProducers, setShowAllProducers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { isAuthenticated, showNotification } = useAuth();

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

        // Build unique producers list from transformed products
        const producerMap = new Map();
        transformed.forEach((p) => {
          const id = p.producerId ? String(p.producerId) : null;
          const name = p.producerName ? String(p.producerName).trim() : "";
          if (!id && !name) return;
          const key = id || `name:${name.toLowerCase()}`;
          if (!producerMap.has(key)) {
            producerMap.set(key, {
              value: id || `name:${name.toLowerCase()}`,
              label: name || "—",
            });
          }
        });
        setProducers(Array.from(producerMap.values()));
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

  const handleAddToCart = async (product, event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      showNotification("Veuillez vous connecter pour ajouter des produits au panier.", "warning");
      navigate(ROUTES.login);
      return;
    }

    try {
      const data = await cartAPI.addToCart(product.id, 1);
      showNotification(data?.message || "Produit ajouté au panier", "success");
    } catch (err) {
      showNotification(err.message || "Erreur lors de l'ajout au panier", "error");
    }
  };

  const formatPrice = (price) => {
    if (typeof price === "number") return price.toFixed(2);
    return String(price);
  };

  // Filtered products by selected category
  const visibleProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" ||
      String(p.category || "").toLowerCase() === selectedCategory;

    const producerKey = p.producerId
      ? String(p.producerId)
      : `name:${String(p.producerName || "").toLowerCase()}`;

    const matchesProducer =
      selectedProducer === "all" || producerKey === selectedProducer;

    return matchesCategory && matchesProducer;
  });

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

            <Link
              to="/nosfermiers"
              className={accueilStyles.cta}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Spacebar" || e.code === "Space") {
                  e.preventDefault();
                  e.currentTarget.click();
                }
              }}
            >
              Découvrir nos fermiers !
            </Link>

            <div className={styles.filtersWrap} aria-label="Filtres de catégorie">
              <div className={styles.chipRow} role="listbox" aria-label="Catégories">
                <span className={styles.filterLabel}>Catégories</span>
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

            {/* Producer filters */}
            <div className={styles.filterRow}>
              <div className={styles.chipRow} role="listbox" aria-label="Producteurs">
                <span className={styles.filterLabel}>Producteurs</span>
                <span className={styles.filterIcon} aria-hidden="true">
                  <BsFilter />
                </span>
                <button
                  type="button"
                  className={`${styles.chip} ${selectedProducer === "all" ? styles.chipActive : ""}`}
                  aria-pressed={selectedProducer === "all"}
                  onClick={() => setSelectedProducer("all")}
                >
                  Tous
                </button>
                {producers.slice(0, 5).map((pr) => (
                  <button
                    type="button"
                    key={pr.value}
                    className={`${styles.chip} ${selectedProducer === pr.value ? styles.chipActive : ""}`}
                    aria-pressed={selectedProducer === pr.value}
                    onClick={() => setSelectedProducer(pr.value)}
                  >
                    {pr.label}
                  </button>
                ))}
                {producers.length > 5 && (
                  <button
                    type="button"
                    className={styles.chip}
                    aria-haspopup="menu"
                    aria-expanded={showAllProducers}
                    aria-controls="all-producers-menu"
                    onClick={() => setShowAllProducers((v) => !v)}
                    title="Voir tous les producteurs"
                  >
                    ...
                    <span className={styles.srOnly}>Voir tous les producteurs</span>
                  </button>
                )}
              </div>

              {showAllProducers && producers.length > 5 && (
                <div
                  id="all-producers-menu"
                  className={styles.menuPanel}
                  role="menu"
                  aria-label="Autres producteurs"
                >
                  {producers.slice(5).map((pr) => (
                    <button
                      type="button"
                      key={pr.value}
                      role="menuitem"
                      className={`${styles.chip} ${selectedProducer === pr.value ? styles.chipActive : ""}`}
                      aria-pressed={selectedProducer === pr.value}
                      onClick={() => {
                        setSelectedProducer(pr.value);
                        setShowAllProducers(false);
                      }}
                    >
                      {pr.label}
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
                        title={Number(product.quantity || 0) <= 0 ? "Rupture de stock" : "Ajouter au panier"}
                        disabled={Number(product.quantity || 0) <= 0}
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
