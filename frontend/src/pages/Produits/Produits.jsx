import React, { useEffect, useState } from "react";
import HeroSection from "../../components/common/HeroSection";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ProductCard from "../../components/common/ProductCard";
import FilterChips from "../../components/common/FilterChips";
import styles from "./Produits.module.scss";
import { productAPI } from "../../services/api";
import { ROUTES } from "../../utils/routes";
import { transformProductData, getCategoryBadge } from "../../utils/defaults";

const Produits = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [producers, setProducers] = useState([]);
  const [selectedProducer, setSelectedProducer] = useState("all");
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
        <div className={styles.filtersSection} aria-label="Filtres">
          <FilterChips
            label="Catégories"
            items={categories}
            selectedValue={selectedCategory}
            onSelect={setSelectedCategory}
            maxVisible={5}
            showIcon={true}
          />

          <FilterChips
            label="Producteurs"
            items={producers}
            selectedValue={selectedProducer}
            onSelect={setSelectedProducer}
            maxVisible={5}
            showIcon={true}
          />
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
