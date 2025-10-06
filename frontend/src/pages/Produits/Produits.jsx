import React, { useEffect, useState } from "react";
import HeroSection from "../../components/common/HeroSection";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ProductCard from "../../components/common/ProductCard";
import FilterChips from "../../components/common/FilterChips";
import Pagination from "../../components/common/Pagination";
import SEO from "../../components/SEO";
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

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

  const handleSelectCategory = (val) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleSelectProducer = (val) => {
    setSelectedProducer(val);
    setCurrentPage(1);
  };

  const totalCount = visibleProducts.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = visibleProducts.slice(startIndex, startIndex + pageSize);

  return (
    <div className={styles.produits}>
      <SEO
        title="Tous nos Produits Locaux"
        description="Parcourez notre sélection complète de produits frais, artisanaux et de saison, directement des producteurs partenaires. Fruits, légumes, laitages, viandes et produits de la ruche."
        keywords="produits locaux, fruits frais, légumes bio, laitages artisanaux, viande fermière, miel, produits de la ruche, produits de saison"
        canonical="https://mff-weld.vercel.app/produits"
        ogType="website"
      />
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
              onSelect={handleSelectCategory}
              maxVisible={5}
              showIcon={true}
            />

            <FilterChips
              label="Producteurs"
              items={producers}
              selectedValue={selectedProducer}
              onSelect={handleSelectProducer}
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
              <>
                <div className={styles.grid} role="grid" aria-label="Grille des produits">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showProducer={true}
                      showStock={true}
                    />
                  ))}
                </div>
                {totalCount > pageSize && (
                  <Pagination
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Produits;
