import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../../components/common/HeroSection";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ProductCard from "../../components/common/ProductCard";
import styles from "./Produits.module.scss";
import { BsFilter } from "react-icons/bs";
import { productAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/useCart";
import { ROUTES } from "../../utils/routes";
import { transformProductData, getCategoryBadge } from "../../utils/defaults";

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
  const { addToCart } = useCart();

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

  const handleAddToCart = async (product) => {

    if (!isAuthenticated) {
      showNotification("Veuillez vous connecter pour ajouter des produits au panier.", "warning");
      navigate(ROUTES.login);
      return;
    }

    try {
      const data = await addToCart(product.id, 1);
      showNotification(data?.message || "Produit ajouté au panier", "success");
    } catch (err) {
      showNotification(err.message || "Erreur lors de l'ajout au panier", "error");
    }
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
        {/* Hero section */}
        <HeroSection
          title="Tous nos produits locaux"
          subtitle="Parcourez notre sélection complète de produits frais, artisanaux et de saison, directement des producteurs partenaires."
          ctaText="Découvrir nos fermiers !"
          ctaLink={ROUTES.nosFermiers}
        />

        {/* Filters section */}
        <div className={styles.filtersSection}>

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

        {/* Content states */}
        {loading ? (
          <LoadingState message="Chargement des produits..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : products.length === 0 ? (
          <EmptyState 
            message="Aucun produit disponible pour le moment."
            icon="🛒"
          />
        ) : (
          <>
            <h3 className={styles.sectionHeading}>Tous les produits</h3>

            {visibleProducts.length === 0 ? (
              <EmptyState 
                message="Aucun produit pour cette catégorie."
                icon="🔍"
              />
            ) : (
              <div className={styles.grid} role="grid" aria-label="Grille des produits">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    showProducer={true}
                    showStock={true}
                  />
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
