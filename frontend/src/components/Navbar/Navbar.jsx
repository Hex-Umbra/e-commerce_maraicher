import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Navbar.module.scss";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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
          <a href="#accueil" onClick={closeMenu}>
            Accueil
          </a>
          <a href="#fermiers" onClick={closeMenu}>
            Nos fermiers
          </a>
          <a href="#produits" onClick={closeMenu}>
            Produits
          </a>
          <a href="#apropos" onClick={closeMenu}>
            À Propos
          </a>
          <a href="#contact" onClick={closeMenu}>
            Contact
          </a>
        </nav>

        {/* User Section */}
        <div className={styles.userSection}>
          {isAuthenticated ? (
            <div className={styles.userIcon}>
              <span className={styles.userName}>{user?.name}</span>
              <div className={styles.profileIcon}>👤</div>
            </div>
          ) : (
            <a href="#accueil" className={styles.signupLink}>
              S'inscrire
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
