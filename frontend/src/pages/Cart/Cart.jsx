import { useEffect, useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cartAPI } from '../../services/api';
import { ROUTES } from '../../utils/routes';

const Cart = () => {
  const { isAuthenticated, showNotification } = useAuth();
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);

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
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
  }, [items]);

  const handleRemove = async (cartItemId) => {
    try {
      const data = await cartAPI.removeCartItem(cartItemId);
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
      const data = await cartAPI.updateCartItem(cartItemId, q);
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
      const data = await cartAPI.clearCart();
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

  return (
    !isAuthenticated ? (
      <Navigate to={ROUTES.login} replace />
    ) : (
      <section className="container" style={{ padding: '1.5rem 0' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>Votre panier</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={ROUTES.produits} className="btn btn-secondary">Continuer vos achats</Link>
            {items.length > 0 && (
              <button onClick={handleClear} className="btn btn-danger">Vider le panier</button>
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
      </section>
    )
  );
};

export default Cart;
