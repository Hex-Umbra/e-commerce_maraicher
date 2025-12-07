import { useEffect, useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/useCart';
import { cartAPI, ordersAPI } from '../../services/api';
import { ROUTES } from '../../utils/routes';
import styles from './Cart.module.scss';

const Cart = () => {
  const { isAuthenticated, showNotification, loading: authLoading } = useAuth();
  const { refreshCart, removeItem: removeCartItem, updateItem: updateCartItem, clearCart: clearCartCtx } = useCart();
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

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


  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
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
      await refreshCart();
    } catch (err) {
      showNotification(err.message || "Erreur lors de la création de la commande", "error");
    } finally {
      setPlacingOrder(false);
    }
  };


  return (
    <>
      <SEO
        title="Mon Panier"
        description="Consultez et gérez les produits dans votre panier. Validez votre commande de produits frais locaux."
        canonical="https://mff-weld.vercel.app/cart"
        noindex={true}
      />
      {authLoading ? (
        <section className={`container ${styles.cart}`}>
          <LoadingState message="Vérification de la session..." />
        </section>
      ) : !isAuthenticated ? (
        <Navigate to={ROUTES.login} replace />
      ) : (
        <section className={`container ${styles.cart}`}>
        <header className={styles.header}>
          <h2>Votre panier</h2>
          <div className={styles.actions}>
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
          <LoadingState message="Chargement du panier..." />
        ) : items.length === 0 ? (
          <EmptyState 
            message="Votre panier est vide."
            icon="🛒"
            ctaText="Voir les produits"
            ctaLink={ROUTES.produits}
          />
        ) : (
          <>
            <ul className={styles.cartItems}>
              {items.map((item) => {
                const product = item.product || {};
                const name = product.name || 'Produit';
                const unitPrice = Number(item.price || 0);
                const lineTotal = unitPrice * Number(item.quantity || 0);

                return (
                  <li key={item._id} className={styles.cartItem}>
                    <div className={styles.productName}>
                      {name}
                    </div>
                    <div className={styles.mobileRow}>
                      <span>Prix:</span>
                      <span>{unitPrice.toFixed(2)} €</span>
                    </div>
                    <div className={styles.quantityControls}>
                      <input
                        type="number"
                        min={1}
                        value={quantities[item._id] ?? item.quantity ?? 1}
                        onChange={(e) =>
                          setQuantities((prev) => ({ ...prev, [item._id]: e.target.value }))
                        }
                      />
                      <button className="btn btn-secondary" onClick={() => handleUpdateQuantity(item._id)}>
                        Mettre à jour
                      </button>
                    </div>
                    <div className={styles.mobileRow}>
                      <span>Total:</span>
                      <span>{lineTotal.toFixed(2)} €</span>
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

            <footer className={styles.cartFooter}>
              Total Panier: {total.toFixed(2)} €
            </footer>
          </>
        )}
        
          
        </section>
      )}
    </>
  );
};

export default Cart;
