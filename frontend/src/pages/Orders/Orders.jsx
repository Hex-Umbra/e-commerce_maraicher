import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../services/api";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import styles from "./Orders.module.scss";
import { ROUTES } from "../../utils/routes";

const Orders = () => {
  const { user, isAuthenticated, loading: authLoading, showNotification } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});

  const isProducteur = user?.role === "producteur";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = isProducteur 
        ? await ordersAPI.getProducteurOrders()
        : await ordersAPI.getUserOrders();
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
  }, [isAuthenticated, isProducteur]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
      try {
        await ordersAPI.cancelOrder(orderId);
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, status: "Annulée" }
              : order
          )
        );
        if (showNotification) {
          showNotification("Commande annulée avec succès.", "success");
        }
      } catch (err) {
        console.error("Error cancelling order:", err);
        if (showNotification) {
          showNotification(err.message || "Erreur lors de l'annulation.", "error");
        }
      } finally {
        setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
      }
    }
  };

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
          <h2 className={styles.title}>
            {isProducteur ? "Commandes de mes produits" : "Mes Commandes"}
          </h2>
          <EmptyState
            icon="🧺"
            message={
              isProducteur
                ? "Aucune commande pour vos produits."
                : "Vous n'avez pas encore de commandes."
            }
            ctaText={isProducteur ? "Voir mes produits" : "Voir les produits"}
            ctaLink={isProducteur ? ROUTES.profile : ROUTES.produits}
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

  const handleStatusChange = async (orderId, productId, newStatus) => {
    const key = `${orderId}-${productId}`;
    setUpdatingStatus((prev) => ({ ...prev, [key]: true }));

    try {
      await ordersAPI.updateProductStatus(orderId, [
        { productId, status: newStatus },
      ]);

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id === orderId) {
            return {
              ...order,
              products: order.products.map((p) =>
                (p.productId?._id || p.productId) === productId
                  ? { ...p, status: newStatus }
                  : p
              ),
            };
          }
          return order;
        })
      );

      if (showNotification) {
        showNotification("Statut mis à jour avec succès.", "success");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      if (showNotification) {
        showNotification(err.message || "Erreur lors de la mise à jour.", "error");
      }
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getStatusOptions = (currentStatus) => {
    const statuses = ["En cours", "Prêt", "Livré"];
    const currentIndex = statuses.indexOf(currentStatus);
    return statuses.slice(currentIndex);
  };

  return (
    <div className={styles.orders}>
      <div className="container">
        <h2 className={styles.title}>
          {isProducteur ? "Commandes de mes produits" : "Mes Commandes"}
        </h2>

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
                <span className={styles.amount}>
                  {formatPrice(isProducteur ? order.producerTotal : order.totalAmount)}
                </span>
              </div>

              {/* Client info for producteur */}
              {isProducteur && order.clientId && (
                <div className={styles.clientInfo}>
                  <strong>Client:</strong> {order.clientId.name}
                  {order.clientId.address && ` - ${order.clientId.address}`}
                </div>
              )}

              {Array.isArray(order.products) && order.products.length > 0 && (
                <div className={styles.lines} role="list" aria-label="Articles de la commande">
                  {order.products.map((p, idx) => {
                    const productId = p.productId?._id || p.productId;
                    const key = `${order._id}-${productId}`;
                    const isUpdating = updatingStatus[key];

                    return (
                      <div key={p._id || idx} className={styles.line} role="listitem">
                        <span className={styles.productName}>
                          {p.productId?.name || "Produit"}
                        </span>
                        <span className={styles.qty}>x{p.quantity}</span>
                        <span className={styles.linePrice}>{formatPrice(p.price)}</span>
                        
                        {isProducteur ? (
                          <div className={styles.statusControl}>
                            <select
                              value={p.status || "En cours"}
                              onChange={(e) =>
                                handleStatusChange(order._id, productId, e.target.value)
                              }
                              disabled={isUpdating || p.status === "Livré"}
                              className={styles.statusSelect}
                              aria-label={`Changer le statut de ${p.productId?.name}`}
                            >
                              {getStatusOptions(p.status || "En cours").map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            {isUpdating && <span className={styles.spinner}>⏳</span>}
                          </div>
                        ) : (
                          <span className={styles.lineStatus}>{p.status || "En cours"}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!isProducteur && !["Annulée", "Complète"].includes(order.status) && (
                <div className={styles.actions}>
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className={styles.cancelButton}
                    disabled={updatingStatus[order._id]}
                  >
                    {updatingStatus[order._id] ? "Annulation..." : "Annuler la commande"}
                  </button>
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
