import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import WelcomeSection from './components/WelcomeSection/WelcomeSection';
import LoginSection from './components/LoginSection/LoginSection';
import Footer from './components/Footer/Footer';
import { AuthProvider } from './context/AuthContext';

// Import page components
import Accueil from './pages/Accueil/Accueil';
import Nosfermiers from './pages/Nosfermiers/Nosfermiers';
import Produits from './pages/Produits/Produits';
import Apropos from './pages/Apropos/Apropos';
import Contact from './pages/Contact/Contact';
import Fermier from './pages/Fermier/Fermier';
import NotFound from './pages/NotFound/NotFound';

import './styles/main.scss';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/accueil" replace />} />
            <Route path="/accueil" element={<Accueil />} />
            <Route path="/nosfermiers" element={<Nosfermiers />} />
            <Route path="/produits" element={<Produits />} />
            <Route path="/apropos" element={<Apropos />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/fermier/:id" element={<Fermier />} />
            <Route path="/register" element={<WelcomeSection />} />
            <Route path="/login" element={<LoginSection />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;
