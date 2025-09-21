import PropTypes from "prop-types";
import { BsCart3 } from "react-icons/bs";
import { getCategoryBadgeClass } from "../../utils/defaults";
import styles from "./ProducerShowcase.module.scss";

const ProducerShowcase = ({ producer, onViewAllHref = "/produits" }) => {
  const {
    name = "Nom Producteur",
    specialty = "Spécialité du producteur",
    description = "Description du Producteur",
    avatar = "https://i.pravatar.cc/100?img=12",
    products = [],
  } = producer || {};

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <header className={styles.header}>
          <img className={styles.avatar} src={avatar} alt={name} />
          <div className={styles.meta}>
            <div className={styles.nameRow}>
              <h3 className={styles.name}>{name}</h3>
              {specialty ? <span className={styles.chip}>{specialty}</span> : null}
            </div>
            {description ? <p className={styles.desc}>{description}</p> : null}
          </div>
        </header>

        <h4 className={styles.productsTitle}>Produits</h4>
        <div className={styles.grid}>
          {products.map((p) => {
            const tagElems = (p.tags || []).map((t, index) => {
              const tLower = String(t).toLowerCase();
              let tagClass = "";
              
              // Check for special tags first
              if (tLower === "nouveau") {
                tagClass = styles.tagNew;
              } else if (tLower === "promo") {
                tagClass = styles.tagPromo;
              } else {
                // Use category-based styling
                tagClass = styles[getCategoryBadgeClass(p.category || t)];
              }
              
              return (
                <span key={`${p.id}-${t}-${index}`} className={`${styles.tag} ${tagClass}`}>
                  {t}
                </span>
              );
            });

            return (
              <article key={p.id} className={styles.productCard}>
                <div className={styles.thumbWrap}>
                  <img src={p.image} alt={p.name} />
                </div>
                <div className={styles.productBody}>
                  <div className={styles.productHeader}>
                    <h5 title={p.name}>{p.name}</h5>
                    <div className={styles.tags}>{tagElems}</div>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>
                      {typeof p.price === "number"
                        ? p.price.toFixed(2)
                        : p.price}
                      €{/* price per unit could be added later */}
                    </span>
                    <button className={styles.cartBtn} title="Ajouter au panier">
                      <BsCart3 />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.actions}>
          <a href={onViewAllHref} className={styles.cta}>
            Voir tous les produits
          </a>
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
        image: PropTypes.string.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        tags: PropTypes.arrayOf(PropTypes.string),
      })
    ),
  }),
  onViewAllHref: PropTypes.string,
};

export default ProducerShowcase;
