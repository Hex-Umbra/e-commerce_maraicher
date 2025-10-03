import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ImageWithFallback from "../../components/common/ImageWithFallback/ImageWithFallback";
import ProductCard from "../../components/common/ProductCard";
import CommentCard from "../../components/common/CommentCard";
import { producerAPI, commentsAPI } from "../../services/api";
import { transformProductData, transformProducerData } from "../../utils/defaults";
import accueilStyles from "../Accueil/Accueil.module.scss";
import styles from "./Fermier.module.scss";

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
                <ImageWithFallback
                  src={producer?.avatar}
                  fallback="https://i.pravatar.cc/100?img=12"
                  alt={`Photo de ${title}`}
                  className={styles.heroAvatar}
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
            <LoadingState message="Chargement des produits..." size="small" />
          ) : prodError ? (
            <ErrorState message={prodError} />
          ) : products.length === 0 ? (
            <EmptyState message="Aucun produit disponible pour le moment" icon="📦" />
          ) : (
            <div className={styles.grid4} role="grid" aria-label="Grille des produits du producteur">
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
        </section>

        {/* Comments section */}
        <section className={styles.commentsSection} aria-labelledby="comments-title">
          <h3 id="comments-title" className={styles.commentsTitle}>Commentaire</h3>

          {commentsLoading ? (
            <LoadingState message="Chargement des commentaires..." size="small" />
          ) : commentsError ? (
            <ErrorState message={commentsError} />
          ) : comments.length === 0 ? (
            <EmptyState 
              message="Pas de commentaire ni d'évaluations pour ce producteur. Voulez-vous laisser le premier commentaire ?"
              icon="💬"
            />
          ) : (
            <div className={styles.commentList}>
              {comments.map((c, idx) => (
                <CommentCard
                  key={c._id || idx}
                  comment={c.comment}
                  username={c?.userId?.username}
                  rating={c.rating}
                  createdAt={c.createdAt}
                  index={idx}
                />
              ))}
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
