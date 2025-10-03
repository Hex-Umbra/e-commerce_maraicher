import PropTypes from "prop-types";
import ImageWithFallback from "../common/ImageWithFallback/ImageWithFallback";
import ProductCard from "../common/ProductCard";
import styles from "./ProducerShowcase.module.scss";
import { Link } from "react-router-dom";

const ProducerShowcase = ({ producer, onViewAllHref = "/produits" }) => {
  const {
    name = "Nom Producteur",
    specialty = "Spécialité du producteur",
    description = "Description du Producteur",
    avatar = "https://i.pravatar.cc/100?img=12",
    products = [],
  } = producer || {};

  return (
    <section className={styles.section} aria-labelledby="producer-title">
      <div className={styles.card}>
        <header className={styles.header}>
          <ImageWithFallback
            src={avatar}
            fallback="https://i.pravatar.cc/100?img=12"
            alt={`Photo de ${name}`}
            className={styles.avatar}
          />
          <div className={styles.meta}>
            <div className={styles.nameRow}>
              <h3 id="producer-title" className={styles.name}>{name}</h3>
              {specialty && <span className={styles.chip} aria-label="Spécialité">{specialty}</span>}
            </div>
            {description && <p className={styles.desc}>{description}</p>}
          </div>
        </header>

        <h4 className={styles.productsTitle} aria-label={`Produits de ${name}`}>
          Produits
          {products.length > 0 && (
            <span className={styles.productCount} aria-label={`${products.length} produits disponibles`}>
              ({products.length})
            </span>
          )}
        </h4>
        
        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Aucun produit disponible pour le moment</p>
          </div>
        ) : (
          <div className={styles.grid} role="grid" aria-label="Grille des produits">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showProducer={false}
                showStock={false}
              />
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <Link 
            to={onViewAllHref} 
            className={styles.cta}
            aria-label="Voir tout les produits de ce producteur"
          >
            Voir tout les produits de ce producteur
          </Link>
        </div>
      </div>
    </section>
  );
};

ProducerShowcase.propTypes = {
  producer: PropTypes.shape({
    name: PropTypes.string,
    specialty: PropTypes.string,
    description: PropTypes.string,
    avatar: PropTypes.string,
    products: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        image: PropTypes.string.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        tags: PropTypes.arrayOf(PropTypes.string),
        category: PropTypes.string,
      })
    ),
  }),
  onViewAllHref: PropTypes.string,
};

export default ProducerShowcase;
