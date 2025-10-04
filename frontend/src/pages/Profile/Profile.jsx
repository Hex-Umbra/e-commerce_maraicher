import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileCard from "../../components/common/ProfileCard";
import ImageWithFallback from "../../components/common/ImageWithFallback/ImageWithFallback";
import styles from "./Profile.module.scss";
import { ROUTES } from "../../utils/routes";
import { productAPI } from "../../services/api";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const Profile = () => {
  const { user, isAuthenticated, loading, showNotification } = useAuth();
  const navigate = useNavigate();

  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);

  const isProducer = user?.role === "producteur";

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isProducer || !user?.id) return;
      try {
        setLoadingProducts(true);
        const list = await productAPI.getByProducer(user.id);
        setMyProducts(list);
        setProductsError(null);
      } catch (err) {
        setProductsError(err.message || "Erreur lors du chargement des produits.");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [isProducer, user?.id]);

  const handleEditProduct = (id) => {
    navigate(ROUTES.productEdit(id));
  };

  const handleDeleteProduct = async (id) => {
    // eslint-disable-next-line no-alert
    if (!confirm("Supprimer ce produit ? Cette action est irréversible.")) return;
    try {
      await productAPI.deleteProduct(id);
      setMyProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      if (showNotification) showNotification("Produit supprimé.", "success");
    } catch (err) {
      if (showNotification) showNotification(err.message || "Erreur lors de la suppression.", "error");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className={styles.profile}>
      <div className="container">
        <h2 className={styles.title}>Mon Profil</h2>

        <div className={styles.cardWrap}>
          <ProfileCard user={user} />
        </div>

        {isProducer && (
          <section className={styles.manageSection} aria-labelledby="manage-title">
            <div className={styles.manageHeader}>
              <h3 id="manage-title">Mes produits</h3>
              <span className="count">
                {myProducts && myProducts.length > 0 ? `(${myProducts.length})` : ""}
              </span>
            </div>

            {loadingProducts ? (
              <div className={styles.loading}>
                <p>Chargement de vos produits...</p>
              </div>
            ) : productsError ? (
              <div className={styles.loading}>
                <p>{productsError}</p>
              </div>
            ) : myProducts.length === 0 ? (
              <div className={styles.loading}>
                <p>Aucun produit pour le moment.</p>
              </div>
            ) : (
              <div className={styles.grid} role="grid" aria-label="Mes produits">
                {myProducts.map((prod) => {
                  const pid = prod._id || prod.id;
                  return (
                    <article key={pid} className={styles.manageCard}>
                      <ImageWithFallback
                        src={prod.image}
                        fallback="/placeholder-product.jpg"
                        alt={`Image de ${prod.name}`}
                        className={styles.thumb}
                      />
                      <div className={styles.info}>
                        <div className={styles.nameRow}>
                          <h4 title={prod.name}>{prod.name}</h4>
                          <span className={styles.price}>
                            {Number(prod.price).toFixed(2)}€
                          </span>
                        </div>
                        <div className={styles.meta}>
                          <span>{prod.category}</span>
                          <span>Stock: {Number(prod.quantity)}</span>
                        </div>
                        <div className={styles.cardActions}>
                          <button
                            className={`${styles.btn} ${styles.edit}`}
                            onClick={() => handleEditProduct(pid)}
                            aria-label="Modifier le produit"
                            type="button"
                          >
                            <FiEdit2 aria-hidden="true" /> Modifier
                          </button>
                          <button
                            className={`${styles.btn} ${styles.delete}`}
                            onClick={() => handleDeleteProduct(pid)}
                            aria-label="Supprimer le produit"
                            type="button"
                          >
                            <FiTrash2 aria-hidden="true" /> Supprimer
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Profile;
