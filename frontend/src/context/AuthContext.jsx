/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // API Base URL - adjust according to your backend
  const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  // Show notification function
  const showNotification = (message, type = 'error', autoHide = true) => {
    setNotification({ message, type, isVisible: true });

    // Auto-hide notification after 5 seconds if autoHide is true
    if (autoHide) {
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  // Hide notification function
  const hideNotification = () => {
    setNotification(null);
  };


  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        if (response.status === 401 || response.status === 403) {
          showNotification('Votre session a expiré. Vous avez été déconnecté.', 'warning');
        } else if (response.status >= 500) {
          showNotification('Erreur serveur. Vous avez été déconnecté.', 'error');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      // Network error - show disconnection notification
      if (!navigator.onLine) {
        showNotification('Connexion perdue. Vérifiez votre connexion internet.', 'error');
      } else {
        showNotification('Impossible de se connecter au serveur. Vous avez été déconnecté.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, showNotification]);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
    
    // Set up online/offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      hideNotification();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('Connexion perdue. Vérifiez votre connexion internet.', 'error', false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkAuthStatus]);

  // Sign up function
  const signUp = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification(data.message, 'success');
        // Re-fetch user status to ensure role is up-to-date
        await checkAuthStatus();
        return {
          success: true,
          message: data.message,
          user: data.user,
        };
      } else {
        setError(data.message || 'Erreur lors de l\'inscription');
        return {
          success: false,
          message: data.message || 'Erreur lors de l\'inscription',
        };
      }
    } catch (_networkError) {
      const errorMessage = 'Erreur de connexion au serveur';
      setError(errorMessage);
      // Show disconnection notification for network errors
      if (!navigator.onLine) {
        showNotification('Connexion perdue pendant l\'inscription.', 'error');
      } else {
        showNotification('Erreur de connexion au serveur.', 'error');
      }
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        showNotification(data.message, 'success');
        // Re-fetch user status to ensure role is up-to-date
        await checkAuthStatus();
        return {
          success: true,
          message: data.message,
          user: data.user,
        };
      } else {
        setError(data.message || 'Erreur lors de la connexion');
        return {
          success: false,
          message: data.message || 'Erreur lors de la connexion',
        };
      }
    } catch (_networkError) {
      const errorMessage = 'Erreur de connexion au serveur';
      setError(errorMessage);
      // Show disconnection notification for network errors
      if (!navigator.onLine) {
        showNotification('Connexion perdue pendant la connexion.', 'error');
      } else {
        showNotification('Erreur de connexion au serveur.', 'error');
      }
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear user regardless of response (in case of network issues)
      setUser(null);
      setError(null);
      showNotification('Vous êtes déconnecté.', 'success');

      return {
        success: true,
        message: 'Déconnexion réussie',
      };
    // eslint-disable-next-line no-unused-vars
    } catch (_networkError) {
      // Still clear user on error
      setUser(null);
      setError(null);

      // Show notification after attempted logout
      if (!navigator.onLine) {
        showNotification('Déconnecté localement. Connexion internet requise pour synchroniser.', 'warning');
      } else {
        showNotification('Vous êtes déconnecté.', 'success');
      }

      return {
        success: true,
        message: 'Déconnexion réussie',
      };
    } finally {
      setLoading(false);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Update user function (for profile updates)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    error,
    notification,
    isOnline,
    signUp,
    signIn,
    signOut,
    clearError,
    updateUser,
    checkAuthStatus, // Expose checkAuthStatus
    showNotification,
    hideNotification,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// PropTypes validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
