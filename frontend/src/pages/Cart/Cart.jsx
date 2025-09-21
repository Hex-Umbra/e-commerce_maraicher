import { useEffect, useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { cartAPI, ordersAPI } from '../../services/api';
import { ROUTES } from '../../utils/routes';

const Cart = () => {
  const { isAuthenticated, showNotification, loading: authLoading } = useAuth();
  const { refreshCart, removeItem: removeCartItem, updateItem: updateCartItem, clearCart: clearCartCtx } = useCart();
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Authentication redirect handled in render to avoid conditional hooks

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartAPI.getCart();
      const cart = Array.isArray(data?.cart) ? data.cart : [];
      setItems(cart);
      // Initialize local quantities state
      const initial = {};
      cart.forEach((it) => {
        initial[it._id] = it.quantity ?? 1;
      });
      setQuantities(initial);
    } catch (err) {
      showNotification(err.message || 'Erreur lors du chargement du panier', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const ordersList = await ordersAPI.getUserOrders();
      setOrders(Array.isArray(ordersList) ? ordersList : []);
    } catch (err) {
      showNotification(err.message || 'Erreur lors du chargement des commandes', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
  }, [items]);

  const handleRemove = async (cartItemId) => {
    try {
      const data = await removeCartItem(cartItemId);
      showNotification(data?.message || 'Article retiré du panier', 'success');
      // Prefer returned cart if present, else refetch
      if (Array.isArray(data?.cart)) {
        setItems(data.cart);
        const updated = {};
        data.cart.forEach((it) => { updated[it._id] = it.quantity ?? 1; });
        setQuantities(updated);
      } else {
        await fetchCart();
      }
    } catch (err) {
      showNotification(err.message || "Erreur lors de la suppression de l'article du panier", 'error');
    }
  };

  const handleUpdateQuantity = async (cartItemId) => {
    const q = Number(quantities[cartItemId] ?? 1);
    if (!q || q <= 0) {
      showNotification('Quantité invalide', 'error');
      return;
    }
    try {
      const data = await updateCartItem(cartItemId, q);
      showNotification(data?.message || 'Quantité mise à jour', 'success');
      if (Array.isArray(data?.cart)) {
        setItems(data.cart);
        const updated = {};
        data.cart.forEach((it) => { updated[it._id] = it.quantity ?? 1; });
        setQuantities(updated);
      } else {
        await fetchCart();
      }
    } catch (err) {
      showNotification(err.message || 'Erreur lors de la mise à jour de la quantité', 'error');
    }
  };

  const handleClear = async () => {
    try {
      const data = await clearCartCtx();
      showNotification(data?.message || 'Panier vidé', 'success');
      if (Array.isArray(data?.cart)) {
        setItems(data.cart);
        setQuantities({});
      } else {
        await fetchCart();
      }
    } catch (err) {
      showNotification(err.message || 'Erreur lors du vidage du panier', 'error');
    }
  };

  const handleCreateOrder = async () => {
    if (!items || items.length === 0) {
      showNotification("Votre panier est vide.", "warning");
      return;
    }
    try {
      setPlacingOrder(true);
      await ordersAPI.createOrder();
      // order can be an array (from Mongoose.create) or object, we don't rely on its shape here
      showNotification("Commande créée avec succès.", "success");
      // Cart is cleared server-side; refresh both cart and orders
      await fetchCart();
      await fetchOrders();
      await refreshCart();
    } catch (err) {
      showNotification(err.message || "Erreur lors de la création de la commande", "error");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingOrderId(orderId);
      await ordersAPI.cancelOrder(orderId);
      showNotification('Commande annulée avec succès.', 'success');
      await fetchOrders();
    } catch (err) {
      showNotification(err.message || "Erreur lors de l'annulation de la commande", 'error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    authLoading ? (
      <section className="container" style={{ padding: '1.5rem 0' }}>
        <p>Vérification de la session...</p>
      </section>
    ) : !isAuthenticated ? (
      <Navigate to={ROUTES.login} replace />
    ) : (
      <section className="container" style={{ padding: '1.5rem 0' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>Votre panier</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to={ROUTES.produits} className="btn btn-secondary">Continuer vos achats</Link>
            {items.length > 0 && (
              <>
                <button
                  onClick={handleCreateOrder}
                  className="btn btn-primary"
                  disabled={placingOrder || loading}
                  title="Valider la commande"
                >
                  {placingOrder ? "Validation..." : "Valider la commande"}
                </button>
                <button onClick={handleClear} className="btn btn-danger">Vider le panier</button>
              </>
            )}
          </div>
        </header>

        {loading ? (
          <p>Chargement du panier...</p>
        ) : items.length === 0 ? (
          <div>
            <p>Votre panier est vide.</p>
            <Link to={ROUTES.produits} className="btn btn-primary">Voir les produits</Link>
          </div>
        ) : (
          <div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items.map((item) => {
                const product = item.product || {};
                const name = product.name || 'Produit';
                const unitPrice = Number(item.price || 0);
                const lineTotal = unitPrice * Number(item.quantity || 0);

                return (
                  <li
                    key={item._id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>
                      {name}
                    </div>
                    <div>
                      Prix: {unitPrice.toFixed(2)} €
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min={1}
                        value={quantities[item._id] ?? item.quantity ?? 1}
                        onChange={(e) =>
                          setQuantities((prev) => ({ ...prev, [item._id]: e.target.value }))
                        }
                        style={{ width: '70px' }}
                      />
                      <button className="btn btn-secondary" onClick={() => handleUpdateQuantity(item._id)}>
                        Mettre à jour
                      </button>
                    </div>
                    <div>
                      Total: {lineTotal.toFixed(2)} €
                    </div>
                    <div>
                      <button className="btn btn-danger" onClick={() => handleRemove(item._id)}>
                        Retirer
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer style={{ marginTop: '1rem', textAlign: 'right', fontWeight: 700 }}>
              Total Panier: {total.toFixed(2)} €
            </footer>
          </div>
        )}
        <hr style={{ margin: '2rem 0' }} />
        <div>
          <h3>Vos commandes</h3>
          {ordersLoading ? (
            <p>Chargement des commandes...</p>
          ) : orders.length === 0 ? (
            <p>Aucune commande.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {orders.map((order) => {
                const created = order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : '';
                const itemsCount = Array.isArray(order.products) ? order.products.reduce((sum, p) => sum + (Number(p.quantity || 0)), 0) : 0;
                const totalAmount = Number(order.totalAmount || 0).toFixed(2);
                return (
                  <li key={order._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <strong>Commande</strong> #{String(order._id).slice(-6).toUpperCase()} • {created}
                      </div>
                      <div>
                        Statut: <strong>{order.status}</strong> • Total: <strong>{totalAmount} €</strong> • Articles: <strong>{itemsCount}</strong>
                      </div>
                    </div>
                    {order.status !== "Annulée" && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrderId === order._id}
                          title="Annuler la commande"
                        >
                          {cancellingOrderId === order._id ? 'Annulation...' : 'Annuler la commande'}
                        </button>
                      </div>
                    )}
                    {Array.isArray(order.products) && order.products.length > 0 && (
                      <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                        {order.products.map((line) => {
                          const prod = line.productId || {};
                          const name = prod.name || 'Produit';
                          const qty = Number(line.quantity || 0);
                          const unitPrice = Number(line.price || 0);
                          const lineTotal = (qty * unitPrice).toFixed(2);
                          return (
                            <li key={prod._id || name} style={{ marginBottom: '0.25rem' }}>
                              {name} — {qty} × {unitPrice.toFixed(2)} € = {lineTotal} €
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    )
  );
};

export default Cart;
