import React, { useEffect, useState } from "react";
import HeroSection from "../../components/common/HeroSection";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ProducerCard from "../../components/common/ProducerCard";
import Pagination from "../../components/common/Pagination";
import SEO from "../../components/SEO";
import styles from "./Nosfermiers.module.scss";
import { producerAPI } from "../../services/api";
import { transformProducerData } from "../../utils/defaults";
import { ROUTES } from "../../utils/routes";

const Nosfermiers = () => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    fetchProducers();
  }, []);

  const fetchProducers = async () => {
    try {
      setLoading(true);
      setError(null);

      const producersResponse = await producerAPI.getAllProducers();
      if (!producersResponse.success || !producersResponse.producteurs) {
        throw new Error("Aucun producteur trouvé");
      }

      const withCounts = await Promise.all(
        producersResponse.producteurs.map(async (producer, index) => {
          const transformed = transformProducerData(producer, index);
          try {
            const productsRes = await producerAPI.getProductsByProducer(producer._id);
            const products = productsRes?.success && Array.isArray(productsRes.products)
              ? productsRes.products
              : [];
            transformed.productCount = products.length;
          } catch {
            transformed.productCount = 0;
          }
          return transformed;
        })
      );

      setProducers(withCounts);
    } catch (err) {
      console.error("Erreur lors de la récupération des producteurs:", err);
      setError(err.message || "Erreur lors du chargement des producteurs");
    } finally {
      setLoading(false);
    }
  };

  const totalCount = producers.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducers = producers.slice(startIndex, startIndex + pageSize);
  
  return (
    <div className={styles.nosfermiers}>
      <SEO
        title="Nos Fermiers Partenaires"
        description="Rencontrez les producteurs passionnés derrière nos produits frais et artisanaux. Parcourez leurs spécialités et soutenez l'agriculture locale et familiale."
        keywords="fermiers locaux, producteurs locaux, agriculture familiale, producteurs bio, fermiers partenaires, agriculture durable"
        canonical="https://mff-weld.vercel.app/nosfermiers"
        ogType="website"
      />
      <div className="container">
        {/* Hero section */}
        <HeroSection
          title="Découvrez nos partenaires"
          subtitle="Rencontrez les producteurs passionnés derrière nos produits frais et artisanaux. Parcourez leurs spécialités et soutenez l'agriculture locale."
          ctaText="Explorer les produits"
          ctaLink={ROUTES.produits}
        />

        {/* Content states */}
        {loading ? (
          <LoadingState message="Chargement des fermiers..." />
        ) : error ? (
          <ErrorState 
            message={error}
            onRetry={fetchProducers}
          />
        ) : producers.length === 0 ? (
          <EmptyState 
            message="Aucun producteur disponible pour le moment."
            icon="👨‍🌾"
          />
        ) : (
          <>
            <h3 className={styles.sectionHeading}>Nos fermiers</h3>
            <div className={styles.grid} role="grid" aria-label="Grille des producteurs">
              {paginatedProducers.map((producer) => (
                <ProducerCard
                  key={producer.id}
                  producer={producer}
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
      </div>
    </div>
  );
};

export default Nosfermiers;
