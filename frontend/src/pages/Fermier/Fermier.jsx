import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { producerAPI, commentsAPI } from "../../services/api";
import { transformProductData, transformProducerData, getCategoryBadgeClass } from "../../utils/defaults";
import accueilStyles from "../Accueil/Accueil.module.scss";
import cardStyles from "../../components/ProducerShowcase/ProducerShowcase.module.scss";
import styles from "./Fermier.module.scss";
import { BsCart3 } from "react-icons/bs";

const Fermier = () => {
  const { id } = useParams();

  const [producer, setProducer] = useState(null);
  const [products, setProducts] = useState([]);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [prodError, setProdError] = useState(null);
  const [commentsError, setCommentsError] = useState(null);
  const [redirect404, setRedirect404] = useState(false);

  const navigate = useNavigate();

  // Helpers
  const renderProductTags = (product) => {
    if (!product.tags || product.tags.length === 0) return null;
    return product.tags.map((tag, index) => {
      const tagLower = String(tag).toLowerCase();
      let tagClass = cardStyles.tagDefault;

      if (tagLower === "nouveau") {
        tagClass = cardStyles.tagNew;
      } else if (tagLower === "promo") {
        tagClass = cardStyles.tagPromo;
      } else {
        const categoryClass = getCategoryBadgeClass(product.category || tag);
        tagClass = cardStyles[categoryClass] || cardStyles.tagDefault;
      }

      return (
        <span
          key={`${product.id}-${tag}-${index}`}
          className={`${cardStyles.tag} ${tagClass}`}
          aria-label={`Catégorie: ${tag}`}
        >
          {tag}
        </span>
      );
    });
  };

  const handleAddToCart = (product, event) => {
    event.preventDefault();
    event.stopPropagation();
    // Integrate with cart when available
    console.log("Ajout au panier:", product.name);
  };

  const formatPrice = (price) => {
    if (typeof price === "number") return price.toFixed(2);
    return String(price);
  };

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return "";
    }
  };

  const getUserAvatar = (username = "", index = 0) => {
    const avatarIndex = (Math.abs(username.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) + index) % 70;
    return `https://i.pravatar.cc/100?img=${avatarIndex || 1}`;
  };

  // Fetch producer, products, comments
  useEffect(() => {
    let isMounted = true;

    const fetchProducer = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await producerAPI.getProducerById(id);
        if (!isMounted) return;
        // If API indicates failure or missing producteur, redirect to 404
        if (!res?.success || !res?.producteur) {
          setRedirect404(true);
          return;
        }
        const transformed = transformProducerData(res.producteur, 0);
        setProducer(transformed);
      } catch {
        if (!isMounted) return;
        // Any error fetching the producer -> redirect to 404
        setRedirect404(true);
        return;
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        setProdLoading(true);
        setProdError(null);
        const res = await producerAPI.getProductsByProducer(id);
        if (!isMounted) return;
        const raw = Array.isArray(res.products) ? res.products : [];
        setProducts(raw.map(transformProductData));
      } catch (err) {
        // Backend may return 404 when no products; treat as empty list but keep message for debugging
        if (!isMounted) return;
        setProducts([]);
        setProdError(err?.message || "Aucun produit trouvé pour ce producteur");
      } finally {
        if (isMounted) setProdLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        setCommentsError(null);
        const res = await commentsAPI.getCommentsByProducer(id);
        if (!isMounted) return;
        const data = res?.data || res?.comments || [];
        setComments(Array.isArray(data) ? data : []);
      } catch {
        // Treat 404 (no comments) as empty without surfacing an error
        if (!isMounted) return;
        setComments([]);
        setCommentsError(null);
      } finally {
        if (isMounted) setCommentsLoading(false);
      }
    };

    fetchProducer();
    fetchProducts();
    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Trigger navigation after state flip to avoid rendering the page with errors
  useEffect(() => {
    if (redirect404) {
      navigate("/404", { replace: true });
    }
  }, [redirect404, navigate]);

  const title = producer?.name || "Nom du Producteur";
  const specialty = producer?.specialty || "Spécialité du producteur";
  const description = producer?.description || "Description du producteur";

  // Prevent rendering while redirecting
  if (redirect404) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Hero section - reuse styles from Accueil */}
        <section className={accueilStyles.hero}>
          <div className={accueilStyles.heroInner}>
            {loading ? (
              <h2 className={accueilStyles.headline}>Chargement...</h2>
            ) : error ? (
              <>
                <h2 className={accueilStyles.headline}>Erreur</h2>
                <p className={accueilStyles.subtitle}>{error}</p>
              </>
            ) : (
              <div className={styles.heroRow}>
                <img
                  className={styles.heroAvatar}
                  src={producer?.avatar && String(producer.avatar).trim() !== "" ? producer.avatar : "https://i.pravatar.cc/100?img=12"}
                  alt={`Photo de ${title}`}
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
                <div className={styles.heroText}>
                  <h2 className={accueilStyles.headline}>{title}</h2>
                  <p className={styles.specialty}>{specialty}</p>
                  <p className={accueilStyles.subtitle}>{description}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Products section */}
        <section aria-labelledby="produits-title">
          <h3 id="produits-title" className={styles.sectionHeading}>Produits</h3>

          {prodLoading ? (
            <div className={styles.loading}><p>Chargement des produits...</p></div>
          ) : prodError ? (
            <div className={styles.error}><p>Erreur: {prodError}</p></div>
          ) : products.length === 0 ? (
            <div className={cardStyles.emptyState}><p>Aucun produit disponible pour le moment</p></div>
          ) : (
            <div className={styles.grid4} role="grid" aria-label="Grille des produits du producteur">
              {products.map((product) => (
                <article
                  key={product.id}
                  className={cardStyles.productCard}
                  role="gridcell"
                  tabIndex="0"
                  aria-labelledby={`product-name-${product.id}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className={cardStyles.thumbWrap}>
                    <img
                      src={product.image && String(product.image).trim() !== "" ? product.image : "/placeholder-product.jpg"}
                      alt={`Image de ${product.name}`}
                      loading="lazy"
                      onError={(e) => {
                        const fallback = "/placeholder-product.jpg";
                        if (!e.currentTarget.src.endsWith(fallback)) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className={cardStyles.productBody}>
                    <div className={cardStyles.productHeader}>
                      <h5
                        id={`product-name-${product.id}`}
                        className={cardStyles.productName}
                        title={product.name}
                      >
                        {product.name}
                      </h5>
                      <div className={cardStyles.tags} role="list" aria-label="Catégories du produit">
                        {renderProductTags(product)}
                      </div>
                    </div>
                    {product.description && (
                      <p className={cardStyles.productDescription} title={product.description}>
                        {product.description}
                      </p>
                    )}
                    <div className={cardStyles.priceRow}>
                      <span className={cardStyles.price} aria-label={`Prix: ${formatPrice(product.price)} euros`}>
                        {formatPrice(product.price)}€
                      </span>
                      <button
                        className={cardStyles.cartBtn}
                        onClick={(e) => handleAddToCart(product, e)}
                        aria-label={`Ajouter ${product.name} au panier`}
                        title="Ajouter au panier"
                      >
                        <BsCart3 aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Comments section */}
        <section className={styles.commentsSection} aria-labelledby="comments-title">
          <h3 id="comments-title" className={styles.commentsTitle}>Commentaire</h3>

          {commentsLoading ? (
            <div className={styles.loading}><p>Chargement des commentaires...</p></div>
          ) : commentsError ? (
            <div className={styles.error}><p>Erreur: {commentsError}</p></div>
          ) : comments.length === 0 ? (
            <div className={styles.noComments}>
              <p>Pas de commentaire ni d'évaluations pour ce producteurs voulez-vous laissez le premier commentaire ?</p>
            </div>
          ) : (
            <div className={styles.commentList}>
              {comments.map((c, idx) => {
                const username = c?.userId?.username || "Nom Client";
                const avatar = getUserAvatar(username, idx);
                return (
                  <div key={c._id || idx} className={styles.commentRow}>
                    <div className={styles.clientInfo}>
                      <img className={styles.clientAvatar} src={avatar} alt={`Avatar de ${username}`} />
                      <div className={styles.clientName}>{username}</div>
                    </div>

                    <div className={styles.vRule} aria-hidden="true" />

                    <div className={styles.commentBody}>
                      <div className={styles.commentText}>{c.comment}</div>
                      <div className={styles.rating}>Rating : <strong>{c.rating}</strong>/5</div>
                      {c.createdAt && (
                        <div className={styles.date} aria-label="Date du commentaire">
                          {formatDate(c.createdAt)}
                        </div>
                      )}
                    </div>

                    <div className={styles.rowDivider} aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Back link */}
        <div className={styles.backRow}>
          <Link to="/nosfermiers" className={styles.backLink}>← Retour aux fermiers</Link>
        </div>
      </div>
    </div>
  );
};

export default Fermier;
