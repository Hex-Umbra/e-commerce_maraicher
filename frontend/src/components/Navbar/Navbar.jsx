import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Navbar.module.scss";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      closeMenu(); // Close mobile menu if open
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={`container ${styles.navbarContainer}`}>
        <h1 className={styles.logo}>Marché Frais Fermier</h1>

        {/* Hamburger Button */}
        <button
          className={`${styles.hamburger} ${
            isMenuOpen ? styles.hamburgerOpen : ""
          }`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <nav
          className={`${styles.navLinks} ${
            isMenuOpen ? styles.navLinksOpen : ""
          }`}
        >
          <Link 
            to="/accueil" 
            className={`${styles.navLink} ${location.pathname === '/accueil' ? styles.active : ''}`}
            onClick={closeMenu}
          >
            Accueil
          </Link>
          <Link 
            to="/nosfermiers" 
            className={`${styles.navLink} ${location.pathname === '/nosfermiers' ? styles.active : ''}`}
            onClick={closeMenu}
          >
            Nos fermiers
          </Link>
          <Link 
            to="/produits" 
            className={`${styles.navLink} ${location.pathname === '/produits' ? styles.active : ''}`}
            onClick={closeMenu}
          >
            Produits
          </Link>
          <Link 
            to="/apropos" 
            className={`${styles.navLink} ${location.pathname === '/apropos' ? styles.active : ''}`}
            onClick={closeMenu}
          >
            À Propos
          </Link>
          <Link 
            to="/contact" 
            className={`${styles.navLink} ${location.pathname === '/contact' ? styles.active : ''}`}
            onClick={closeMenu}
          >
            Contact
          </Link>
        </nav>

        {/* User Section */}
        <div className={styles.userSection}>
          {isAuthenticated ? (
            <div className={styles.userInfo}>
              <div className={styles.userIcon}>
                <span className={styles.userName}>{user?.name}</span>
                <div className={styles.profileIcon}>👤</div>
              </div>
              <button 
                className={styles.logoutButton}
                onClick={handleLogout}
                aria-label="Se déconnecter"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link 
                to="/login" 
                className={`${styles.authLink} ${location.pathname === '/login' ? styles.active : ''}`}
                onClick={closeMenu}
              >
                Connexion
              </Link>
              <Link 
                to="/register" 
                className={`${styles.authLink} ${styles.signupLink} ${location.pathname === '/register' ? styles.active : ''}`}
                onClick={closeMenu}
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
