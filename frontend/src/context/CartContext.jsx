import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const cartCount = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.quantity || 0), 0),
    [items]
  );

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return { success: true, cart: [] };
    }
    setLoading(true);
    try {
      const data = await cartAPI.getCart();
      const cart = Array.isArray(data?.cart) ? data.cart : [];
      setItems(cart);
      return { success: true, cart };
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const data = await cartAPI.addToCart(productId, quantity);
    if (Array.isArray(data?.cart)) {
      setItems(data.cart);
    } else {
      await refreshCart();
    }
    return data;
  };

  const updateItem = async (cartItemId, quantity) => {
    const data = await cartAPI.updateCartItem(cartItemId, quantity);
    if (Array.isArray(data?.cart)) {
      setItems(data.cart);
    } else {
      await refreshCart();
    }
    return data;
  };

  const removeItem = async (cartItemId) => {
    const data = await cartAPI.removeCartItem(cartItemId);
    if (Array.isArray(data?.cart)) {
      setItems(data.cart);
    } else {
      await refreshCart();
    }
    return data;
  };

  const clearCart = async () => {
    const data = await cartAPI.clearCart();
    if (Array.isArray(data?.cart)) {
      setItems(data.cart);
    } else {
      await refreshCart();
    }
    return data;
  };

  // Keep cart in sync with auth state
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const value = {
    items,
    loading,
    cartCount,
    refreshCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
