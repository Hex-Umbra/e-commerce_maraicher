import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar/Navbar';
import WelcomeSection from './components/WelcomeSection/WelcomeSection';
import LoginSection from './components/LoginSection/LoginSection';
import Footer from './components/Footer/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import page components
import Accueil from './pages/Accueil/Accueil';
import Nosfermiers from './pages/Nosfermiers/Nosfermiers';
import Produits from './pages/Produits/Produits';
import Apropos from './pages/Apropos/Apropos';
import Contact from './pages/Contact/Contact';
import Fermier from './pages/Fermier/Fermier';
import NotFound from './pages/NotFound/NotFound';
import Cart from './pages/Cart/Cart';
import MentionsLegales from './pages/MentionsLegales/MentionsLegales';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite/PolitiqueConfidentialite';
import ConditionsUtilisation from './pages/ConditionsUtilisation/ConditionsUtilisation';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import ProfileEdit from './pages/ProfileEdit/ProfileEdit';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminUserEdit from './pages/Admin/AdminUserEdit';
import AdminUserCreate from './pages/Admin/AdminUserCreate';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminProductEdit from './pages/Admin/AdminProductEdit'; // New Import
import AdminOrdersList from './pages/Admin/AdminOrdersList';
import AdminOrderEdit from './pages/Admin/AdminOrderEdit';
import AdminComments from './pages/Admin/AdminComments';
import PublicLayout from './components/common/PublicLayout/PublicLayout';

import './styles/main.scss';

const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Navigate to="/accueil" replace />} />
                <Route path="/accueil" element={<Accueil />} />
                <Route path="/nosfermiers" element={<Nosfermiers />} />
                <Route path="/produits" element={<Produits />} />
                <Route path="/apropos" element={<Apropos />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/fermier/:id" element={<Fermier />} />
                <Route path="/register" element={<WelcomeSection />} />
                <Route path="/login" element={<LoginSection />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/profil" element={<Profile />} />
                <Route path="/profil/editer" element={<ProfileEdit />} />
                <Route path="/commandes" element={<Orders />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
                <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="users/create" element={<AdminUserCreate />} />
                  <Route path="users/edit/:userId" element={<AdminUserEdit />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/edit/:productId" element={<AdminProductEdit />} />
                  <Route path="orders" element={<AdminOrdersList />} />
                  <Route path="orders/:orderId/edit" element={<AdminOrderEdit />} />
                  <Route path="comments" element={<AdminComments />} />
                </Route>
              </Route>

              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </Router>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
