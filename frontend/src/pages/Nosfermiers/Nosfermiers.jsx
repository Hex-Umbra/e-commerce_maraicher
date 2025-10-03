import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ImageWithFallback from "../../components/common/ImageWithFallback/ImageWithFallback";
import styles from "./Nosfermiers.module.scss";
import accueilStyles from "../Accueil/Accueil.module.scss";
import { producerAPI } from "../../services/api";
import { transformProducerData } from "../../utils/defaults";

const Nosfermiers = () => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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

  return (
    <div className={styles.nosfermiers}>
      <div className="container">
        {/* Hero section aligned with Accueil/Produits */}
        <section className={accueilStyles.hero}>
          <div className={accueilStyles.heroInner}>
            <h2 className={accueilStyles.headline}>Découvrez nos partenaires</h2>
            <p className={accueilStyles.subtitle}>
              Rencontrez les producteurs passionnés derrière nos produits frais et artisanaux.
              Parcourez leurs spécialités et soutenez l&apos;agriculture locale.
            </p>
            <Link
              to="/produits"
              className={accueilStyles.cta}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Spacebar" || e.code === "Space") {
                  e.preventDefault();
                  e.currentTarget.click();
                }
              }}
            >
              Explorer les produits
            </Link>
          </div>
        </section>

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
              {producers.map((p) => (
                <article
                  key={p.id}
                  className={styles.producerCard}
                  role="gridcell"
                  tabIndex="0"
                  aria-labelledby={`producer-name-${p.id}`}
                  onClick={() => navigate(`/fermier/${p.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/fermier/${p.id}`);
                    }
                  }}
                >
                  <header className={styles.header}>
                    <ImageWithFallback
                      src={p.avatar}
                      fallback="https://i.pravatar.cc/100?img=12"
                      alt={`Photo de ${p.name}`}
                      className={styles.avatar}
                    />
                    <div className={styles.meta}>
                      <h4 id={`producer-name-${p.id}`} className={styles.name} title={p.name}>
                        {p.name}
                      </h4>
                      {p.specialty && (
                        <p className={styles.specialty} aria-label="Spécialité">
                          {p.specialty}
                        </p>
                      )}
                      <p className={styles.productCount} aria-label={`${p.productCount || 0} produits`}>
                        {(p.productCount || 0)} produit{(p.productCount || 0) > 1 ? "s" : ""}
                      </p>
                    </div>
                  </header>

                  {p.description && (
                    <p className={styles.description} title={p.description}>
                      {p.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Nosfermiers;
