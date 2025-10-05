import axios from 'axios';

// API Base URL - adjust according to your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  // Do not set Content-Type globally; let axios infer per request (JSON vs FormData)
});

// Check if we're in development mode
const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development' || import.meta.env.DEV;

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    if (isDevelopment) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.error('API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (isDevelopment) {
      console.error('API Response Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Producer API functions
export const producerAPI = {
  // Get all producers
  getAllProducers: async () => {
    try {
      const response = await apiClient.get('/producteurs');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des producteurs');
    }
  },

  // Get producer by ID
  getProducerById: async (id) => {
    try {
      const response = await apiClient.get(`/producteurs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du producteur');
    }
  },

  // Get products by producer ID
  getProductsByProducer: async (producerId) => {
    try {
      const response = await apiClient.get(`/producteurs/${producerId}/products`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des produits');
    }
  },
};

// Product API functions (for future use)
export const productAPI = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await apiClient.get('/products');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des produits');
    }
  },

  // Get products by producer (returns [] on 404)
  getByProducer: async (producerId) => {
    try {
      const response = await apiClient.get(`/producteurs/${producerId}/products`);
      // Expected shape: { success, message, producteur, products }
      return response.data?.products || [];
    } catch (error) {
      if (error.response?.status === 404) {
        // No products for this producer
        return [];
      }
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des produits du producteur');
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      const response = await apiClient.get(`/products/${productId}`);
      return response.data?.product;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du produit');
    }
  },

  // Create a new product (Producteur only)
  createProduct: async (payload) => {
    try {
      const response = await apiClient.post('/products', payload);
      return response.data?.product;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du produit');
    }
  },

  // Create a new product with file upload (multipart/form-data)
  createProductMultipart: async (formData) => {
    try {
      // Let the browser set the correct multipart boundary automatically
      const response = await apiClient.post('/products', formData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du produit (multipart)');
    }
  },

  // Update a product (Producteur only) - JSON body
  updateProduct: async (productId, payload) => {
    try {
      const response = await apiClient.put(`/products/${productId}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du produit');
    }
  },

  // Update a product with file upload (multipart/form-data)
  updateProductMultipart: async (productId, formData) => {
    try {
      // Let the browser set the correct multipart boundary automatically
      const response = await apiClient.put(`/products/${productId}`, formData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du produit (multipart)');
    }
  },

  // Delete a product (Producteur only)
  deleteProduct: async (productId) => {
    try {
      const response = await apiClient.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du produit');
    }
  },
};

 // Comments API functions
export const commentsAPI = {
  // Create a comment for a producer (client only)
  createComment: async ({ ProducteurId, comment, rating }) => {
    try {
      const response = await apiClient.post('/comments', { ProducteurId, comment, rating });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur lors de l'envoi du commentaire");
    }
  },

  // Update an existing comment (owner only)
  updateComment: async (commentId, { comment, rating }) => {
    try {
      const response = await apiClient.put(`/comments/${commentId}`, { comment, rating });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour du commentaire");
    }
  },

  // Delete an existing comment (owner only)
  deleteComment: async (commentId) => {
    try {
      const response = await apiClient.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur lors de la suppression du commentaire");
    }
  },

  // Get comments for a producer
  getCommentsByProducer: async (producteurId) => {
    try {
      const response = await apiClient.get(`/comments/producteur/${producteurId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur lors de la récupération des commentaires");
    }
  },

  // Get average rating for a producer
  getAverageRatingByProducer: async (producteurId) => {
    try {
      const response = await apiClient.get(`/comments/producteur/${producteurId}/average-rating`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur lors de la récupération de la note moyenne");
    }
  },
};

export const cartAPI = {
  // Get current user's cart
  getCart: async () => {
    try {
      const response = await apiClient.get('/cart');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du panier');
    }
  },

  // Add product to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await apiClient.post('/cart', { productId, quantity });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur lors de l'ajout au panier");
    }
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId, quantity) => {
    try {
      const response = await apiClient.put(`/cart/${cartItemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du panier');
    }
  },

  // Remove a specific cart item
  removeCartItem: async (cartItemId) => {
    try {
      const response = await apiClient.delete(`/cart/${cartItemId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur lors de la suppression de l'article du panier");
    }
  },

  // Clear the cart
  clearCart: async () => {
    try {
      const response = await apiClient.delete('/cart/clear');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors du vidage du panier');
    }
  },
};

export const ordersAPI = {
  // Get orders for the authenticated user
  getUserOrders: async () => {
    try {
      const response = await apiClient.get('/orders');
      // Backend returns: { status, message, data: { orders } }
      return response.data?.data?.orders || [];
    } catch (error) {
      if (error.response?.status === 404) {
        // No orders found for this user
        return [];
      }
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des commandes');
    }
  },

  // Create an order from current user's cart (for later use)
  createOrder: async () => {
    try {
      const response = await apiClient.post('/orders');
      // Backend returns: { status, data: { order } } where order is an array from Mongoose.create
      return response.data?.data?.order;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la commande');
    }
  },

  // Cancel an order with backend method fallback (PATCH primary, DELETE fallback)
  cancelOrder: async (orderId) => {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/cancel`);
      return response.data?.data?.order;
    } catch (error) {
      // Fallback to DELETE if server expects DELETE for cancel
      try {
        const response = await apiClient.delete(`/orders/${orderId}/cancel`);
        return response.data?.data?.order;
      } catch (e2) {
        throw new Error(
          e2.response?.data?.message ||
            error.response?.data?.message ||
            "Erreur lors de l'annulation de la commande"
        );
      }
    }
  },

  // Get orders for producteur (orders containing their products)
  getProducteurOrders: async () => {
    try {
      const response = await apiClient.get('/orders/producteur');
      // Backend returns: { status, message, data: { orders } }
      return response.data?.data?.orders || [];
    } catch (error) {
      if (error.response?.status === 404) {
        // No orders found for this producteur
        return [];
      }
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des commandes');
    }
  },

  // Update product statuses in an order (Producteur only)
  updateProductStatus: async (orderId, updates) => {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/status`, { updates });
      return response.data?.data?.order;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  },
};

export const supportAPI = {
  // Send contact message to support
  sendContact: async ({ subject, title, message }) => {
    try {
      const response = await apiClient.post('/support/contact', {
        subject,
        title,
        message,
      });
      // Backend returns: { status, message }
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de l'envoi du message au support"
      );
    }
  },
};

// User/Auth API functions
export const userAPI = {
  // Update user profile
  updateProfile: async ({ name, email, address }) => {
    try {
      const response = await apiClient.patch('/auth/profile', {
        name,
        email,
        address,
      });
      // Backend returns: { success, message, user }
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du profil"
      );
    }
  },
};

export default apiClient;
