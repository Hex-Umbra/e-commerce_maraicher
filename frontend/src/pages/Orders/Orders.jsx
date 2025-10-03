import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../services/api";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import styles from "./Orders.module.scss";
import { ROUTES } from "../../utils/routes";

const Orders = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersAPI.getUserOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <p>Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <ErrorState message={error} onRetry={fetchOrders} />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container">
        <div className={styles.orders}>
          <h2 className={styles.title}>Mes Commandes</h2>
          <EmptyState
            icon="🧺"
            message="Vous n'avez pas encore de commandes."
            ctaText="Voir les produits"
            ctaLink={ROUTES.produits}
          />
        </div>
      </div>
    );
  }

  const formatPrice = (amount) =>
    typeof amount === "number" ? `${amount.toFixed(2)} €` : "—";

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className={styles.orders}>
      <div className="container">
        <h2 className={styles.title}>Mes Commandes</h2>

        <ul className={styles.list} role="list" aria-label="Liste de vos commandes">
          {orders.map((order) => (
            <li key={order._id} className={styles.item} role="listitem">
              <div className={styles.itemHeader}>
                <span className={styles.orderId}>Commande #{order._id?.slice(-6)}</span>
                <span className={styles.status} data-status={order.status || "En cours"}>
                  {order.status || "En cours"}
                </span>
              </div>
              <div className={styles.meta}>
                <span className={styles.date}>{formatDate(order.createdAt)}</span>
                <span className={styles.amount}>{formatPrice(order.totalAmount)}</span>
              </div>

              {Array.isArray(order.products) && order.products.length > 0 && (
                <div className={styles.lines} role="list" aria-label="Articles de la commande">
                  {order.products.map((p, idx) => (
                    <div key={p._id || idx} className={styles.line} role="listitem">
                      <span className={styles.productName}>
                        {p.productId?.name || "Produit"}
                      </span>
                      <span className={styles.qty}>x{p.quantity}</span>
                      <span className={styles.linePrice}>{formatPrice(p.price)}</span>
                      <span className={styles.lineStatus}>{p.status || "En cours"}</span>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Orders;
