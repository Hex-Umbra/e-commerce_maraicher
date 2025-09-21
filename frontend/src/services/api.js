import axios from 'axios';

// API Base URL - adjust according to your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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
};

// Comments API functions
export const commentsAPI = {
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

export default apiClient;
