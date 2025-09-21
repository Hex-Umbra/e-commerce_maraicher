import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Nosfermiers.module.scss";
import accueilStyles from "../Accueil/Accueil.module.scss";
import { producerAPI } from "../../services/api";
import { transformProducerData } from "../../utils/defaults";

const Nosfermiers = () => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <div className={styles.loading}>
            <p>Chargement des fermiers...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>Erreur: {error}</p>
            <button onClick={fetchProducers} className={styles.retryBtn}>
              Réessayer
            </button>
          </div>
        ) : producers.length === 0 ? (
          <div className={styles.noProducers}>
            <p>Aucun producteur disponible pour le moment.</p>
          </div>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                >
                  <header className={styles.header}>
                    <img
                      className={styles.avatar}
                      src={p.avatar && String(p.avatar).trim() !== "" ? p.avatar : "https://i.pravatar.cc/100?img=12"}
                      alt={`Photo de ${p.name}`}
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
