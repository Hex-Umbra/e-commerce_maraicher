import React from 'react';
import Navbar from './components/Navbar/Navbar';
import WelcomeSection from './components/WelcomeSection/WelcomeSection';
import Footer from './components/Footer/Footer';
import { AuthProvider } from './context/AuthContext';

import './styles/main.scss';

const App = () => {
  return (
    <AuthProvider>
      <Navbar />
      <main>
        <WelcomeSection />
      </main>
      <Footer />
    </AuthProvider>
  );
};

export default App;