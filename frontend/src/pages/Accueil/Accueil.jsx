import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProducerShowcase from "../../components/ProducerShowcase/ProducerShowcase";
import { producerAPI } from "../../services/api";
import { transformProducerData, transformProductData } from "../../utils/defaults";
import styles from "./Accueil.module.scss";

const Accueil = () => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducersWithProducts();
  }, []);

  const fetchProducersWithProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all producers
      const producersResponse = await producerAPI.getAllProducers();
      
      if (!producersResponse.success || !producersResponse.producteurs) {
        throw new Error('Aucun producteur trouvé');
      }

      // Transform producer data and fetch products for each
      const producersWithProducts = await Promise.all(
        producersResponse.producteurs.map(async (producer, index) => {
          try {
            // Transform producer data with defaults
            const transformedProducer = transformProducerData(producer, index);

            // Fetch products for this producer
            const productsResponse = await producerAPI.getProductsByProducer(producer._id);
            
            if (productsResponse.success && productsResponse.products) {
              // Transform and limit products to 3 items
              const transformedProducts = productsResponse.products
                .map(transformProductData)
                .slice(0, 3); // Limit to 3 products
              
              transformedProducer.products = transformedProducts;
            }

            return transformedProducer;
          } catch (productError) {
            console.warn(`Erreur lors de la récupération des produits pour ${producer.name}:`, productError);
            // Return producer without products if product fetch fails
            const transformedProducer = transformProducerData(producer, index);
            transformedProducer.products = [];
            return transformedProducer;
          }
        })
      );

      setProducers(producersWithProducts);
    } catch (err) {
      console.error('Erreur lors de la récupération des producteurs:', err);
      setError(err.message || 'Erreur lors du chargement des producteurs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.accueil}>
        <div className="container">
          <div className={styles.loading}>
            <p>Chargement des producteurs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.accueil}>
        <div className="container">
          <div className={styles.error}>
            <p>Erreur: {error}</p>
            <button onClick={fetchProducersWithProducts} className={styles.retryBtn}>
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.accueil}>
      <div className="container">
        {/* Hero section inside the page */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h2 className={styles.headline}>Frais de la ferme à votre table</h2>
            <p className={styles.subtitle}>
              Découvrez les meilleurs produits locaux, laitages artisanaux et
              fruits de saison directement de notre réseau de confiance de
              fermiers familiaux.
            </p>
            <Link to="/nosfermiers" className={styles.cta}>
              Découvrir nos fermiers !
            </Link>
          </div>
        </section>

        {/* Producers showcase */}
        <h3 className={styles.sectionHeading}>Nos Agriculteurs partenaires</h3>
        {producers.length > 0 ? (
          <div className={styles.producers}>
            {producers.map((producer) => (
              <ProducerShowcase key={producer.id} producer={producer} />
            ))}
          </div>
        ) : (
          <div className={styles.noProducers}>
            <p>Aucun producteur disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Accueil;
