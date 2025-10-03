import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import styles from "./ProducerCard.module.scss";

const ProducerCard = ({ producer, onClick }) => {
  const navigate = useNavigate();

  const {
    id,
    name = "Nom Producteur",
    specialty,
    description,
    avatar,
    productCount = 0,
  } = producer || {};

  const handleClick = () => {
    if (onClick) {
      onClick(producer);
    } else {
      navigate(`/fermier/${id}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={styles.producerCard}
      role="gridcell"
      tabIndex="0"
      aria-labelledby={`producer-name-${id}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <header className={styles.header}>
        <ImageWithFallback
          src={avatar}
          fallback="https://i.pravatar.cc/100?img=12"
          alt={`Photo de ${name}`}
          className={styles.avatar}
        />
        <div className={styles.meta}>
          <h4 id={`producer-name-${id}`} className={styles.name} title={name}>
            {name}
          </h4>
          {specialty && (
            <p className={styles.specialty} aria-label="Spécialité">
              {specialty}
            </p>
          )}
          <p className={styles.productCount} aria-label={`${productCount} produits`}>
            {productCount} produit{productCount > 1 ? "s" : ""}
          </p>
        </div>
      </header>

      {description && (
        <p className={styles.description} title={description}>
          {description}
        </p>
      )}
    </article>
  );
};

ProducerCard.propTypes = {
  producer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    specialty: PropTypes.string,
    description: PropTypes.string,
    avatar: PropTypes.string,
    productCount: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func,
};

export default ProducerCard;
