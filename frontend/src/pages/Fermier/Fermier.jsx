import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ImageWithFallback from "../../components/common/ImageWithFallback/ImageWithFallback";
import ProductCard from "../../components/common/ProductCard";
import CommentCard from "../../components/common/CommentCard";
import SEO from "../../components/SEO";
import { producerAPI, commentsAPI } from "../../services/api";
import { transformProductData, transformProducerData } from "../../utils/defaults";
import accueilStyles from "../Accueil/Accueil.module.scss";
import styles from "./Fermier.module.scss";
import FormField from "../../components/common/FormField";
import { useAuth } from "../../context/AuthContext";

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

  // Inline comment form state
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();
  const { user, isAuthenticated, showNotification } = useAuth();

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

  // Handle inline comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || user?.role !== "client") {
      showNotification && showNotification("Veuillez vous connecter en tant que client pour commenter.", "warning");
      return;
    }

    const trimmed = commentText.trim();
    if (trimmed.length < 5) {
      setFormError("Le commentaire doit contenir au moins 5 caractères");
      return;
    }
    if (rating < 1 || rating > 5) {
      setFormError("La note doit être comprise entre 1 et 5");
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const res = await commentsAPI.createComment({
        ProducteurId: id,
        comment: trimmed,
        rating,
      });

      // API returns { status, data } where data is created document (may not be populated)
      const apiPayload = res?.data || res;
      const created = apiPayload?.data || apiPayload;

      const newComment = {
        ...(created || {}),
        comment: trimmed,
        rating,
        createdAt: created?.createdAt || new Date().toISOString(),
        userId: { _id: user?.id, username: user?.name },
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      setRating(5);
      showNotification && showNotification("Commentaire publié avec succès", "success");
    } catch (err) {
      const message = err?.message || "Erreur lors de l'envoi du commentaire";
      setFormError(message);
      showNotification && showNotification(message, "error");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleUpdateComment = async (commentId, { comment, rating }) => {
    try {
      const res = await commentsAPI.updateComment(commentId, { comment, rating });
      const updatedPayload = res?.data || res;
      const updated = updatedPayload?.data || updatedPayload;
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, comment: updated?.comment ?? comment, rating: updated?.rating ?? rating }
            : c
        )
      );
      showNotification && showNotification("Commentaire mis à jour", "success");
      return true;
    } catch (err) {
      showNotification && showNotification(err?.message || "Erreur lors de la mise à jour", "error");
      return false;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsAPI.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      showNotification && showNotification("Commentaire supprimé", "success");
      return true;
    } catch (err) {
      showNotification && showNotification(err?.message || "Erreur lors de la suppression", "error");
      return false;
    }
  };
  
  const title = producer?.name || "Nom du Producteur";
  const specialty = producer?.specialty || "Spécialité du producteur";
  const description = producer?.description || "Description du producteur";

  // Calculate average rating
  const averageRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(1)
    : null;

  // Prevent rendering while redirecting
  if (redirect404) {
    return null;
  }

  return (
    <div className={styles.page}>
      <SEO
        title={`${title} - Producteur Local`}
        description={`${description} Spécialité: ${specialty}. Découvrez les produits frais et artisanaux de ${title}.`}
        keywords={`${title}, ${specialty}, producteur local, fermier, produits frais, agriculture locale`}
        canonical={`https://mff-weld.vercel.app/fermier/${id}`}
        ogType="profile"
        ogImage={producer?.avatar}
        ogImageAlt={`Photo de ${title}`}
      >
        {averageRating && (
          <meta name="rating" content={averageRating} />
        )}
      </SEO>
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

          {/* Inline comment form */}
          {isAuthenticated && user?.role === "client" ? (
            <form className={styles.commentForm} onSubmit={handleSubmit} noValidate>
              <div className={styles.formRow}>
                <FormField
                  id="comment-text"
                  label="Votre commentaire"
                  type="textarea"
                  value={commentText}
                  onChange={setCommentText}
                  placeholder="Partagez votre expérience avec ce producteur..."
                  required
                  error={formError}
                  rows={4}
                />
                <div>
                  <label htmlFor="rating-select" className={styles.commentLabel}>Note</label>
                  <select
                    id="rating-select"
                    className={styles.ratingSelect}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    disabled={submitting}
                    aria-label="Sélectionnez une note"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Très bien</option>
                    <option value={3}>3 - Bien</option>
                    <option value={2}>2 - Moyen</option>
                    <option value={1}>1 - Mauvais</option>
                  </select>
                </div>
              </div>
              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                  aria-label="Publier le commentaire"
                >
                  {submitting ? "Envoi..." : "Publier"}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.loginNotice}>
              Vous devez être connecté en tant que client pour laisser un commentaire.
              <Link to="/login">Se connecter</Link>
            </div>
          )}

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
                  commentId={c._id}
                  comment={c.comment}
                  username={c?.userId?.username}
                  rating={c.rating}
                  createdAt={c.createdAt}
                  index={idx}
                  isOwner={
                    isAuthenticated &&
                    (c?.userId?._id === user?.id ||
                      c?.userId?.id === user?.id ||
                      c?.userId === user?.id)
                  }
                  onSave={handleUpdateComment}
                  onDelete={handleDeleteComment}
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
